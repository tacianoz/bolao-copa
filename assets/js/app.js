// ============================================================================
//  TRETA DAS NAÇÕES · Bolão da Copa 2026  —  aplicação (interface + roteamento)
// ============================================================================
import { APP } from "./config.js";
import { TEAMS, GROUPS, MATCHES, FASES } from "./data.js";
import { store } from "./store.js";
import { matchPoints, pointsFor, pickQuality, totalPoints } from "./scoring.js";

const AVATARS = ["🗿", "🤙", "🐐", "🥶", "👑", "🤡", "💀", "😎", "🔥", "🥸", "🤠", "👽"];
const $ = (s, r = document) => r.querySelector(s);
const el = (h) => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const fmtFusoOpts = { timeZone: APP.fusoHorario, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };
const fmtDia = (iso) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: APP.fusoHorario, weekday: "long", day: "2-digit", month: "long" });
const fmtHora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { timeZone: APP.fusoHorario, hour: "2-digit", minute: "2-digit" });
const team = (code) => code ? TEAMS[code] : null;

const state = { picks: {}, results: {}, route: "jogos", faseFiltro: "grupos", saving: false };

// ----------------------------------------------------------------------------
//  BOOT
// ----------------------------------------------------------------------------
async function boot() {
  $("#app").innerHTML = `<div class="boot"><div class="seal">🌎</div><p>Esquentando a resenha… 🔥</p></div>`;
  await store.init();
  store.onAuth(async (user) => {
    if (user) {
      state.picks = await store.getMyPicks();
      state.results = await store.getResults();
    }
    render();
  });
}

function setRoute(r) { state.route = r; render(); }

// ----------------------------------------------------------------------------
//  RENDER PRINCIPAL
// ----------------------------------------------------------------------------
function render() {
  const root = $("#app");
  if (!store.user) { root.innerHTML = ""; root.appendChild(viewAuth()); return; }
  root.innerHTML = "";
  root.appendChild(layout());
}

function layout() {
  const wrap = el(`<div class="shell"></div>`);
  wrap.appendChild(header());
  const main = el(`<main class="main"></main>`);
  if (state.route === "jogos") main.appendChild(viewJogos());
  else if (state.route === "ranking") main.appendChild(viewRanking());
  else if (state.route === "bolada") main.appendChild(viewBolada());
  else if (state.route === "regras") main.appendChild(viewRegras());
  else if (state.route === "perfil") main.appendChild(viewPerfil());
  wrap.appendChild(main);
  wrap.appendChild(footer());
  return wrap;
}

function header() {
  const u = store.user;
  const modeBadge = store.mode === "local"
    ? `<span class="pill pill-warn" title="Configure o Firebase pra valer o ranking entre todo mundo">modo treino</span>` : "";
  const h = el(`
    <header class="topbar">
      <div class="brand">
        <span class="brand-seal">🌎</span>
        <div>
          <h1>${esc(APP.nome)}</h1>
          <small>${esc(APP.subtitulo)}</small>
        </div>
      </div>
      <nav class="nav">
        <button data-r="jogos">⚽ Jogão</button>
        <button data-r="ranking">🏆 Ranking</button>
        <button data-r="bolada">💰 Bolada</button>
        <button data-r="regras">📜 Regras</button>
        <button data-r="perfil" class="nav-user">${u.avatar} ${esc(u.displayName)} ${modeBadge}</button>
      </nav>
    </header>`);
  h.querySelectorAll(".nav button").forEach((b) =>
    b.addEventListener("click", () => setRoute(b.dataset.r)));
  h.querySelectorAll(".nav button").forEach((b) =>
    b.classList.toggle("active", b.dataset.r === state.route));
  return h;
}

function footer() {
  const upd = store.resultsUpdatedAt
    ? `Resultados atualizados em ${new Date(store.resultsUpdatedAt).toLocaleString("pt-BR", { timeZone: APP.fusoHorario })}`
    : `Resultado lançado na mão por enquanto`;
  return el(`<footer class="foot">🇧🇷 Feito na zoeira, com muito cafezinho e treta · ${esc(upd)}</footer>`);
}

