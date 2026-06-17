// ============================================================================
//  SISTEMA DE PONTUAÇÃO
// ============================================================================
import { APP } from "./config.js";
import { MATCHES } from "./data.js";

const P = APP.pontuacao;
const sign = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);

// Pontos de um palpite contra um resultado (sem multiplicador).
export function pointsFor(pick, result) {
  if (!pick || !result) return 0;
  const ph = +pick.h, pa = +pick.a, rh = +result.h, ra = +result.a;
  if ([ph, pa, rh, ra].some((n) => Number.isNaN(n))) return 0;

  // Cravou o placar exato
  if (ph === rh && pa === ra) return P.placarExato;

  // Acertou o vencedor (ou o empate)
  if (sign(ph - pa) === sign(rh - ra)) {
    // ...e ainda acertou o saldo de gols
    if (ph - pa === rh - ra) return P.saldoVencedor;
    return P.vencedor;
  }

  // Errou o resultado, mas acertou os gols de uma das seleções
  if (ph === rh || pa === ra) return P.golsTime;

  return P.erro;
}

// Multiplicador da fase (mata-mata vale mais).
function faseMultiplier(match) {
  return match.fase === "grupos" ? 1 : APP.multiplicadorMataMata;
}

export function matchPoints(match, pick, result) {
  return Math.round(pointsFor(pick, result) * faseMultiplier(match));
}

// Classifica a qualidade de um palpite (para exibir um selo colorido).
export function pickQuality(pick, result) {
  const base = pointsFor(pick, result);
  if (base >= P.placarExato) return "cravou";
  if (base >= P.saldoVencedor) return "saldo";
  if (base >= P.vencedor) return "vencedor";
  if (base >= P.golsTime) return "parcial";
  return "errou";
}

// Total de pontos de um jogador (mapa matchId -> {h,a}) dado os resultados.
export function totalPoints(picks, results) {
  let total = 0, cravadas = 0, acertos = 0, jogados = 0;
  for (const m of MATCHES) {
    const r = results[m.id];
    if (!r) continue;
    jogados++;
    const pick = picks?.[m.id];
    if (!pick) continue;
    const pts = matchPoints(m, pick, r);
    total += pts;
    if (pts > 0) acertos++;
    if (pointsFor(pick, r) >= P.placarExato) cravadas++;
  }
  return { total, cravadas, acertos, jogados };
}
