const ROUTES = {
  home: () => import("./pages/home.js").then((m) => m.mountHome),
  league: () => import("./pages/league.js").then((m) => m.mountLeague),
  team: () => import("./pages/team.js").then((m) => m.mountTeam),
  match: () => import("./pages/match.js").then((m) => m.mountMatch),
  players: () => import("./pages/players.js").then((m) => m.mountPlayers),
  about: () => import("./pages/about.js").then((m) => m.mountAbout),
};

function shell() {
  return `
<div class="app-shell">
  <header class="navbar">
    <div class="container navbar__inner">
      <a class="navbar__logo" data-nav="home">
        <img src="/b-score/bscore.png" class="navbar__logo-img" alt="B-Score" />
        B<span>·</span>SCORE
      </a>
      <nav class="navbar__nav">
        <a class="navbar__link active" data-nav="home">Home</a>
        <a class="navbar__link" data-nav="league" data-id="PL">Premier League</a>
        <a class="navbar__link" data-nav="league" data-id="PD">La Liga</a>
        <a class="navbar__link" data-nav="league" data-id="SA">Serie A</a>
        <a class="navbar__link" data-nav="league" data-id="BL1">Bundesliga</a>
        <a class="navbar__link" data-nav="league" data-id="FL1">Ligue 1</a>
        <a class="navbar__link" data-nav="about">About</a>
      </nav>
      <div class="navbar__right">
        <button class="navbar__theme-toggle" id="themeToggle" title="Toggle light/dark mode">☀</button>
        <button class="navbar__refresh" id="navRefresh" title="Clear cache &amp; refresh">↺</button>
        <div class="navbar__quota" title="Cached — data refreshes every hour">
          <span id="quotaUsed">0</span>/<span id="quotaMax">100</span>
        </div>
        <button class="navbar__burger" id="navBurger">☰</button>
      </div>
    </div>
    <div class="navbar__drawer" id="navDrawer">
      <a class="navbar__drawer-link" data-nav="home">Home</a>
      <a class="navbar__drawer-link" data-nav="league" data-id="PL">Premier League</a>
      <a class="navbar__drawer-link" data-nav="league" data-id="PD">La Liga</a>
      <a class="navbar__drawer-link" data-nav="league" data-id="SA">Serie A</a>
      <a class="navbar__drawer-link" data-nav="league" data-id="BL1">Bundesliga</a>
      <a class="navbar__drawer-link" data-nav="league" data-id="FL1">Ligue 1</a>
      <a class="navbar__drawer-link" data-nav="about">About</a>
    </div>
  </header>
  <main class="page-content container" id="pageContent">
    <div class="page-loader"><div class="spinner"></div></div>
  </main>
  <footer class="footer">
    <div class="container footer__inner">
      <span class="footer__logo">B<span>·</span>SCORE</span>
      <p>Data: <a href="https://www.api-football.com" target="_blank" rel="noopener">API-Football</a> · Season 2024/25</p>
      <p class="footer__note">© <span id="footerYear"></span> B-Score</p>
    </div>
  </footer>
</div>`;
}

function initTheme() {
  const saved = localStorage.getItem("bscore_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("bscore_theme", next);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = next === "dark" ? "☀" : "🌙";
}

export function initApp(rootEl) {
  initTheme();
  rootEl.innerHTML = shell();
  document.getElementById("footerYear").textContent = new Date().getFullYear();

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    themeBtn.textContent = current === "dark" ? "☀" : "🌙";
    themeBtn.addEventListener("click", toggleTheme);
  }

  document.getElementById("navRefresh")?.addEventListener("click", () => {
    import("./api/api.js").then((m) => {
      m.clearCache();
      const page =
        window.location.hash.replace(/^#\/?/, "").split("/")[0] || "home";
      navigateTo(page);
    });
  });

  window.addEventListener("bscore:quota", (e) => {
    const u = document.getElementById("quotaUsed");
    const m = document.getElementById("quotaMax");
    if (u) u.textContent = e.detail.used;
    if (m) m.textContent = e.detail.limit;
  });

  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  burger?.addEventListener("click", (e) => {
    e.stopPropagation();
    drawer.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#navDrawer") && !e.target.closest("#navBurger"))
      drawer?.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-nav]");
    if (!link) return;
    e.preventDefault();
    const page = link.dataset.nav;
    const params = {};
    if (link.dataset.id) params.id = link.dataset.id;
    if (link.dataset.teamId) params.teamId = parseInt(link.dataset.teamId);
    if (link.dataset.fixtureId)
      params.fixtureId = parseInt(link.dataset.fixtureId);
    if (link.dataset.leagueId) params.leagueId = link.dataset.leagueId;
    navigateTo(page, params);
    drawer?.classList.remove("open");
  });

  const hash = window.location.hash.replace(/^#\/?/, "");
  const [page, ...paramParts] = hash.split("/");
  const params = {};
  if (paramParts[0]) params.id = paramParts[0];
  navigateTo(ROUTES[page] ? page : "home", params);
}

export async function navigateTo(page, params = {}) {
  document.dispatchEvent(new CustomEvent("bscore:navigate"));
  document
    .querySelectorAll("[data-nav]")
    .forEach((el) =>
      el.classList.toggle(
        "active",
        el.dataset.nav === page &&
          (!el.dataset.id || el.dataset.id === String(params.id)),
      ),
    );
  const hashParts = [page];
  if (params.id) hashParts.push(params.id);
  else if (params.fixtureId) hashParts.push(params.fixtureId);
  window.location.hash = hashParts.join("/");
  window.scrollTo({ top: 0, behavior: "smooth" });
  const content = document.getElementById("pageContent");
  if (!content) return;
  content.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
  try {
    const getMount = ROUTES[page];
    if (!getMount) {
      navigateTo("home");
      return;
    }
    const mount = await getMount();
    mount(content, params);
  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="error-state"><strong>Error</strong>Could not load this page.</div>`;
  }
}

window.__nav = navigateTo;
