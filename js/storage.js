/* ==========================================================================
   PetalTalk — storage.js
   Safe localStorage persistence, defaults, export / import / reset.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;
  const KEY = "petaltalk.v1";

  const DEFAULT_SETTINGS = {
    sound: false,
    animations: true,
    timer: false,
    timerSeconds: 45,
    explain: "immediate",   // immediate | end
    shuffleQuestions: true,
    shuffleAnswers: true,
    defaultCount: 10,
    defaultDifficulty: "Mixed",
    name: ""
  };

  function defaults() {
    return {
      version: 1,
      createdAt: Date.now(),
      settings: Object.assign({}, DEFAULT_SETTINGS),
      stats: { quizzes: 0, answered: 0, correct: 0, incorrect: 0, timeMs: 0, perfect: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null, comebacks: 0 },
      activity: {},      // date -> {answered, correct, quizzes, timeMs}
      categories: {},    // label -> {answered, correct}
      questions: {},     // id -> {seen, correct, wrong, last, lastResult}
      history: [],       // recent quiz summaries (max 100)
      bookmarks: [],
      favorites: [],
      daily: {},         // date -> {ids, answers, completed, correct, finishedAt}
      achievements: {},  // key -> timestamp
      notes: [],
      active: null
    };
  }

  let state = null;

  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }

  // Merge saved data onto defaults so missing keys never crash the app.
  function normalize(saved) {
    const d = defaults();
    if (!isObj(saved)) return d;
    const out = d;
    out.createdAt = typeof saved.createdAt === "number" ? saved.createdAt : d.createdAt;
    out.settings = Object.assign({}, DEFAULT_SETTINGS, isObj(saved.settings) ? saved.settings : {});
    out.stats = Object.assign({}, d.stats, isObj(saved.stats) ? saved.stats : {});
    ["activity", "categories", "questions", "daily", "achievements"].forEach((k) => { out[k] = isObj(saved[k]) ? saved[k] : {}; });
    ["history", "bookmarks", "favorites", "notes"].forEach((k) => { out[k] = Array.isArray(saved[k]) ? saved[k] : []; });
    out.active = isObj(saved.active) ? saved.active : null;
    return out;
  }

  function load() {
    if (state) return state;
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    state = normalize(raw ? safeParse(raw) : null);
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { console.warn("PetalTalk: could not save progress", e); return false; }
  }

  PT.state = () => load();
  PT.save = save;
  PT.settings = () => load().settings;
  PT.setSetting = (k, v) => { load().settings[k] = v; save(); return v; };
  PT.DEFAULT_SETTINGS = DEFAULT_SETTINGS;

  // Validation for imported files
  PT.validateImport = function (obj) {
    const errors = [];
    if (!isObj(obj)) { errors.push("The file is not a PetalTalk progress object."); return errors; }
    if (!("stats" in obj) && !("settings" in obj) && !("questions" in obj)) errors.push("The file does not contain PetalTalk progress data.");
    if ("stats" in obj && !isObj(obj.stats)) errors.push("The stats section is malformed.");
    if ("settings" in obj && !isObj(obj.settings)) errors.push("The settings section is malformed.");
    ["history", "bookmarks", "favorites", "notes"].forEach((k) => { if (k in obj && !Array.isArray(obj[k])) errors.push(`The ${k} section should be a list.`); });
    ["activity", "categories", "questions", "daily", "achievements"].forEach((k) => { if (k in obj && !isObj(obj[k])) errors.push(`The ${k} section is malformed.`); });
    if (isObj(obj.stats)) {
      ["quizzes", "answered", "correct"].forEach((k) => { if (k in obj.stats && typeof obj.stats[k] !== "number") errors.push(`stats.${k} should be a number.`); });
    }
    return errors;
  };

  PT.exportJSON = function () {
    const data = Object.assign({}, load(), { exportedAt: new Date().toISOString(), app: "PetalTalk", appVersion: PT.VERSION });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `petaltalk-progress-${PT.todayKey()}.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  PT.importJSON = function (text) {
    const obj = safeParse(text);
    const errors = PT.validateImport(obj);
    if (errors.length) return { ok: false, errors };
    state = normalize(obj);
    save();
    return { ok: true };
  };

  PT.resetAll = function () {
    state = defaults();
    save();
  };

  PT.summaryForDisplay = function () {
    const s = load();
    return { quizzes: s.stats.quizzes, answered: s.stats.answered, bookmarks: s.bookmarks.length, achievements: Object.keys(s.achievements).length, notes: s.notes.length, since: s.createdAt };
  };

  // Bookmarks & favorites
  PT.isBookmarked = (id) => load().bookmarks.includes(id);
  PT.toggleBookmark = (id) => {
    const b = load().bookmarks; const i = b.indexOf(id);
    if (i >= 0) b.splice(i, 1); else b.unshift(id);
    save();
    if (PT.checkAchievements) PT.checkAchievements();
    return i < 0;
  };
  PT.isFavorite = (label) => load().favorites.includes(label);
  PT.toggleFavorite = (label) => {
    const f = load().favorites; const i = f.indexOf(label);
    if (i >= 0) f.splice(i, 1); else f.push(label);
    save(); return i < 0;
  };
})();
