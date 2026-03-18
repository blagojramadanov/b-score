import { fetchScorers, LEAGUES, LEAGUE_CODES } from "../api/api.js";

export function mountPlayers(container) {
  container.innerHTML = `
<section class="players-page">
  <h1 class="page-title">Top Scorers</h1>
  <div class="league-buttons" id="playerLeagueBtns">
    ${LEAGUE_CODES.map(
      (code, i) => `
      <button class="league-btn${i === 0 ? " active" : ""}" data-id="${code}">
        ${LEAGUES[code].flag} ${LEAGUES[code].name}
      </button>`,
    ).join("")}
  </div>
  <div id="playersContent">
    <div class="page-loader"><div class="spinner"></div></div>
  </div>
</section>`;

  loadPlayers("PL");

  container.querySelectorAll(".league-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container
        .querySelectorAll(".league-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadPlayers(btn.dataset.id);
    });
  });
}

async function loadPlayers(code) {
  const el = document.getElementById("playersContent");
  el.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
  const scorers = await fetchScorers(code);
  if (!scorers) {
    el.innerHTML = `<div class="error-state">No player data available.</div>`;
    return;
  }

  el.innerHTML = `
    <div class="players-wrap">
      <table class="players-table">
        <thead>
          <tr><th>#</th><th>Player</th><th>Nationality</th><th>Team</th><th>Goals</th><th>Assists</th><th>Penalties</th></tr>
        </thead>
        <tbody>
          ${scorers
            .map(
              (s, i) => `
            <tr>
              <td class="rank-cell">${i + 1}</td>
              <td class="player-cell"><span>${s.player.name}</span></td>
              <td>${s.player.nationality || "—"}</td>
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