// ============================================================================
//  AUTENTICAÇÃO
// ============================================================================
function viewAuth() {
  let avatar = "🗿";
  const card = el(`
    <div class="auth-bg">
      <div class="auth-card">
        <div class="auth-head">
          <div class="auth-seal">🌎</div>
          <h1>${esc(APP.nome)}</h1>
          <p class="auth-sub">${esc(APP.subtitulo)}</p>
          <p class="auth-tag">“Diplomata também chuta placar — e erra feio.” 🤙</p>
        </div>
        <div class="tabs">
          <button class="tab active" data-t="login">Bora entrar 🚪</button>
          <button class="tab" data-t="register">Criar conta (vrau)</button>
        </div>

        <form class="auth-form" data-form="login">
          <label>Seu e-mail
            <input type="email" name="email" required placeholder="seuemail@gmail.com" autocomplete="email">
          </label>
          <label>Senha
            <input type="password" name="password" required placeholder="••••••••" autocomplete="current-password">
          </label>
          <button type="submit" class="btn-primary">Bora pra cima 🚀</button>
          <button type="button" class="link" data-action="reset">Esqueci a senha (mó vacilo)</button>
        </form>

        <form class="auth-form hidden" data-form="register">
          <label>Seu nome de guerra
            <input name="displayName" required placeholder="Ex: Zé do Chute, Cabeça de Bagre…" maxlength="40">
          </label>
          <div class="row">
            <label>De onde tu fala?
              <input name="posto" placeholder="Ex: Sofá da sala 🛋️" maxlength="40">
            </label>
            <label>Sua figurinha
              <div class="avatar-pick">${AVATARS.map((a) => `<button type="button" class="av ${a === '🗿' ? 'sel' : ''}" data-av="${a}">${a}</button>`).join("")}</div>
            </label>
          </div>
          <label>E-mail
            <input type="email" name="email" required placeholder="seuemail@gmail.com" autocomplete="email">
          </label>
          <label>Senha (mín. 6 caracteres)
            <input type="password" name="password" required minlength="6" placeholder="••••••••" autocomplete="new-password">
          </label>
          <button type="submit" class="btn-primary">Criar conta e partir pro abraço 🤝</button>
        </form>

        <p class="auth-msg" data-msg></p>
      </div>
    </div>`);

  const msg = (t, ok) => { const m = card.querySelector("[data-msg]"); m.textContent = t; m.className = "auth-msg " + (ok ? "ok" : "err"); };

  card.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    card.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
    card.querySelector('[data-form="login"]').classList.toggle("hidden", t.dataset.t !== "login");
    card.querySelector('[data-form="register"]').classList.toggle("hidden", t.dataset.t !== "register");
    msg("");
  }));

  card.querySelectorAll(".av").forEach((b) => b.addEventListener("click", () => {
    card.querySelectorAll(".av").forEach((x) => x.classList.remove("sel"));
    b.classList.add("sel"); avatar = b.dataset.av;
  }));

  card.querySelector('[data-form="login"]').addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    try { msg("Conferindo se tu é gente boa…", true); await store.loginUser(f.email.value.trim(), f.password.value); }
    catch (err) { msg(traduzErro(err), false); }
  });

  card.querySelector('[data-action="reset"]').addEventListener("click", async () => {
    const email = card.querySelector('[data-form="login"] [name=email]').value.trim();
    if (!email) return msg("Bota teu e-mail aí em cima que eu mando o link. 👆", false);
    if (store.mode !== "firebase") return msg("Recuperar senha só rola no modo on-line (Firebase). No modo treino não tem como, foi mal. 🤷", false);
    try { await store.resetPassword(email); msg("Mandei um e-mail pra tu criar uma senha nova. Corre lá! ✉️", true); }
    catch (err) { msg(traduzErro(err), false); }
  });

  card.querySelector('[data-form="register"]').addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      msg("Criando teu perfil de craque…", true);
      await store.registerUser(f.email.value.trim(), f.password.value, f.displayName.value.trim(), f.posto.value.trim(), avatar);
      msg("Tá dentro! Agora é resenha. Bora cravar uns placar 🎉", true);
    } catch (err) { msg(traduzErro(err), false); }
  });

  return card;
}

