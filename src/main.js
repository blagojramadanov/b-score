import "./styles/home.scss";
import "./styles/about.scss";

import { getHomeHtml } from "./home.js";
import { getAboutHtml } from "./about.js";

const app = document.getElementById("app");

app.innerHTML = `
  ${getHomeHtml()}
  ${getAboutHtml()}
`;
