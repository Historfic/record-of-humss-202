/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // Cache Supabase REST reads so the report still loads with no internet.
        // NetworkFirst: use live data when online, fall back to last-cached when offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/rest/v1/"),
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "supabase-reads",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "Records of HUMSS-202",
        short_name: "HUMSS-202",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  test: { environment: "jsdom", globals: true, setupFiles: "./src/test-setup.ts" },
});
