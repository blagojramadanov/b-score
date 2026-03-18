export function mountAbout(container) {
  container.innerHTML = `
<section class="about">
  <div class="about__hero">
    <h1 class="about__title">What is <em>B-Score</em>?</h1>
    <p class="about__lead">Full football data for Europe's top 5 leagues. Match history, lineups, scorers, cards and formations — every match of the 2025/26 season.</p>
  </div>
  <div class="about__features">
    <div class="about-card"><div class="about-card__icon">📋</div><h3>Match Lineups</h3><p>Full starting XI with formation diagram, player positions and the complete bench for every match.</p></div>
    <div class="about-card"><div class="about-card__icon">⚽</div><h3>Goals & Scorers</h3><p>Every goal — who scored it, at what minute, penalty or open play, and who assisted.</p></div>
    <div class="about-card"><div class="about-card__icon">🟨</div><h3>Cards & Events</h3><p>Yellow cards, red cards, second yellows, substitutions and VAR decisions for every match.</p></div>
    <div class="about-card"><div class="about-card__icon">📊</div><h3>Match Statistics</h3><p>Shots, possession, corners, fouls, offsides and more — visualised with comparison bars.</p></div>
    <div class="about-card"><div class="about-card__icon">🏆</div><h3>Full Standings</h3><p>Live league tables with wins, draws, losses, goal difference, form guide and zone indicators.</p></div>
    <div class="about-card"><div class="about-card__icon">👤</div><h3>Team Profiles</h3><p>Season stats, stadium info, home/away record and full match history for every club.</p></div>
  </div>
  <div class="about__info">
    <h2>The 5 Leagues</h2>
    <ul class="leagues-list">
      <li>🏴󠁧󠁢󠁥󠁮󠁧󠁿 <strong>Premier League</strong> — England's top flight, 20 clubs</li>
      <li>🇪🇸 <strong>La Liga</strong> — Spain's top flight, 20 clubs</li>
      <li>🇮🇹 <strong>Serie A</strong> — Italy's top flight, 20 clubs</li>
      <li>🇩🇪 <strong>Bundesliga</strong> — Germany's top flight, 18 clubs</li>
      <li>🇫🇷 <strong>Ligue 1</strong> — France's top flight, 18 clubs</li>
    </ul>
    <h2>Data</h2>
    <p>All data is provided by <a href="https://www.api-football.com" target="_blank" rel="noopener">API-Football</a>. The free tier covers 100 requests/day which is enough for browsing. Season shown: 2025/26.</p>
  </div>
</section>`;
}
