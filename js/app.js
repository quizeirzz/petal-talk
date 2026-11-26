/* ==========================================================================
   PetalTalk — app.js
   Core namespace: categories, icons, Mimo mascot, utilities, toasts,
   modals, sound, loader, decorative sky. Loaded first on every page.
   ========================================================================== */
(function () {
  "use strict";

  const PT = (window.PT = window.PT || {});
  PT.VERSION = "1.0.0";
  PT.NAME = "PetalTalk";
  PT.TAGLINE = "Grow your English, one little lesson at a time.";

  /* ---------------------------------------------------------------------
     Categories
     --------------------------------------------------------------------- */
  PT.CATEGORIES = [
    { slug: "grammar", label: "Grammar", icon: "pencil", color: "#E5F2FC", desc: "Core rules that hold sentences together.", tips: ["Find the subject first, then check the verb.", "Read your sentence aloud; mistakes often sound wrong.", "Modal verbs are always followed by a base verb."] },
    { slug: "vocabulary", label: "Vocabulary", icon: "book", color: "#E8ECFB", desc: "Learn new words and their shades of meaning.", tips: ["Learn words in phrases, not alone.", "Guess meaning from context before checking.", "Review new words the next day to keep them."] },
    { slug: "sentence", label: "Sentence Construction", icon: "blocks", color: "#E4F5EC", desc: "Build clear, well-ordered sentences.", tips: ["Subject, verb, object: the English backbone.", "A complete sentence needs a subject and a finite verb.", "Keep modifiers next to the words they describe."] },
    { slug: "tenses", label: "Verb Tenses", icon: "clock", color: "#FBEAED", desc: "Past, present, future and everything between.", tips: ["Look for time words: yesterday, since, by the time.", "Present perfect links the past to now.", "Past perfect = the earlier of two past actions."] },
    { slug: "punctuation", label: "Punctuation", icon: "comma", color: "#FFF4E0", desc: "Commas, apostrophes, colons and more.", tips: ["Two full sentences need more than a comma.", "It's = it is; its = belonging to it.", "Extra information gets a comma on both sides."] },
    { slug: "spelling", label: "Spelling", icon: "abc", color: "#E5F2FC", desc: "Tricky words, silent letters and doubled consonants.", tips: ["Break long words into syllables.", "I before E, except after C (usually!).", "Write the word three times to lock it in."] },
    { slug: "reading", label: "Reading Comprehension", icon: "glasses", color: "#E8ECFB", desc: "Short passages with questions about meaning.", tips: ["Read the question before the passage.", "Look for signal words: because, however, so.", "Infer means: what does the text suggest, not state?"] },
    { slug: "pos", label: "Parts of Speech", icon: "puzzle", color: "#E4F5EC", desc: "Nouns, verbs, adjectives, adverbs and friends.", tips: ["Ask what job the word does in this sentence.", "The same word can be different parts of speech.", "Adverbs often (not always) end in -ly."] },
    { slug: "prepositions", label: "Prepositions", icon: "box", color: "#FBEAED", desc: "In, on, at and other little words of place and time.", tips: ["At a time, on a day, in a month or year.", "Learn verb + preposition pairs as one unit.", "Movement into a space: into, through, across."] },
    { slug: "articles", label: "Articles", icon: "tag", color: "#FFF4E0", desc: "When to use a, an, the, or nothing at all.", tips: ["A/an depends on sound, not spelling.", "Use the when both of you know which one.", "No article for languages, meals and most countries."] },
    { slug: "pronouns", label: "Pronouns", icon: "people", color: "#E5F2FC", desc: "He, she, they, whom, whose and reflexives.", tips: ["Subject does the action; object receives it.", "After a preposition, use the object form.", "Reflexives (myself) need the same person as subject."] },
    { slug: "sva", label: "Subject-Verb Agreement", icon: "scale", color: "#E8ECFB", desc: "Make subjects and verbs match in number.", tips: ["Ignore phrases between subject and verb.", "Each, every, everyone are singular.", "With neither/nor, agree with the nearer subject."] },
    { slug: "synonyms", label: "Synonyms and Antonyms", icon: "swap", color: "#E4F5EC", desc: "Words that mean the same, words that oppose.", tips: ["Group words by feeling: positive or negative?", "Antonym questions hide synonyms as distractors.", "Prefixes like un-, in-, dis- flip meanings."] },
    { slug: "idioms", label: "Idioms and Expressions", icon: "bubble", color: "#FBEAED", desc: "Colorful phrases that don't mean what they say.", tips: ["Idioms are not literal; picture the image anyway.", "Learn the whole phrase, word for word.", "Notice idioms in songs and films."] },
    { slug: "voice", label: "Active and Passive Voice", icon: "cycle", color: "#FFF4E0", desc: "Who does the action, and who receives it.", tips: ["Passive = be + past participle.", "Keep the tense when switching voice.", "The object of the active becomes the new subject."] },
    { slug: "speech", label: "Direct and Indirect Speech", icon: "quote", color: "#E5F2FC", desc: "Report what people said, correctly.", tips: ["Shift tenses one step back after said.", "Now becomes then; here becomes there.", "Questions lose their question word order."] },
    { slug: "modals", label: "Modal Verbs", icon: "key", color: "#E8ECFB", desc: "Can, could, must, might, should and more.", tips: ["Modals never take -s or to.", "Must have + participle = confident guess about the past.", "Should have = regret or criticism."] },
    { slug: "conjunctions", label: "Conjunctions", icon: "link", color: "#E4F5EC", desc: "Join ideas smoothly with the right connector.", tips: ["Although shows contrast; because shows reason.", "Neither pairs with nor; either with or.", "However needs a semicolon or a new sentence."] },
    { slug: "adjadv", label: "Adjectives and Adverbs", icon: "palette", color: "#FBEAED", desc: "Describing words and how to compare them.", tips: ["Adjectives describe nouns; adverbs describe verbs.", "After feel, look, smell, use an adjective.", "Two things: -er / more. Three or more: -est / most."] },
    { slug: "advanced", label: "Advanced English", icon: "crown", color: "#FFF4E0", desc: "Collocations, register, phrasal verbs and nuance.", tips: ["Formal English prefers single verbs to phrasal verbs.", "Collocations are habits: make a decision, do homework.", "Notice register: who is speaking, and to whom?"] }
  ];
  PT.catBySlug = (s) => PT.CATEGORIES.find((c) => c.slug === s);
  PT.catByLabel = (l) => PT.CATEGORIES.find((c) => c.label === l);
  PT.DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];

  /* ---------------------------------------------------------------------
     Small utilities
     --------------------------------------------------------------------- */
  PT.$ = (sel, root) => (root || document).querySelector(sel);
  PT.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  PT.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  PT.pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  PT.clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  PT.pad2 = (n) => String(n).padStart(2, "0");
  PT.todayKey = (d) => {
    const x = d || new Date();
    return `${x.getFullYear()}-${PT.pad2(x.getMonth() + 1)}-${PT.pad2(x.getDate())}`;
  };
  PT.addDays = (key, n) => {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(y, m - 1, d + n);
    return PT.todayKey(dt);
  };
  PT.fmtTime = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${PT.pad2(r)}s`;
    return `${r}s`;
  };
  PT.fmtClock = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${PT.pad2(Math.floor(s / 60))}:${PT.pad2(s % 60)}`;
  };
  PT.fmtDate = (key) => {
    if (!key) return "—";
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };
  PT.fmtDateTime = (ts) => new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  PT.param = (name) => new URLSearchParams(location.search).get(name);
  PT.html = (strings, ...vals) => strings.reduce((acc, s, i) => acc + s + (i < vals.length ? vals[i] : ""), "");
  PT.diffClass = (d) => "tag--" + String(d || "").toLowerCase();
  PT.questionTypeLabel = (t) => ({ fill: "Fill in the blank", correction: "Sentence correction", mcq: "Multiple choice" }[t] || "Multiple choice");

  // Renders question text: handles blanks, passages, quotes.
  PT.renderQuestion = (q) => {
    let t = PT.esc(q.question);
    const m = t.match(/^Read the passage: &quot;(.+?)&quot;\s*(.*)$/);
    if (m) {
      return `<span class="passage">${m[1]}</span>${m[2]}`;
    }
    t = t.replace(/___/g, '<span class="blank" aria-label="blank"></span>');
    return t;
  };

  /* ---------------------------------------------------------------------
     Icons (inline SVG, currentColor)
     --------------------------------------------------------------------- */
  const I = {
    pencil: '<path d="M4 20l4-1 10-10-3-3L5 16l-1 4z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="#6FA6D4" stroke-width="1.6"/><path d="M4 20l4-1-3-3-1 4z" fill="#C7D2F5"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.6"/><path d="M8 7h7M8 10h5" stroke="#B8D9F2" stroke-width="1.6" stroke-linecap="round"/>',
    blocks: '<rect x="3" y="13" width="8" height="8" rx="1.5" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="#91CDAE" stroke="#6FA6D4" stroke-width="1.6"/><rect x="8" y="3" width="8" height="8" rx="1.5" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.6"/>',
    clock: '<circle cx="12" cy="12" r="8.5" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><path d="M12 7v5l3 2" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.2" fill="#EBA7B1"/>',
    comma: '<path d="M9 14a4 4 0 1 1 4-4c0 4-2 7-5 9" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linecap="round"/><circle cx="18" cy="8" r="2" fill="#F2D48A" stroke="#6FA6D4" stroke-width="1.4"/><circle cx="18" cy="15" r="2" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.4"/>',
    abc: '<rect x="3" y="6" width="18" height="12" rx="3" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><text x="12" y="15.3" font-size="8" font-weight="700" text-anchor="middle" fill="#6FA6D4" font-family="Arial">abc</text><path d="M7 19.5h10" stroke="#EBA7B1" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="2 2"/>',
    glasses: '<path d="M3 15a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm10 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><path d="M11 14h2M3 14L5 7h3M21 14l-2-7h-3" stroke="#6FA6D4" stroke-width="1.6" stroke-linecap="round"/>',
    puzzle: '<path d="M8 4h5v3a2 2 0 1 0 4 0V4h3v5h-3a2 2 0 1 0 0 4h3v5h-5v-3a2 2 0 1 0-4 0v3H4v-5h3a2 2 0 1 0 0-4H4V4h4z" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.5" stroke-linejoin="round"/>',
    box: '<path d="M4 9l8-4 8 4-8 4-8-4z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9v7l8 4 8-4V9" fill="none" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 13v7" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="12" cy="4" r="2" fill="#EBA7B1"/>',
    tag: '<path d="M3 4h8l10 10-7 7L4 11V4z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.6" fill="#8ABDE3"/><text x="13" y="16" font-size="6.5" font-weight="700" fill="#6FA6D4" font-family="Georgia" transform="rotate(45 13 16)">the</text>',
    people: '<circle cx="9" cy="8" r="3.2" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="16.5" cy="9.5" r="2.6" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.6"/><path d="M3 19a6 6 0 0 1 12 0" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><path d="M14.5 19a4.5 4.5 0 0 1 7 0" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.6"/>',
    scale: '<path d="M12 4v15M5 19h14M12 6l-6 2 6-2 6 2" stroke="#6FA6D4" stroke-width="1.6" stroke-linecap="round"/><path d="M3 13a3 3 0 0 0 6 0L6 8l-3 5z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 13a3 3 0 0 0 6 0l-3-5-3 5z" fill="#91CDAE" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="4" cy="16" r="2" fill="#EBA7B1"/><circle cx="20" cy="8" r="2" fill="#91CDAE"/>',
    bubble: '<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-5 4v-4H7a3 3 0 0 1-3-3V6z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 8.3 11 8z" fill="#F2D48A"/>',
    cycle: '<path d="M6 10a6 6 0 0 1 11-2M18 14a6 6 0 0 1-11 2" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round"/><path d="M17 4v4h-4M7 20v-4h4" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.8" fill="#EBA7B1"/>',
    quote: '<path d="M5 15h4V9H6a3 3 0 0 1 3-3V4a5 5 0 0 0-5 5v6zm9 0h4V9h-3a3 3 0 0 1 3-3V4a5 5 0 0 0-5 5v6z" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.5" stroke-linejoin="round"/><path d="M5 19h14" stroke="#B8D9F2" stroke-width="1.6" stroke-linecap="round"/>',
    key: '<circle cx="8" cy="12" r="4.5" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="8" cy="12" r="1.3" fill="#8ABDE3"/><path d="M12.5 12H21v3h-2v-1.5h-2V15h-2v-1.5" fill="#F2D48A" stroke="#6FA6D4" stroke-width="1.5" stroke-linejoin="round"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="#91CDAE" stroke-width="1.8" stroke-linecap="round"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h1.5A3.5 3.5 0 0 0 20 13.5 9.5 9.5 0 0 0 12 3z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="8" cy="10" r="1.5" fill="#8ABDE3"/><circle cx="12" cy="7.5" r="1.5" fill="#EBA7B1"/><circle cx="16" cy="10" r="1.5" fill="#F2D48A"/><circle cx="7.5" cy="14.5" r="1.5" fill="#91CDAE"/>',
    crown: '<path d="M4 17l-1-9 5 4 4-6 4 6 5-4-1 9H4z" fill="#F2D48A" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 20h16" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="13" r="1.4" fill="#8ABDE3"/>',
    // UI icons
    flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-9z" fill="#F2D48A" stroke="#E7B86E" stroke-width="1.4" stroke-linejoin="round"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    cross: '<path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z" fill="#F2D48A" stroke="#E7B86E" stroke-width="1.2" stroke-linejoin="round"/>',
    sparkle: '<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#B8D9F2"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" fill="#C7D2F5"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="none" stroke="#C9697A" stroke-width="1.8" stroke-linejoin="round"/>',
    lightbulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.5 1 .5 1.6v.5h6v-.5c0-.6 0-1.2.5-1.6A6 6 0 0 0 12 3z" fill="#FFF2CC" stroke="#E7B86E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    timer: '<circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v4l2.5 1.5M10 3h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    target: '<circle cx="12" cy="12" r="8" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="12" cy="12" r="4.5" fill="#E5F2FC" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="12" cy="12" r="1.5" fill="#EBA7B1"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="#6FA6D4" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="15" r="1.5" fill="#91CDAE"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="#F2D48A" stroke="#E7B86E" stroke-width="1.5"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 20h8M9 17h6" stroke="#E7B86E" stroke-width="1.5" stroke-linecap="round"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="4" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="9" cy="9" r="1.5" fill="#8ABDE3"/><circle cx="15" cy="15" r="1.5" fill="#8ABDE3"/><circle cx="15" cy="9" r="1.5" fill="#EBA7B1"/><circle cx="9" cy="15" r="1.5" fill="#EBA7B1"/><circle cx="12" cy="12" r="1.5" fill="#91CDAE"/>',
    shuffle: '<path d="M3 7h3l9 10h6M3 17h3l2.5-2.8M13 9.5L15 7h6" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 4.5L21 7l-2 2.5M19 14.5L21 17l-2 2.5" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    seedling: '<path d="M12 21v-8" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6z" fill="#91CDAE" stroke="#6FA6D4" stroke-width="1.5"/><path d="M12 11c0-3-2-5-6-5 0 3 2 5 6 5z" fill="#B8D9F2" stroke="#6FA6D4" stroke-width="1.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#8ABDE3"/>',
    redo: '<path d="M4 12a8 8 0 1 0 3-6.2" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round"/><path d="M3 4v5h5" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    search: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    download: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    upload: '<path d="M12 15V4m0 0L8 8m4-4l4 4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3M8 7l1 13h6l1-13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    flower: '<circle cx="12" cy="6" r="3" fill="#fff" stroke="#8ABDE3" stroke-width="1.2"/><circle cx="12" cy="18" r="3" fill="#fff" stroke="#8ABDE3" stroke-width="1.2"/><circle cx="6" cy="12" r="3" fill="#fff" stroke="#8ABDE3" stroke-width="1.2"/><circle cx="18" cy="12" r="3" fill="#fff" stroke="#8ABDE3" stroke-width="1.2"/><circle cx="12" cy="12" r="2.6" fill="#8ABDE3"/>',
    bluebell: '<circle cx="12" cy="6.5" r="3" fill="#B8D9F2"/><circle cx="12" cy="17.5" r="3" fill="#B8D9F2"/><circle cx="6.5" cy="12" r="3" fill="#B8D9F2"/><circle cx="17.5" cy="12" r="3" fill="#B8D9F2"/><circle cx="8.2" cy="8.2" r="3" fill="#C7D2F5"/><circle cx="15.8" cy="8.2" r="3" fill="#C7D2F5"/><circle cx="8.2" cy="15.8" r="3" fill="#C7D2F5"/><circle cx="15.8" cy="15.8" r="3" fill="#C7D2F5"/><circle cx="12" cy="12" r="2.8" fill="#fff"/><circle cx="12" cy="12" r="1.4" fill="#F2D48A"/>',
    arrow: '<path d="M5 12h13m0 0l-5-5m5 5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    arrowLeft: '<path d="M19 12H6m0 0l5-5m-5 5l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/>',
    note: '<path d="M6 3h9l4 4v14H6V3z" fill="#fff" stroke="#6FA6D4" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 3v4h4M9 11h6M9 15h4" stroke="#6FA6D4" stroke-width="1.6" stroke-linecap="round"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="#C7D2F5" stroke="#6FA6D4" stroke-width="1.5"/>',
    sun: '<circle cx="12" cy="12" r="4.5" fill="#F2D48A" stroke="#E7B86E" stroke-width="1.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="#E7B86E" stroke-width="1.5" stroke-linecap="round"/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h8" fill="none" stroke="#6FA6D4" stroke-width="1.8" stroke-linecap="round"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 17 18H7z" fill="#fff" stroke="#8ABDE3" stroke-width="1.6" stroke-linejoin="round"/>',
    gear: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  PT.icon = (name, cls) => `<svg class="ico-svg ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[name] || I.sparkle}</svg>`;

  /* ---------------------------------------------------------------------
     Mimo — the cloud mascot (original SVG)
     moods: happy | cheer | think | sad | sleepy | wink | love
     --------------------------------------------------------------------- */
  PT.mimo = function (mood, opts) {
    mood = mood || "happy";
    opts = opts || {};
    const cls = opts.className ? ` ${opts.className}` : "";
    const styleAttr = opts.width ? ` style="width:${opts.width}px"` : "";
    const faces = {
      happy: '<path d="M46 54q3-4 6 0" class="eye"/><path d="M70 54q3-4 6 0" class="eye"/><path d="M57 62q4 4 8 0" class="mouth"/>',
      cheer: '<ellipse cx="49" cy="54" rx="3.2" ry="4" fill="#34475D"/><ellipse cx="73" cy="54" rx="3.2" ry="4" fill="#34475D"/><circle cx="50.2" cy="52.4" r="1.1" fill="#fff"/><circle cx="74.2" cy="52.4" r="1.1" fill="#fff"/><path d="M55 61q6 7 12 0z" fill="#34475D"/><path d="M57.5 63.5q3.5 2.5 7 0z" fill="#EBA7B1"/>',
      think: '<ellipse cx="49" cy="54" rx="3" ry="3.6" fill="#34475D"/><ellipse cx="73" cy="54" rx="3" ry="3.6" fill="#34475D"/><circle cx="50" cy="52.6" r="1" fill="#fff"/><circle cx="74" cy="52.6" r="1" fill="#fff"/><path d="M44 46q5-3 10 0" class="eye"/><path d="M57 64q3-2 7 1" class="mouth"/>',
      sad: '<path d="M45 52q4 3 8 1" class="eye"/><path d="M77 52q-4 3-8 1" class="eye"/><ellipse cx="49" cy="56" rx="2.6" ry="3" fill="#34475D"/><ellipse cx="73" cy="56" rx="2.6" ry="3" fill="#34475D"/><path d="M57 66q4-4 8 0" class="mouth"/><path d="M40 60q-1 4 1 5 2-1 1-5z" fill="#B8D9F2"/>',
      sleepy: '<path d="M45 55q4 2 8 0" class="eye"/><path d="M69 55q4 2 8 0" class="eye"/><ellipse cx="61" cy="63" rx="2.4" ry="2.8" fill="#34475D"/><text x="86" y="40" font-size="11" fill="#8ABDE3" font-family="Georgia" font-style="italic">z</text><text x="92" y="32" font-size="8" fill="#B8D9F2" font-family="Georgia" font-style="italic">z</text>',
      wink: '<ellipse cx="49" cy="54" rx="3.2" ry="4" fill="#34475D"/><circle cx="50.2" cy="52.4" r="1.1" fill="#fff"/><path d="M70 54q3-4 6 0" class="eye"/><path d="M56 61q5 5 10 0" class="mouth"/>',
      love: '<path d="M49 58l-4.5-4.6a3 3 0 0 1 4.5-4 3 3 0 0 1 4.5 4z" fill="#EBA7B1"/><path d="M73 58l-4.5-4.6a3 3 0 0 1 4.5-4 3 3 0 0 1 4.5 4z" fill="#EBA7B1"/><path d="M56 63q5 5 10 0" class="mouth"/>'
    };
    const face = faces[mood] || faces.happy;
    return `<span class="mimo mimo--${mood}${cls}"${styleAttr}><svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mimo the cloud">
      <defs><style>.eye{fill:none;stroke:#34475D;stroke-width:2.6;stroke-linecap:round}.mouth{fill:none;stroke:#34475D;stroke-width:2.2;stroke-linecap:round}</style></defs>
      <ellipse cx="60" cy="90" rx="34" ry="5" fill="#B8D9F2" opacity=".35"/>
      <g>
        <path d="M30 76 C14 76 12 56 26 52 C22 36 40 28 50 36 C54 22 76 20 82 36 C96 30 108 44 100 56 C112 60 108 78 92 78 Z" fill="#FFFFFF" stroke="#CFE3F5" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M34 72 C24 72 24 60 32 58" fill="none" stroke="#E5F2FC" stroke-width="3" stroke-linecap="round"/>
        <path d="M86 42 C92 42 96 48 94 54" fill="none" stroke="#E5F2FC" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="41" cy="61" rx="5" ry="3" fill="#F7C8D0" opacity=".8"/>
        <ellipse cx="81" cy="61" rx="5" ry="3" fill="#F7C8D0" opacity=".8"/>
        ${face}
        <g transform="translate(92 30) rotate(12)">
          <path d="M0 0 L-12 -7 L-10 7 Z" fill="#8ABDE3"/>
          <path d="M0 0 L12 -7 L10 7 Z" fill="#8ABDE3"/>
          <path d="M-11 -5 L-7 0 L-11 5" fill="none" stroke="#6FA6D4" stroke-width="1" opacity=".6"/>
          <path d="M11 -5 L7 0 L11 5" fill="none" stroke="#6FA6D4" stroke-width="1" opacity=".6"/>
          <circle cx="0" cy="0" r="3" fill="#6FA6D4"/>
          <path d="M-2 3 L-5 12 M2 3 L5 12" stroke="#8ABDE3" stroke-width="2.4" stroke-linecap="round"/>
        </g>
      </g>
    </svg></span>`;
  };

  // Decorative flower (small SVG) used in several places
  PT.flower = (color, center, size) => `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" aria-hidden="true"><circle cx="12" cy="6" r="3.4" fill="${color || "#fff"}" stroke="#B8D9F2" stroke-width="1"/><circle cx="12" cy="18" r="3.4" fill="${color || "#fff"}" stroke="#B8D9F2" stroke-width="1"/><circle cx="6" cy="12" r="3.4" fill="${color || "#fff"}" stroke="#B8D9F2" stroke-width="1"/><circle cx="18" cy="12" r="3.4" fill="${color || "#fff"}" stroke="#B8D9F2" stroke-width="1"/><circle cx="12" cy="12" r="2.8" fill="${center || "#8ABDE3"}"/></svg>`;

  // Mimo encouragement lines
  PT.MIMO_LINES = {
    correct: ["Yay! That's exactly right.", "Beautifully done!", "You're blooming today!", "Perfect! Keep that rhythm.", "Mimo is so proud of you.", "Lovely! On to the next one.", "That's the one! Well spotted.", "Sparkly! You knew it."],
    wrong: ["Oops, not quite — but now you know!", "Mistakes are how petals grow.", "Close! Read the note and keep going.", "That one was tricky. Onward!", "No worries, Mimo believes in you.", "A little stumble, a big lesson.", "Hmm, let's remember this one together."],
    start: ["Let's make English bloom!", "Take a deep breath. You've got this.", "A little practice goes a long way.", "Ready when you are!", "One question at a time."],
    empty: ["Nothing here yet — let's plant something!", "This page is waiting for your first lesson.", "Quiet so far. Shall we practice?"]
  };
  PT.line = (kind) => { const a = PT.MIMO_LINES[kind] || PT.MIMO_LINES.start; return a[Math.floor(Math.random() * a.length)]; };

  /* ---------------------------------------------------------------------
     Sound (Web Audio, tiny synth; off by default)
     --------------------------------------------------------------------- */
  let audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  function tone(freq, start, dur, type, gain) {
    const c = ctx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, c.currentTime + start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  PT.sound = function (name) {
    if (!PT.settings || !PT.settings().sound) return;
    switch (name) {
      case "correct": tone(660, 0, 0.14, "sine"); tone(880, 0.12, 0.22, "sine"); break;
      case "wrong": tone(300, 0, 0.18, "triangle", 0.09); tone(240, 0.14, 0.26, "triangle", 0.08); break;
      case "click": tone(520, 0, 0.06, "sine", 0.05); break;
      case "achievement": [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, "sine", 0.1)); break;
      case "finish": [523, 587, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.35, "triangle", 0.09)); break;
      default: tone(440, 0, 0.1);
    }
  };

  /* ---------------------------------------------------------------------
     Toasts
     --------------------------------------------------------------------- */
  function stack() {
    let s = PT.$(".toast-stack");
    if (!s) { s = document.createElement("div"); s.className = "toast-stack"; s.setAttribute("aria-live", "polite"); document.body.appendChild(s); }
    return s;
  }
  PT.toast = function (opts) {
    opts = typeof opts === "string" ? { title: opts } : opts || {};
    const t = document.createElement("div");
    t.className = `toast ${opts.type ? "toast--" + opts.type : ""}`;
    const icon = opts.mimo ? PT.mimo(opts.mimo, { width: 34 }) : PT.icon(opts.icon || "sparkle");
    t.innerHTML = `<div class="t-ico">${icon}</div><div><b>${PT.esc(opts.title || "")}</b>${opts.text ? `<span>${PT.esc(opts.text)}</span>` : ""}</div><button class="t-close" aria-label="Dismiss">×</button>`;
    stack().appendChild(t);
    const remove = () => { t.style.opacity = "0"; t.style.transform = "translateY(6px)"; setTimeout(() => t.remove(), 250); };
    t.querySelector(".t-close").addEventListener("click", remove);
    setTimeout(remove, opts.duration || 4200);
    return t;
  };

  /* ---------------------------------------------------------------------
     Modal / confirm / prompt (no browser alerts)
     --------------------------------------------------------------------- */
  PT.modal = function (opts) {
    return new Promise((resolve) => {
      const prev = PT.$(".modal-backdrop"); if (prev) prev.remove();
      const back = document.createElement("div");
      back.className = "modal-backdrop";
      back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true");
      const buttons = (opts.buttons || [{ label: "OK", value: true, primary: true }])
        .map((b, i) => `<button class="btn ${b.primary ? "btn--primary" : b.danger ? "btn--danger" : "btn--secondary"}" data-i="${i}">${PT.esc(b.label)}</button>`).join("");
      back.innerHTML = `<div class="modal">${PT.mimo(opts.mood || "think", { className: "modal-mimo" })}<h3>${PT.esc(opts.title || "")}</h3>${opts.text ? `<p>${PT.esc(opts.text)}</p>` : ""}${opts.input ? `<input type="text" placeholder="${PT.esc(opts.input.placeholder || "")}" value="${PT.esc(opts.input.value || "")}" aria-label="${PT.esc(opts.input.placeholder || "Input")}">` : ""}<div class="modal-actions">${buttons}</div></div>`;
      document.body.appendChild(back);
      requestAnimationFrame(() => back.classList.add("open"));
      const close = (val) => { back.classList.remove("open"); setTimeout(() => back.remove(), 250); document.removeEventListener("keydown", onKey); resolve(val); };
      const onKey = (e) => { if (e.key === "Escape") close(opts.escapeValue !== undefined ? opts.escapeValue : false); };
      document.addEventListener("keydown", onKey);
      back.addEventListener("click", (e) => { if (e.target === back && !opts.locked) close(opts.escapeValue !== undefined ? opts.escapeValue : false); });
      PT.$$("button[data-i]", back).forEach((b) => b.addEventListener("click", () => {
        const def = (opts.buttons || [{ value: true }])[+b.dataset.i];
        if (opts.input) { const v = back.querySelector("input").value; close(def.value ? v : null); } else close(def.value);
      }));
      const inp = back.querySelector("input"); if (inp) setTimeout(() => inp.focus(), 60);
      else setTimeout(() => { const f = back.querySelector(".btn--primary") || back.querySelector("button"); f && f.focus(); }, 60);
    });
  };
  PT.confirm = (title, text, opts) => PT.modal(Object.assign({ title, text, mood: "think", buttons: [{ label: (opts && opts.cancel) || "Cancel", value: false }, { label: (opts && opts.ok) || "Yes, continue", value: true, primary: !(opts && opts.danger), danger: !!(opts && opts.danger) }] }, opts || {}));
  PT.alert = (title, text, mood) => PT.modal({ title, text, mood: mood || "happy", buttons: [{ label: "Okay", value: true, primary: true }] });

  /* ---------------------------------------------------------------------
     Loader + decorative sky + petals burst
     --------------------------------------------------------------------- */
  PT.showLoader = function (text) {
    let l = PT.$(".loader");
    if (!l) { l = document.createElement("div"); l.className = "loader"; document.body.appendChild(l); }
    l.innerHTML = `<div class="center">${PT.mimo("happy")}<p>${PT.esc(text || "Watering the garden…")}</p><div class="dots"><span></span><span></span><span></span></div></div>`;
    l.classList.remove("hide");
    return l;
  };
  PT.hideLoader = function () { const l = PT.$(".loader"); if (l) { l.classList.add("hide"); setTimeout(() => l.remove(), 450); } };

  PT.sky = function () {
    if (PT.$(".sky")) return;
    const s = document.createElement("div"); s.className = "sky"; s.setAttribute("aria-hidden", "true");
    const cloud = (c) => `<svg class="cloud cloud--${c}" viewBox="0 0 120 60"><path d="M30 55C12 55 8 35 24 30 20 14 40 6 52 16 58 2 84 2 88 20 104 14 118 30 108 42 120 46 114 56 100 56Z" fill="#fff" stroke="#DFEAF4" stroke-width="2"/></svg>`;
    const petal = (p) => `<svg class="petal petal--${p}" viewBox="0 0 20 20"><path d="M10 1C4 6 4 14 10 19c6-5 6-13 0-18z" fill="#C7D2F5" opacity=".8"/></svg>`;
    s.innerHTML = cloud(1) + cloud(2) + cloud(3) + petal(1) + petal(2) + petal(3);
    document.body.prepend(s);
  };

  PT.petalBurst = function (n) {
    if (document.body.classList.contains("no-animations")) return;
    const b = document.createElement("div"); b.className = "petal-burst"; b.setAttribute("aria-hidden", "true");
    const colors = ["#B8D9F2", "#C7D2F5", "#fff", "#EBA7B1", "#F2D48A", "#91CDAE"];
    for (let i = 0; i < (n || 40); i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 1.2 + "s";
      p.style.animationDuration = 2.5 + Math.random() * 2 + "s";
      p.style.transform = `scale(${0.7 + Math.random()})`;
      b.appendChild(p);
    }
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 6000);
  };

  /* ---------------------------------------------------------------------
     Question bank access
     --------------------------------------------------------------------- */
  PT.questions = () => window.PETAL_QUESTIONS || [];
  PT.qById = (() => { let map = null; return (id) => { if (!map) { map = {}; PT.questions().forEach((q) => (map[q.id] = q)); } return map[id]; }; })();
  PT.catQuestions = (label) => PT.questions().filter((q) => q.category === label);

  /* ---------------------------------------------------------------------
     Boot: apply settings, sky, page init hooks
     --------------------------------------------------------------------- */
  PT.pageInits = [];
  PT.onPage = (page, fn) => PT.pageInits.push({ page, fn });
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page || "";
    try {
      const s = PT.settings ? PT.settings() : {};
      if (s.animations === false) document.body.classList.add("no-animations");
      PT.sky();
      if (PT.renderNav) PT.renderNav(page);
      PT.pageInits.filter((p) => p.page === page || p.page === "*").forEach((p) => { try { p.fn(); } catch (e) { console.error("PetalTalk page init failed:", e); } });
    } catch (e) {
      console.error("PetalTalk boot failed:", e);
    }
  });
})();
