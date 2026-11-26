/* ==========================================================================
   PetalTalk — settings.js
   Preferences, quiz defaults, data export / import / reset, about.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  PT.onPage("settings", function () {
    const s = PT.settings();
    const sw = (key, label, sub) => `<label class="setting-row"><div><b>${label}</b><span>${sub}</span></div><span class="switch"><input type="checkbox" data-set="${key}" ${s[key] ? "checked" : ""}><span class="track"></span></span></label>`;
    const sel = (key, label, sub, opts) => `<div class="setting-row"><div><b>${label}</b><span>${sub}</span></div><select data-set="${key}" aria-label="${label}">${opts.map(([v, l]) => `<option value="${v}" ${String(s[key]) === String(v) ? "selected" : ""}>${l}</option>`).join("")}</select></div>`;

    PT.$("#prefGroup").innerHTML = `
      <div class="setting-row"><div><b>Your name</b><span>Mimo will use it to say hello.</span></div><input type="text" data-set="name" maxlength="24" placeholder="Optional" value="${PT.esc(s.name || "")}" aria-label="Your name"></div>
      ${sw("sound", "Sound effects", "Soft chimes for correct and incorrect answers. Off by default.")}
      ${sw("animations", "Animations", "Floating clouds, petals and small celebrations. Reduced-motion preferences are always respected.")}`;
    PT.$("#quizGroup").innerHTML = `
      ${sel("defaultCount", "Default question count", "Preselected when you open the practice page.", [[5, "5"], [10, "10"], [15, "15"], [20, "20"], [30, "30"], [50, "50"]])}
      ${sel("defaultDifficulty", "Default difficulty", "Mixed draws from every level.", [["Mixed", "Mixed"], ["Easy", "Easy"], ["Medium", "Medium"], ["Hard", "Hard"], ["Expert", "Expert"]])}
      ${sw("timer", "Timer on by default", "A countdown for each question.")}
      ${sel("timerSeconds", "Seconds per question", "Only used when the timer is on.", [[20, "20 s"], [30, "30 s"], [45, "45 s"], [60, "60 s"], [90, "90 s"]])}
      ${sel("explain", "Explanations", "Immediately after each answer, or all together at the end.", [["immediate", "Show immediately"], ["end", "Show at the end"]])}
      ${sw("shuffleQuestions", "Shuffle questions", "Fisher–Yates shuffle of the selected questions.")}
      ${sw("shuffleAnswers", "Shuffle answers", "Correct answers move between A–D.")}`;

    PT.$$("[data-set]").forEach((el) => {
      const ev = el.tagName === "INPUT" && el.type === "text" ? "input" : "change";
      el.addEventListener(ev, () => {
        let v = el.type === "checkbox" ? el.checked : el.value;
        if (["defaultCount", "timerSeconds"].includes(el.dataset.set)) v = parseInt(v, 10);
        PT.setSetting(el.dataset.set, v);
        if (el.dataset.set === "animations") document.body.classList.toggle("no-animations", !v);
        if (el.dataset.set === "sound" && v) PT.sound("click");
        if (ev === "change") PT.toast({ title: "Saved", icon: "check", duration: 1400 });
      });
    });

    // Data
    const sum = PT.summaryForDisplay();
    PT.$("#dataSummary").innerHTML = `<dl class="kv"><dt>Quizzes</dt><dd>${sum.quizzes}</dd><dt>Questions answered</dt><dd>${sum.answered}</dd><dt>Bookmarks</dt><dd>${sum.bookmarks}</dd><dt>Achievements</dt><dd>${sum.achievements}</dd><dt>Notes</dt><dd>${sum.notes}</dd><dt>Journal started</dt><dd>${PT.fmtDate(PT.todayKey(new Date(sum.since)))}</dd></dl>`;
    PT.$("#exportBtn").addEventListener("click", () => { PT.exportJSON(); PT.toast({ title: "Progress exported", text: "A JSON file has been downloaded.", icon: "download" }); });

    const fileInput = PT.$("#importFile");
    const drop = PT.$("#fileDrop");
    async function handleFile(file) {
      if (!file) return;
      let text;
      try { text = await file.text(); } catch (e) { PT.alert("Couldn't read the file", "Please try again with a PetalTalk JSON export.", "sad"); return; }
      let parsed; try { parsed = JSON.parse(text); } catch (e) { PT.alert("That isn't valid JSON", "The file could not be parsed. Make sure it is an unmodified PetalTalk export.", "sad"); return; }
      const errors = PT.validateImport(parsed);
      if (errors.length) { PT.alert("This file can't be imported", errors.join(" "), "sad"); return; }
      const q = (parsed.stats && parsed.stats.answered) || 0;
      const ok = await PT.confirm("Replace your current progress?", `The file contains ${q} answered questions and ${(parsed.bookmarks || []).length} bookmarks. Importing will overwrite everything stored in this browser.`, { ok: "Import and replace", danger: true });
      if (!ok) return;
      const r = PT.importJSON(text);
      if (r.ok) { PT.toast({ title: "Progress imported", text: "Welcome back to your garden.", mimo: "cheer" }); setTimeout(() => location.reload(), 900); }
      else PT.alert("Import failed", r.errors.join(" "), "sad");
    }
    fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.style.borderColor = "var(--primary)"; }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.style.borderColor = ""; }));
    drop.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));

    PT.$("#resetBtn").addEventListener("click", async () => {
      const first = await PT.confirm("Reset all progress?", "Statistics, streaks, achievements, bookmarks, notes and settings will be deleted from this browser. Consider exporting first.", { ok: "Continue", danger: true });
      if (!first) return;
      const typed = await PT.modal({ title: "Type RESET to confirm", text: "This cannot be undone.", mood: "sad", input: { placeholder: "RESET" }, buttons: [{ label: "Cancel", value: false }, { label: "Delete everything", value: true, danger: true }] });
      if (typed === null || typed === false) return;
      if (String(typed).trim().toUpperCase() !== "RESET") { PT.toast({ title: "Not reset", text: "The confirmation word didn't match.", icon: "info" }); return; }
      PT.resetAll();
      PT.toast({ title: "Fresh soil", text: "All progress has been cleared.", mimo: "happy" });
      setTimeout(() => location.reload(), 900);
    });

    PT.$("#aboutInfo").innerHTML = `<dl class="kv"><dt>Version</dt><dd>${PT.VERSION}</dd><dt>Question bank</dt><dd>${PT.questions().length.toLocaleString()} questions · ${PT.CATEGORIES.length} categories</dd><dt>Storage</dt><dd>This browser only (localStorage)</dd><dt>Network</dt><dd>None. Nothing is sent anywhere.</dd></dl>`;

    // Side nav highlight
    const links = PT.$$(".settings-nav a");
    const groups = links.map((a) => PT.$(a.getAttribute("href")));
    const onScroll = () => { let cur = 0; groups.forEach((g, i) => { if (g && g.getBoundingClientRect().top < 140) cur = i; }); links.forEach((a, i) => a.classList.toggle("active", i === cur)); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  });
})();
