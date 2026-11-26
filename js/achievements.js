/* ==========================================================================
   PetalTalk — achievements.js
   Achievement definitions, automatic unlocking, badges, achievements page.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  const catAnswered = (label) => (PT.state().categories[label] || {}).answered || 0;
  const catCorrect = (label) => (PT.state().categories[label] || {}).correct || 0;
  const dailyCount = () => Object.values(PT.state().daily).filter((d) => d.completed).length;
  const categoriesPracticed = () => PT.CATEGORIES.filter((c) => catAnswered(c.label) > 0).length;
  const expertCorrect = () => Object.entries(PT.state().questions).filter(([id, r]) => { const q = PT.qById(id); return q && q.difficulty === "Expert" && r.correct > 0; }).length;

  // progress: () => [current, target]
  PT.ACHIEVEMENTS = [
    { key: "first_petal", title: "First Petal", desc: "Complete your first quiz.", badge: "petal", progress: () => [Math.min(1, PT.state().stats.quizzes), 1] },
    { key: "little_scholar", title: "Little Scholar", desc: "Answer 50 questions.", badge: "book", progress: () => [PT.state().stats.answered, 50] },
    { key: "hundred_petals", title: "Hundred Petals", desc: "Answer 100 questions.", badge: "flowers", progress: () => [PT.state().stats.answered, 100] },
    { key: "grammar_garden", title: "Grammar Garden", desc: "Answer 50 grammar questions correctly.", badge: "garden", progress: () => [catCorrect("Grammar"), 50] },
    { key: "perfect_bloom", title: "Perfect Bloom", desc: "Score 100% on a quiz of 5 or more questions.", badge: "bloom", progress: () => [Math.min(1, PT.state().stats.perfect), 1] },
    { key: "sprout", title: "Little Sprout", desc: "Practice three days in a row.", badge: "sprout", progress: () => [Math.max(PT.state().stats.longestStreak || 0, PT.currentStreak()), 3] },
    { key: "seven_day", title: "Seven-Day Streak", desc: "Practice seven consecutive days.", badge: "week", progress: () => [Math.max(PT.state().stats.longestStreak || 0, PT.currentStreak()), 7] },
    { key: "full_bloom", title: "Full Bloom", desc: "Keep a 30-day practice streak.", badge: "sun", progress: () => [Math.max(PT.state().stats.longestStreak || 0, PT.currentStreak()), 30] },
    { key: "vocab_lover", title: "Vocabulary Lover", desc: "Complete 100 vocabulary questions.", badge: "heart", progress: () => [catAnswered("Vocabulary"), 100] },
    { key: "knowledge_garden", title: "Knowledge Garden", desc: "Practice all 20 categories.", badge: "map", progress: () => [categoriesPracticed(), 20] },
    { key: "english_explorer", title: "English Explorer", desc: "Answer 500 questions correctly.", badge: "compass", progress: () => [PT.state().stats.correct, 500] },
    { key: "morning_dew", title: "Morning Dew", desc: "Complete your first daily challenge.", badge: "dew", progress: () => [Math.min(1, dailyCount()), 1] },
    { key: "week_of_dew", title: "Week of Dew", desc: "Complete seven daily challenges.", badge: "calendar", progress: () => [dailyCount(), 7] },
    { key: "pressed_flowers", title: "Pressed Flowers", desc: "Bookmark 10 questions to your library.", badge: "bookmark", progress: () => [PT.state().bookmarks.length, 10] },
    { key: "second_bloom", title: "Second Bloom", desc: "Correctly answer 20 questions you once got wrong.", badge: "redo", progress: () => [PT.state().stats.comebacks || 0, 20] },
    { key: "cloud_nine", title: "Cloud Nine", desc: "Get 25 expert questions right.", badge: "cloud", progress: () => [expertCorrect(), 25] },
    { key: "swift_breeze", title: "Swift Breeze", desc: "Finish a 10+ question quiz in under 2 minutes with 80%+.", badge: "wind", progress: () => [PT.state().achievements.swift_breeze ? 1 : 0, 1], event: (s) => s && s.total >= 10 && s.timeMs < 120000 && PT.pct(s.correct, s.total) >= 80 },
    { key: "long_walk", title: "The Long Walk", desc: "Complete a 50-question quiz.", badge: "path", progress: () => [PT.state().achievements.long_walk ? 1 : 0, 1], event: (s) => s && s.total >= 50 },
    { key: "moonlit", title: "Moonlit Study", desc: "Finish a quiz between 10 pm and 4 am.", badge: "moon", progress: () => [PT.state().achievements.moonlit ? 1 : 0, 1], event: (s) => { const h = new Date().getHours(); return !!s && (h >= 22 || h < 4); } },
    { key: "sunrise", title: "Sunrise Study", desc: "Finish a quiz between 5 am and 8 am.", badge: "sunrise", progress: () => [PT.state().achievements.sunrise ? 1 : 0, 1], event: (s) => { const h = new Date().getHours(); return !!s && h >= 5 && h < 8; } }
  ];

  PT.checkAchievements = function (quizSummary) {
    const st = PT.state();
    const unlocked = [];
    PT.ACHIEVEMENTS.forEach((a) => {
      if (st.achievements[a.key]) return;
      let ok = false;
      if (a.event) ok = a.event(quizSummary);
      else { const [cur, target] = a.progress(); ok = cur >= target; }
      if (ok) { st.achievements[a.key] = Date.now(); unlocked.push(a); }
    });
    if (unlocked.length) {
      PT.save();
      unlocked.forEach((a, i) => setTimeout(() => {
        PT.toast({ type: "achievement", title: `Achievement unlocked: ${a.title}`, text: a.desc, mimo: "cheer", duration: 6000 });
        PT.sound("achievement");
      }, 600 + i * 900));
    }
    return unlocked;
  };

  /* Badge art — small medallions, each distinct */
  PT.badge = function (name) {
    const ring = '<circle cx="50" cy="50" r="44" fill="#fff" stroke="#B8D9F2" stroke-width="3"/><circle cx="50" cy="50" r="38" fill="none" stroke="#E5F2FC" stroke-width="2" stroke-dasharray="4 5"/>';
    const petal = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
    const art = {
      petal: `<path d="M50 28c-10 10-10 24 0 34 10-10 10-24 0-34z" fill="#B8D9F2"/><path d="M50 62V74" stroke="#91CDAE" stroke-width="3" stroke-linecap="round"/>`,
      book: `<rect x="30" y="32" width="40" height="34" rx="4" fill="#8ABDE3"/><rect x="34" y="36" width="32" height="26" rx="2" fill="#fff"/><path d="M40 44h20M40 50h14" stroke="#B8D9F2" stroke-width="2.5" stroke-linecap="round"/>`,
      flowers: `${petal(36, 44, 6, "#C7D2F5")}${petal(50, 36, 6, "#B8D9F2")}${petal(64, 44, 6, "#C7D2F5")}${petal(42, 58, 6, "#B8D9F2")}${petal(58, 58, 6, "#C7D2F5")}${petal(50, 48, 7, "#F2D48A")}`,
      garden: `<path d="M30 68h40" stroke="#91CDAE" stroke-width="4" stroke-linecap="round"/><path d="M40 68V50M50 68V42M60 68V52" stroke="#91CDAE" stroke-width="3" stroke-linecap="round"/>${petal(40, 46, 6, "#8ABDE3")}${petal(50, 38, 7, "#EBA7B1")}${petal(60, 48, 6, "#C7D2F5")}`,
      bloom: `${petal(50, 32, 8, "#fff")}${petal(50, 68, 8, "#fff")}${petal(32, 50, 8, "#fff")}${petal(68, 50, 8, "#fff")}${petal(37, 37, 8, "#E5F2FC")}${petal(63, 37, 8, "#E5F2FC")}${petal(37, 63, 8, "#E5F2FC")}${petal(63, 63, 8, "#E5F2FC")}<circle cx="50" cy="50" r="9" fill="#F2D48A" stroke="#E7B86E" stroke-width="2"/>`,
      sprout: `<path d="M50 72V52" stroke="#91CDAE" stroke-width="4" stroke-linecap="round"/><path d="M50 54c0-10 8-14 18-14 0 10-8 14-18 14z" fill="#91CDAE"/><path d="M50 50c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#B8D9F2"/>`,
      week: `<rect x="28" y="32" width="44" height="38" rx="6" fill="#fff" stroke="#8ABDE3" stroke-width="3"/><path d="M28 42h44" stroke="#8ABDE3" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-size="16" font-weight="700" fill="#6FA6D4" font-family="Georgia">7</text>`,
      sun: `<circle cx="50" cy="50" r="12" fill="#F2D48A"/><g stroke="#F2D48A" stroke-width="3.5" stroke-linecap="round"><path d="M50 26v6M50 68v6M26 50h6M68 50h6M33 33l4 4M63 63l4 4M33 67l4-4M63 37l4-4"/></g>`,
      heart: `<path d="M50 70S28 56 28 42a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 14-22 28-22 28z" fill="#EBA7B1"/><path d="M38 40a6 6 0 0 1 6-4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>`,
      map: `<path d="M30 36l14-6 12 6 14-6v34l-14 6-12-6-14 6z" fill="#E5F2FC" stroke="#8ABDE3" stroke-width="3" stroke-linejoin="round"/><path d="M44 30v34M56 36v34" stroke="#8ABDE3" stroke-width="2"/><circle cx="50" cy="48" r="4" fill="#EBA7B1"/>`,
      compass: `<circle cx="50" cy="50" r="20" fill="#fff" stroke="#8ABDE3" stroke-width="3"/><path d="M50 34l6 12-6 20-6-20z" fill="#EBA7B1"/><path d="M44 46l6-12 6 12" fill="#8ABDE3"/><circle cx="50" cy="50" r="3" fill="#34475D"/>`,
      dew: `<path d="M50 28c8 12 14 20 14 28a14 14 0 0 1-28 0c0-8 6-16 14-28z" fill="#B8D9F2"/><path d="M42 56a8 8 0 0 0 6 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>`,
      calendar: `<rect x="28" y="32" width="44" height="38" rx="6" fill="#fff" stroke="#8ABDE3" stroke-width="3"/><path d="M28 42h44M38 28v8M62 28v8" stroke="#8ABDE3" stroke-width="3" stroke-linecap="round"/><g fill="#91CDAE">${[36, 44, 52, 60].map((x) => `<circle cx="${x}" cy="52" r="2.5"/>`).join("")}${[36, 44, 52].map((x) => `<circle cx="${x}" cy="61" r="2.5"/>`).join("")}</g>`,
      bookmark: `<path d="M36 28h28v44l-14-9-14 9z" fill="#C7D2F5" stroke="#8ABDE3" stroke-width="3" stroke-linejoin="round"/>${petal(50, 44, 5, "#fff")}`,
      redo: `<path d="M34 50a16 16 0 1 0 6-12.5" fill="none" stroke="#8ABDE3" stroke-width="4" stroke-linecap="round"/><path d="M32 30v10h10" fill="none" stroke="#8ABDE3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${petal(50, 50, 5, "#91CDAE")}`,
      cloud: `<path d="M36 64a10 10 0 0 1-1-20 14 14 0 0 1 27-3 11 11 0 0 1 2 23z" fill="#fff" stroke="#8ABDE3" stroke-width="3" stroke-linejoin="round"/><text x="50" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#6FA6D4" font-family="Georgia">9</text>`,
      wind: `<path d="M28 44h26a6 6 0 1 0-6-6M28 54h32a6 6 0 1 1-6 6M28 64h16" fill="none" stroke="#8ABDE3" stroke-width="4" stroke-linecap="round"/>`,
      path: `<path d="M30 70c10-10 0-20 10-28s20 0 30-14" fill="none" stroke="#C7D2F5" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 10"/>${petal(70, 28, 5, "#EBA7B1")}${petal(30, 70, 4, "#91CDAE")}`,
      moon: `<path d="M62 62A20 20 0 0 1 40 32a20 20 0 1 0 22 30z" fill="#C7D2F5"/>${petal(62, 36, 2.5, "#F2D48A")}${petal(70, 46, 1.8, "#F2D48A")}`,
      sunrise: `<path d="M28 62h44" stroke="#8ABDE3" stroke-width="3" stroke-linecap="round"/><path d="M36 60a14 14 0 0 1 28 0z" fill="#F2D48A"/><g stroke="#F2D48A" stroke-width="3" stroke-linecap="round"><path d="M50 36v-6M34 44l-4-4M66 44l4-4"/></g>`
    };
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${ring}${art[name] || art.petal}</svg>`;
  };

  PT.onPage("achievements", function () {
    const st = PT.state();
    PT.checkAchievements();
    const total = PT.ACHIEVEMENTS.length, done = PT.ACHIEVEMENTS.filter((a) => st.achievements[a.key]).length;
    PT.$("#achSummary").innerHTML = `${PT.mimo(done ? "cheer" : "happy")}<div><div class="big">${done} <span class="muted" style="font-size:1.2rem">/ ${total}</span></div><div class="muted">badges collected</div><div class="progress mt-2" style="width:220px;max-width:100%"><i style="width:${PT.pct(done, total)}%"></i></div></div>
      <div class="bubble bubble--right" style="margin-left:auto;max-width:280px">${done === 0 ? "Every garden starts with one seed. Finish a quiz to earn your First Petal!" : done === total ? "You collected them all! Mimo is speechless… almost." : `${total - done} more to go. Mimo can't wait to see the next one.`}</div>`;
    PT.$("#achGrid").innerHTML = PT.ACHIEVEMENTS.map((a) => {
      const ts = st.achievements[a.key];
      const [cur, target] = a.progress();
      const p = ts ? 100 : PT.pct(Math.min(cur, target), target);
      return `<div class="ach ${ts ? "" : "locked"}">${ts ? '<div class="ribbon">Unlocked</div>' : ""}<div class="badge">${PT.badge(a.badge)}</div><h3>${PT.esc(a.title)}</h3><p>${PT.esc(a.desc)}</p>
        <div class="ach-bar"><i style="width:${p}%"></i></div>${ts ? `<div class="unlocked-on">Unlocked ${PT.fmtDate(PT.todayKey(new Date(ts)))}</div>` : `<div class="ach-prog">${Math.min(cur, target)} / ${target}</div>`}</div>`;
    }).join("");
  });
})();
