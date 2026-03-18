import { fetchTeam, fetchTeamMatches, LEAGUES } from "../api/api.js";

export async function mountTeam(container, params) {
  const teamId = params.teamId || params.id;
  const leagueCode = params.leagueId || "PL";
  if (!teamId) {
    container.innerHTML = `<div class="error-state">No team selected.</div>`;
    return;
  }
  container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

  const [team, matches] = await Promise.all([
    fetchTeam(teamId),
    fetchTeamMatches(teamId, leagueCode),
  ]);

  if (!team) {
    container.innerHTML = `<div class="error-state">Team not found.</div>`;
    return;
  }

  container.innerHTML = `
<section class="team-page">
  <div class="team-hero">
    ${team.crest ? `<img src="${team.crest}" class="team-hero__logo" alt="${team.name}">` : ""}
    <div class="team-hero__info">
      <h1 class="team-hero__name">${team.name}</h1>
      <div class="team-hero__meta">
        <span>🏴 ${team.area?.name || ""}</span>
        ${team.founded ? `<span>📅 Founded ${team.founded}</span>` : ""}
        ${team.venue ? `<span>🏟 ${team.venue}</span>` : ""}
        ${team.website ? `<span><a href="${team.website}" target="_blank" rel="noopener" style="color:var(--accent)">Website ↗</a></span>` : ""}
      </div>
    </div>
  </div>

  <div class="team-tabs">
    <button class="ttab active" data-ttab="all">All Matches</button>
    <button class="ttab" data-ttab="home">Home</button>
    <button class="ttab" data-ttab="away">Away</button>
  </div>

  <div id="teamFixturesContent">
    ${renderFixtures(matches, "all", parseInt(teamId))}
  </div>
</section>`;

  container.querySelectorAll(".ttab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container
        .querySelectorAll(".ttab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("teamFixturesContent").innerHTML = renderFixtures(
        matches,
        tab.dataset.ttab,
        parseInt(teamId),
      );
    });
  });
}

function renderFixtures(matches, filter, teamId) {
  if (!matches || !matches.length)
    return `<div class="empty-state">No matches found.</div>`;

  let list = [...matches].sort(
    (a, b) => new Date(b.utcDate) - new Date(a.utcDate),
  );
  if (filter === "home") list = list.filter((m) => m.homeTeam.id === teamId);
  if (filter === "away") list = list.filter((m) => m.awayTeam.id === teamId);
  if (!list.length)
    return `<div class="empty-state">No matches for this filter.</div>`;

  return `
    <div class="results-wrap">
      <div class="results-list">
        ${list
          .map((m) => {
            const isHome = m.homeTeam.id === teamId;
            const hg = m.score?.fullTime?.home ?? 0;
            const ag = m.score?.fullTime?.away ?? 0;
            const myGoals = isHome ? hg : ag;
            const oppGoals = isHome ? ag : hg;
            const result =
              myGoals > oppGoals ? "W" : myGoals < oppGoals ? "L" : "D";
            const opp = isHome ? m.awayTeam : m.homeTeam;
            const dt = new Date(m.utcDate);
            const date = dt.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return `
            <a class="team-result-row" data-nav="match" data-fixture-id="${m.id}">
              <span class="team-result-row__date">${date}</span>
              <span class="team-result-row__venue">${isHome ? "H" : "A"}</span>
              <div class="team-result-row__opp">
                ${opp.crest ? `<img src="${opp.crest}" alt="" onerror="this.style.display='none'">` : ""}
                <span>${opp.shortName || opp.name}</span>
              </div>
              <div class="team-result-row__score">
                <span class="result-badge result--${result.toLowerCase()}">${result}</span>
                <span class="team-result-row__goals">${myGoals}–${oppGoals}</span>
              </div>
              <span class="team-result-row__ht">HT ${m.score?.halfTime?.home ?? 0}–${m.score?.halfTime?.away ?? 0}</span>
              <span class="team-result-row__arrow">→</span>
            </a>`;
          })
          .join("")}
      </div>
    </div>`;
}
