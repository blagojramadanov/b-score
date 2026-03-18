const IS_DEV =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const BASE = IS_DEV
  ? "/api"
  : ": 'https://bscore-proxy.YOUR-SUBDOMAIN.workers.dev';";
const KEY = "8243ec99557b450a9c932eca7d54fa06";
const RATE_DELAY = 8000;
const CACHE_TTL = 60 * 60 * 1000;
const CACHE_VER = "v4";

(function bustOldCache() {
  try {
    if (localStorage.getItem("bscore_ver") !== CACHE_VER) {
      Object.keys(localStorage).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("bscore_ver", CACHE_VER);
    }
  } catch {}
})();

export const LEAGUES = {
  PL: {
    name: "Premier League",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    logo: "https://crests.football-data.org/PL.png",
    color: "#3d195b",
    accent: "#00ff85",
  },
  PD: {
    name: "La Liga",
    country: "Spain",
    flag: "🇪🇸",
    logo: "https://crests.football-data.org/PD.png",
    color: "#ee8707",
    accent: "#fff",
  },
  SA: {
    name: "Serie A",
    country: "Italy",
    flag: "🇮🇹",
    logo: "https://crests.football-data.org/SA.png",
    color: "#024494",
    accent: "#fff",
  },
  BL1: {
    name: "Bundesliga",
    country: "Germany",
    flag: "🇩🇪",
    logo: "https://crests.football-data.org/BL1.png",
    color: "#d3010c",
    accent: "#fff",
  },
  FL1: {
    name: "Ligue 1",
    country: "France",
    flag: "🇫🇷",
    logo: "https://crests.football-data.org/FL1.png",
    color: "#091c3e",
    accent: "#dba111",
  },
};

export const LEAGUE_CODES = ["PL", "PD", "SA", "BL1", "FL1"];

let lastCallTime = 0;

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function lsSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

async function call(path) {
  const cached = lsGet(path);
  if (cached) return cached;

  const since = Date.now() - lastCallTime;
  if (since < RATE_DELAY) await wait(RATE_DELAY - since);
  lastCallTime = Date.now();

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const isMatch = path.startsWith("/matches/");
    const r = await fetch(`${BASE}${path}`, {
      headers: {
        "X-Auth-Token": KEY,
        ...(isMatch
          ? {
              "X-Unfold-Goals": "true",
              "X-Unfold-Bookings": "true",
              "X-Unfold-Lineups": "true",
              "X-Unfold-Subs": "true",
            }
          : {}),
      },
      signal: ctrl.signal,
    });
    clearTimeout(t);

    if (r.status === 429) {
      console.warn("[API] 429 rate limit hit — data will load after cooldown");
      return null;
    }
    if (!r.ok) {
      console.warn(`[API] ${r.status} ${path}`);
      return null;
    }

    const json = await r.json();
    lsSet(path, json);
    return json;
  } catch (e) {
    clearTimeout(t);
    console.warn("[API] fetch failed:", path, e.message);
    return null;
  }
}

export async function fetchStandings(code) {
  const d = await call(`/competitions/${code}/standings`);
  if (!d) return null;
  return d.standings?.find((s) => s.type === "TOTAL")?.table || null;
}

export async function fetchMatches(code) {
  const d = await call(`/competitions/${code}/matches?status=FINISHED`);
  return d?.matches || null;
}

export async function fetchScorers(code) {
  const d = await call(`/competitions/${code}/scorers?limit=20`);
  return d?.scorers || null;
}

export async function fetchMatch(matchId) {
  return await call(`/matches/${matchId}`);
}

export async function fetchTeamMatches(teamId, code) {
  const d = await call(
    `/teams/${teamId}/matches?competitions=${code}&status=FINISHED&limit=20`,
  );
  return d?.matches || null;
}

export async function fetchTeam(teamId) {
  return await call(`/teams/${teamId}`);
}

export async function fetchTeamInfo(teamId) {
  return fetchTeam(teamId);
}

export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter(
        (k) =>
          k.startsWith("/competitions") ||
          k.startsWith("/matches") ||
          k.startsWith("/teams"),
      )
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}
