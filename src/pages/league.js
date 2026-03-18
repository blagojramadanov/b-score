import {
  fetchStandings,
  fetchMatches,
  fetchScorers,
  LEAGUES,
} from "../api/api.js";

export async function mountLeague(container, params) {
  const code = params.id || "PL";
  const meta = LEAGUES[code];
  if (!meta) {
    container.innerHTML = `<div class="error-state">League not found.</div>`;
    return;
  }

  container.innerHTML = `
<section class="league-page">
  <div class="league-hero">
    <span class="league-hero__flag">${meta.flag}</span>
    <div>
      <h1 class="league-hero__name">${meta.name}</h1>
      <span class="league-hero__country">${meta.country} · Season 2025/26</span>
    </div>
  </div>
  <div class="league-tabs">
    <button class="ltab active" data-ltab="standings">Standings</button>
    <button class="ltab" data-ltab="results">Results</button>
    <button class="ltab" data-ltab="scorers">Top Scorers</button>
  </div>
  <div id="leagueTabContent">
    <div class="page-loader"><div class="spinner"></div></div>
  </div>
</section>`;

  container.querySelectorAll(".ltab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container
        .querySelectorAll(".ltab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      loadTab(tab.dataset.ltab, code);
    });
  });

  loadTab("standings", code);
}

async function loadTab(tab, code) {
  const el = document.getElementById("leagueTabContent");
  el.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
  if (tab === "standings") await renderStandings(el, code);
  if (tab === "results") await renderResults(el, code);
  if (tab === "scorers") await renderScorers(el, code);
}

async function renderStandings(el, code) {
  const rows = await fetchStandings(code);
  if (!rows) {
    el.innerHTML = `<div class="error-state">Could not load standings.</div>`;
    return;
  }

  const total = rows.length;
  el.innerHTML = `
    <div class="standings-wrap">
      <div class="zone-legend">
        <span class="zone-item zone-item--ucl">Champions League</span>
        <span class="zone-item zone-item--uel">Europa League</span>
        <span class="zone-item zone-item--conf">Conference</span>
        <span class="zone-item zone-item--rel">Relegation</span>
      </div>
      <table class="standings-table">
        <thead>
          <tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Form</th><th>Pts</th></tr>
        </thead>
        <tbody>
          ${rows
            .map((r) => {
              const pos = r.position;
              let zone = "";
              if (pos <= 4) zone = "zone-ucl";
              else if (pos <= 6) zone = "zone-uel";
              else if (pos === 7) zone = "zone-conf";
              else if (pos >= total - 2) zone = "zone-rel";
              const gd =
                r.goalDifference > 0
                  ? `+${r.goalDifference}`
                  : r.goalDifference;
              const formStr = r.form || "";
              const formChars = formStr.includes(",")
                ? formStr
                    .split(",")
                    .slice(-5)
                    .map((c) =>
                      c === "WIN"
                        ? "W"
                        : c === "DRAW"
                          ? "D"
                          : c === "LOSS" || c === "LOSE"
                            ? "L"
                            : c,
                    )
                : formStr.slice(-5).split("");
              const form = formChars
                .map((c) => {
                  const cls =
                    c === "W" ? "w" : c === "D" ? "d" : c === "L" ? "l" : "l";
                  const lbl =
                    c === "W" ? "W" : c === "D" ? "D" : c === "L" ? "L" : "?";
                  return `<span class="form-dot form-dot--${cls}">${lbl}</span>`;
                })
                .join("");
              return `
              <tr class="${zone}" data-nav="team" data-team-id="${r.team.id}" data-league-id="${code}" style="cursor:pointer">
                <td class="pos-cell ${zone}">${pos}</td>
                <td class="team-cell">
                  ${r.team.crest ? `<img src="${r.team.crest}" alt="" onerror="this.style.display='none'">` : ""}
                  <span>${r.team.shortName || r.team.name}</span>
                </td>
                <td>${r.playedGames}</td>
                <td>${r.won}</td>
                <td>${r.draw}</td>
                <td>${r.lost}</td>
                <td>${r.goalsFor}</td>
                <td>${r.goalsAgainst}</td>
                <td>${gd}</td>
                <td><div class="form-dots">${form}</div></td>
                <td class="pts-cell">${r.points}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
}

async function renderResults(el, code) {
  const matches = await fetchMatches(code);
  if (!matches || !matches.length) {
    el.innerHTML = `<div class="error-state">No results found.</div>`;
    return;
  }

  const sorted = [...matches].sort(
    (a, b) => new Date(b.utcDate) - new Date(a.utcDate),
  );

  el.innerHTML = `
    <div class="results-wrap">
      <div class="results-list">
        ${sorted
          .map((m) => {
            const dt = new Date(m.utcDate);
            const date = dt.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const hg = m.score?.fullTime?.home ?? 0;
            const ag = m.score?.fullTime?.away ?? 0;
            const hWin = hg > ag,
              aWin = ag > hg;
            return `
            <a class="result-row" data-nav="match" data-fixture-id="${m.id}">
              <span class="result-row__date">${date}</span>
              <div class="result-row__home">
                ${m.homeTeam.crest ? `<img src="${m.homeTeam.crest}" alt="" onerror="this.style.display='none'">` : ""}
                <span class="${hWin ? "result-row__name--win" : ""}">${m.homeTeam.shortName || m.homeTeam.name}</span>
              </div>
              <div class="result-row__score">
                <span class="${hWin ? "score--win" : ""}">${hg}</span>
                <span class="score-sep">–</span>
                <span class="${aWin ? "score--win" : ""}">${ag}</span>
              </div>
              <div class="result-row__away">
                ${m.awayTeam.crest ? `<img src="${m.awayTeam.crest}" alt="" onerror="this.style.display='none'">` : ""}
                <span class="${aWin ? "result-row__name--win" : ""}">${m.awayTeam.shortName || m.awayTeam.name}</span>
              </div>
              <span class="result-row__ht">HT ${m.score?.halfTime?.home ?? 0}–${m.score?.halfTime?.away ?? 0}</span>
              <span class="result-row__arrow">→</span>
            </a>`;
          })
          .join("")}
      </div>
    </div>`;
}

async function renderScorers(el, code) {
  const scorers = await fetchScorers(code);
  if (!scorers) {
    el.innerHTML = `<div class="error-state">No data available.</div>`;
    return;
  }
  el.innerHTML = `
    <div class="players-wrap">
      <table class="players-table">
        <thead><tr><th>#</th><th>Player</th><th>Team</th><th>Goals</th><th>Assists</th><th>Penalties</th></tr></thead>
        <tbody>
          ${scorers
            .map(
              (s, i) => `
            <tr>
              <td class="rank-cell">${i + 1}</td>
              <td class="player-cell">
                <span>${s.player.name}</span>
              </td>
              <td class="team-cell">
                ${s.team?.crest ? `<img src="${s.team.crest}" alt="" onerror="this.style.display='none'">` : ""}
                <span>${s.team?.shortName || s.team?.name || "—"}</span>
              </td>
              <td class="pts-cell">${s.goals ?? 0}</td>
              <td>${s.assists ?? 0}</td>
              <td>${s.penalties ?? 0}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}
