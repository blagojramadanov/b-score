import { fetchMatch } from "../api/api.js";

export async function mountMatch(container, params) {
  const matchId = params.fixtureId || params.id;
  if (!matchId) {
    container.innerHTML = `<div class="error-state">No match selected.</div>`;
    return;
  }
  container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

  const m = await fetchMatch(matchId);
  if (!m) {
    container.innerHTML = `<div class="error-state">Match not found.</div>`;
    return;
  }

  const hg = m.score?.fullTime?.home ?? 0;
  const ag = m.score?.fullTime?.away ?? 0;
  const dt = new Date(m.utcDate);
  const dateStr = dt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  container.innerHTML = `
<section class="match-page">
  <div class="match-header">
    <div class="match-header__league">
      ${m.competition?.emblem ? `<img src="${m.competition.emblem}" alt="">` : ""}
      <span>${m.competition?.name} · Matchday ${m.matchday}</span>
    </div>
    <div class="match-header__date">${dateStr}</div>
    <div class="match-header__scoreboard">
      <div class="match-header__team">
        ${m.homeTeam.crest ? `<img src="${m.homeTeam.crest}" class="match-header__badge" alt="">` : ""}
        <span class="match-header__team-name">${m.homeTeam.name}</span>
      </div>
      <div class="match-header__score">
        <span class="${hg > ag ? "score--win" : ""}">${hg}</span>
        <span class="score-sep">–</span>
        <span class="${ag > hg ? "score--win" : ""}">${ag}</span>
        <div class="match-header__ht">HT ${m.score?.halfTime?.home ?? 0}–${m.score?.halfTime?.away ?? 0}</div>
      </div>
      <div class="match-header__team match-header__team--away">
        ${m.awayTeam.crest ? `<img src="${m.awayTeam.crest}" class="match-header__badge" alt="">` : ""}
        <span class="match-header__team-name">${m.awayTeam.name}</span>
      </div>
    </div>
    ${m.venue ? `<div class="match-header__venue">📍 ${m.venue}</div>` : ""}
    ${m.referees?.length ? `<div class="match-header__referee">👤 ${m.referees[0].name}</div>` : ""}
  </div>

  <div class="match-tabs">
    <button class="mtab active" data-mtab="events">Match Events</button>
    <button class="mtab" data-mtab="lineups">Lineups</button>
  </div>

  <div id="matchTabContent">
    ${renderEvents(m)}
  </div>
</section>`;

  container.querySelectorAll(".mtab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container
        .querySelectorAll(".mtab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const tc = document.getElementById("matchTabContent");
      if (tab.dataset.mtab === "events") tc.innerHTML = renderEvents(m);
      if (tab.dataset.mtab === "lineups") tc.innerHTML = renderLineups(m);
    });
  });
}

function renderEvents(m) {
  const goals = m.goals || [];
  const bookings = m.bookings || [];
  const subs = m.substitutions || [];

  if (!goals.length && !bookings.length && !subs.length) {
    return `<div class="empty-state">No event data available for this match.</div>`;
  }

  const all = [
    ...goals.map((e) => ({ ...e, _type: "goal", _min: e.minute })),
    ...bookings.map((e) => ({ ...e, _type: "card", _min: e.minute })),
    ...subs.map((e) => ({ ...e, _type: "sub", _min: e.minute })),
  ].sort((a, b) => (a._min || 0) - (b._min || 0));

  const home = m.homeTeam;
  const away = m.awayTeam;

  const rows = all
    .map((e) => {
      const isHome = e.team?.id === home.id;
      const min = `${e.minute}${e.injuryTime ? "+" + e.injuryTime : ""}'`;

      let icon, player, detail;
      if (e._type === "goal") {
        icon =
          e.type === "OWN_GOAL"
            ? "⚽ OG"
            : e.type === "PENALTY"
              ? "⚽ PEN"
              : "⚽";
        player = e.scorer?.name || "";
        detail = e.assist ? `↗ ${e.assist.name}` : "";
      } else if (e._type === "card") {
        icon =
          e.card === "YELLOW_CARD"
            ? "🟨"
            : e.card === "RED_CARD"
              ? "🟥"
              : "🟨🟥";
        player = e.player?.name || "";
        detail = "";
      } else {
        icon = "🔄";
        player = `↑ ${e.playerIn?.name || ""} ↓ ${e.playerOut?.name || ""}`;
        detail = "";
      }

      return `
      <div class="event-row ${isHome ? "event-row--home" : "event-row--away"}">
        ${
          isHome
            ? `
          <div class="event-row__content">
            <span class="event-row__player">${player}</span>
            ${detail ? `<span class="event-assist">${detail}</span>` : ""}
          </div>
          <span class="event-row__icon">${icon}</span>
          <span class="event-row__min">${min}</span>
          <div class="event-row__spacer"></div>
        `
            : `
          <div class="event-row__spacer"></div>
          <span class="event-row__min">${min}</span>
          <span class="event-row__icon">${icon}</span>
          <div class="event-row__content">
            <span class="event-row__player">${player}</span>
            ${detail ? `<span class="event-assist">${detail}</span>` : ""}
          </div>
        `
        }
      </div>`;
    })
    .join("");

  return `
    <div class="events-wrap">
      <div class="events-header">
        <span>${home.name}</span><span></span><span>${away.name}</span>
      </div>
      <div class="events-list">${rows}</div>
    </div>`;
}

