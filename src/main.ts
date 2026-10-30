import "./styles/main.css";
import { projects, experience, techStack, socials, type Project } from "./data/projects";
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

const pad = (n: number) => String(n).padStart(2, "0");

// One phone mockup: a real screenshot when provided, otherwise a stylised
// placeholder screen built from the project's logo (or name).
function renderPhone(p: Project, screen: string | undefined, variant: number): string {
  if (screen) {
    return `<div class="phone"><div class="phone__screen"><img class="phone__shot" src="${screen}" alt="${p.title} app screen" loading="lazy" /></div></div>`;
  }
  const brand = p.image
    ? `<img class="phone__logo" src="${p.image}" alt="" />`
    : `<span class="phone__wordmark">${p.title.split(" ")[0]}</span>`;
  const body =
    variant === 0
      ? `${brand}<span class="sk sk--lg"></span><span class="sk"></span><span class="sk sk--sm"></span><span class="sk sk--btn"></span>`
      : `<span class="sk sk--card"></span><span class="sk"></span><span class="sk sk--sm"></span><span class="sk sk--card sk--alt"></span><span class="sk"></span>`;
  return `<div class="phone" aria-hidden="true"><div class="phone__screen phone__screen--placeholder phone__screen--v${variant}">${body}</div></div>`;
}

function renderFeatured(featured: Project[]): void {
  const el = document.getElementById("work-featured");
  if (!el) return;
  el.innerHTML = featured
    .map((p, i) => {
      const f = p.featured!;
      const screens = f.screens ?? [];
      return `
      <article class="feature">
        <div class="feature__body">
          <p class="feature__index" data-fade>${pad(i + 1)} · ${p.tag}</p>
          <h3 class="feature__title" data-fade>${p.title}</h3>
          <p class="feature__desc" data-fade>${p.description}</p>
          <div class="feature__metric" data-fade>
            <span class="feature__metric-value">${f.metric.value}</span>
            <span class="feature__metric-label">${f.metric.label}</span>
          </div>
          <dl class="feature__meta" data-fade>
            <dt>Role</dt><dd>${f.role}</dd>
            <dt>Stack</dt><dd><ul class="feature__stack">${f.stack.map((t) => `<li>${t}</li>`).join("")}</ul></dd>
          </dl>
          <p data-fade>
            <a class="btn" href="${p.link}" target="_blank" rel="noopener" data-magnetic>${p.linkLabel ?? "View project"} →</a>
          </p>
        </div>
        <div class="feature__media" data-fade>
          <div class="feature__phones">
            ${renderPhone(p, screens[0], 0)}
            ${renderPhone(p, screens[1], 1)}
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function renderWork(): void {
  renderFeatured(projects.filter((p) => p.featured));
  const featuredCount = projects.filter((p) => p.featured).length;
  const list = document.getElementById("work-list");
  if (!list) return;
  list.innerHTML = projects
    .filter((p) => !p.featured)
    .map((p, i) => {
      const index = pad(featuredCount + i + 1);
      return `
      <a class="work-item" href="${p.link}" target="_blank" rel="noopener"${p.image ? ` data-image="${p.image}"` : ""}>
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

// If anything in the animated layer fails, drop the `js` class so CSS shows
// all content in its final state and the preloader stays out of the way.
function showStatic(error: unknown): void {
  console.error(error);
  document.documentElement.classList.remove("js");
}

function boot(): void {
  // Static / data-driven content first.
  renderWork();
  renderExperience();
  renderMarquee();
  renderSocials();
  initNav();
  setYear();

  try {
    // Background is optional: without WebGL the CSS background shows.
    const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement | null;
    if (canvas) {
      try {
        if (!initBackground(canvas)) canvas.remove();
      } catch (error) {
        console.warn(error);
        canvas.remove();
      }
    }

    // Scroll + cursor.
    initSmoothScroll();
    initCursor();

    // Reveals depend on rendered DOM.
    initScrollReveals();
    initMarquee();
    initWorkPreview();

    // Run intro, then animate the hero in.
    runPreloader().then(revealHero).catch(showStatic);
  } catch (error) {
    showStatic(error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
