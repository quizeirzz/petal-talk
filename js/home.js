/* ==========================================================================
   PetalTalk — home.js
   Home page widgets and the Categories page.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  PT.categoryCard = function (c, delay) {
    const s = PT.categoryStats(c.label);
    const qs = PT.catQuestions(c.label);
    const diffs = PT.DIFFICULTIES.filter((d) => qs.some((q) => q.difficulty === d));
    const range = diffs.length ? `${diffs[0]} – ${diffs[diffs.length - 1]}` : "—";
    const fav = PT.isFavorite(c.label);
    return `<a class="cat-card" href="practice.html?category=${c.slug}" style="--c:${c.color};animation-delay:${delay || 0}ms" aria-label="${PT.esc(c.label)}: ${qs.length} questions">
      <button type="button" class="fav-btn ${fav ? "on" : ""}" data-fav="${PT.esc(c.label)}" aria-label="${fav ? "Remove from" : "Add to"} favorite categories" aria-pressed="${fav}">${PT.icon("heart")}</button>
      <span class="cat-ico">${PT.icon(c.icon)}</span>
      <h3>${PT.esc(c.label)}</h3><p>${PT.esc(c.desc)}</p>
      <div class="cat-meta"><span>${qs.length} questions</span><span>${range}</span></div>
      <div class="progress progress--thin" aria-label="${s.coverage}% explored"><i style="width:${s.coverage}%"></i></div>
      <div class="cat-foot"><span class="tiny muted">${s.answered ? `${s.accuracy}% accuracy · ${s.seen}/${s.total} seen` : "Not started yet"}</span><span class="pct">Start ${PT.icon("arrow")}</span></div>
    </a>`;
  };
  function bindFav(root) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-fav]"); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const on = PT.toggleFavorite(b.dataset.fav);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      PT.toast({ title: on ? `${b.dataset.fav} added to favorites` : `${b.dataset.fav} removed from favorites`, icon: "heart", duration: 2000 });
    });
  }

  /* Home ---------------------------------------------------------------- */
  PT.onPage("home", function () {
    const st = PT.state(), s = st.stats;
    const rec = PT.dailyRecord();
    const dailyDone = rec.answers.filter(Boolean).length;
    PT.$("#statsStrip").innerHTML = [
      ["flame", PT.currentStreak(), "Day streak", PT.practicedToday() ? "Practiced today" : "Practice today to keep it"],
      ["pencil", s.answered, "Questions answered", `${s.quizzes} quizzes completed`],
      ["target", (s.answered ? PT.pct(s.correct, s.answered) : 0) + "%", "Overall accuracy", `${s.correct} correct so far`],
      ["calendar", `${dailyDone}/${PT.DAILY_COUNT}`, "Daily challenge", rec.completed ? "Completed — well done!" : "In progress"]
    ].map(([i, v, l, sub]) => `<div class="stat-tile"><span class="ico">${PT.icon(i)}</span><div><div class="val">${PT.esc(v)}</div><div class="lab">${l}</div><div class="tiny muted">${sub}</div></div></div>`).join("");

    PT.renderDailyCard(PT.$("#dailyCard"));

    // Categories preview: favorites first, then the rest, 8 total
    const favs = PT.CATEGORIES.filter((c) => PT.isFavorite(c.label));
    const rest = PT.CATEGORIES.filter((c) => !PT.isFavorite(c.label));
    const preview = favs.concat(rest).slice(0, 8);
    const grid = PT.$("#homeCats");
    grid.innerHTML = preview.map((c, i) => PT.categoryCard(c, i * 40)).join("");
    bindFav(grid);

    PT.$("#homeModes").innerHTML = PT.MODES.map((m) => `<a class="mode-card" href="practice.html?mode=${m.key}"><span class="mode-ico">${PT.icon(m.icon)}</span><b>${m.label}</b><span>${m.desc}</span><span class="count">${PT.modePool(m.key)} questions</span></a>`).join("");

    const sw = PT.strongestWeakest();
    const name = st.settings.name ? `, ${st.settings.name}` : "";
    let say;
    if (!s.answered) say = `Hello${name}! I'm Mimo. There are ${PT.questions().length} questions waiting in our garden. Shall we start with something easy?`;
    else if (sw.weakest && sw.weakest.s.accuracy < 60) say = `Welcome back${name}! ${sw.weakest.label} has been a little tricky (${sw.weakest.s.accuracy}%). Want to practice it together today?`;
    else if (sw.strongest) say = `Welcome back${name}! You're wonderful at ${sw.strongest.label} (${sw.strongest.s.accuracy}%). Ready to explore something new?`;
    else say = `Welcome back${name}! A few more questions and I'll know your strengths. Let's go!`;
    PT.$("#mimoSay").textContent = say;
    PT.$("#bankCount").textContent = PT.questions().length.toLocaleString();
  });

  /* Categories page ----------------------------------------------------- */
  PT.onPage("categories", function () {
    const grid = PT.$("#catGrid");
    const search = PT.$("#catSearch");
    const sortSel = PT.$("#catSort");
    function render() {
      const term = (search.value || "").trim().toLowerCase();
      let list = PT.CATEGORIES.filter((c) => !term || c.label.toLowerCase().includes(term) || c.desc.toLowerCase().includes(term));
      const sort = sortSel.value;
      if (sort === "progress") list = list.slice().sort((a, b) => PT.categoryStats(b.label).coverage - PT.categoryStats(a.label).coverage);
      if (sort === "weakest") list = list.slice().sort((a, b) => { const A = PT.categoryStats(a.label), B = PT.categoryStats(b.label); return (A.answered ? A.accuracy : 101) - (B.answered ? B.accuracy : 101); });
      if (sort === "favorites") list = list.slice().sort((a, b) => Number(PT.isFavorite(b.label)) - Number(PT.isFavorite(a.label)));
      grid.innerHTML = list.length ? list.map((c, i) => PT.categoryCard(c, i * 30)).join("") : `<div class="empty-state" style="grid-column:1/-1">${PT.mimo("think")}<b>No category matches "${PT.esc(term)}"</b>Try another word.</div>`;
    }
    search.addEventListener("input", render); sortSel.addEventListener("change", render);
    bindFav(grid);
    render();
    const seen = PT.CATEGORIES.filter((c) => PT.categoryStats(c.label).answered > 0).length;
    PT.$("#catIntro").textContent = `${PT.CATEGORIES.length} categories · ${PT.questions().length.toLocaleString()} questions · you've visited ${seen} so far`;
  });
})();
