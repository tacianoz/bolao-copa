// ============================================================================
//  CONFIGURAÇÃO DO BOLÃO  —  "Bolão da Zoeira Mundial · Copa 2026"
// ----------------------------------------------------------------------------
//  Edite este arquivo para conectar seu projeto Firebase (autenticação por
//  e-mail + ranking compartilhado entre todos os diplomatas).
//
//  Se você deixar FIREBASE_CONFIG.apiKey em branco, o app roda em
//  MODO LOCAL (demonstração): tudo funciona no seu navegador, mas os palpites
//  e o ranking ficam apenas neste dispositivo.
//
//  Passo a passo para ativar o modo on-line está no README.md.
// ============================================================================

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD3QXhTMfr0zl4ONQGiFdXlGceFppdofQ4",
  authDomain: "bolao-copa-e83e0.firebaseapp.com",
  projectId: "bolao-copa-e83e0",
  storageBucket: "bolao-copa-e83e0.firebasestorage.app",
  messagingSenderId: "1099111977780",
  appId: "1:1099111977780:web:bd5c00683d94cc29ef8b61"
};

export const APP = {
  // Nome do bolão exibido no cabeçalho
  nome: "Treta das Nações",
  subtitulo: "Copa 2026 · o bolão que une (e separa) as nações 🌎⚽",

  // Fuso usado para mostrar e travar os jogos (horário de Brasília).
  fusoHorario: "America/Sao_Paulo",

  // E-mails com poderes de administrador (podem lançar/corrigir resultados
  // manualmente pela interface). Coloque os e-mails dos organizadores.
  admins: ["tacianoz@gmail.com"],

  // Sistema de pontuação (inspirado nos melhores bolões brasileiros).
  pontuacao: {
    placarExato: 10,   // cravou o placar (ex: palpite 2x1, resultado 2x1)
    saldoVencedor: 7,  // acertou o vencedor E o saldo de gols
    vencedor: 5,       // acertou apenas o vencedor (ou o empate)
    golsTime: 2,       // acertou o número de gols de uma das seleções
    erro: 0
  },

  // Bônus de fase final (mata-mata) — multiplica os pontos do jogo.
  multiplicadorMataMata: 1.5,

  // -------------------------------------------------------------------------
  //  BOLADA (premiação) — o app apenas MOSTRA a divisão; o pagamento e o
  //  acerto da grana acontecem por fora (PIX no grupo, na unha, como preferir).
  // -------------------------------------------------------------------------
  premiacao: {
    cota: 30,        // valor da entrada por pessoa
    moeda: "R$",
    // Como o pote é dividido no fim da Copa (a soma das % deve dar 100).
    divisao: [
      { pos: "1º lugar", pct: 70, emoji: "🥇" },
      { pos: "2º lugar", pct: 20, emoji: "🥈" },
      { pos: "3º lugar", pct: 10, emoji: "🥉" }
    ],
    // Castigo de honra pra quem terminar em último (só na zoeira).
    lanterna: "A lanterna paga a primeira rodada de cerveja da resenha. 🍺"
  }
};
