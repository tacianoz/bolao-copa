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

// --- Calendário REAL da fase de grupos (fixtures oficiais da Copa 2026) ------
// Cada jogo = [mandante, visitante, "MM-DD", "HH:MM"] em HORÁRIO DE BRASÍLIA.
// Pesquisado jogo a jogo (confrontos + horários, convertidos de ET para -03:00).
// Obs.: alguns jogos noturnos no Pacífico/México caem na madrugada de Brasília.
const GROUP_FIXTURES = {
  A: [["MEX","RSA","06-11","16:00"],["KOR","CZE","06-11","23:00"],["MEX","KOR","06-18","22:00"],["CZE","RSA","06-18","13:00"],["RSA","KOR","06-24","22:00"],["CZE","MEX","06-24","22:00"]],
  B: [["CAN","BIH","06-12","19:00"],["QAT","SUI","06-13","16:00"],["CAN","QAT","06-18","19:00"],["SUI","BIH","06-18","16:00"],["SUI","CAN","06-24","19:00"],["BIH","QAT","06-24","19:00"]],
  C: [["BRA","MAR","06-13","19:00"],["SCO","HAI","06-13","22:00"],["BRA","HAI","06-19","21:30"],["SCO","MAR","06-19","19:00"],["SCO","BRA","06-24","19:00"],["MAR","HAI","06-24","19:00"]],
  D: [["USA","PAR","06-12","22:00"],["AUS","TUR","06-14","01:00"],["USA","AUS","06-19","16:00"],["TUR","PAR","06-20","01:00"],["PAR","AUS","06-25","23:00"],["TUR","USA","06-25","23:00"]],
  E: [["GER","CUW","06-14","14:00"],["CIV","ECU","06-14","20:00"],["GER","CIV","06-20","17:00"],["ECU","CUW","06-20","21:00"],["ECU","GER","06-25","17:00"],["CUW","CIV","06-25","17:00"]],
  F: [["NED","JPN","06-14","17:00"],["SWE","TUN","06-14","23:00"],["NED","SWE","06-20","14:00"],["TUN","JPN","06-21","01:00"],["JPN","SWE","06-25","20:00"],["TUN","NED","06-25","20:00"]],
  G: [["BEL","EGY","06-15","16:00"],["IRN","NZL","06-15","22:00"],["BEL","IRN","06-21","16:00"],["NZL","EGY","06-21","22:00"],["EGY","IRN","06-27","00:00"],["NZL","BEL","06-27","00:00"]],
  H: [["ESP","CPV","06-15","13:00"],["KSA","URU","06-15","19:00"],["ESP","KSA","06-21","13:00"],["URU","CPV","06-21","19:00"],["CPV","KSA","06-26","21:00"],["URU","ESP","06-26","21:00"]],
  I: [["FRA","SEN","06-16","16:00"],["IRQ","NOR","06-16","19:00"],["FRA","IRQ","06-22","18:00"],["NOR","SEN","06-22","21:00"],["NOR","FRA","06-26","16:00"],["SEN","IRQ","06-26","16:00"]],
  J: [["ARG","ALG","06-16","22:00"],["AUT","JOR","06-17","01:00"],["ARG","AUT","06-22","14:00"],["JOR","ALG","06-23","00:00"],["JOR","ARG","06-27","23:00"],["ALG","AUT","06-27","23:00"]],
  K: [["POR","COD","06-17","14:00"],["UZB","COL","06-17","23:00"],["POR","UZB","06-23","14:00"],["COL","COD","06-23","23:00"],["COL","POR","06-27","20:30"],["COD","UZB","06-27","20:30"]],
  L: [["ENG","CRO","06-17","17:00"],["GHA","PAN","06-17","20:00"],["ENG","GHA","06-23","17:00"],["PAN","CRO","06-23","20:00"],["CRO","GHA","06-27","18:00"],["PAN","ENG","06-27","18:00"]]
};