function renderLineups(m) {
  const home = m.homeTeam;
  const away = m.awayTeam;

  if (!home.lineup?.length && !away.lineup?.length) {
    return `<div class="empty-state">No lineup data available for this match.</div>`;
  }

  const renderTeam = (team) => {
    const xi = team.lineup || [];
    const bench = team.bench || [];
    const formation = team.formation || "";

    return `
      <div class="lineup-team">
        <div class="lineup-team__header">
          ${team.crest ? `<img src="${team.crest}" alt="">` : ""}
          <span class="lineup-team__name">${team.name}</span>
          ${formation ? `<span class="lineup-team__formation">${formation}</span>` : ""}
        </div>
        ${formation && xi.length ? `<div class="formation-grid">${buildFormation(xi, formation)}</div>` : ""}
        <div class="lineup-players">
          <h4>Starting XI</h4>
          <div class="player-list">
            ${xi
              .map(
                (p) => `
              <div class="player-item">
                <span class="player-item__num">${p.shirtNumber ?? "—"}</span>
                <span class="player-item__pos pos--${(p.position || "M").slice(0, 2).toUpperCase()}">${posLabel(p.position)}</span>
                <span class="player-item__name">${p.name}</span>
              </div>`,
              )
              .join("")}
          </div>
          ${
            bench.length
              ? `
            <h4>Bench</h4>
            <div class="player-list player-list--bench">
              ${bench
                .map(
                  (p) => `
                <div class="player-item player-item--bench">
                  <span class="player-item__num">${p.shirtNumber ?? "—"}</span>
                  <span class="player-item__pos pos--${(p.position || "M").slice(0, 2).toUpperCase()}">${posLabel(p.position)}</span>
                  <span class="player-item__name">${p.name}</span>
                </div>`,
                )
                .join("")}
            </div>`
              : ""
          }
        </div>
      </div>`;
  };

  return `<div class="lineups-wrap">${renderTeam(home)}${renderTeam(away)}</div>`;
}

function buildFormation(players, formation) {
  const rows = formation.split("-").map(Number);
  rows.unshift(1);
  let idx = 0;
  return rows
    .map((count) => {
      const row = players.slice(idx, idx + count);
      idx += count;
      return `<div class="formation-row">${row
        .map(
          (p) => `
      <div class="formation-player">
        <div class="formation-player__circle">${p.shirtNumber ?? "?"}</div>
        <span class="formation-player__name">${(p.name || "").split(" ").pop()}</span>
      </div>`,
        )
        .join("")}</div>`;
    })
    .reverse()
    .join("");
}

function posLabel(pos) {
  if (!pos) return "?";
  if (pos === "Goalkeeper") return "GK";
  if (pos.includes("Back") || pos.includes("Defence")) return "D";
  if (pos.includes("Midfield")) return "M";
  if (
    pos.includes("Forward") ||
    pos.includes("Offence") ||
    pos.includes("Winger")
  )
    return "F";
  return pos.slice(0, 2).toUpperCase();
}
