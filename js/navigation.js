/* ==========================================================================
   PetalTalk — navigation.js
   Header, mobile navigation, footer, active link, shared skip link.
   ========================================================================== */
(function () {
  "use strict";
  const PT = window.PT;

  PT.NAV = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "practice.html", label: "Practice", page: "practice" },
    { href: "categories.html", label: "Categories", page: "categories" },
    { href: "progress.html", label: "Progress", page: "progress" },
    { href: "achievements.html", label: "Achievements", page: "achievements" },
    { href: "library.html", label: "Library", page: "library" },
    { href: "settings.html", label: "Settings", page: "settings" }
  ];

  PT.logo = () => `<svg viewBox="0 0 60 50" aria-hidden="true"><path d="M14 40C5 40 4 29 12 27 10 18 20 14 25 19 27 11 40 10 43 19 51 16 57 24 53 30 59 33 56 41 48 41Z" fill="#fff" stroke="#B8D9F2" stroke-width="2"/><path d="M22 29q2-3 4 0M34 29q2-3 4 0" fill="none" stroke="#34475D" stroke-width="1.8" stroke-linecap="round"/><path d="M28 33q2 2 4 0" fill="none" stroke="#34475D" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="20" cy="33" rx="2.5" ry="1.5" fill="#F7C8D0"/><ellipse cx="40" cy="33" rx="2.5" ry="1.5" fill="#F7C8D0"/><g transform="translate(47 17) rotate(14)"><path d="M0 0L-6-4-5 4zM0 0L6-4 5 4z" fill="#8ABDE3"/><circle r="1.8" fill="#6FA6D4"/></g></svg>`;

  PT.renderNav = function (page) {
    const header = PT.$("#siteHeader");
    if (header) {
      const streak = PT.currentStreak ? PT.currentStreak() : 0;
      header.innerHTML = `<div class="wrap">
        <a class="brand" href="index.html" aria-label="PetalTalk home">${PT.logo()}<span class="brand-name">Petal<b>Talk</b></span></a>
        <nav class="nav" id="mainNav" aria-label="Main">${PT.NAV.map((n) => `<a href="${n.href}" ${n.page === page ? 'class="active" aria-current="page"' : ""}>${n.label}</a>`).join("")}</nav>
        <div class="header-tools">
          <a class="streak-chip" href="progress.html" title="Current practice streak">${PT.icon("flame")}<span>${streak}</span><span class="visually-hidden">day streak</span></a>
          <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mainNav" aria-label="Open menu"><span></span><span></span><span></span></button>
        </div></div>`;
      const t = PT.$("#navToggle"), nav = PT.$("#mainNav");
      t.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        t.setAttribute("aria-expanded", String(open));
        t.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      document.addEventListener("click", (e) => { if (!header.contains(e.target) && nav.classList.contains("open")) { nav.classList.remove("open"); t.setAttribute("aria-expanded", "false"); } });
    }
    const footer = PT.$("#siteFooter");
    if (footer) {
      footer.innerHTML = `<div class="wrap">
        <div><a class="brand" href="index.html">${PT.logo()}<span class="brand-name">Petal<b>Talk</b></span></a><p class="foot-note mt-1">${PT.esc(PT.TAGLINE)} Everything you do here stays in this browser — no accounts, no servers.</p></div>
        <nav aria-label="Footer">${PT.NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}</nav>
        <div class="foot-flowers" aria-hidden="true">${PT.flower("#fff")}${PT.flower("#C7D2F5", "#fff")}${PT.flower("#B8D9F2", "#F2D48A")}</div>
      </div>`;
    }
  };
  PT.refreshStreakChip = () => { const c = PT.$(".streak-chip span"); if (c && PT.currentStreak) c.textContent = PT.currentStreak(); };
})();
