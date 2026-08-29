import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const sentryBuildVars = {
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
};
const missingSentryVars = Object.entries(sentryBuildVars)
  .filter(([, value]) => !value)
  .map(([name]) => name);
const sentryUploadEnabled = missingSentryVars.length === 0;

if (process.env.VERCEL) {
  console.log(
    sentryUploadEnabled
      ? "[sentry] upload de source map HABILITADO (stack de produção legível)"
      : `[sentry] upload de source map DESABILITADO — faltam: ${missingSentryVars.join(
          ", ",
        )} — a stack de produção virá MINIFICADA`,
  );
}

const sentryDsnDefine =
  process.env.SENTRY_DSN && !process.env.VITE_SENTRY_DSN
    ? {
        "import.meta.env.VITE_SENTRY_DSN": JSON.stringify(
          process.env.SENTRY_DSN,
        ),
      }
    : {};

export default defineConfig({
  define: sentryDsnDefine,
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Livrea",
        short_name: "Livrea",
        description:
          "Clubes de leitura: encontre clubes, acompanhe suas leituras e converse sobre livros.",
        lang: "pt-BR",
        theme_color: "#8c11dc",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallbackDenylist: [/^\/convite/],
        sourcemap: false,
        importScripts: ["push-sw.js"],
      },
    }),
    sentryVitePlugin({
      disable: !sentryUploadEnabled,
      org: sentryBuildVars.SENTRY_ORG,
      project: sentryBuildVars.SENTRY_PROJECT,
      authToken: sentryBuildVars.SENTRY_AUTH_TOKEN,
      sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
      errorHandler: (err) =>
        console.warn("[sentry] upload de source map falhou:", err.message),
    }),
  ],
  build: {
    sourcemap: sentryUploadEnabled,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    env: {
      VITE_GOOGLE_BOOKS_API_KEY: "test-google-books-key",
      VITE_SUPABASE_URL: "https://test-project.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: "test-supabase-anon-key",
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/**",
      "**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
