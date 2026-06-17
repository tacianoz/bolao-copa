// ============================================================================
//  CAMADA DE DADOS  —  autenticação por e-mail + persistência de palpites
//  Usa Firebase (Auth + Firestore) quando configurado; caso contrário,
//  funciona em MODO LOCAL (localStorage) para demonstração.
// ============================================================================
import { FIREBASE_CONFIG, APP } from "./config.js";
import { DEFAULT_RESULTS, MATCHES, GROUPS } from "./data.js";

// ----------------------------------------------------------------------------
//  MIGRAÇÃO DE PALPITES  —  quando o calendário muda, os palpites já feitos
//  são transferidos para o jogo da DUPLA CERTA de seleções (ajustando o mando).
// ----------------------------------------------------------------------------
const FXV = 2; // versão atual do calendário (fixtures reais)
// Esquema ANTIGO (rotação automática) que estava no ar antes da correção.
const OLD_PAIRS = { 1: [[0, 1], [2, 3]], 2: [[0, 2], [3, 1]], 3: [[0, 3], [1, 2]] };
function oldTeamsForId(id) {
  const m = id.match(/^([A-L])-MD([123])-([12])$/);
  if (!m) return null;
  const pair = OLD_PAIRS[+m[2]][+m[3] - 1];
  const t = GROUPS[m[1]];
  return [t[pair[0]], t[pair[1]]];
}
function newSlotForPair(a, b) {
  return MATCHES.find((mt) => mt.fase === "grupos" &&
    ((mt.home === a && mt.away === b) || (mt.home === b && mt.away === a))) || null;
}
function migrateV2(picks) {
  const out = {};
  for (const [id, sc] of Object.entries(picks || {})) {
    const old = oldTeamsForId(id);
    if (!old) { out[id] = sc; continue; }          // mata-mata / id desconhecido
    const slot = newSlotForPair(old[0], old[1]);
    if (!slot) { out[id] = sc; continue; }
    out[slot.id] = slot.home === old[0] ? sc : { h: sc.a, a: sc.h }; // ajusta mando
  }
  return out;
}
function applyMigrations(picks, fxv) {
  return (fxv || 1) < FXV ? migrateV2(picks) : (picks || {});
}

const FB_VER = "10.12.2";
const CDN = (m) => `https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${m}.js`;

