/* ==========================================================================
   PetalTalk — library.js
   Personal learning library: bookmarks, mistakes, recent, favorites,
   grammar notes, vocabulary notes, tips.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  const GRAMMAR_NOTES = [
    { t: "Simple present vs. present continuous", b: "Use the <code>simple present</code> for habits and facts (<code>She reads every night</code>). Use the <code>present continuous</code> for actions happening now or temporary situations (<code>She is reading right now</code>). Signal words: always, usually, every day → simple; now, at the moment, look! → continuous." },
    { t: "Present perfect: the bridge to now", b: "<code>Have/has + past participle</code> connects the past to the present: experiences (<code>I have been to Japan</code>), unfinished time (<code>this week</code>), and results (<code>She has lost her keys</code>). Use <code>for</code> with a length of time and <code>since</code> with a starting point." },
    { t: "Articles in one minute", b: "<code>a/an</code> for one of many, chosen by sound (<code>an hour</code>, <code>a university</code>). <code>the</code> when both people know which one, for superlatives and unique things. No article for languages, meals, most countries and general plurals (<code>Dogs are loyal</code>)." },
    { t: "Subject–verb agreement traps", b: "Ignore words between the subject and the verb: <code>The <b>box</b> of apples <b>is</b> heavy</code>. <code>Each, every, everyone, nobody</code> are singular. With <code>neither…nor</code> and <code>either…or</code>, the verb agrees with the nearer subject. <code>A number of</code> = plural; <code>the number of</code> = singular." },
    { t: "Conditionals at a glance", b: "Zero: <code>If you heat ice, it melts</code> (facts). First: <code>If it rains, we will stay in</code> (real future). Second: <code>If I were you, I would wait</code> (unreal present). Third: <code>If I had known, I would have called</code> (unreal past)." },
    { t: "Passive voice recipe", b: "Move the object to the front, add the right form of <code>be</code>, and use the past participle: <code>The chef cooks the meal → The meal is cooked (by the chef)</code>. Keep the tense of the original. Modals: <code>must be finished</code>; perfect: <code>has been sent</code>." },
    { t: "Reported speech shifts", b: "After a past reporting verb, move tenses one step back: present → past, past → past perfect, will → would, can → could, may → might. Change time words (<code>now → then, tomorrow → the next day</code>) and pronouns. Questions use statement word order: <code>He asked where I lived</code>." },
    { t: "Commas: the big four", b: "1) After an introductory phrase: <code>After dinner, we walked</code>. 2) Around extra information: <code>My brother, who lives in Oslo, is visiting</code>. 3) Between items in a list. 4) Before <code>and/but/so</code> when joining two full sentences. Never join two full sentences with only a comma." },
    { t: "Adjective or adverb?", b: "Adjectives describe nouns (<code>a careful driver</code>); adverbs describe verbs, adjectives or other adverbs (<code>drives carefully</code>). After linking verbs — <code>feel, look, seem, smell, taste</code> — use an adjective: <code>The soup smells delicious</code>." },
    { t: "Modals of deduction", b: "<code>must</code> = almost certain (<code>She must be tired</code>). <code>might/may/could</code> = possible. <code>can't</code> = almost impossible. For the past, add <code>have + participle</code>: <code>He must have missed the bus</code>." },
    { t: "Who, whom, whose", b: "<code>Who</code> is a subject (<code>Who called?</code>). <code>Whom</code> is an object, often after prepositions (<code>To whom should I write?</code>). <code>Whose</code> shows possession (<code>Whose coat is this?</code>). Tip: if you can answer with <i>him</i>, use <i>whom</i>." },
    { t: "Inversion for emphasis", b: "When a negative or limiting adverb starts a sentence, swap the subject and the auxiliary: <code>Never have I seen such a view</code>, <code>Not only did she win, but she also set a record</code>, <code>Hardly had we arrived when it rained</code>." }
  ];
  const TIPS = [
    { i: "seedling", t: "Little and often", s: "Ten minutes a day beats two hours once a week. The daily challenge is designed for exactly that." },
    { i: "redo", t: "Revisit your mistakes", s: "Use Previously Incorrect mode a day or two after a quiz. Spacing out reviews is how memories settle." },
    { i: "book", t: "Learn words in phrases", s: "Instead of \"reluctant\", learn \"reluctant to admit\". Chunks are easier to remember and use." },
    { i: "bubble", t: "Say it out loud", s: "Reading a sentence aloud helps your ear catch errors your eye misses, especially with word order." },
    { i: "lightbulb", t: "Read the explanation even when you're right", s: "Being right by luck is common. The explanation turns a lucky guess into real knowledge." },
    { i: "bookmark", t: "Bookmark what surprises you", s: "If an answer surprised you, save it. Surprise is a sign your mental model needs a small update." },
    { i: "target", t: "Attack your weakest area", s: "Weak Areas mode picks your lowest-scoring categories. A little discomfort is where growth happens." },
    { i: "note", t: "Keep a vocabulary notebook", s: "Write new words with an example sentence of your own in the Vocabulary Notes tab." },
    { i: "glasses", t: "Read beyond the quiz", s: "Short articles, song lyrics, and subtitles are free practice. Notice the grammar you've studied in the wild." },
    { i: "moon", t: "Sleep on it", s: "Memory consolidation happens during sleep. A short review before bed is surprisingly effective." }
  ];

  function qItem(q, extra) {
    const rec = PT.state().questions[q.id];
    const bm = PT.isBookmarked(q.id);
    return `<article class="paper q-item"><div>
      <div class="qi-meta"><span class="tag">${PT.esc(q.category)}</span><span class="tag ${PT.diffClass(q.difficulty)}">${q.difficulty}</span>${rec ? `<span class="tag">${rec.correct}✓ ${rec.wrong}✗</span>` : ""}${extra || ""}</div>
      <div class="qi-q">${PT.renderQuestion(q)}</div>
      <div class="qi-a">Answer: ${PT.esc(q.options[q.answer])}</div>
      <div class="qi-exp">${PT.esc(q.explanation)}</div></div>
      <div class="qi-actions"><button class="bm-btn ${bm ? "on" : ""}" data-bm="${q.id}">${PT.icon("bookmark")} <span>${bm ? "Saved" : "Save"}</span></button></div></article>`;
  }
  const empty = (title, text, mood) => `<div class="empty-state">${PT.mimo(mood || "sleepy")}<b>${title}</b>${text}</div>`;

  PT.onPage("library", function () {
    const st = PT.state();
    const tabs = PT.$("#libTabs");
    const panels = {
      bookmarks: PT.$("#tabBookmarks"), incorrect: PT.$("#tabIncorrect"), recent: PT.$("#tabRecent"), favorites: PT.$("#tabFavorites"),
      grammar: PT.$("#tabGrammar"), vocab: PT.$("#tabVocab"), tips: PT.$("#tabTips")
    };

    function counts() {
      const incorrect = Object.entries(st.questions).filter(([id, r]) => r.lastResult === "wrong" && PT.qById(id)).length;
      return { bookmarks: st.bookmarks.filter((id) => PT.qById(id)).length, incorrect, recent: Math.min(30, Object.keys(st.questions).length), favorites: st.favorites.length, grammar: GRAMMAR_NOTES.length, vocab: st.notes.length, tips: TIPS.length };
    }
    function renderTabs(activeKey) {
      const c = counts();
      const defs = [["bookmarks", "Bookmarks"], ["incorrect", "Incorrect"], ["recent", "Recent"], ["favorites", "Favorite categories"], ["grammar", "Grammar notes"], ["vocab", "Vocabulary notes"], ["tips", "Learning tips"]];
      tabs.innerHTML = defs.map(([k, l]) => `<button class="tab-btn" role="tab" data-tab="${k}" aria-selected="${k === activeKey}">${l}<span class="n">${c[k]}</span></button>`).join("");
    }
    function activate(key) {
      renderTabs(key);
      Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== key; });
      renderPanel(key);
      history.replaceState(null, "", "#" + key);
    }
    function renderPanel(key) {
      if (key === "bookmarks") {
        const qs = st.bookmarks.map(PT.qById).filter(Boolean);
        panels.bookmarks.innerHTML = qs.length ? `<div class="row row--between mb-2"><p class="muted mb-0">${qs.length} saved question${qs.length === 1 ? "" : "s"}. Review them any time in <a href="practice.html?mode=review">Review Mode</a>.</p><a class="btn btn--primary btn--sm" href="practice.html?mode=review">Practice bookmarks</a></div><div class="q-list">${qs.map((q) => qItem(q)).join("")}</div>` : empty("No bookmarks yet", "Tap “Save” on any question during a quiz to press it into your library.");
      }
      if (key === "incorrect") {
        const qs = Object.entries(st.questions).filter(([, r]) => r.lastResult === "wrong").sort((a, b) => b[1].last - a[1].last).map(([id]) => PT.qById(id)).filter(Boolean);
        panels.incorrect.innerHTML = qs.length ? `<div class="row row--between mb-2"><p class="muted mb-0">Questions you answered incorrectly most recently. Answer them correctly and they'll leave this list.</p><a class="btn btn--primary btn--sm" href="practice.html?mode=incorrect">Retry these</a></div><div class="q-list">${qs.slice(0, 60).map((q) => qItem(q, `<span class="tag tag--expert">missed ${PT.fmtDate(PT.todayKey(new Date(st.questions[q.id].last)))}</span>`)).join("")}</div>` : empty("Nothing to fix!", "No lingering mistakes. Either you're perfect, or you're new here — both are fine.", "cheer");
      }
      if (key === "recent") {
        const qs = Object.entries(st.questions).sort((a, b) => b[1].last - a[1].last).slice(0, 30).map(([id, r]) => [PT.qById(id), r]).filter((x) => x[0]);
        panels.recent.innerHTML = qs.length ? `<div class="q-list">${qs.map(([q, r]) => qItem(q, `<span class="tag ${r.lastResult === "correct" ? "tag--easy" : "tag--expert"}">${r.lastResult === "correct" ? "correct" : "incorrect"} · ${PT.fmtDateTime(r.last)}</span>`)).join("")}</div>` : empty("No recent activity", PT.line("empty"));
      }
      if (key === "favorites") {
        const cats = PT.CATEGORIES.filter((c) => st.favorites.includes(c.label));
        panels.favorites.innerHTML = cats.length ? `<div class="cat-grid">${cats.map((c, i) => PT.categoryCard(c, i * 40)).join("")}</div>` : empty("No favorite categories", 'Tap the little heart on any category card to keep it here.<div class="mt-2"><a class="btn btn--secondary btn--sm" href="categories.html">Browse categories</a></div>', "love");
        panels.favorites.onclick = (e) => { const b = e.target.closest("[data-fav]"); if (!b) return; e.preventDefault(); PT.toggleFavorite(b.dataset.fav); activate("favorites"); };
      }
      if (key === "grammar") {
        panels.grammar.innerHTML = `<p class="muted">Short, friendly notes on the rules that come up most often. Open one whenever a quiz explanation leaves you curious.</p><div class="gram-list">${GRAMMAR_NOTES.map((n) => `<details><summary>${n.t}</summary><div class="gram-body">${n.b}</div></details>`).join("")}</div>`;
      }
      if (key === "vocab") {
        const notes = st.notes;
        panels.vocab.innerHTML = `<div class="two-col"><div>${notes.length ? `<div class="notes-grid">${notes.map((n) => `<div class="note-card"><h4>${PT.esc(n.title)}</h4><p>${PT.esc(n.text)}</p><div class="note-foot"><span>${PT.fmtDateTime(n.createdAt)}</span><button class="link-btn" data-del="${n.id}">Delete</button></div></div>`).join("")}</div>` : empty("Your notebook is empty", "Add a word, its meaning, and a sentence of your own. Writing it yourself is the trick.", "think")}</div>
          <form class="paper note-form" id="noteForm"><h3 class="mb-0">${PT.icon("note")} New vocabulary note</h3><input type="text" id="noteTitle" placeholder="Word or phrase" maxlength="60" required><textarea id="noteText" placeholder="Meaning, an example sentence, a memory trick…" maxlength="600" required></textarea><button class="btn btn--primary" type="submit">Add note</button></form></div>`;
        PT.$("#noteForm").addEventListener("submit", (e) => {
          e.preventDefault();
          const title = PT.$("#noteTitle").value.trim(), text = PT.$("#noteText").value.trim();
          if (!title || !text) return;
          st.notes.unshift({ id: "n" + Date.now(), title, text, createdAt: Date.now() }); PT.save();
          PT.toast({ title: "Note added", text: title, icon: "note", duration: 2000 }); activate("vocab");
        });
        panels.vocab.onclick = async (e) => { const b = e.target.closest("[data-del]"); if (!b) return; const ok = await PT.confirm("Delete this note?", "This can't be undone.", { ok: "Delete", danger: true }); if (!ok) return; const i = st.notes.findIndex((n) => n.id === b.dataset.del); if (i >= 0) st.notes.splice(i, 1); PT.save(); activate("vocab"); };
      }
      if (key === "tips") {
        panels.tips.innerHTML = `<div class="tip-list">${TIPS.map((t) => `<div class="paper tip-item"><span class="ti">${PT.icon(t.i)}</span><div><b>${t.t}</b><span>${t.s}</span></div></div>`).join("")}</div>`;
      }
    }

    tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) activate(b.dataset.tab); });
    document.addEventListener("click", (e) => { const b = e.target.closest("[data-bm]"); if (!b) return; const on = PT.toggleBookmark(b.dataset.bm); b.classList.toggle("on", on); b.querySelector("span:last-child").textContent = on ? "Saved" : "Save"; renderTabs(location.hash.slice(1) || "bookmarks"); });
    const initial = location.hash.slice(1);
    activate(panels[initial] ? initial : "bookmarks");
    PT.$("#libSummary").innerHTML = `${st.bookmarks.length} bookmarks · ${counts().incorrect} to revisit · ${st.notes.length} notes`;
  });
})();