function traduzErro(err) {
  const c = (err && err.code) || "";
  const map = {
    "auth/invalid-credential": "E-mail ou senha errados, parça. 👀",
    "auth/invalid-email": "Esse e-mail tá meio torto aí.",
    "auth/user-not-found": "Não achei essa conta. Cria uma!",
    "auth/wrong-password": "Senha errada. Bola pra frente. 😅",
    "auth/email-already-in-use": "Esse e-mail já tá no rolê. Tenta entrar.",
    "auth/weak-password": "Senha fraquinha. Bota pelo menos 6 caracteres.",
    "auth/too-many-requests": "Calma, calabreso! Tentou demais. Respira e tenta de novo."
  };
  return map[c] || (err && err.message) || "Deu ruim aqui. Tenta de novo. 🤷";
}

// ============================================================================
//  JOGOS + APOSTAS
// ============================================================================
function viewJogos() {
  const v = el(`<section class="view"></section>`);

  // resumo do jogador
  const stats = totalPoints(state.picks, state.results);
  v.appendChild(el(`
    <div class="hero">
      <div class="hero-l">
        <h2>Bora cravar uns placar 🎯</h2>
        <p>Chuta teu palpite antes do juiz apitar. Depois que a bola rola, já era — não dá mais pra mudar. 🔒</p>
      </div>
      <div class="hero-stats">
        <div><b>${stats.total}</b><span>pontão</span></div>
        <div><b>${stats.cravadas}</b><span>cravadas</span></div>
        <div><b>${nextDeadlineLabel()}</b><span>fecha quando</span></div>
      </div>
    </div>`));

  // filtros de fase
  const filtros = el(`<div class="filtros"></div>`);
  FASES.forEach((f) => {
    const b = el(`<button class="chip ${f === state.faseFiltro ? "active" : ""}">${faseNome(f)}</button>`);
    b.addEventListener("click", () => { state.faseFiltro = f; render(); });
    filtros.appendChild(b);
  });
  v.appendChild(filtros);

  // lista de jogos da fase, agrupada por dia
  const jogos = MATCHES.filter((m) => m.fase === state.faseFiltro)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

  if (state.faseFiltro === "grupos") v.appendChild(grupoTabs(jogos, v));
  else renderDias(v, jogos);

  return v;
}

function grupoTabs(jogos, container) {
  const wrap = el(`<div></div>`);
  const tabs = el(`<div class="grupo-tabs"></div>`);
  if (!state.grupoSel) state.grupoSel = "C"; // Brasil 🇧🇷
  Object.keys(GROUPS).forEach((g) => {
    const b = el(`<button class="gtab ${g === state.grupoSel ? "active" : ""}">Grupo ${g}</button>`);
    b.addEventListener("click", () => { state.grupoSel = g; render(); });
    tabs.appendChild(b);
  });
  wrap.appendChild(tabs);
  wrap.appendChild(tabelaGrupo(state.grupoSel));
  renderDias(wrap, jogos.filter((m) => m.grupo === state.grupoSel));
  return wrap;
}

function renderDias(container, jogos) {
  let lastDay = "";
  for (const m of jogos) {
    const d = fmtDia(m.kickoff);
    if (d !== lastDay) { container.appendChild(el(`<h3 class="dia">📆 ${d}</h3>`)); lastDay = d; }
    container.appendChild(matchCard(m));
  }
  if (!jogos.length) container.appendChild(el(`<p class="vazio">Nada por aqui ainda. Calma que a treta tá chegando. 🍿</p>`));
}

