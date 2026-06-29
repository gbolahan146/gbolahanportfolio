# Gbolahan Oduyemi — Portfolio

Personal portfolio of Gbolahan Oduyemi, Software Engineer (Mobile + Frontend).
Live at [gbolahanoduyemi.com](https://gbolahanoduyemi.com).

## Stack

- [Vite](https://vitejs.dev/) + TypeScript
- [Three.js](https://threejs.org/) — animated gradient/noise shader background
- [GSAP](https://gsap.com/) + ScrollTrigger — reveals, marquee, hover interactions
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scrolling

## Develop

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Deploy

Pushing to the `part-2` branch triggers `.github/workflows/deploy.yml`, which
builds the site and deploys `dist/` to GitHub Pages. The custom domain is set
via `public/CNAME` (copied into every build).

> One-time setup: in the repo Settings → Pages, set Source to "GitHub Actions".
