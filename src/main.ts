import "./styles/main.css";
import { projects, experience, techStack, socials } from "./data/projects";
import { initBackground } from "./lib/background";
import { initSmoothScroll } from "./lib/smoothScroll";
import { initCursor } from "./lib/cursor";
import {
  runPreloader,
  revealHero,
  initScrollReveals,
  initMarquee,
  initWorkPreview,
} from "./lib/reveals";

function renderWork(): void {
  const list = document.getElementById("work-list");
  if (!list) return;
  list.innerHTML = projects
    .map((p, i) => {
      const index = String(i + 1).padStart(2, "0");
      return `
      <a class="work-item" href="${p.link}" target="_blank" rel="noopener" data-image="${p.image}">
        <span class="work-item__index">${index}</span>
        <h3 class="work-item__title">${p.title}</h3>
        <span class="work-item__tag">${p.tag}</span>
        <p class="work-item__desc">${p.description}</p>
      </a>`;
    })
    .join("");
}

function renderExperience(): void {
  const list = document.getElementById("exp-list");
  if (!list) return;
  list.innerHTML = experience
    .map(
      (r) => `
      <div class="exp-item" data-fade>
        <div class="exp-item__period">${r.period}</div>
        <div class="exp-item__role">
          <h3 class="exp-item__title">${r.title}</h3>
          <p class="exp-item__company">${r.company} · ${r.location}</p>
          <p class="exp-item__desc">${r.description}</p>
        </div>
      </div>`
    )
    .join("");
}

function renderMarquee(): void {
  const marquee = document.getElementById("marquee");
  if (!marquee) return;
  // Duplicate the set so the loop is seamless.
  const items = [...techStack, ...techStack]
    .map((t) => `<span class="marquee__item">${t}</span>`)
    .join("");
  marquee.innerHTML = `<div class="marquee__track">${items}</div>`;
}

function renderSocials(): void {
  const el = document.getElementById("socials");
  if (!el) return;
  el.innerHTML = socials
    .map(
      (s) =>
        `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}" data-magnetic>
          <img src="${s.icon}" alt="" />
        </a>`
    )
    .join("");
}

function initNav(): void {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;
  const close = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

function setYear(): void {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function boot(): void {
  // Static / data-driven content first.
  renderWork();
  renderExperience();
  renderMarquee();
  renderSocials();
  initNav();
  setYear();

  // Background + scroll + cursor.
  const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement | null;
  if (canvas) initBackground(canvas);
  initSmoothScroll();
  initCursor();

  // Reveals depend on rendered DOM.
  initScrollReveals();
  initMarquee();
  initWorkPreview();

  // Run intro, then animate the hero in.
  runPreloader().then(revealHero);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
