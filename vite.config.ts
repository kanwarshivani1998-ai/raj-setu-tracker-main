import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

// package.json ka current version build ke time JS bundle me inject hota hai
// (in-app update checker isi __APP_VERSION__ ko GitHub ke latest release se compare karta hai)
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

// Is file root project ke root folder me daalni hai (jaha package.json hai)
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    // path aliases (@/...) ke liye
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),

    tailwindcss(),

    tanstackStart({
      // SPA mode: Capacitor ke liye zaroori hai, kyunki mobile app
      // me koi backend server nahi chalta (sab kuch static build hota hai)
      spa: {
        enabled: true,
        prerender: {
          crawlLinks: true,
          outputPath: "index.html",
        },
      },
    }),

    // react plugin, tanstackStart ke baad hona chahiye
    viteReact(),

    // App me src/lib/pwa/registerSW.ts already "/sw.js" register karta hai,
    // isliye yaha generateSW se wahi file generate hogi
    VitePWA({
      strategies: "generateSW",
      filename: "sw.js",
      injectRegister: false,
      manifest: false, // apna manifest.webmanifest public/ me already hai
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: "/index.html",
      },
    }),
  ],

  build: {
    // Capacitor ka webDir isi folder se point hoga: dist/client
    outDir: "dist",
  },
});
