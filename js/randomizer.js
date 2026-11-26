/* ==========================================================================
   PetalTalk — randomizer.js
   Fisher-Yates shuffling, seeded RNG, smart question selection.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  // Fisher-Yates (in place on a copy). Accepts an optional rng() in [0,1).
  PT.shuffle = function (arr, rng) {
    const a = arr.slice();
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  // mulberry32 — small deterministic PRNG for the daily challenge.
  PT.seededRng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  PT.hashString = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  PT.MODES = [
    { key: "random", label: "Completely Random", icon: "dice", desc: "A surprise mix from the whole garden." },
    { key: "grammar", label: "Grammar Practice", icon: "pencil", desc: "Grammar, tenses, agreement and structure." },
    { key: "vocabulary", label: "Vocabulary Practice", icon: "book", desc: "Words, synonyms, idioms and spelling." },
    { key: "mixed", label: "Mixed Categories", icon: "shuffle", desc: "At least one question from every category you pick." },
    { key: "weak", label: "Weak Areas", icon: "target", desc: "Focus on the categories where you score lowest." },
    { key: "unseen", label: "Never Answered", icon: "seedling", desc: "Only questions you have never met before." },
    { key: "incorrect", label: "Previously Incorrect", icon: "redo", desc: "Second chances for the ones that got away." },
    { key: "review", label: "Review Mode", icon: "bookmark", desc: "Your bookmarks and recent mistakes, together." }
  ];
  const GRAMMAR_GROUP = ["Grammar", "Verb Tenses", "Subject-Verb Agreement", "Sentence Construction", "Parts of Speech", "Prepositions", "Articles", "Pronouns", "Modal Verbs", "Conjunctions", "Adjectives and Adverbs", "Active and Passive Voice", "Direct and Indirect Speech", "Punctuation"];
  const VOCAB_GROUP = ["Vocabulary", "Synonyms and Antonyms", "Idioms and Expressions", "Spelling", "Advanced English", "Reading Comprehension"];
  PT.modeByKey = (k) => PT.MODES.find((m) => m.key === k) || PT.MODES[0];

  // Count of questions a mode has available (for setup UI)
  PT.modePool = function (mode) {
    return basePool({ mode, categories: null, difficulty: "Mixed", type: "mixed" }).length;
  };

  function basePool(o) {
    const st = PT.state();
    let pool = PT.questions();
    const mode = o.mode || "random";
    const recent = o.excludeIds || [];

    if (mode === "grammar") pool = pool.filter((q) => GRAMMAR_GROUP.includes(q.category));
    if (mode === "vocabulary") pool = pool.filter((q) => VOCAB_GROUP.includes(q.category));
    if (mode === "unseen") pool = pool.filter((q) => !st.questions[q.id]);
    if (mode === "incorrect") pool = pool.filter((q) => st.questions[q.id] && st.questions[q.id].wrong > 0 && st.questions[q.id].lastResult === "wrong");
    if (mode === "review") pool = pool.filter((q) => st.bookmarks.includes(q.id) || (st.questions[q.id] && st.questions[q.id].lastResult === "wrong"));
    if (mode === "weak") {
      const weak = PT.weakCategories ? PT.weakCategories(5) : [];
      if (weak.length) pool = pool.filter((q) => weak.includes(q.category));
    }
    if (o.categories && o.categories.length) pool = pool.filter((q) => o.categories.includes(q.category));
    if (o.difficulty && o.difficulty !== "Mixed") pool = pool.filter((q) => q.difficulty === o.difficulty);
    if (o.type && o.type !== "mixed") pool = pool.filter((q) => q.type === o.type);
    if (recent.length) pool = pool.filter((q) => !recent.includes(q.id));
    return pool;
  }

  /**
   * Select questions for a quiz.
   * opts: { mode, categories:[labels]|null, difficulty, type, count, rng }
   * Prioritises unseen questions, then least-recently-answered ones. Never repeats inside a quiz.
   * Returns { questions, note } — note explains any relaxation of filters.
   */
  PT.selectQuestions = function (opts) {
    const st = PT.state();
    const rng = opts.rng || Math.random;
    const count = Math.max(1, opts.count || 10);
    let note = "";

    let pool = basePool(opts);
    if (pool.length < count && opts.type && opts.type !== "mixed") {
      const wider = basePool(Object.assign({}, opts, { type: "mixed" }));
      if (wider.length > pool.length) { pool = wider; note = "Not enough questions of that type — other types were added."; }
    }
    if (pool.length < count && opts.difficulty && opts.difficulty !== "Mixed") {
      const wider = basePool(Object.assign({}, opts, { difficulty: "Mixed" }));
      if (wider.length > pool.length) { pool = wider; note = "Not enough questions at that difficulty — nearby difficulties were added."; }
    }
    if (pool.length < count && (opts.mode === "unseen" || opts.mode === "incorrect" || opts.mode === "review" || opts.mode === "weak")) {
      const wider = basePool(Object.assign({}, opts, { mode: "random" }));
      if (wider.length > pool.length) { pool = pool.concat(wider.filter((q) => !pool.includes(q))); note = "That mode had fewer questions than requested, so some fresh ones were added."; }
    }
    if (!pool.length) return { questions: [], note: "No questions matched this selection." };

    // Weighted buckets: unseen first, then by least-recent answer; shuffle inside buckets.
    const now = Date.now();
    const unseen = [], seen = [];
    pool.forEach((q) => (st.questions[q.id] ? seen : unseen).push(q));
    const recentCut = now - 1000 * 60 * 60 * 6; // answered in the last 6 hours = "recent"
    const older = PT.shuffle(seen.filter((q) => (st.questions[q.id].last || 0) < recentCut), rng);
    const recent = PT.shuffle(seen.filter((q) => (st.questions[q.id].last || 0) >= recentCut), rng);
    let ordered;
    if (opts.mode === "mixed" && opts.categories && opts.categories.length > 1) {
      ordered = roundRobin(PT.shuffle(unseen, rng).concat(older, recent), opts.categories, rng);
    } else {
      ordered = PT.shuffle(unseen, rng).concat(older, recent);
    }
    let chosen = ordered.slice(0, count);
    if (opts.shuffleQuestions !== false) chosen = PT.shuffle(chosen, rng);
    return { questions: chosen, note };
  };

  // Interleave by category so each category gets a fair share.
  function roundRobin(list, categories, rng) {
    const buckets = {};
    list.forEach((q) => { (buckets[q.category] = buckets[q.category] || []).push(q); });
    const keys = PT.shuffle(Object.keys(buckets), rng);
    const out = [];
    let added = true;
    while (added) {
      added = false;
      keys.forEach((k) => { if (buckets[k].length) { out.push(buckets[k].shift()); added = true; } });
    }
    return out;
  }

  // Build the per-quiz item: shuffled option order with remapped answer key.
  PT.buildItem = function (q, shuffleAnswers, rng) {
    const idx = [0, 1, 2, 3];
    const order = shuffleAnswers === false ? idx : PT.shuffle(idx, rng);
    return { id: q.id, order, answerIndex: order.indexOf(q.answer) };
  };
  // Resolve a quiz item back to display data
  PT.itemView = function (item) {
    const q = PT.qById(item.id);
    if (!q) return null;
    return { q, options: item.order.map((i) => q.options[i]), answerIndex: item.order.indexOf(q.answer) };
  };
})();
