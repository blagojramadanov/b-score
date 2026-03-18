import { fetchStandings, LEAGUES, LEAGUE_CODES } from "../api/api.js";

export function mountHome(container) {
  container.innerHTML = `
<section class="home">

  <div class="hero">
    <div class="hero__inner">
      <div class="hero__left">
        <div class="hero__badge">2025 / 26 Season</div>
        <h1 class="hero__title">The Score.<br/><em>The Real One.</em></h1>
        <p class="hero__sub">Full match history, lineups, scorers, cards and standings for Europe's top 5 leagues.</p>
        <div class="hero__actions">
          <a class="btn btn--accent" data-nav="league" data-id="PL">Explore Leagues</a>
          <a class="btn btn--ghost" data-nav="about">About B-Score</a>
        </div>
        <div class="hero__stats">
          <div class="hero__stat"><span class="hero__stat-val">5</span><span class="hero__stat-lbl">Leagues</span></div>
          <div class="hero__stat"><span class="hero__stat-val">98</span><span class="hero__stat-lbl">Teams</span></div>
          <div class="hero__stat"><span class="hero__stat-val">380+</span><span class="hero__stat-lbl">Matches</span></div>
        </div>
      </div>
      <div class="hero__image-wrap">
        <img src="/b-score/topleagues.jpg" alt="Top Leagues" class="hero__image" />
        <div class="hero__image-overlay"></div>
      </div>
    </div>
  </div>

  <div class="features-bar">
    <div class="container features-bar__inner">
      <div class="features-bar__item">
        <span class="features-bar__icon">📋</span>
        <div><strong>Lineups</strong><p>Starting XI &amp; bench for every match</p></div>
      </div>
      <div class="features-bar__item">
        <span class="features-bar__icon">⚽</span>
        <div><strong>Scorers</strong><p>Goals, assists &amp; minute by minute</p></div>
      </div>
      <div class="features-bar__item">
        <span class="features-bar__icon">🟨</span>
        <div><strong>Cards</strong><p>Yellow, red &amp; all match events</p></div>
      </div>
      <div class="features-bar__item">
        <span class="features-bar__icon">📊</span>
        <div><strong>Standings</strong><p>Full tables with form &amp; zones</p></div>
      </div>
    </div>
  </div>

  <div class="home__leagues">
    <div class="container">
      <div class="home__leagues-header">
        <h2 class="section-title">Top 5 Leagues</h2>
        <span class="home__season-badge">Season 2025/26</span>
      </div>
      <div class="league-cards">
        ${LEAGUE_CODES.map((code) => {
          const l = LEAGUES[code];
          return `
          <a class="league-card" data-nav="league" data-id="${code}">
            <div class="league-card__top">
              <div class="league-card__logo-wrap">
                <img class="league-card__logo" src="${l.logo}" alt="${l.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                <span class="league-card__logo-fallback" style="display:none">${l.flag}</span>
              </div>
              <div class="league-card__info">
                <span class="league-card__name">${l.name}</span>
                <span class="league-card__country">${l.flag} ${l.country}</span>
              </div>
              <span class="league-card__arrow">→</span>
            </div>
            <div class="league-card__standings" id="miniTable_${code}">
              <div class="league-card__loading">
                <div class="spinner spinner--sm"></div>
                <span>Loading standings…</span>
              </div>
            </div>
          </a>`;
        }).join("")}
      </div>
    </div>
  </div>

  <div class="players-banner">
    <div class="players-banner__img-wrap">
      <img src="/b-score/players.avif" alt="Top Players" class="players-banner__img" />
      <div class="players-banner__overlay"></div>
    </div>
    <div class="players-banner__content container">
      <div class="players-banner__text">
        <h2>Track Every Player</h2>
        <p>Goals, assists, cards and season stats for every player across all five leagues. Click any team in the standings to explore their full squad and match history.</p>
        <a class="btn btn--accent" data-nav="league" data-id="PL">View Standings</a>
      </div>
    </div>
  </div>

</section>`;

  loadAllMiniTables();
}

async function loadMiniTable(code) {
  const el = document.getElementById(`miniTable_${code}`);
  if (!el) return;
  const rows = await fetchStandings(code);
  if (!rows) {
    el.innerHTML = `<div class="league-card__error">Could not load standings</div>`;
    return;
  }
  el.innerHTML = `
    <table class="mini-table">
      <thead>
        <tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr>
      </thead>
      <tbody>
        ${rows
          .slice(0, 5)
          .map(
            (r) => `
          <tr>
            <td class="mini-table__pos">${r.position}</td>
            <td class="mini-table__team">
              ${r.team.crest ? `<img src="${r.team.crest}" alt="" onerror="this.style.display='none'">` : ""}
              <span>${r.team.shortName || r.team.name}</span>
            </td>
            <td>${r.playedGames}</td>
            <td>${r.won}</td>
            <td>${r.draw}</td>
            <td>${r.lost}</td>
            <td class="mini-table__pts">${r.points}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <a class="mini-table__more" data-nav="league" data-id="${code}">Full table →</a>`;
}

async function loadAllMiniTables() {
  for (const code of LEAGUE_CODES) {
    await loadMiniTable(code);
  }
}
