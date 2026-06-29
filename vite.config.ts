import { defineConfig } from "vite";

// Custom domain served at root, so base stays "/".
export default defineConfig({
  base: "/",
  build: {
    target: "es2020",
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
