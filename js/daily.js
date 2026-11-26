/* ==========================================================================
   PetalTalk — daily.js
   Daily challenge: deterministic per-day question set, status, home card.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;
  PT.DAILY_COUNT = 10;

  // Same 10 questions for a given local date, every reload, on every device with the same bank.
  PT.dailyIds = function (dateKey) {
    const key = dateKey || PT.todayKey();
    const rng = PT.seededRng(PT.hashString("petaltalk-daily-" + key));
    const all = PT.questions();
    const byDiff = (d) => PT.shuffle(all.filter((q) => q.difficulty === d), rng);
    const plan = [["Easy", 4], ["Medium", 3], ["Hard", 2], ["Expert", 1]];
    const chosen = [], usedCats = new Set();
    plan.forEach(([d, n]) => {
      const pool = byDiff(d);
      let taken = 0;
      // first pass: prefer distinct categories
      for (const q of pool) { if (taken >= n) break; if (!usedCats.has(q.category)) { chosen.push(q); usedCats.add(q.category); taken++; } }
      for (const q of pool) { if (taken >= n) break; if (!chosen.includes(q)) { chosen.push(q); taken++; } }
    });
    return PT.shuffle(chosen, rng).slice(0, PT.DAILY_COUNT).map((q) => q.id);
  };

  PT.dailyRecord = function (dateKey) {
    const key = dateKey || PT.todayKey();
    const st = PT.state();
    if (!st.daily[key]) { st.daily[key] = { ids: PT.dailyIds(key), answers: [], completed: false, correct: 0, finishedAt: null }; PT.save(); }
    // Guard: if the bank changed and ids are missing, regenerate.
    if (!st.daily[key].ids.every((id) => PT.qById(id))) { st.daily[key].ids = PT.dailyIds(key); PT.save(); }
    return st.daily[key];
  };

  PT.dailyStreak = function () {
    const st = PT.state();
    let n = 0, key = PT.todayKey();
    if (!(st.daily[key] && st.daily[key].completed)) key = PT.addDays(key, -1);
    while (st.daily[key] && st.daily[key].completed) { n++; key = PT.addDays(key, -1); }
    return n;
  };

  PT.renderDailyCard = function (el) {
    if (!el) return;
    const rec = PT.dailyRecord();
    const dots = rec.ids.map((id, i) => { const a = rec.answers[i]; return `<span class="${a ? (a.correct ? "ok" : "bad") : ""}"></span>`; }).join("");
    const answered = rec.answers.filter(Boolean).length;
    const dstreak = PT.dailyStreak();
    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    let cta, mood, msg;
    if (rec.completed) { mood = "cheer"; msg = `Done for today — you scored <b>${rec.correct}/${PT.DAILY_COUNT}</b>. Come back tomorrow for a fresh set.`; cta = `<a class="btn btn--secondary" href="practice.html?mode=daily&review=1">Review today's answers</a>`; }
    else if (answered) { mood = "think"; msg = `You're ${answered} of ${PT.DAILY_COUNT} questions in. Let's finish it!`; cta = `<a class="btn btn--primary" href="practice.html?mode=daily">Continue challenge</a>`; }
    else { mood = "happy"; msg = `Ten hand-picked questions, the same for everyone today. Finish them to grow your daily streak.`; cta = `<a class="btn btn--primary" href="practice.html?mode=daily">Start today's challenge</a>`; }
    el.innerHTML = `<div class="daily-left"><span class="eyebrow">Daily challenge · ${PT.esc(dateLabel)}</span><h2 class="mt-1 mb-1">${rec.completed ? "Today's petals are collected!" : "Today's little challenge"}</h2><p class="muted mb-0">${msg}</p><div class="progress-dots" aria-label="${answered} of ${PT.DAILY_COUNT} answered">${dots}</div>
      <div class="row">${cta}<span class="pill pill--gold">${PT.icon("calendar")} ${dstreak}-day daily streak</span></div></div>
      <div class="daily-right">${PT.mimo(mood, { className: "daily-mimo" })}<span class="sticker ${rec.completed ? "sticker--mint" : ""}">${rec.completed ? "Completed" : "10 questions"}</span></div>`;
  };
})();
