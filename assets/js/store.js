// ============================================================================
//  CAMADA DE DADOS  —  autenticação por e-mail + persistência de palpites
//  Usa Firebase (Auth + Firestore) quando configurado; caso contrário,
//  funciona em MODO LOCAL (localStorage) para demonstração.
// ============================================================================
import { FIREBASE_CONFIG, APP } from "./config.js";
import { DEFAULT_RESULTS, MATCHES } from "./data.js";

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
      try { await this._initFirebase(); this.mode = "firebase"; return; }
      catch (e) { console.warn("Firebase indisponível, usando modo local:", e); }
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
      doc: dbMod.doc, getDoc: dbMod.getDoc, setDoc: dbMod.setDoc,
      collection: dbMod.collection, getDocs: dbMod.getDocs
    };

    return new Promise((resolve) => {
      authMod.onAuthStateChanged(auth, async (u) => {
        if (u) {
          const profile = await this._fbLoadProfile(u.uid);
          this.user = {
            uid: u.uid, email: u.email, emailVerified: u.emailVerified,
            displayName: profile.displayName || u.displayName || u.email.split("@")[0],
            posto: profile.posto || "", avatar: profile.avatar || "🎩"
          };
        } else this.user = null;
        this._emit();
        resolve();
      });
    });
  },

  async _fbLoadProfile(uid) {
    const { doc, getDoc, db } = this._fb;
    const snap = await getDoc(doc(db, "predictions", uid));
    return snap.exists() ? snap.data() : {};
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
    const snap = await this._fb.getDoc(this._fb.doc(this._fb.db, "predictions", uid));
    return snap.exists() ? (snap.data().picks || {}) : {};
  },
  async _fbSavePicks(picks) {
    const f = this._fb;
    await f.setDoc(f.doc(f.db, "predictions", this.user.uid),
      { picks, displayName: this.user.displayName, posto: this.user.posto,
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
        posto: x.posto || "", avatar: x.avatar || "🎩", picks: x.picks || {} });
    });
    return out;
  },
  async _fbUpdateProfile(p) {
    Object.assign(this.user, p);
    await this._fbSavePicks(await this._fbGetPicks(this.user.uid));
  },

  // ==========================================================================
  //  MODO LOCAL (localStorage)
  // ==========================================================================
  _initLocal() {
    const raw = localStorage.getItem("bolao.session");
    this.user = raw ? JSON.parse(raw) : null;
    this._seedDemoPlayers();
    this._emit();
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
  _localSavePicks(picks) {
    const users = this._localUsers();
    const email = this.user.email.toLowerCase();
    if (users[email]) { users[email].picks = picks; this._saveLocalUsers(users); }
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
      avatar: u.avatar, picks: u.picks || {}
    }));
  },

  // Adiciona "diplomatas" fictícios ao ranking local (apenas demonstração).
  _seedDemoPlayers() {
    const users = this._localUsers();
    if (Object.keys(users).some((k) => k.startsWith("demo"))) return;
    const demos = [
      { n: "Zé do Chute", p: "Boteco da esquina 🍺", a: "🍺",
        picks: { "A-MD1-1": { h: 2, a: 0 }, "C-MD1-1": { h: 2, a: 1 }, "E-MD1-1": { h: 5, a: 0 }, "D-MD1-1": { h: 3, a: 1 } } },
      { n: "Cabeça de Bagre", p: "Sofá da vó 🛋️", a: "🗿",
        picks: { "A-MD1-1": { h: 1, a: 0 }, "C-MD1-1": { h: 1, a: 1 }, "F-MD1-1": { h: 2, a: 2 }, "H-MD1-1": { h: 0, a: 0 } } },
      { n: "Tia do Zap", p: "Grupo da família 📱", a: "📱",
        picks: { "A-MD1-2": { h: 2, a: 1 }, "B-MD1-1": { h: 1, a: 1 }, "D-MD1-2": { h: 2, a: 0 }, "G-MD1-2": { h: 1, a: 1 } } },
      { n: "Mister M Mistério", p: "Sei lá onde 👽", a: "👽",
        picks: { "E-MD1-1": { h: 7, a: 1 }, "F-MD1-2": { h: 3, a: 0 }, "C-MD1-2": { h: 1, a: 0 }, "H-MD1-2": { h: 2, a: 1 } } }
    ];
    demos.forEach((d, i) => {
      users["demo" + i + "@bolao.gg"] = {
        uid: "demo_" + i, email: "demo" + i + "@bolao.gg",
        password: "—", displayName: d.n, posto: d.p, avatar: d.a, picks: d.picks
      };
    });
    this._saveLocalUsers(users);
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
    return this.mode === "firebase" ? this._fbGetPicks(this.user.uid) : this._localGetPicks(this.user.uid);
  },
  async savePicks(picks) {
    return this.mode === "firebase" ? this._fbSavePicks(picks) : this._localSavePicks(picks);
  },
  async allPlayers() {
    return this.mode === "firebase" ? this._fbAllPlayers() : this._localAllPlayers();
  },
  async updateProfile(p) {
    return this.mode === "firebase" ? this._fbUpdateProfile(p) : this._localUpdateProfile(p);
  }
};