function matchCard(m) {
  const locked = Date.now() >= new Date(m.kickoff).getTime();
  const result = state.results[m.id];
  const pick = state.picks[m.id] || { h: "", a: "" };
  const h = team(m.home), a = team(m.away);
  const pts = (result && state.picks[m.id]) ? matchPoints(m, state.picks[m.id], result) : null;
  const q = (result && state.picks[m.id]) ? pickQuality(state.picks[m.id], result) : null;

  const card = el(`
    <article class="match ${locked ? "locked" : ""} ${result ? "done" : ""}" data-id="${m.id}">
      <div class="match-meta">
        <span>${fmtHora(m.kickoff)} · ${esc(m.cidade)}</span>
        ${m.fase !== "grupos" ? `<span class="fase-tag">${faseNome(m.fase)}</span>` : `<span>Grupo ${m.grupo} · ${m.rodada}ª rodada</span>`}
      </div>
      <div class="match-body">
        <div class="side side-h">
          <span class="flag">${h ? h.flag : "🏳️"}</span>
          <span class="tname">${h ? esc(h.nome) : esc(m.homeLabel || "A definir")}</span>
        </div>
        <div class="scoreboard">
          <input class="sc" inputmode="numeric" maxlength="2" data-side="h" value="${pick.h}" ${locked || !h ? "disabled" : ""}>
          <span class="x">×</span>
          <input class="sc" inputmode="numeric" maxlength="2" data-side="a" value="${pick.a}" ${locked || !a ? "disabled" : ""}>
        </div>
        <div class="side side-a">
          <span class="tname">${a ? esc(a.nome) : esc(m.awayLabel || "A definir")}</span>
          <span class="flag">${a ? a.flag : "🏳️"}</span>
        </div>
      </div>
      <div class="match-foot">
        ${result ? `<span class="real">Deu nisso: <b>${result.h} × ${result.a}</b></span>`
          : locked ? `<span class="lockmsg">🔒 Fechou, parça</span>`
          : `<span class="opening">🟢 Bora chutar!</span>`}
        ${pts !== null ? `<span class="badge q-${q}">${q === "cravou" ? "🎯 CRAVOU, MONSTRO!" : q === "saldo" ? "Quase! 😎" : q === "vencedor" ? "Acertou o vencedor 👍" : q === "parcial" ? "Migé 🤏" : "Errou feio 💀"} · ${pts} pts</span>` : ""}
        ${store.isAdmin() ? `<button class="link adm" data-adm="${m.id}">⚙️ botar o placar</button>` : ""}
      </div>
    </article>`);

  // entrada de palpite com auto-save (debounce)
  const inputs = card.querySelectorAll(".sc");
  inputs.forEach((inp) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/[^0-9]/g, "").slice(0, 2);
      schedulePickSave(m.id, card);
    });
  });
  const adm = card.querySelector("[data-adm]");
  if (adm) adm.addEventListener("click", () => promptAdminResult(m));
  return card;
}

let saveTimer = null;
function schedulePickSave(matchId, card) {
  const h = card.querySelector('[data-side=h]').value;
  const a = card.querySelector('[data-side=a]').value;
  if (h === "" || a === "") { state.picks[matchId] && delete state.picks[matchId]; return; }
  state.picks[matchId] = { h: +h, a: +a };
  card.classList.add("touched");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await store.savePicks(state.picks);
      toast("Palpite salvo, brabo! ✍️");
      card.classList.remove("touched"); card.classList.add("flash");
      setTimeout(() => card.classList.remove("flash"), 600);
    } catch (e) { toast("Deu ruim ao salvar 😬", true); }
  }, 700);
}

