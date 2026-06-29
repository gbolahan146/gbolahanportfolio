import gsap from "gsap";

// Custom cursor with a fast dot and a lagging ring, plus magnetic pull on
// elements tagged [data-magnetic]. Desktop / fine-pointer only.
export function initCursor(): void {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine) return;

  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  document.body.classList.add("has-cursor");

  const setDotX = gsap.quickSetter(dot, "x", "px");
  const setDotY = gsap.quickSetter(dot, "y", "px");
  const setRingX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
  const setRingY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    setDotX(e.clientX);
    setDotY(e.clientY);
    setRingX(e.clientX);
    setRingY(e.clientY);
  });

  const hoverTargets = "a, button, [data-magnetic], .work-item";
  document.querySelectorAll<HTMLElement>(hoverTargets).forEach((el) => {
    el.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
  });

  // Magnetic pull
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = 0.4;
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: "power3" });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}
