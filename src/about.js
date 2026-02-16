export function getAboutHtml() {
  return `
    <section class="about">
      <div class="about-title">
        <h1>HERE YOU CAN WATCH</h1>
      </div>

      <div class="about-cards">

        <div class="about-card">
          <div class="card-image">
            <img src="public/images/leagues.png" alt="Leagues">
          </div>
          <div class="card-content">
            <button class="card-button">LEAGUES</button>
            <ul>
              <li>Premier League</li>
              <li>La Liga</li>
              <li>Serie A</li>
              <li>Bundesliga</li>
              <li>Ligue 1</li>
            </ul>
          </div>
        </div>

        <div class="about-card">
          <div class="card-image">
            <img src="public/images/livescore.jpg" alt="Live Scores">
          </div>
          <div class="card-content">
            <button class="card-button">LIVE RESULT</button>
            <br></br>
            <p>Now to the results.</p>
          </div>
        </div>

        <div class="about-card">
          <div class="card-image">
            <img src="public/images/schedule.jpg" alt="Schedule">
          </div>
          <div class="card-content">
            <button class="card-button">SCHEDULE</button>
            <ol>
              <li>Real Madrid</li>
              <li>Barcelona</li>
              <li>Valencia</li>
            </ol>
          </div>
        </div>

      </div>
    </section>
  `;
}
