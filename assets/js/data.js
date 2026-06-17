// ============================================================================
//  DADOS DA COPA DO MUNDO 2026  —  seleções, grupos, calendário completo
//  Sorteio final oficial (grupos A–L) com as vagas de repescagem já definidas.
// ============================================================================

// --- Seleções: código -> { nome em português, bandeira emoji } -------------
export const TEAMS = {
  MEX: { nome: "México",          flag: "🇲🇽" },
  RSA: { nome: "África do Sul",   flag: "🇿🇦" },
  KOR: { nome: "Coreia do Sul",   flag: "🇰🇷" },
  CZE: { nome: "Tchéquia",        flag: "🇨🇿" },
  CAN: { nome: "Canadá",          flag: "🇨🇦" },
  BIH: { nome: "Bósnia e Herz.",  flag: "🇧🇦" },
  QAT: { nome: "Catar",           flag: "🇶🇦" },
  SUI: { nome: "Suíça",           flag: "🇨🇭" },
  BRA: { nome: "Brasil",          flag: "🇧🇷" },
  MAR: { nome: "Marrocos",        flag: "🇲🇦" },
  SCO: { nome: "Escócia",         flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  HAI: { nome: "Haiti",           flag: "🇭🇹" },
  USA: { nome: "Estados Unidos",  flag: "🇺🇸" },
  PAR: { nome: "Paraguai",        flag: "🇵🇾" },
  AUS: { nome: "Austrália",       flag: "🇦🇺" },
  TUR: { nome: "Turquia",         flag: "🇹🇷" },
  GER: { nome: "Alemanha",        flag: "🇩🇪" },
  CUW: { nome: "Curaçao",         flag: "🇨🇼" },
  CIV: { nome: "Costa do Marfim", flag: "🇨🇮" },
  ECU: { nome: "Equador",         flag: "🇪🇨" },
  NED: { nome: "Países Baixos",   flag: "🇳🇱" },
  JPN: { nome: "Japão",           flag: "🇯🇵" },
  SWE: { nome: "Suécia",          flag: "🇸🇪" },
  TUN: { nome: "Tunísia",         flag: "🇹🇳" },
  BEL: { nome: "Bélgica",         flag: "🇧🇪" },
  EGY: { nome: "Egito",           flag: "🇪🇬" },
  IRN: { nome: "Irã",             flag: "🇮🇷" },
  NZL: { nome: "Nova Zelândia",   flag: "🇳🇿" },
  ESP: { nome: "Espanha",         flag: "🇪🇸" },
  CPV: { nome: "Cabo Verde",      flag: "🇨🇻" },
  KSA: { nome: "Arábia Saudita",  flag: "🇸🇦" },
  URU: { nome: "Uruguai",         flag: "🇺🇾" },
  FRA: { nome: "França",          flag: "🇫🇷" },
  SEN: { nome: "Senegal",         flag: "🇸🇳" },
  IRQ: { nome: "Iraque",          flag: "🇮🇶" },
  NOR: { nome: "Noruega",         flag: "🇳🇴" },
  ARG: { nome: "Argentina",       flag: "🇦🇷" },
  ALG: { nome: "Argélia",         flag: "🇩🇿" },
  AUT: { nome: "Áustria",         flag: "🇦🇹" },
  JOR: { nome: "Jordânia",        flag: "🇯🇴" },
  POR: { nome: "Portugal",        flag: "🇵🇹" },
  COD: { nome: "RD Congo",        flag: "🇨🇩" },
  UZB: { nome: "Uzbequistão",     flag: "🇺🇿" },
  COL: { nome: "Colômbia",        flag: "🇨🇴" },
  ENG: { nome: "Inglaterra",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  CRO: { nome: "Croácia",         flag: "🇭🇷" },
  GHA: { nome: "Gana",            flag: "🇬🇭" },
  PAN: { nome: "Panamá",          flag: "🇵🇦" }
};

// --- Grupos (ordem usada para gerar os confrontos das rodadas) --------------
export const GROUPS = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "SCO", "HAI"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"]
};

// --- Cidades-sede (16) ------------------------------------------------------
const CITIES = [
  "Cidade do México 🇲🇽", "Guadalajara 🇲🇽", "Monterrey 🇲🇽",
  "Toronto 🇨🇦", "Vancouver 🇨🇦",
  "Atlanta 🇺🇸", "Boston 🇺🇸", "Dallas 🇺🇸", "Houston 🇺🇸",
  "Kansas City 🇺🇸", "Los Angeles 🇺🇸", "Miami 🇺🇸",
  "Nova York / Nova Jersey 🇺🇸", "Filadélfia 🇺🇸",
  "São Francisco 🇺🇸", "Seattle 🇺🇸"
];

// Confrontos por rodada dentro de um grupo de 4 (índices 0..3).
// Garante que cada seleção enfrente as outras três.
const ROUND_PAIRS = {
  1: [[0, 1], [2, 3]],
  2: [[0, 2], [3, 1]],
  3: [[0, 3], [1, 2]]
};

// Datas (horário de Brasília, fuso -03:00) por grupo e rodada.
const MD1_DATE = {
  A: "06-11", B: "06-12", C: "06-13", D: "06-12", E: "06-14", F: "06-14",
  G: "06-15", H: "06-15", I: "06-16", J: "06-16", K: "06-17", L: "06-17"
};
const MD_TIMES = ["13:00", "16:00", "19:00", "22:00"];

function groupBlock(letter) {
  // bloco de 0..3 conforme a ordem das letras, para escalonar MD2/MD3
  return Math.floor("ABCDEFGHIJKL".indexOf(letter) / 3);
}
function md2Date(letter) { return `06-${18 + groupBlock(letter)}`; }
function md3Date(letter) { return `06-${24 + groupBlock(letter)}`; }

let cityIdx = 0;
function nextCity() { return CITIES[(cityIdx++) % CITIES.length]; }

// --- Geração do calendário da fase de grupos --------------------------------
const groupMatches = [];
for (const letter of Object.keys(GROUPS)) {
  const teams = GROUPS[letter];
  for (const md of [1, 2, 3]) {
    const date =
      md === 1 ? MD1_DATE[letter] : md === 2 ? md2Date(letter) : md3Date(letter);
    ROUND_PAIRS[md].forEach((pair, i) => {
      groupMatches.push({
        id: `${letter}-MD${md}-${i + 1}`,
        fase: "grupos",
        grupo: letter,
        rodada: md,
        home: teams[pair[0]],
        away: teams[pair[1]],
        kickoff: `2026-${date}T${MD_TIMES[(i + md) % MD_TIMES.length]}:00-03:00`,
        cidade: nextCity()
      });
    });
  }
}

// --- Mata-mata (chaveamento, seleções a definir conforme classificação) -----
function ko(id, fase, date, time, label) {
  return {
    id, fase,
    home: null, away: null,
    homeLabel: label[0], awayLabel: label[1],
    kickoff: `2026-${date}T${time}:00-03:00`,
    cidade: nextCity()
  };
}

const knockoutMatches = [];
// Rodada de 32 (28/06 a 03/07) — 16 jogos
const r32Labels = [
  ["1º A", "3º C/E/F/H"], ["1º C", "2º F"], ["1º E", "2º A"], ["1º F", "2º C"],
  ["1º I", "3º A/B/G/H"], ["1º J", "2º L"], ["1º B", "3º E/F/G/I"], ["1º D", "2º H"],
  ["1º G", "2º B"], ["1º H", "2º J"], ["1º K", "3º D/E/I/J"], ["1º L", "2º K"],
  ["2º D", "2º G"], ["1º A", "3º B"], ["2º E", "2º I"], ["1º A", "2º A"]
];
for (let i = 0; i < 16; i++) {
  const day = 28 + Math.floor(i / 3); // 28/06 -> 03/07
  knockoutMatches.push(ko(`R32-${i + 1}`, "32avos", `06-${day}`, MD_TIMES[i % 4], r32Labels[i]));
}
// Oitavas (04 a 07/07) — 8 jogos
for (let i = 0; i < 8; i++) {
  const day = String(4 + Math.floor(i / 2)).padStart(2, "0");
  knockoutMatches.push(ko(`R16-${i + 1}`, "Oitavas", `07-${day}`, MD_TIMES[i % 4],
    [`Vencedor 32A-${i * 2 + 1}`, `Vencedor 32A-${i * 2 + 2}`]));
}
// Quartas (09 a 11/07) — 4 jogos
for (let i = 0; i < 4; i++) {
  const day = String(9 + Math.floor(i / 2)).padStart(2, "0");
  knockoutMatches.push(ko(`QF-${i + 1}`, "Quartas", `07-${day}`, MD_TIMES[i % 2 + 1],
    [`Vencedor Oitava ${i * 2 + 1}`, `Vencedor Oitava ${i * 2 + 2}`]));
}
// Semifinais (14 e 15/07)
knockoutMatches.push(ko("SF-1", "Semifinal", "07-14", "16:00", ["Vencedor Quarta 1", "Vencedor Quarta 2"]));
knockoutMatches.push(ko("SF-2", "Semifinal", "07-15", "16:00", ["Vencedor Quarta 3", "Vencedor Quarta 4"]));
// Disputa de 3º lugar (18/07) e Final (19/07)
knockoutMatches.push(ko("3RD", "3º Lugar", "07-18", "13:00", ["Perdedor Semi 1", "Perdedor Semi 2"]));
knockoutMatches.push(ko("FINAL", "Final", "07-19", "16:00", ["Vencedor Semi 1", "Vencedor Semi 2"]));

// --- Calendário completo ----------------------------------------------------
export const MATCHES = [...groupMatches, ...knockoutMatches];

// --- Resultados oficiais já conhecidos (atualizados pelo cron diário) -------
// Chave = id do jogo, valor = { h: gols mandante, a: gols visitante }
export const DEFAULT_RESULTS = {
  "A-MD1-1": { h: 2, a: 0 },  // México 2 x 0 África do Sul
  "A-MD1-2": { h: 2, a: 1 },  // Coreia do Sul 2 x 1 Tchéquia
  "B-MD1-1": { h: 1, a: 1 },  // Canadá 1 x 1 Bósnia
  "B-MD1-2": { h: 1, a: 1 },  // Catar 1 x 1 Suíça
  "C-MD1-1": { h: 1, a: 1 },  // Brasil 1 x 1 Marrocos
  "C-MD1-2": { h: 1, a: 0 },  // Escócia 1 x 0 Haiti
  "D-MD1-1": { h: 4, a: 1 },  // EUA 4 x 1 Paraguai
  "D-MD1-2": { h: 2, a: 0 },  // Austrália 2 x 0 Turquia
  "E-MD1-1": { h: 7, a: 1 },  // Alemanha 7 x 1 Curaçao
  "E-MD1-2": { h: 1, a: 0 },  // Costa do Marfim 1 x 0 Equador
  "F-MD1-1": { h: 2, a: 2 },  // Países Baixos 2 x 2 Japão
  "F-MD1-2": { h: 5, a: 1 },  // Suécia 5 x 1 Tunísia
  "G-MD1-1": { h: 1, a: 1 },  // Bélgica 1 x 1 Egito
  "G-MD1-2": { h: 2, a: 2 },  // Irã 2 x 2 Nova Zelândia
  "H-MD1-1": { h: 0, a: 0 },  // Espanha 0 x 0 Cabo Verde
  "H-MD1-2": { h: 1, a: 1 }   // Arábia Saudita 1 x 1 Uruguai
};

export const FASES = ["grupos", "32avos", "Oitavas", "Quartas", "Semifinal", "3º Lugar", "Final"];
