// ============================================================================
//  ATUALIZADOR DIÁRIO DE RESULTADOS  —  Treta das Nações
// ----------------------------------------------------------------------------
//  Roda no GitHub Actions (cron). Busca os jogos da Copa 2026 numa API pública
//  e grava assets/data/results.json com placares + confrontos do mata-mata.
//
//  Fonte padrão: football-data.org (plano gratuito).
//   -> Crie uma conta grátis em https://www.football-data.org/client/register
//   -> Pegue seu token e cadastre como secret FOOTBALL_DATA_TOKEN no repositório.
//
//  Sem token, o script encerra sem erro (os placares continuam podendo ser
//  lançados na mão pelo admin dentro do app).
// ============================================================================
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "..", "assets", "data", "results.json");

const TOKEN = process.env.FOOTBALL_DATA_TOKEN || "";
const COMPETITION = process.env.WC_COMPETITION || "WC"; // código da Copa na API
const API = `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`;

// --- Nossos grupos (precisa bater com assets/js/data.js) --------------------
const GROUPS = {
  A: ["MEX", "RSA", "KOR", "CZE"], B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "SCO", "HAI"], D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"], F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"], H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"], J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"], L: ["ENG", "CRO", "GHA", "PAN"]
};
const ROUND_PAIRS = { 1: [[0, 1], [2, 3]], 2: [[0, 2], [3, 1]], 3: [[0, 3], [1, 2]] };

// Constrói o índice "par de seleções (grupo) -> id do nosso jogo".
const groupPairIndex = {};
for (const [letter, t] of Object.entries(GROUPS)) {
  for (const md of [1, 2, 3]) {
    ROUND_PAIRS[md].forEach((p, i) => {
      const id = `${letter}-MD${md}-${i + 1}`;
      groupPairIndex[`${t[p[0]]}|${t[p[1]]}`] = { id, home: t[p[0]], away: t[p[1]] };
      groupPairIndex[`${t[p[1]]}|${t[p[0]]}`] = { id, home: t[p[0]], away: t[p[1]] };
    });
  }
}

// --- Nome/código da seleção -> nosso código de 3 letras ---------------------
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z]/g, "");
const NAME2CODE = {};
const add = (code, ...names) => names.forEach((n) => (NAME2CODE[norm(n)] = code));
add("MEX", "Mexico"); add("RSA", "South Africa"); add("KOR", "South Korea", "Korea Republic");
add("CZE", "Czechia", "Czech Republic"); add("CAN", "Canada"); add("BIH", "Bosnia and Herzegovina", "Bosnia");
add("QAT", "Qatar"); add("SUI", "Switzerland"); add("BRA", "Brazil"); add("MAR", "Morocco");
add("SCO", "Scotland"); add("HAI", "Haiti"); add("USA", "United States", "USA");
add("PAR", "Paraguay"); add("AUS", "Australia"); add("TUR", "Turkey", "Turkiye", "Türkiye");
add("GER", "Germany"); add("CUW", "Curacao", "Curaçao"); add("CIV", "Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire");
add("ECU", "Ecuador"); add("NED", "Netherlands"); add("JPN", "Japan"); add("SWE", "Sweden");
add("TUN", "Tunisia"); add("BEL", "Belgium"); add("EGY", "Egypt"); add("IRN", "Iran", "IR Iran");
add("NZL", "New Zealand"); add("ESP", "Spain"); add("CPV", "Cape Verde", "Cabo Verde");
add("KSA", "Saudi Arabia"); add("URU", "Uruguay"); add("FRA", "France"); add("SEN", "Senegal");
add("IRQ", "Iraq"); add("NOR", "Norway"); add("ARG", "Argentina"); add("ALG", "Algeria");
add("AUT", "Austria"); add("JOR", "Jordan"); add("POR", "Portugal"); add("COD", "DR Congo", "Congo DR", "Democratic Republic of Congo");
add("UZB", "Uzbekistan"); add("COL", "Colombia"); add("ENG", "England"); add("CRO", "Croatia");
add("GHA", "Ghana"); add("PAN", "Panama");

const codeOf = (team) => {
  if (!team) return null;
  const byTla = team.tla && Object.values(GROUPS).flat().includes(team.tla) ? team.tla : null;
  return byTla || NAME2CODE[norm(team.name)] || NAME2CODE[norm(team.shortName)] || null;
};

// Mapeia o estágio da API para o prefixo do nosso chaveamento.
const STAGE = {
  LAST_32: { prefix: "R32", count: 16 }, ROUND_OF_32: { prefix: "R32", count: 16 },
  LAST_16: { prefix: "R16", count: 8 }, ROUND_OF_16: { prefix: "R16", count: 8 },
  QUARTER_FINALS: { prefix: "QF", count: 4 }, QUARTER_FINAL: { prefix: "QF", count: 4 },
  SEMI_FINALS: { prefix: "SF", count: 2 }, SEMI_FINAL: { prefix: "SF", count: 2 },
  THIRD_PLACE: { prefix: "3RD", single: "3RD" }, FINAL: { prefix: "FINAL", single: "FINAL" }
};

async function main() {
  if (!TOKEN) {
    console.log("ℹ️  FOOTBALL_DATA_TOKEN não configurado — nada a atualizar. (placares manuais continuam funcionando)");
    return;
  }

  let data;
  try {
    const res = await fetch(API, { headers: { "X-Auth-Token": TOKEN } });
    if (!res.ok) throw new Error(`API respondeu ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.error("⚠️  Falha ao consultar a API:", e.message);
    process.exitCode = 0; // não derruba o workflow
    return;
  }

  const matches = data.matches || [];
  const results = {};
  const fixtures = {};
  const koByStage = {};

  for (const m of matches) {
    const hc = codeOf(m.homeTeam), ac = codeOf(m.awayTeam);
    const finished = m.status === "FINISHED";
    const sh = m.score?.fullTime?.home, sa = m.score?.fullTime?.away;
    const stage = m.stage || "";

    if (stage === "GROUP_STAGE" || stage === "GROUP") {
      if (!hc || !ac) continue;
      const slot = groupPairIndex[`${hc}|${ac}`];
      if (slot && finished && sh != null && sa != null) {
        results[slot.id] = slot.home === hc ? { h: sh, a: sa } : { h: sa, a: sh };
      }
    } else if (STAGE[stage]) {
      (koByStage[stage] ||= []).push({ m, hc, ac, finished, sh, sa });
    }
  }

  // Mata-mata: ordena por data e encaixa nos nossos slots (melhor esforço).
  for (const [stage, arr] of Object.entries(koByStage)) {
    const cfg = STAGE[stage];
    arr.sort((x, y) => new Date(x.m.utcDate) - new Date(y.m.utcDate));
    arr.forEach((it, i) => {
      const id = cfg.single || `${cfg.prefix}-${i + 1}`;
      if (it.hc || it.ac) fixtures[id] = { home: it.hc || null, away: it.ac || null };
      if (it.finished && it.sh != null && it.sa != null) results[id] = { h: it.sh, a: it.sa };
    });
  }

  // Mescla com o que já existia (não apaga lançamentos anteriores).
  let prev = {};
  try { prev = JSON.parse(await readFile(OUT, "utf8")); } catch {}
  const out = {
    updatedAt: new Date().toISOString(),
    results: { ...(prev.results || {}), ...results },
    fixtures: { ...(prev.fixtures || {}), ...fixtures }
  };

  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`✅ Atualizado: ${Object.keys(out.results).length} placares, ${Object.keys(out.fixtures).length} confrontos de mata-mata.`);
}

main();
