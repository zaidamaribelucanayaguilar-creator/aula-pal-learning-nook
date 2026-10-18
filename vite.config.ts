// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null, // el registro lo hace solo src/lib/pwa-register.ts
        devOptions: { enabled: false },
        filename: "sw.js",
        manifest: false, // el manifest vive en public/manifest.webmanifest
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          runtimeCaching: [
            {
              // Navegaciones/HTML: red primero, caché como respaldo offline.
              urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "aulaplus-pages",
                networkTimeoutSeconds: 4,
              },
            },
            {
              // Assets con hash del propio sitio: caché primero.
              urlPattern: ({ url, request }: { url: URL; request: Request }) =>
                url.origin === self.location.origin &&
                ["style", "script", "worker", "font", "image"].includes(request.destination),
              handler: "CacheFirst",
              options: {
                cacheName: "aulaplus-assets",
                expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});