// Tabela de classificação do grupo (calculada a partir dos resultados)
function tabelaGrupo(letter) {
  const tbl = {};
  GROUPS[letter].forEach((c) => tbl[c] = { c, P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0 });
  MATCHES.filter((m) => m.fase === "grupos" && m.grupo === letter).forEach((m) => {
    const r = state.results[m.id]; if (!r) return;
    const H = tbl[m.home], A = tbl[m.away];
    H.J++; A.J++; H.GP += r.h; H.GC += r.a; A.GP += r.a; A.GC += r.h;
    if (r.h > r.a) { H.V++; A.D++; H.P += 3; }
    else if (r.h < r.a) { A.V++; H.D++; A.P += 3; }
    else { H.E++; A.E++; H.P++; A.P++; }
  });
  const rows = Object.values(tbl).sort((x, y) =>
    y.P - x.P || (y.GP - y.GC) - (x.GP - x.GC) || y.GP - x.GP);
  return el(`
    <table class="tabela">
      <thead><tr><th>#</th><th>Seleção</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr></thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr class="${i < 2 ? "qualif" : i === 2 ? "repesca" : ""}">
            <td>${i + 1}</td>
            <td class="tt">${TEAMS[r.c].flag} ${esc(TEAMS[r.c].nome)}</td>
            <td><b>${r.P}</b></td><td>${r.J}</td><td>${r.V}</td><td>${r.E}</td><td>${r.D}</td>
            <td>${(r.GP - r.GC > 0 ? "+" : "") + (r.GP - r.GC)}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <p class="legenda"><span class="dot qualif"></span> classificados (brabos) &nbsp; <span class="dot repesca"></span> 3º (vai na fé) 🙏</p>`);
}

// ============================================================================
//  RANKING
// ============================================================================
function viewRanking() {
  const v = el(`<section class="view"></section>`);
  v.appendChild(el(`<div class="hero"><div class="hero-l"><h2>Ranking dos Brabo 🏆</h2><p>Os monstro que mais cravam placar. Cadê tu nessa lista, hein? 👀</p></div></div>`));
  const list = el(`<div class="rank-list"><p class="vazio">Juntando a galera…</p></div>`);
  v.appendChild(list);

  store.allPlayers().then((players) => {
    const ranked = players.map((p) => ({ ...p, ...totalPoints(p.picks, state.results) }))
      .sort((a, b) => b.total - a.total || b.cravadas - a.cravadas);
    list.innerHTML = "";
    if (!ranked.length) { list.appendChild(el(`<p class="vazio">Ninguém chutou nada ainda. Sê o primeiro, vai! 🐔</p>`)); return; }
    ranked.forEach((p, i) => {
      const me = p.uid === store.user.uid;
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
      list.appendChild(el(`
        <div class="rank-row ${me ? "me" : ""} ${i < 3 ? "podium" : ""}">
          <div class="rk-pos">${medal}</div>
          <div class="rk-av">${p.avatar || "🎩"}</div>
          <div class="rk-id">
            <b>${esc(p.displayName)}${me ? " <span class='tag-you'>você</span>" : ""}</b>
            <small>${esc(p.posto || "Em algum lugar do mundo 🌎")}</small>
          </div>
          <div class="rk-num"><b>${p.cravadas}</b><span>🎯</span></div>
          <div class="rk-num"><b>${p.acertos}</b><span>acertos</span></div>
          <div class="rk-pts">${p.total}<span>pts</span></div>
        </div>`));
    });
  });
  return v;
}