const MD_TIMES = ["14:00", "17:00", "20:00", "23:00"]; // horários genéricos do mata-mata
let cityIdx = 0;
function nextCity() { return CITIES[(cityIdx++) % CITIES.length]; }

// --- Geração do calendário da fase de grupos --------------------------------
const groupMatches = [];
for (const letter of Object.keys(GROUP_FIXTURES)) {
  GROUP_FIXTURES[letter].forEach((fx, idx) => {
    const md = Math.floor(idx / 2) + 1;     // 1, 2 ou 3
    const i = (idx % 2) + 1;                // 1º ou 2º jogo da rodada
    groupMatches.push({
      id: `${letter}-MD${md}-${i}`,
      fase: "grupos",
      grupo: letter,
      rodada: md,
      home: fx[0],
      away: fx[1],
      kickoff: `2026-${fx[2]}T${fx[3]}:00-03:00`,
      cidade: nextCity()
    });
  });
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
  // 28/06 -> 03/07 (datas válidas; o results.json sobrescreve com as reais)
  const d = 28 + Math.floor(i / 3);
  const date = d <= 30 ? `06-${d}` : `07-0${d - 30}`;
  knockoutMatches.push(ko(`R32-${i + 1}`, "16avos", date, MD_TIMES[i % 4], r32Labels[i]));
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
  "H-MD1-2": { h: 1, a: 1 },  // Arábia Saudita 1 x 1 Uruguai
  "I-MD1-1": { h: 3, a: 1 },  // França 3 x 1 Senegal
  "I-MD1-2": { h: 1, a: 4 },  // Iraque 1 x 4 Noruega
  "J-MD1-1": { h: 3, a: 0 },  // Argentina 3 x 0 Argélia
  "J-MD1-2": { h: 3, a: 1 },  // Áustria 3 x 1 Jordânia
  "K-MD1-1": { h: 1, a: 1 },  // Portugal 1 x 1 RD Congo
  "K-MD1-2": { h: 1, a: 3 },  // Uzbequistão 1 x 3 Colômbia
  "L-MD1-1": { h: 4, a: 2 },  // Inglaterra 4 x 2 Croácia
  "L-MD1-2": { h: 1, a: 0 },  // Gana 1 x 0 Panamá
  "A-MD2-1": { h: 1, a: 0 },  // México 1 x 0 Coreia do Sul
  "A-MD2-2": { h: 1, a: 1 },  // Tchéquia 1 x 1 África do Sul
  "B-MD2-1": { h: 6, a: 0 },  // Canadá 6 x 0 Catar
  "B-MD2-2": { h: 4, a: 1 },  // Suíça 4 x 1 Bósnia
  "C-MD2-1": { h: 3, a: 0 },  // Brasil 3 x 0 Haiti
  "C-MD2-2": { h: 0, a: 1 },  // Escócia 0 x 1 Marrocos
  "D-MD2-1": { h: 2, a: 0 },  // EUA 2 x 0 Austrália
  "D-MD2-2": { h: 0, a: 1 },  // Turquia 0 x 1 Paraguai
  "E-MD2-1": { h: 2, a: 1 },  // Alemanha 2 x 1 Costa do Marfim
  "E-MD2-2": { h: 0, a: 0 },  // Equador 0 x 0 Curaçao
  "F-MD2-1": { h: 5, a: 1 },  // Países Baixos 5 x 1 Suécia
  "F-MD2-2": { h: 0, a: 4 },  // Tunísia 0 x 4 Japão
  "G-MD2-1": { h: 0, a: 0 },  // Bélgica 0 x 0 Irã
  "G-MD2-2": { h: 1, a: 3 },  // Nova Zelândia 1 x 3 Egito
  "H-MD2-1": { h: 4, a: 0 },  // Espanha 4 x 0 Arábia Saudita
  "H-MD2-2": { h: 2, a: 2 }   // Uruguai 2 x 2 Cabo Verde
};

export const FASES = ["grupos", "16avos", "Oitavas", "Quartas", "Semifinal", "3º Lugar", "Final"];
