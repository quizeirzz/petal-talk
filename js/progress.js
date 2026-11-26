/* ==========================================================================
   PetalTalk — progress.js
   Recording results, streaks, derived statistics, progress dashboard.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  /* ---------------------------------------------------------------------
     Recording
     --------------------------------------------------------------------- */
  function bump(obj, key, n) { obj[key] = (obj[key] || 0) + (n == null ? 1 : n); }

  // Record a single answered question (called as the quiz progresses so a refresh never loses data).
  PT.recordAnswer = function (qid, isCorrect, timeMs) {
    const st = PT.state();
    const q = PT.qById(qid); if (!q) return;
    const rec = st.questions[qid] || (st.questions[qid] = { seen: 0, correct: 0, wrong: 0, last: 0, lastResult: null });
    const wasWrong = rec.lastResult === "wrong";
    rec.seen++; rec.last = Date.now();
    if (isCorrect) { rec.correct++; rec.lastResult = "correct"; if (wasWrong) bump(st.stats, "comebacks"); }
    else { rec.wrong++; rec.lastResult = "wrong"; }

    bump(st.stats, "answered"); bump(st.stats, isCorrect ? "correct" : "incorrect"); bump(st.stats, "timeMs", timeMs || 0);
    const cat = st.categories[q.category] || (st.categories[q.category] = { answered: 0, correct: 0 });
    cat.answered++; if (isCorrect) cat.correct++;
    const day = st.activity[PT.todayKey()] || (st.activity[PT.todayKey()] = { answered: 0, correct: 0, quizzes: 0, timeMs: 0 });
    day.answered++; if (isCorrect) day.correct++; day.timeMs += timeMs || 0;
    PT.save();
  };

  // Record quiz completion: streaks, history, achievements.
  PT.recordQuiz = function (summary) {
    const st = PT.state();
    bump(st.stats, "quizzes");
    if (summary.total >= 5 && summary.correct === summary.total) bump(st.stats, "perfect");
    const today = PT.todayKey();
    const day = st.activity[today] || (st.activity[today] = { answered: 0, correct: 0, quizzes: 0, timeMs: 0 });
    day.quizzes++;
    // Streak
    const last = st.stats.lastActiveDate;
    if (last !== today) {
      if (last === PT.addDays(today, -1)) st.stats.currentStreak = (st.stats.currentStreak || 0) + 1;
      else st.stats.currentStreak = 1;
      st.stats.lastActiveDate = today;
      st.stats.longestStreak = Math.max(st.stats.longestStreak || 0, st.stats.currentStreak);
    }
    st.history.unshift(Object.assign({ at: Date.now(), date: today }, summary));
    if (st.history.length > 100) st.history.length = 100;
    PT.save();
    const unlocked = PT.checkAchievements ? PT.checkAchievements(summary) : [];
    return unlocked;
  };

  /* ---------------------------------------------------------------------
     Derived statistics
     --------------------------------------------------------------------- */
  // Streak as it should be displayed today (0 if the chain is broken).
  PT.currentStreak = function () {
    const s = PT.state().stats;
    const today = PT.todayKey();
    if (!s.lastActiveDate) return 0;
    if (s.lastActiveDate === today || s.lastActiveDate === PT.addDays(today, -1)) return s.currentStreak || 0;
    return 0;
  };
  PT.practicedToday = () => PT.state().stats.lastActiveDate === PT.todayKey();

  PT.categoryStats = function (label) {
    const c = PT.state().categories[label] || { answered: 0, correct: 0 };
    const total = PT.catQuestions(label).length;
    const seen = Object.keys(PT.state().questions).filter((id) => { const q = PT.qById(id); return q && q.category === label; }).length;
    return { answered: c.answered, correct: c.correct, accuracy: PT.pct(c.correct, c.answered), total, seen, coverage: PT.pct(seen, total) };
  };

  PT.weakCategories = function (n) {
    const rows = PT.CATEGORIES.map((c) => ({ label: c.label, s: PT.categoryStats(c.label) })).filter((r) => r.s.answered >= 3);
    rows.sort((a, b) => a.s.accuracy - b.s.accuracy);
    return rows.slice(0, n || 5).map((r) => r.label);
  };
  PT.strongestWeakest = function () {
    const rows = PT.CATEGORIES.map((c) => ({ label: c.label, s: PT.categoryStats(c.label) })).filter((r) => r.s.answered >= 3);
    if (!rows.length) return { strongest: null, weakest: null };
    rows.sort((a, b) => b.s.accuracy - a.s.accuracy || b.s.answered - a.s.answered);
    return { strongest: rows[0], weakest: rows[rows.length - 1] };
  };

  PT.weekActivity = function () {
    const st = PT.state();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const key = PT.addDays(PT.todayKey(), -i);
      const a = st.activity[key] || { answered: 0, correct: 0, quizzes: 0, timeMs: 0 };
      const [y, m, d] = key.split("-").map(Number);
      out.push({ key, label: new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" }), answered: a.answered, correct: a.correct, quizzes: a.quizzes });
    }
    return out;
  };

  /* ---------------------------------------------------------------------
     Progress page
     --------------------------------------------------------------------- */
  PT.onPage("progress", function () {
    const st = PT.state();
    const s = st.stats;
    const acc = PT.pct(s.correct, s.answered);
    const sw = PT.strongestWeakest();

    PT.$("#overview").innerHTML = [
      [s.quizzes, "Quizzes done"], [s.answered, "Answered"], [s.correct, "Correct"], [s.incorrect, "Incorrect"], [acc + "%", "Accuracy"],
      [PT.currentStreak(), "Day streak"], [s.longestStreak || 0, "Longest streak"], [PT.fmtTime(s.timeMs), "Practice time"],
      [sw.strongest ? sw.strongest.label : "—", "Strongest"], [sw.weakest ? sw.weakest.label : "—", "Weakest"]
    ].map(([v, l]) => `<div class="ov-tile"><b>${PT.esc(v)}</b><span>${l}</span></div>`).join("");

    // Weekly chart
    const week = PT.weekActivity();
    const max = Math.max(1, ...week.map((d) => d.answered));
    PT.$("#weekChart").innerHTML = week.map((d, i) => `<div class="bar-col ${i === 6 ? "today" : ""}" title="${d.answered} answered, ${d.correct} correct">
      <div class="bar ${d.answered ? "" : "empty"}" style="height:${d.answered ? Math.max(6, Math.round((d.answered / max) * 100)) : 4}%"><span class="v">${d.answered || ""}</span></div><span class="d">${PT.esc(d.label)}</span></div>`).join("");
    const weekTotal = week.reduce((a, d) => a + d.answered, 0);
    const weekCorrect = week.reduce((a, d) => a + d.correct, 0);
    PT.$("#weekSummary").textContent = weekTotal ? `${weekTotal} questions this week · ${PT.pct(weekCorrect, weekTotal)}% accuracy` : "No practice yet this week — today is a lovely day to start.";

    // Mastery
    PT.$("#mastery").innerHTML = PT.CATEGORIES.map((c) => {
      const cs = PT.categoryStats(c.label);
      return `<div class="mastery-row"><div class="mi" style="--c:${c.color}">${PT.icon(c.icon)}</div>
        <div><div class="mn">${PT.esc(c.label)}</div><div class="ms">${cs.seen}/${cs.total} seen · ${cs.answered ? cs.accuracy + "% accuracy" : "not started"}</div>
        <div class="progress progress--thin mt-1"><i style="width:${cs.coverage}%"></i></div></div>
        <div class="mp">${cs.coverage}%</div></div>`;
    }).join("");

    // History
    const hist = st.history.slice(0, 12);
    PT.$("#history").innerHTML = hist.length ? hist.map((h) => `<div class="history-row">
      <div><div class="h-title">${PT.esc(h.title || h.mode || "Quiz")}</div><div class="h-sub">${PT.fmtDateTime(h.at)} · ${PT.esc(h.difficulty || "Mixed")} · ${h.total} questions</div></div>
      <div class="h-extra small muted">${PT.fmtTime(h.timeMs || 0)}</div>
      <div class="h-extra"><span class="pill ${PT.pct(h.correct, h.total) >= 80 ? "pill--mint" : PT.pct(h.correct, h.total) >= 50 ? "" : "pill--pink"}">${PT.pct(h.correct, h.total)}%</span></div>
      <div class="h-score">${h.correct}/${h.total}</div></div>`).join("")
      : `<div class="empty-state">${PT.mimo("sleepy")}<b>No quizzes yet</b>${PT.esc(PT.line("empty"))}<div class="mt-2"><a class="btn btn--primary btn--sm" href="practice.html">Start practicing</a></div></div>`;

    // Calendar (current month)
    PT.$("#calendar").innerHTML = PT.renderCalendar(new Date());
  });

  PT.renderCalendar = function (date) {
    const st = PT.state();
    const y = date.getFullYear(), m = date.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const today = PT.todayKey();
    const dows = ["S", "M", "T", "W", "T", "F", "S"].map((d) => `<div class="dow">${d}</div>`).join("");
    let cells = "";
    for (let i = 0; i < first; i++) cells += '<div class="day pad"></div>';
    for (let d = 1; d <= days; d++) {
      const key = `${y}-${PT.pad2(m + 1)}-${PT.pad2(d)}`;
      const done = st.daily[key] && st.daily[key].completed;
      const active = st.activity[key] && st.activity[key].answered > 0;
      const title = done ? `Daily challenge: ${st.daily[key].correct}/10` : active ? `${st.activity[key].answered} answered` : "";
      cells += `<div class="day ${done ? "done" : ""} ${active ? "active-day" : ""} ${key === today ? "today" : ""}" title="${title}">${d}</div>`;
    }
    const label = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return `<div class="row row--between mb-2"><b>${label}</b><span class="tiny muted">${PT.icon("check")} daily done · outlined = practiced</span></div><div class="calendar">${dows}${cells}</div>`;
  };
})();