// ============================================================================
//  BOLADA (premiação)
// ============================================================================
function viewBolada() {
  const pr = APP.premiacao;
  const moeda = (n) => `${pr.moeda} ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const v = el(`<section class="view"></section>`);
  v.appendChild(el(`<div class="hero"><div class="hero-l"><h2>A Bolada 💰</h2><p>Onde tem dinheiro, a treta é maior. Aqui a gente só mostra a conta — o PIX corre solto no grupo. 🤝</p></div></div>`));

  const box = el(`<div class="bolada"><p class="vazio">Contando a grana…</p></div>`);
  v.appendChild(box);

  store.allPlayers().then((players) => {
    const n = players.length || 1;
    const pote = n * pr.cota;
    const ranked = players.map((p) => ({ ...p, ...totalPoints(p.picks, state.results) }))
      .sort((a, b) => b.total - a.total || b.cravadas - a.cravadas);

    box.innerHTML = "";
    box.appendChild(el(`
      <div class="pote-card">
        <div class="pote-top">
          <div><span>Cota por cabeça</span><b>${moeda(pr.cota)}</b></div>
          <div><span>Gente no bolão</span><b>${players.length} 🤙</b></div>
          <div class="pote-big"><span>Pote total na mesa</span><b>${moeda(pote)}</b></div>
        </div>
      </div>`));

    const grid = el(`<div class="premios"></div>`);
    pr.divisao.forEach((d, i) => {
      const ganhador = ranked[i];
      const valor = pote * (d.pct / 100);
      grid.appendChild(el(`
        <div class="premio ${i === 0 ? "ouro" : ""}">
          <div class="premio-emoji">${d.emoji}</div>
          <div class="premio-pos">${esc(d.pos)} <small>(${d.pct}% do pote)</small></div>
          <div class="premio-valor">${moeda(valor)}</div>
          <div class="premio-quem">${ganhador
            ? `por enquanto: <b>${ganhador.avatar || "🎩"} ${esc(ganhador.displayName)}</b>`
            : `tá sobrando, hein 👀`}</div>
        </div>`));
    });
    box.appendChild(grid);

    if (pr.lanterna) {
      const last = ranked[ranked.length - 1];
      box.appendChild(el(`<div class="lanterna">🔦 <b>Castigo da lanterna:</b> ${esc(pr.lanterna)}${last && ranked.length > 1 ? ` &nbsp;Agora seria o <b>${esc(last.displayName)}</b> pagando. 💀` : ""}</div>`));
    }
    box.appendChild(el(`<p class="disclaimer">💡 O app só mostra a divisão pra todo mundo ficar de olho. O pagamento da cota e a entrega do prêmio acontecem por fora (PIX no grupo). Sem treta. 😇</p>`));
  });
  return v;
}

// ============================================================================
//  REGRAS
// ============================================================================
function viewRegras() {
  const P = APP.pontuacao;
  const v = el(`<section class="view"></section>`);
  v.appendChild(el(`
    <div class="hero"><div class="hero-l"><h2>As Regra da Zoeira 📜</h2><p>Tá tudo aqui, sem rolo. Lê com atenção pra não vir chorar depois. 😏</p></div></div>
    <div class="cards">
      <div class="rule"><span class="rb">${P.placarExato}</span><div><h4>🎯 Cravou o placar</h4><p>Acertou o placar na mosca. Tu é brabo demais. 🐐</p></div></div>
      <div class="rule"><span class="rb">${P.saldoVencedor}</span><div><h4>Vencedor + saldo</h4><p>Acertou quem ganhou (ou o empate) e o saldo de gols. Quase lá! 😎</p></div></div>
      <div class="rule"><span class="rb">${P.vencedor}</span><div><h4>Só o vencedor</h4><p>Acertou só quem levou a melhor (ou o empate). Tá valendo. 👍</p></div></div>
      <div class="rule"><span class="rb">${P.golsTime}</span><div><h4>Migé (parcial)</h4><p>Errou o resultado, mas acertou os gols de um dos times. Migué conta. 🤏</p></div></div>
    </div>
    <div class="info">
      <h4>🔒 Fechou, fechou</h4>
      <p>Pode mudar teu palpite o quanto quiser até o <b>juiz apitar</b> (horário de Brasília). Depois que a bola rola, acabou — não chora.</p>
      <h4>⚔️ Mata-mata vale mais</h4>
      <p>Das oitavas em diante, cada jogo vale <b>${APP.multiplicadorMataMata}×</b> os pontos. É onde a treta esquenta de vez. 🔥</p>
      <h4>🤝 Empatou? E agora?</h4>
      <p>Se dois cabras empatarem na pontuação, leva quem tiver mais <b>placares cravados</b>. Frieza no chute decide.</p>
      <h4>📡 Resultado no automático</h4>
      <p>Os resultados e o chaveamento do mata-mata atualizam sozinhos todo dia, via robô (cron). Mágica, sem ninguém precisar mexer. 🤖</p>
    </div>`));
  return v;
}

// ============================================================================
//  PERFIL
// ============================================================================
function viewPerfil() {
  const u = store.user;
  const stats = totalPoints(state.picks, state.results);
  const v = el(`<section class="view"></section>`);
  const card = el(`
    <div class="perfil">
      <div class="perfil-head">
        <div class="perfil-av">${u.avatar}</div>
        <div>
          <h2>${esc(u.displayName)}</h2>
          <p>${esc(u.posto || "Em algum lugar do mundo 🌎")}</p>
          <small>${esc(u.email)} ${store.mode === "firebase" && u.emailVerified === false ? "· <span class='pill pill-warn'>e-mail não verificado</span>" : ""}</small>
        </div>
      </div>
      <div class="perfil-stats">
        <div><b>${stats.total}</b><span>pontos</span></div>
        <div><b>${stats.cravadas}</b><span>cravadas</span></div>
        <div><b>${stats.acertos}</b><span>acertos</span></div>
        <div><b>${Object.keys(state.picks).length}</b><span>palpites</span></div>
      </div>
      <form class="perfil-form">
        <label>Nome de guerra<input name="displayName" value="${esc(u.displayName)}" maxlength="40"></label>
        <label>De onde tu fala?<input name="posto" value="${esc(u.posto || "")}" maxlength="40"></label>
        <label>Figurinha<div class="avatar-pick">${AVATARS.map((a) => `<button type="button" class="av ${a === u.avatar ? "sel" : ""}" data-av="${a}">${a}</button>`).join("")}</div></label>
        <button class="btn-primary" type="submit">Salvar</button>
      </form>
      <button class="btn-ghost" data-action="logout">Sair (foi bom enquanto durou) 👋</button>
    </div>`);
  let avatar = u.avatar;
  card.querySelectorAll(".av").forEach((b) => b.addEventListener("click", () => {
    card.querySelectorAll(".av").forEach((x) => x.classList.remove("sel"));
    b.classList.add("sel"); avatar = b.dataset.av;
  }));
  card.querySelector(".perfil-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await store.updateProfile({ displayName: e.target.displayName.value.trim() || u.displayName, posto: e.target.posto.value.trim(), avatar });
    toast("Salvo, chefia! ✔"); render();
  });
  card.querySelector('[data-action="logout"]').addEventListener("click", async () => { await store.logout(); });
  v.appendChild(card);
  return v;
}

// ============================================================================
//  ADMIN — lançar resultado manualmente
// ============================================================================
async function promptAdminResult(m) {
  const h = team(m.home), a = team(m.away);
  const cur = state.results[m.id];
  const raw = prompt(`Lançar placar oficial:\n${(h ? h.nome : m.homeLabel)} × ${(a ? a.nome : m.awayLabel)}\n\nDigite no formato  2-1  (ou deixe vazio para apagar)`,
    cur ? `${cur.h}-${cur.a}` : "");
  if (raw === null) return;
  if (raw.trim() === "") { await store.saveResult(m.id, null); }
  else {
    const mm = raw.match(/^\s*(\d+)\s*[-x×:]\s*(\d+)\s*$/i);
    if (!mm) return toast("Formato inválido. Use 2-1", true);
    await store.saveResult(m.id, { h: +mm[1], a: +mm[2] });
  }
  state.results = await store.getResults();
  toast("Resultado atualizado ✔");
  render();
}

// ============================================================================
//  UTILIDADES DE INTERFACE
// ============================================================================
function faseNome(f) {
  return { grupos: "Fase de Grupos", "32avos": "32 avos", Oitavas: "Oitavas", Quartas: "Quartas", Semifinal: "Semis", "3º Lugar": "3º Lugar", Final: "Final" }[f] || f;
}
function nextDeadlineLabel() {
  const next = MATCHES.map((m) => new Date(m.kickoff).getTime()).filter((t) => t > Date.now()).sort((a, b) => a - b)[0];
  if (!next) return "—";
  return new Date(next).toLocaleString("pt-BR", fmtFusoOpts);
}
function toast(text, err) {
  const t = el(`<div class="toast ${err ? "err" : ""}">${esc(text)}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2200);
}

boot();
