import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      // service worker atualiza sozinho quando sai deploy novo
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
        // pré-cacheia também os ícones/imagens do bundle (o padrão só pega
        // js/css/html); chamadas ao Supabase e às APIs de livros não são
        // interceptadas — sem runtime caching de API de propósito
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // anexa os handlers de web push (push/notificationclick) ao SW gerado
        importScripts: ["push-sw.js"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // testes não devem depender de segredos reais nem do .env local: o CI
    // não injeta VITE_ISBNDB_API_KEY/VITE_GOOGLE_BOOKS_API_KEY, e o nome
    // que ele injeta para o Supabase (VITE_SUPABASE_ANON_KEY) não bate com
    // o que src/lib/supabase.ts lê (VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) —
    // sem isso, createClient() lança "supabaseKey is required" já no import
    // em qualquer teste que carregue o módulo real (mockado ou não)
    env: {
      VITE_ISBNDB_API_KEY: "test-isbndb-key",
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