export const store = {
  mode: "local",        // "firebase" | "local"
  user: null,           // { uid, email, displayName, posto, avatar }
  _fb: null,            // { auth, db, fns... }
  _listeners: [],
  _overrideResults: {}, // resultados do cron (results.json) + lançamentos admin

  isConfigured() {
    return !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
  },

  onAuth(cb) { this._listeners.push(cb); if (this.user !== undefined) cb(this.user); },
  _emit() { this._listeners.forEach((cb) => cb(this.user)); },

  // --- Inicialização --------------------------------------------------------
  async init() {
    await this._loadResultsFile();
    if (this.isConfigured()) {
      try {
        // Rede de segurança: o boot nunca fica preso esperando o Firebase.
        await Promise.race([
          this._initFirebase(),
          new Promise((res) => setTimeout(res, 10000))
        ]);
        this.mode = "firebase";
        return;
      } catch (e) { console.warn("Firebase indisponível, usando modo local:", e); }
    }
    this.mode = "local";
    this._initLocal();
  },

  async _loadResultsFile() {
    try {
      const res = await fetch("assets/data/results.json", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        this._overrideResults = json.results || {};
        this.resultsUpdatedAt = json.updatedAt || null;
        // Preenche os confrontos do mata-mata conforme a classificação real.
        const fx = json.fixtures || {};
        for (const m of MATCHES) {
          if (fx[m.id]) {
            if (fx[m.id].home) m.home = fx[m.id].home;
            if (fx[m.id].away) m.away = fx[m.id].away;
          }
        }
      }
    } catch { /* arquivo ainda não gerado pelo cron — tudo bem */ }
  },

  // --- Resultados efetivos (defaults + cron + lançamentos admin) -----------
  async getResults() {
    let admin = {};
    if (this.mode === "firebase") {
      const { doc, getDoc } = this._fb;
      const snap = await getDoc(doc(this._fb.db, "results", "official"));
      if (snap.exists()) admin = snap.data().results || {};
    } else {
      admin = JSON.parse(localStorage.getItem("bolao.results") || "{}");
    }
    return { ...DEFAULT_RESULTS, ...this._overrideResults, ...admin };
  },

  async saveResult(matchId, result) {
    if (this.mode === "firebase") {
      const { doc, setDoc, db } = this._fb;
      await setDoc(doc(db, "results", "official"),
        { results: { [matchId]: result } }, { merge: true });
    } else {
      const r = JSON.parse(localStorage.getItem("bolao.results") || "{}");
      if (result === null) delete r[matchId]; else r[matchId] = result;
      localStorage.setItem("bolao.results", JSON.stringify(r));
    }
  },

  isAdmin() {
    return !!this.user && APP.admins.includes((this.user.email || "").toLowerCase());
  },

  // ==========================================================================
  //  FIREBASE
  // ==========================================================================
  async _initFirebase() {
    const appMod = await import(CDN("app"));
    const authMod = await import(CDN("auth"));
    const dbMod = await import(CDN("firestore"));
    const app = appMod.initializeApp(FIREBASE_CONFIG);
    const auth = authMod.getAuth(app);
    const db = dbMod.getFirestore(app);
    this._fb = {
      auth, db,
      createUserWithEmailAndPassword: authMod.createUserWithEmailAndPassword,
      signInWithEmailAndPassword: authMod.signInWithEmailAndPassword,
      sendPasswordResetEmail: authMod.sendPasswordResetEmail,
      sendEmailVerification: authMod.sendEmailVerification,
      signOut: authMod.signOut,
      updateProfile: authMod.updateProfile,
      doc: dbMod.doc, getDoc: dbMod.getDoc, setDoc: dbMod.setDoc, deleteDoc: dbMod.deleteDoc,
      collection: dbMod.collection, getDocs: dbMod.getDocs
    };

    return new Promise((resolve) => {
      authMod.onAuthStateChanged(auth, async (u) => {
        try {
          if (u) {
            const profile = await this._fbLoadProfile(u.uid);
            this.user = {
              uid: u.uid, email: u.email, emailVerified: u.emailVerified,
              displayName: profile.displayName || u.displayName || u.email.split("@")[0],
              posto: profile.posto || "", avatar: profile.avatar || "🎩"
            };
          } else this.user = null;
        } catch (e) {
          console.warn("Erro ao montar a sessão:", e);
          this.user = u ? { uid: u.uid, email: u.email, emailVerified: u.emailVerified,
            displayName: (u.email || "").split("@")[0], posto: "", avatar: "🎩" } : null;
        }
        this._emit();
        resolve();
      });
    });
  },

  async _fbLoadProfile(uid) {
    // Resiliente: se a leitura falhar (regras/rede), não trava o login.
    try {
      const { doc, getDoc, db } = this._fb;
      const snap = await getDoc(doc(db, "predictions", uid));
      return snap.exists() ? snap.data() : {};
    } catch (e) {
      console.warn("Não consegui ler o perfil (verifique as regras do Firestore):", e);
      this.profileError = e;
      return {};
    }
  },

  // --- Auth (Firebase) ------------------------------------------------------
  async register(email, password, displayName, posto, avatar) {
    const f = this._fb;
    const cred = await f.createUserWithEmailAndPassword(f.auth, email, password);
    await f.updateProfile(cred.user, { displayName });
    await f.setDoc(f.doc(f.db, "predictions", cred.user.uid),
      { email, displayName, posto, avatar, picks: {}, updatedAt: Date.now() }, { merge: true });
    try { await f.sendEmailVerification(cred.user); } catch {}
    return cred.user;
  },
  async login(email, password) {
    const f = this._fb;
    await f.signInWithEmailAndPassword(f.auth, email, password);
  },
  async resetPassword(email) {
    const f = this._fb;
    await f.sendPasswordResetEmail(f.auth, email);
  },
  async logout() {
    if (this.mode === "firebase") await this._fb.signOut(this._fb.auth);
    else { localStorage.removeItem("bolao.session"); this.user = null; this._emit(); }
  },

  // --- Palpites (Firebase) --------------------------------------------------
  async _fbGetPicks(uid) {
    try {
      const snap = await this._fb.getDoc(this._fb.doc(this._fb.db, "predictions", uid));
      return snap.exists() ? (snap.data().picks || {}) : {};
    } catch (e) {
      console.warn("Não consegui ler os palpites:", e);
      return {};
    }
  },
  async _fbSavePicks(picks) {
    const f = this._fb;
    await f.setDoc(f.doc(f.db, "predictions", this.user.uid),
      { picks, fxv: FXV, displayName: this.user.displayName, posto: this.user.posto,
        avatar: this.user.avatar, email: this.user.email, updatedAt: Date.now() },
      { merge: true });
  },
  async _fbAllPlayers() {
    const f = this._fb;
    const snap = await f.getDocs(f.collection(f.db, "predictions"));
    const out = [];
    snap.forEach((d) => {
      const x = d.data();
      out.push({ uid: d.id, displayName: x.displayName || x.email,
        posto: x.posto || "", avatar: x.avatar || "🎩", picks: x.picks || {}, fxv: x.fxv || 1 });
    });
    return out;
  },
  async _fbUpdateProfile(p) {
    Object.assign(this.user, p);
    await this._fbSavePicks(await this._fbGetPicks(this.user.uid));
  },
  async _fbRemovePlayer(uid) {
    // Remove o jogador do bolão (apaga os palpites/ranking). A conta de
    // autenticação em si só pode ser apagada pelo console do Firebase.
    await this._fb.deleteDoc(this._fb.doc(this._fb.db, "predictions", uid));
  },

  // ==========================================================================
  //  MODO LOCAL (localStorage)
  // ==========================================================================
  _initLocal() {
    this._purgeSeedUsers();
    const raw = localStorage.getItem("bolao.session");
    this.user = raw ? JSON.parse(raw) : null;
    // Se a sessão era de uma conta de teste já removida, desloga.
    if (this.user) {
      const exists = Object.values(this._localUsers()).some((u) => u.uid === this.user.uid);
      if (!exists) { localStorage.removeItem("bolao.session"); this.user = null; }
    }
    this._emit();
  },

  // Remove contas de teste/demonstração que possam ter ficado salvas no
  // navegador em versões anteriores (Zé do Chute, contas "admin_" etc.).
  _purgeSeedUsers() {
    const users = this._localUsers();
    let changed = false;
    for (const [email, u] of Object.entries(users)) {
      const seed = (u.uid || "").startsWith("demo_") || (u.uid || "").startsWith("admin_") || /@bolao\.gg$/.test(email);
      if (seed) { delete users[email]; changed = true; }
    }
    if (changed) this._saveLocalUsers(users);
  },
  _localUsers() { return JSON.parse(localStorage.getItem("bolao.users") || "{}"); },
  _saveLocalUsers(u) { localStorage.setItem("bolao.users", JSON.stringify(u)); },

  async _localRegister(email, password, displayName, posto, avatar) {
    const users = this._localUsers();
    email = email.toLowerCase();
    if (users[email]) throw new Error("Esse e-mail já tá no rolê. Tenta entrar. 😉");
    users[email] = { uid: "u_" + Date.now(), email, password, displayName, posto, avatar, picks: {} };
    this._saveLocalUsers(users);
    return this._localLogin(email, password);
  },
  async _localLogin(email, password) {
    const users = this._localUsers();
    email = email.toLowerCase();
    const u = users[email];
    if (!u || u.password !== password) throw new Error("E-mail ou senha errados, parça. 👀");
    this.user = { uid: u.uid, email: u.email, emailVerified: true,
      displayName: u.displayName, posto: u.posto, avatar: u.avatar };
    localStorage.setItem("bolao.session", JSON.stringify(this.user));
    this._emit();
  },
  _localGetPicks(uid) {
    const users = this._localUsers();
    const u = Object.values(users).find((x) => x.uid === uid);
    return u ? (u.picks || {}) : {};
  },
  _localUserMeta(uid) {
    const u = Object.values(this._localUsers()).find((x) => x.uid === uid);
    return { picks: (u && u.picks) || {}, fxv: (u && u.fxv) || 1 };
  },
  _localSavePicks(picks) {
    const users = this._localUsers();
    const email = this.user.email.toLowerCase();
    if (users[email]) { users[email].picks = picks; users[email].fxv = FXV; this._saveLocalUsers(users); }
  },
  _localUpdateProfile(p) {
    Object.assign(this.user, p);
    localStorage.setItem("bolao.session", JSON.stringify(this.user));
    const users = this._localUsers();
    const email = this.user.email.toLowerCase();
    if (users[email]) { Object.assign(users[email], p); this._saveLocalUsers(users); }
  },
  _localAllPlayers() {
    return Object.values(this._localUsers()).map((u) => ({
      uid: u.uid, displayName: u.displayName, posto: u.posto,
      avatar: u.avatar, email: u.email, picks: u.picks || {}, fxv: u.fxv || 1
    }));
  },
  _localRemovePlayer(uid) {
    const users = this._localUsers();
    const email = Object.keys(users).find((e) => users[e].uid === uid);
    if (email) { delete users[email]; this._saveLocalUsers(users); }
  },

  // ==========================================================================
  //  API unificada (usada pela interface)
  // ==========================================================================
  async registerUser(email, password, displayName, posto, avatar) {
    return this.mode === "firebase"
      ? this.register(email, password, displayName, posto, avatar)
      : this._localRegister(email, password, displayName, posto, avatar);
  },
  async loginUser(email, password) {
    return this.mode === "firebase" ? this.login(email, password) : this._localLogin(email, password);
  },
  async getMyPicks() {
    // Lê os palpites + a versão do calendário; se for antiga, migra e salva.
    let picks = {}, fxv = 1;
    if (this.mode === "firebase") {
      try {
        const snap = await this._fb.getDoc(this._fb.doc(this._fb.db, "predictions", this.user.uid));
        if (snap.exists()) { const d = snap.data(); picks = d.picks || {}; fxv = d.fxv || 1; }
      } catch (e) { console.warn("Não consegui ler os palpites:", e); return {}; }
    } else {
      const meta = this._localUserMeta(this.user.uid); picks = meta.picks; fxv = meta.fxv;
    }
    if ((fxv || 1) < FXV) {
      const migrated = migrateV2(picks);
      try { await this.savePicks(migrated); } catch (e) { console.warn("Falha ao salvar migração:", e); }
      return migrated;
    }
    return picks;
  },
  async savePicks(picks) {
    return this.mode === "firebase" ? this._fbSavePicks(picks) : this._localSavePicks(picks);
  },
  async allPlayers() {
    // Aplica a migração de calendário em memória (para o ranking ficar correto
    // mesmo de quem ainda não logou desde a mudança).
    const list = this.mode === "firebase" ? await this._fbAllPlayers() : this._localAllPlayers();
    return list.map((p) => ({ ...p, picks: applyMigrations(p.picks, p.fxv) }));
  },
  async updateProfile(p) {
    return this.mode === "firebase" ? this._fbUpdateProfile(p) : this._localUpdateProfile(p);
  },
  async removePlayer(uid) {
    if (!this.isAdmin()) throw new Error("Só admin pode remover jogador.");
    return this.mode === "firebase" ? this._fbRemovePlayer(uid) : this._localRemovePlayer(uid);
  }
};
