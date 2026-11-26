/* ==========================================================================
   PetalTalk — quiz.js
   Practice page: setup, quiz runtime, results, answer review, resume.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;
  const COUNTS = [5, 10, 15, 20, 30, 50];
  const TYPES = [["mixed", "Mixed"], ["mcq", "Multiple Choice"], ["fill", "Fill in the Blank"], ["correction", "Sentence Correction"]];

  let views, setup, session, tickHandle = null;

  /* ---------------------------------------------------------------------
     Setup state
     --------------------------------------------------------------------- */
  function defaultSetup() {
    const s = PT.settings();
    return { mode: "random", count: s.defaultCount || 10, custom: "", difficulty: s.defaultDifficulty || "Mixed", category: "all", type: "mixed",
      timer: !!s.timer, explain: s.explain || "immediate", explainNow: (s.explain || "immediate") === "immediate", sound: !!s.sound, shuffleQ: s.shuffleQuestions !== false, shuffleA: s.shuffleAnswers !== false };
  }
  function applyParams() {
    const m = PT.param("mode"); if (m && (PT.modeByKey(m).key === m)) setup.mode = m;
    const c = PT.param("category"); if (c && PT.catBySlug(c)) setup.category = PT.catBySlug(c).label;
    const n = parseInt(PT.param("count"), 10); if (n > 0) { setup.count = COUNTS.includes(n) ? n : "custom"; if (!COUNTS.includes(n)) setup.custom = n; }
    const d = PT.param("difficulty"); if (d && (d === "Mixed" || PT.DIFFICULTIES.includes(d))) setup.difficulty = d;
    const t = PT.param("type"); if (t && TYPES.some((x) => x[0] === t)) setup.type = t;
  }
  function effectiveCount() { return setup.count === "custom" ? PT.clamp(parseInt(setup.custom, 10) || 10, 1, 100) : setup.count; }
  function selectedCategories() { return setup.category === "all" ? null : [setup.category]; }
  function availableCount() {
    return PT.selectQuestions({ mode: setup.mode, categories: selectedCategories(), difficulty: setup.difficulty, type: setup.type, count: 9999, shuffleQuestions: false }).questions.length;
  }

  /* ---------------------------------------------------------------------
     Setup view
     --------------------------------------------------------------------- */
  function renderSetup() {
    show("setup");
    const st = PT.state();
    const modes = PT.MODES.map((m) => {
      const n = PT.modePool(m.key);
      return `<button type="button" class="mode-card" data-mode="${m.key}" aria-pressed="${setup.mode === m.key}"><span class="mode-ico">${PT.icon(m.icon)}</span><b>${m.label}</b><span>${m.desc}</span><span class="count">${n} available</span></button>`;
    }).join("");
    const counts = COUNTS.map((c) => `<button type="button" class="chip-btn ${setup.count === c ? "on" : ""}" data-count="${c}">${c}</button>`).join("")
      + `<span class="custom-count"><button type="button" class="chip-btn ${setup.count === "custom" ? "on" : ""}" data-count="custom">Custom</button><input type="number" min="1" max="100" id="customCount" aria-label="Custom question count" placeholder="12" value="${PT.esc(setup.custom)}" ${setup.count === "custom" ? "" : "hidden"}></span>`;
    const diffs = ["Mixed"].concat(PT.DIFFICULTIES).map((d) => `<button type="button" class="chip-btn diff-${d.toLowerCase()} ${setup.difficulty === d ? "on" : ""}" data-diff="${d}">${d}</button>`).join("");
    const cats = `<option value="all">All categories (${PT.questions().length} questions)</option>` + PT.CATEGORIES.map((c) => `<option value="${PT.esc(c.label)}" ${setup.category === c.label ? "selected" : ""}>${c.label} (${PT.catQuestions(c.label).length})</option>`).join("");
    const types = TYPES.map(([k, l]) => `<button type="button" class="chip-btn ${setup.type === k ? "on" : ""}" data-type="${k}">${l}</button>`).join("");
    const toggle = (key, label, sub) => `<label class="toggle-row"><div><b>${label}</b><span>${sub}</span></div><span class="switch"><input type="checkbox" data-toggle="${key}" ${setup[key] ? "checked" : ""}><span class="track"></span></span></label>`;

    views.setup.innerHTML = `<div class="wrap">
      <div class="page-head"><div><span class="eyebrow">Practice</span><h1>Set up your little quiz</h1><p>Pick a mode, choose how much you'd like to practice, and Mimo will prepare the rest. Every quiz is freshly shuffled.</p></div>${PT.mimo("happy", { className: "head-mimo bob" })}</div>
      <div class="setup-layout">
        <div>
          <div class="paper setup-block"><h3><span class="num">1</span>Quiz mode</h3><div class="mode-list" id="modeList">${modes}</div></div>
          <div class="paper setup-block"><h3><span class="num">2</span>How many questions?</h3><div class="choice-row" id="countRow">${counts}</div></div>
          <div class="paper setup-block"><h3><span class="num">3</span>Difficulty</h3><div class="choice-row" id="diffRow">${diffs}</div></div>
          <div class="paper setup-block"><h3><span class="num">4</span>Category</h3><select class="cat-select" id="catSelect">${cats}</select><p class="tiny muted mt-1 mb-0">Grammar, Vocabulary, Weak Areas and Review modes already narrow the pool; choose a category to narrow it further.</p></div>
          <div class="paper setup-block"><h3><span class="num">5</span>Question type</h3><div class="choice-row" id="typeRow">${types}</div></div>
          <div class="paper setup-block"><h3><span class="num">6</span>Other settings</h3><div class="toggle-list">
            ${toggle("timer", "Timer", `${PT.settings().timerSeconds || 45} seconds per question`)}
            ${toggle("explainNow", "Show explanation immediately", "Off = explanations wait until the end")}
            ${toggle("sound", "Sound effects", "Gentle chimes for right and wrong")}
            ${toggle("shuffleQ", "Shuffle questions", "Random order every time")}
            ${toggle("shuffleA", "Shuffle answers", "Correct answer moves around")}
          </div></div>
        </div>
        <aside class="paper summary-card" id="summaryCard"></aside>
      </div></div>`;
    setup.explainNow = setup.explain === "immediate";
    PT.$("[data-toggle=explainNow]").checked = setup.explainNow;

    // events
    PT.$("#modeList").addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (!b) return; setup.mode = b.dataset.mode; PT.$$("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); updateSummary(); });
    PT.$("#countRow").addEventListener("click", (e) => { const b = e.target.closest("[data-count]"); if (!b) return; setup.count = b.dataset.count === "custom" ? "custom" : +b.dataset.count; PT.$$("[data-count]").forEach((x) => x.classList.toggle("on", x === b)); const inp = PT.$("#customCount"); inp.hidden = setup.count !== "custom"; if (!inp.hidden) inp.focus(); updateSummary(); });
    PT.$("#customCount").addEventListener("input", (e) => { setup.custom = e.target.value; updateSummary(); });
    PT.$("#diffRow").addEventListener("click", (e) => { const b = e.target.closest("[data-diff]"); if (!b) return; setup.difficulty = b.dataset.diff; PT.$$("[data-diff]").forEach((x) => x.classList.toggle("on", x === b)); updateSummary(); });
    PT.$("#catSelect").addEventListener("change", (e) => { setup.category = e.target.value; updateSummary(); });
    PT.$("#typeRow").addEventListener("click", (e) => { const b = e.target.closest("[data-type]"); if (!b) return; setup.type = b.dataset.type; PT.$$("[data-type]").forEach((x) => x.classList.toggle("on", x === b)); updateSummary(); });
    PT.$$("[data-toggle]").forEach((t) => t.addEventListener("change", () => { setup[t.dataset.toggle] = t.checked; if (t.dataset.toggle === "sound") PT.setSetting("sound", t.checked); updateSummary(); }));
    updateSummary();
  }

  function updateSummary() {
    const n = effectiveCount(), avail = availableCount();
    const m = PT.modeByKey(setup.mode);
    const card = PT.$("#summaryCard"); if (!card) return;
    const warn = avail === 0 ? `<div class="warn">No questions match this combination yet. Try another mode or category.</div>` : avail < n ? `<div class="warn">Only ${avail} question${avail === 1 ? "" : "s"} match exactly — Mimo will top up the quiz with close matches.</div>` : "";
    card.innerHTML = `${PT.mimo(avail ? "wink" : "think", { className: "sum-mimo" })}<h3 class="center mb-0">Your quiz</h3><p class="center tiny muted">${PT.esc(PT.line("start"))}</p>
      <dl><dt>Mode</dt><dd>${m.label}</dd><dt>Questions</dt><dd>${n}</dd><dt>Difficulty</dt><dd>${setup.difficulty}</dd><dt>Category</dt><dd>${setup.category === "all" ? "All" : PT.esc(setup.category)}</dd><dt>Type</dt><dd>${TYPES.find((t) => t[0] === setup.type)[1]}</dd><dt>Matching</dt><dd>${avail}</dd></dl>${warn}
      <button class="btn btn--primary btn--block btn--lg mt-3" id="startBtn" ${avail ? "" : "disabled"}>${PT.icon("sparkle")} Start quiz</button>
      <p class="tiny muted center mt-2 mb-0">Press <kbd>1</kbd>–<kbd>4</kbd> to answer, <kbd>Enter</kbd> for next.</p>`;
    const b = PT.$("#startBtn"); if (b) b.addEventListener("click", () => startQuiz(buildConfigFromSetup()));
  }

  function buildConfigFromSetup() {
    const m = PT.modeByKey(setup.mode);
    const catLabel = setup.category === "all" ? null : setup.category;
    return { mode: setup.mode, title: catLabel ? `${catLabel} · ${m.label}` : m.label, count: effectiveCount(), difficulty: setup.difficulty, categories: catLabel ? [catLabel] : null, type: setup.type,
      timer: setup.timer, timerSeconds: PT.settings().timerSeconds || 45, explain: setup.explainNow ? "immediate" : "end", shuffleQ: setup.shuffleQ, shuffleA: setup.shuffleA };
  }

  /* ---------------------------------------------------------------------
     Session lifecycle
     --------------------------------------------------------------------- */
  function persist() { PT.state().active = session; PT.save(); }
  function clearActive() { PT.state().active = null; PT.save(); }

  function startQuiz(config) {
    const sel = PT.selectQuestions({ mode: config.mode, categories: config.categories, difficulty: config.difficulty, type: config.type, count: config.count, shuffleQuestions: config.shuffleQ });
    if (!sel.questions.length) { PT.alert("Nothing to practice yet", "No questions match that selection. Try a different mode or category.", "think"); return; }
    session = { id: Date.now(), mode: config.mode, title: config.title, config, items: sel.questions.map((q) => PT.buildItem(q, config.shuffleA)), index: 0, answers: new Array(sel.questions.length).fill(null), startedAt: Date.now(), elapsedMs: 0, qStart: Date.now(), isDaily: false, note: sel.note };
    if (sel.note) PT.toast({ title: "Heads up", text: sel.note, icon: "info" });
    persist();
    renderQuestion();
  }

  function startDaily() {
    const rec = PT.dailyRecord();
    const key = PT.todayKey();
    if (rec.completed) { renderDailyResults(rec); return; }
    const rng = PT.seededRng(PT.hashString("petaltalk-daily-order-" + key));
    session = { id: "daily-" + key, mode: "daily", title: "Daily Challenge", config: { count: rec.ids.length, difficulty: "Mixed", type: "mixed", timer: PT.settings().timer, timerSeconds: PT.settings().timerSeconds || 45, explain: PT.settings().explain || "immediate", shuffleA: true },
      items: rec.ids.map((id) => PT.buildItem(PT.qById(id), true, rng)), index: 0, answers: rec.ids.map((_, i) => rec.answers[i] || null), startedAt: Date.now(), elapsedMs: rec.answers.filter(Boolean).reduce((a, x) => a + (x.timeMs || 0), 0), qStart: Date.now(), isDaily: true, dailyKey: key };
    // Resume at the first unanswered question
    const firstOpen = session.answers.findIndex((a) => !a);
    session.index = firstOpen < 0 ? session.answers.length - 1 : firstOpen;
    persist();
    renderQuestion();
  }

  function restoreSession(s) {
    session = s;
    session.qStart = Date.now();
    if (session.isDaily && session.dailyKey !== PT.todayKey()) { clearActive(); session = null; return false; }
    const open = session.answers.findIndex((a) => !a);
    if (open < 0) { finish(); return true; }
    session.index = session.answers[session.index] ? open : session.index;
    renderQuestion();
    return true;
  }

  /* ---------------------------------------------------------------------
     Question view
     --------------------------------------------------------------------- */
  function renderQuestion() {
    show("quiz");
    stopTick();
    const item = session.items[session.index];
    const v = PT.itemView(item);
    if (!v) { session.index++; return session.index < session.items.length ? renderQuestion() : finish(); }
    const q = v.q;
    const n = session.index + 1, total = session.items.length;
    const answered = session.answers[session.index];
    const cat = PT.catByLabel(q.category);
    const letters = ["A", "B", "C", "D"];
    const timerOn = session.config.timer && !answered;
    views.quiz.innerHTML = `<div class="wrap quiz-shell">
      <div class="quiz-top">
        <div class="q-count">Question <b>${n}</b> <span class="muted">of ${total}</span></div>
        <div class="quiz-tags"><span class="tag">${PT.icon(cat ? cat.icon : "sparkle")} ${PT.esc(q.category)}</span><span class="tag ${PT.diffClass(q.difficulty)}">${q.difficulty}</span><span class="tag">${PT.questionTypeLabel(q.type)}</span>
          <span class="timer" id="timer" title="${timerOn ? "Time left for this question" : "Elapsed time"}">${PT.icon("timer")} <span id="timerVal">${timerOn ? PT.fmtClock(session.config.timerSeconds * 1000) : PT.fmtClock(elapsed())}</span></span></div>
      </div>
      <div class="quiz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${n - 1}"><i style="width:${((n - 1) / total) * 100}%"></i></div>
      <article class="paper q-card mt-3" aria-live="polite">
        <div class="row row--between mb-2"><span class="tiny muted">${session.isDaily ? "Daily challenge" : PT.esc(session.title)}</span><button class="bm-btn ${PT.isBookmarked(q.id) ? "on" : ""}" id="bmBtn" aria-pressed="${PT.isBookmarked(q.id)}">${PT.icon("bookmark")} <span>${PT.isBookmarked(q.id) ? "Saved" : "Save"}</span></button></div>
        <h2 class="q-text" style="font-family:var(--font-body)">${PT.renderQuestion(q)}</h2>
        <div class="options" id="options">${v.options.map((o, i) => `<button type="button" class="option" data-i="${i}"><span class="key">${letters[i]}</span><span>${PT.esc(o)}</span></button>`).join("")}</div>
        <div id="feedback"></div>
      </article>
      <div class="quiz-actions">
        <div class="left"><button class="btn btn--ghost btn--sm" id="quitBtn">${PT.icon("arrowLeft")} ${session.isDaily ? "Pause & go home" : "Quit quiz"}</button></div>
        <button class="btn btn--primary" id="nextBtn" hidden>${n === total ? "See results" : "Next question"} ${PT.icon("arrow")}</button>
      </div></div>`;
    PT.$("#bmBtn").addEventListener("click", () => { const on = PT.toggleBookmark(q.id); const b = PT.$("#bmBtn"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); b.querySelector("span:last-child").textContent = on ? "Saved" : "Save"; PT.toast({ title: on ? "Saved to your library" : "Removed from library", icon: "bookmark", duration: 2000 }); });
    PT.$("#options").addEventListener("click", (e) => { const b = e.target.closest(".option"); if (b && !b.disabled) answer(+b.dataset.i); });
    PT.$("#nextBtn").addEventListener("click", next);
    PT.$("#quitBtn").addEventListener("click", quit);
    if (answered) showFeedback(answered.choice, true);
    session.qStart = Date.now();
    startTick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function elapsed() { return session.elapsedMs + (Date.now() - session.qStart); }
  function startTick() {
    const tv = PT.$("#timerVal"), t = PT.$("#timer");
    if (!tv) return;
    const timerOn = session.config.timer && !session.answers[session.index];
    tickHandle = setInterval(() => {
      if (!session) return stopTick();
      if (timerOn && !session.answers[session.index]) {
        const left = session.config.timerSeconds * 1000 - (Date.now() - session.qStart);
        tv.textContent = PT.fmtClock(Math.max(0, left));
        t.classList.toggle("warn", left < 10000);
        if (left <= 0) { stopTick(); answer(-1); }
      } else { tv.textContent = PT.fmtClock(elapsed()); t.classList.remove("warn"); }
    }, 250);
  }
  function stopTick() { if (tickHandle) { clearInterval(tickHandle); tickHandle = null; } }

  function answer(choice) {
    if (session.answers[session.index]) return;
    stopTick();
    const item = session.items[session.index];
    const v = PT.itemView(item);
    const correct = choice === v.answerIndex;
    const timeMs = Date.now() - session.qStart;
    session.answers[session.index] = { choice, correct, timeMs };
    session.elapsedMs += timeMs;
    PT.recordAnswer(item.id, correct, timeMs);
    if (session.isDaily) { const rec = PT.dailyRecord(session.dailyKey); rec.answers[session.index] = { choice, correct, timeMs }; }
    persist();
    PT.sound(correct ? "correct" : "wrong");
    showFeedback(choice, false);
    const t = PT.$("#timer"); if (t) { t.classList.remove("warn"); t.title = "Elapsed time"; }
    startTick();
    if (session.config.explain !== "immediate") setTimeout(next, 650);
  }

  function showFeedback(choice, restoring) {
    const item = session.items[session.index];
    const v = PT.itemView(item);
    const q = v.q, correct = choice === v.answerIndex;
    PT.$$(".option").forEach((b) => {
      const i = +b.dataset.i; b.disabled = true;
      if (i === v.answerIndex) b.classList.add("correct");
      else if (i === choice) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    const next = PT.$("#nextBtn"); next.hidden = false; if (!restoring) next.focus({ preventScroll: true });
    if (session.config.explain !== "immediate") return;
    const cat = PT.catByLabel(q.category);
    const tip = q.tip || (cat ? cat.tips[PT.hashString(q.id) % cat.tips.length] : "");
    PT.$("#feedback").innerHTML = `<div class="feedback ${correct ? "ok" : "bad"}">
      <div class="fb-head" style="color:${correct ? "#3F8A64" : "#C9697A"}">${PT.icon(correct ? "check" : "cross")} ${correct ? "Correct!" : choice === -1 ? "Time's up!" : "Not quite."}${!correct ? ` <span class="small" style="font-weight:600;color:var(--text)">The answer is <u>${PT.esc(v.options[v.answerIndex])}</u>.</span>` : ""}</div>
      <div>${PT.esc(q.explanation)}</div>
      ${tip ? `<div class="fb-tip">${PT.icon("lightbulb")}<span><b>Little tip:</b> ${PT.esc(tip)}</span></div>` : ""}
      <div class="mimo-say">${PT.mimo(correct ? "cheer" : "sad", { width: 56 })}<div class="bubble">${PT.esc(PT.line(correct ? "correct" : "wrong"))}</div></div></div>`;
  }

  function next() {
    if (!session.answers[session.index]) return;
    if (session.index + 1 >= session.items.length) return finish();
    session.index++; persist(); renderQuestion();
  }

  async function quit() {
    if (session.isDaily) { stopTick(); persist(); location.href = "index.html"; return; }
    const ok = await PT.confirm("Quit this quiz?", "Your answers so far are already counted in your statistics, but the quiz itself won't be finished.", { ok: "Quit quiz", cancel: "Keep going", danger: true });
    if (!ok) return;
    stopTick(); session = null; clearActive();
    renderSetup();
  }

  /* ---------------------------------------------------------------------
     Finish & results
     --------------------------------------------------------------------- */
  function summarize() {
    const total = session.items.length;
    const correct = session.answers.filter((a) => a && a.correct).length;
    const perCat = {};
    session.items.forEach((it, i) => { const q = PT.qById(it.id); if (!q) return; const p = perCat[q.category] || (perCat[q.category] = { total: 0, correct: 0 }); p.total++; if (session.answers[i] && session.answers[i].correct) p.correct++; });
    return { title: session.title, mode: session.mode, difficulty: session.config.difficulty, category: session.config.categories ? session.config.categories[0] : "All", total, correct, timeMs: session.elapsedMs, ids: session.items.map((i) => i.id), perCat };
  }

  function finish() {
    stopTick();
    const sum = summarize();
    if (session.isDaily) {
      const rec = PT.dailyRecord(session.dailyKey);
      rec.completed = true; rec.correct = sum.correct; rec.finishedAt = Date.now(); rec.timeMs = sum.timeMs;
      rec.order = session.items.map((i) => i.order);
    }
    PT.recordQuiz(sum);
    PT.refreshStreakChip();
    PT.sound("finish");
    const finished = session; session = null; clearActive();
    renderResults(finished, sum);
  }

  function renderDailyResults(rec) {
    const fake = { title: "Daily Challenge", mode: "daily", isDaily: true, config: { difficulty: "Mixed", categories: null }, items: rec.ids.map((id, i) => ({ id, order: (rec.order && rec.order[i]) || [0, 1, 2, 3] })), answers: rec.answers, elapsedMs: rec.timeMs || 0 };
    const total = fake.items.length, correct = rec.correct;
    const perCat = {};
    fake.items.forEach((it, i) => { const q = PT.qById(it.id); if (!q) return; const p = perCat[q.category] || (perCat[q.category] = { total: 0, correct: 0 }); p.total++; if (rec.answers[i] && rec.answers[i].correct) p.correct++; });
    renderResults(fake, { title: "Daily Challenge", mode: "daily", difficulty: "Mixed", total, correct, timeMs: rec.timeMs || 0, perCat });
  }

  function renderResults(done, sum) {
    show("results");
    const pct = PT.pct(sum.correct, sum.total);
    const msg = pct === 100 ? ["Perfect bloom!", "Every single petal in place. Mimo is doing a happy dance."] : pct >= 80 ? ["Your little learning journey continues!", "That was lovely work — your English is growing beautifully."] : pct >= 60 ? ["Nicely done!", "A solid round. Review the tricky ones and they'll be yours next time."] : pct >= 40 ? ["Good effort!", "Every mistake is a seed. Have a look at the explanations and try again soon."] : ["Thank you for practicing!", "The hardest part is showing up. Mimo will be here for the next round."];
    const mood = pct >= 80 ? "cheer" : pct >= 50 ? "happy" : "think";
    const circ = 2 * Math.PI * 85;
    const cats = Object.entries(sum.perCat).sort((a, b) => b[1].total - a[1].total).map(([label, p]) => `<div class="perf-row"><span>${PT.esc(label)}</span><div class="progress ${PT.pct(p.correct, p.total) >= 70 ? "progress--mint" : ""}"><i style="width:${PT.pct(p.correct, p.total)}%"></i></div><b>${p.correct}/${p.total}</b></div>`).join("");
    const wrong = done.answers.filter((a) => !a || !a.correct).length;
    views.results.innerHTML = `<div class="wrap quiz-shell">
      <div class="paper results-hero rise"><div class="tape"></div>
        <div><div class="score-ring"><svg viewBox="0 0 200 200"><circle class="track" cx="100" cy="100" r="85"/><circle class="bar" id="ringBar" cx="100" cy="100" r="85" style="stroke-dasharray:${circ};stroke-dashoffset:${circ}"/></svg><div class="ring-label"><div><b>${pct}%</b><span>accuracy</span></div></div></div>
          <div class="center mt-2">${PT.mimo(mood, { width: 90, className: "bob" })}</div></div>
        <div class="results-copy"><span class="eyebrow">${done.isDaily ? "Daily challenge complete" : "Quiz complete"}</span><h2>${msg[0]}</h2><p class="lead mb-1">You got <b>${sum.correct} out of ${sum.total}</b>!</p><p class="muted">${msg[1]}</p>
          <div class="result-stats"><div><b>${sum.correct}</b><span>Correct</span></div><div><b>${sum.total - sum.correct}</b><span>Incorrect</span></div><div><b>${PT.fmtTime(sum.timeMs)}</b><span>Time</span></div><div><b>${PT.esc(sum.difficulty || "Mixed")}</b><span>Difficulty</span></div></div>
          <div class="results-actions">
            ${wrong ? `<button class="btn btn--secondary" id="revWrong">${PT.icon("redo")} Review incorrect (${wrong})</button>` : ""}
            <button class="btn btn--secondary" id="revAll">${PT.icon("eye")} Review all questions</button>
            ${done.isDaily ? "" : `<button class="btn btn--primary" id="tryAgain">${PT.icon("redo")} Try again</button>`}
            <button class="btn btn--primary" id="newRandom">${PT.icon("dice")} New random quiz</button>
            <a class="btn btn--ghost" href="index.html">${PT.icon("home")} Return home</a>
          </div></div></div>
      <div class="paper paper--pad mt-3"><h3>Category performance</h3><div class="cat-perf">${cats}</div></div>
    </div>`;
    requestAnimationFrame(() => setTimeout(() => { const b = PT.$("#ringBar"); if (b) b.style.strokeDashoffset = circ - (circ * pct) / 100; }, 50));
    if (pct >= 80) PT.petalBurst(pct === 100 ? 70 : 36);
    const rw = PT.$("#revWrong"); if (rw) rw.addEventListener("click", () => renderReview(done, sum, true));
    PT.$("#revAll").addEventListener("click", () => renderReview(done, sum, false));
    const ta = PT.$("#tryAgain"); if (ta) ta.addEventListener("click", () => {
      // Same questions, freshly shuffled order and answers.
      const cfg = done.config;
      session = { id: Date.now(), mode: done.mode, title: done.title, config: cfg, items: PT.shuffle(done.items).map((it) => PT.buildItem(PT.qById(it.id), cfg.shuffleA)), index: 0, answers: new Array(done.items.length).fill(null), startedAt: Date.now(), elapsedMs: 0, qStart: Date.now(), isDaily: false };
      persist(); renderQuestion();
    });
    PT.$("#newRandom").addEventListener("click", () => startQuiz({ mode: "random", title: "Completely Random", count: done.items.length, difficulty: "Mixed", categories: null, type: "mixed", timer: PT.settings().timer, timerSeconds: PT.settings().timerSeconds || 45, explain: PT.settings().explain || "immediate", shuffleQ: true, shuffleA: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderReview(done, sum, onlyWrong) {
    show("review");
    const letters = ["A", "B", "C", "D"];
    const items = done.items.map((it, i) => ({ it, i, a: done.answers[i] })).filter((x) => !onlyWrong || !x.a || !x.a.correct);
    views.review.innerHTML = `<div class="wrap quiz-shell">
      <div class="page-head"><div><span class="eyebrow">Answer review</span><h1>${onlyWrong ? "The tricky ones" : "Every question, explained"}</h1><p>${onlyWrong ? "These are the questions that slipped away. Read the notes, then try them again sometime." : "Correct answers are highlighted in green; your choices are marked."}</p></div><button class="btn btn--secondary" id="backResults">${PT.icon("arrowLeft")} Back to results</button></div>
      <div class="review-list">${items.map(({ it, i, a }) => {
        const v = PT.itemView(it); if (!v) return "";
        const q = v.q;
        return `<article class="paper review-item ${a && a.correct ? "" : "wrong"}"><div class="ri-head"><div class="quiz-tags"><span class="tag">${i + 1}</span><span class="tag">${PT.esc(q.category)}</span><span class="tag ${PT.diffClass(q.difficulty)}">${q.difficulty}</span></div><button class="bm-btn ${PT.isBookmarked(q.id) ? "on" : ""}" data-bm="${q.id}">${PT.icon("bookmark")} <span>${PT.isBookmarked(q.id) ? "Saved" : "Save"}</span></button></div>
          <div class="ri-q">${PT.renderQuestion(q)}</div>
          <div class="ri-opts">${v.options.map((o, k) => `<span class="${k === v.answerIndex ? "is-correct" : ""} ${a && a.choice === k ? "is-chosen" : ""}">${letters[k]}. ${PT.esc(o)}${k === v.answerIndex ? " ✓" : ""}${a && a.choice === k && k !== v.answerIndex ? " (your answer)" : ""}</span>`).join("")}${a && a.choice === -1 ? '<span class="is-chosen">No answer — time ran out</span>' : ""}</div>
          <div class="ri-exp">${PT.esc(q.explanation)}</div></article>`;
      }).join("") || `<div class="empty-state">${PT.mimo("cheer")}<b>Nothing to review</b>You got everything right!</div>`}</div>
      <div class="center mt-3"><button class="btn btn--primary" id="backResults2">${PT.icon("arrowLeft")} Back to results</button></div></div>`;
    const back = () => renderResults(done, sum);
    PT.$("#backResults").addEventListener("click", back); PT.$("#backResults2").addEventListener("click", back);
    views.review.addEventListener("click", (e) => { const b = e.target.closest("[data-bm]"); if (!b) return; const on = PT.toggleBookmark(b.dataset.bm); b.classList.toggle("on", on); b.querySelector("span:last-child").textContent = on ? "Saved" : "Save"; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------------------------------------------------------------
     Helpers / boot
     --------------------------------------------------------------------- */
  function show(name) { Object.keys(views).forEach((k) => { views[k].hidden = k !== name; }); }

  document.addEventListener("keydown", (e) => {
    if (!session || views.quiz.hidden) return;
    if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
    if (["1", "2", "3", "4"].includes(e.key)) { const b = PT.$(`.option[data-i="${+e.key - 1}"]`); if (b && !b.disabled) { e.preventDefault(); answer(+e.key - 1); } }
    else if (e.key === "Enter" || e.key === " ") { const nb = PT.$("#nextBtn"); if (nb && !nb.hidden && document.activeElement !== nb) { e.preventDefault(); next(); } }
  });
  window.addEventListener("beforeunload", () => { if (session) { session.elapsedMs += Date.now() - session.qStart; session.qStart = Date.now(); persist(); } });

  PT.onPage("practice", async function () {
    views = { setup: PT.$("#viewSetup"), quiz: PT.$("#viewQuiz"), results: PT.$("#viewResults"), review: PT.$("#viewReview") };
    setup = defaultSetup(); applyParams();
    const mode = PT.param("mode");
    const active = PT.state().active;

    if (mode === "daily") {
      if (PT.param("review") && PT.dailyRecord().completed) return renderDailyResults(PT.dailyRecord());
      if (active && !active.isDaily) {
        const ok = await PT.confirm("Pause your other quiz?", "You have an unfinished quiz. Starting the daily challenge will discard it.", { ok: "Start daily challenge", cancel: "Go back" });
        if (!ok) { history.back(); return; }
        clearActive();
      }
      return startDaily();
    }
    if (active) {
      const resume = await PT.modal({ title: "Welcome back!", text: `You have an unfinished ${active.isDaily ? "daily challenge" : "quiz"} (${active.answers.filter(Boolean).length}/${active.items.length} answered). Pick up where you left off?`, mood: "happy", locked: true, buttons: [{ label: "Discard", value: false, danger: true }, { label: "Resume", value: true, primary: true }] });
      if (resume && restoreSession(active)) return;
      clearActive();
    }
    if (PT.param("start") === "1") return startQuiz(buildConfigFromSetup());
    renderSetup();
  });
})();
