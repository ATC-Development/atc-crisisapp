import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { version } from "./package.json"; // 👈 Import version

// https://vite.dev/config/
export default defineConfig({
  base: "/atc-crisisapp/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192.png",
        "pwa-512.png",
        "pwa-maskable-512.png",
      ],
      manifest: {
        name: "ATC Crisis Management",
        short_name: "ATC Crisis",
        description: "Offline-ready crisis checklists and reporting.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",

        // Because you are hosted at /atc-crisisapp/ on GitHub Pages:
        scope: "/atc-crisisapp/",
        start_url: "/atc-crisisapp/",

        icons: [
          {
            src: "/atc-crisisapp/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/atc-crisisapp/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/atc-crisisapp/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // SPA navigation fallback for offline + GH Pages deep links
        navigateFallback: "/atc-crisisapp/index.html",
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version), // 👈 keep your version constant
  },
});
