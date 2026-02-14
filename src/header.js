export function getHeaderHtml() {
  return `
    <header>
      <nav class="navbar">
        <div class="logo">B-Score</div>
        <ul class="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Leagues</a></li>
          <li><a href="#">Live Scores</a></li>
          <li><a href="#">Schedule</a></li>
        </ul>
      </nav>
    </header>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.innerHTML = `
    ${getHeaderHtml()}
    <main>
      <section class="hero">
        <div class="hero-content">
          <div class="hero-image">
            <img src="./images/players.png" alt="Players">
          </div>
          <div class="hero-text">
            <h1>WATCH YOUR TEAM'S SCORE LIVE NOW!</h1>
            <p>Tables, schedules and live scores only on B-Score</p>
            <button class="btn-score">SCORE</button>
          </div>
        </div>
      </section>
    </main>
  `;
});
