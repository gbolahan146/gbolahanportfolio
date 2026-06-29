import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Animated counter preloader. Resolves when the intro is fully out of the way.
export function runPreloader(): Promise<void> {
  return new Promise((resolve) => {
    const el = document.getElementById("preloader");
    const count = document.getElementById("preloader-count");
    const bar = document.getElementById("preloader-bar");
    if (!el || !count || !bar) return resolve();

    if (reduceMotion) {
      el.style.display = "none";
      return resolve();
    }

    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = "none";
        resolve();
      },
    });

    tl.to(obj, {
      v: 100,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        count.firstChild!.textContent = String(Math.round(obj.v));
      },
    })
      .to(bar, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
      .to([count, bar], { opacity: 0, duration: 0.3 }, ">-0.1")
      .to(el, { yPercent: -100, duration: 0.8, ease: "power3.inOut" }, ">-0.1");
  });
}

// Hero headline lines rise into place.
export function revealHero(): void {
  const lines = document.querySelectorAll(".hero__title .reveal-line > *");
  const intro = document.querySelector(".hero__intro");
  const scroll = document.querySelector(".hero__scroll");
  const eyebrow = document.querySelector(".hero__eyebrow");

  if (reduceMotion) {
    gsap.set([...lines, intro, scroll, eyebrow], { clearProps: "all", opacity: 1, y: 0 });
    return;
  }

  // GSAP owns the hidden state from here (avoids parsing a CSS % transform
  // into a stuck pixel value).
  gsap.set(lines, { yPercent: 110 });

  const tl = gsap.timeline();
  tl.from(eyebrow, { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" })
    .to(
      lines,
      { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.1 },
      "-=0.3"
    )
    .to([intro, scroll], { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.6");
}

// Generic on-scroll fade/rise for [data-fade] elements.
export function initScrollReveals(): void {
  const items = gsap.utils.toArray<HTMLElement>("[data-fade]");
  if (reduceMotion) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }
  items.forEach((item) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 85%" },
    });
  });

  // Section labels draw a line
  gsap.utils.toArray<HTMLElement>(".work-item").forEach((row) => {
    gsap.from(row, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 90%" },
    });
  });
}

// Infinite marquee built from two identical tracks.
export function initMarquee(): void {
  const track = document.querySelector<HTMLElement>(".marquee__track");
  if (!track || reduceMotion) return;
  // Track holds the item set twice; one copy width is half the scrollWidth.
  const distance = track.scrollWidth / 2;
  gsap.to(track, {
    x: `-=${distance}`,
    duration: distance / 60,
    ease: "none",
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % distance),
    },
  });
}

// Floating image preview that follows the cursor across the work list.
export function initWorkPreview(): void {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const preview = document.getElementById("work-preview");
  const img = document.getElementById("work-preview-img") as HTMLImageElement | null;
  if (!fine || !preview || !img) return;

  const items = document.querySelectorAll<HTMLElement>(".work-item");
  // GSAP owns the transform; keep the element centered on the cursor.
  gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.85 });
  const setX = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" });
  const setY = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    setX(e.clientX);
    setY(e.clientY);
  });

  items.forEach((item) => {
    const src = item.dataset.image;
    item.addEventListener("pointerenter", () => {
      if (src) img.src = src;
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
    });
    item.addEventListener("pointerleave", () => {
      gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.4, ease: "power3.out" });
    });
  });
}
