import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Upload de source maps pro Sentry: sem eles a stack de produção chega
// minificada e é praticamente inútil. Só liga quando SENTRY_AUTH_TOKEN existe
// (build da Vercel) — é uma env var de BUILD, nunca VITE_*, senão o token iria
// parar no bundle. Sem token o build local segue idêntico ao de hoje e, o que
// importa, os .map nem são gerados: se fossem, seriam servidos publicamente.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// A integração Sentry↔Vercel cadastra o DSN como SENTRY_DSN, mas o Vite só
// injeta no bundle o que começa com VITE_ — sem mapear, o DSN não chega no
// cliente e initSentry() silenciosamente não inicializa nada em produção.
//
// O mapeamento é var a var DE PROPÓSITO: `envPrefix: ["VITE_", "SENTRY_"]`
// resolveria em uma linha, mas exporia junto o SENTRY_AUTH_TOKEN, que é o
// único segredo real do conjunto. O DSN é público por design (vai pro bundle
// de qualquer forma); o token não.
//
// Local (VITE_SENTRY_DSN no .env) segue tendo precedência: aí o define nem
// entra e o valor vem do .env como em qualquer outra var do projeto.
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
        // /convite é uma página estática (public/convite/), não uma rota do
        // SPA — sem isso o navigateFallback do SW devolveria o index.html do
        // app e a landing de convite nunca apareceria pra quem já tem o SW.
        navigateFallbackDenylist: [/^\/convite/],
        // o SW é gerado depois da limpeza de .map do plugin do Sentry, então
        // o sourcemap dele escaparia pro dist público; nada aqui é código
        // nosso (é boilerplate do Workbox), não vale servir
        sourcemap: false,
        // anexa os handlers de web push (push/notificationclick) ao SW gerado
        importScripts: ["push-sw.js"],
      },
    }),
    // precisa vir por último: age no bundle já gerado pelos outros plugins
    sentryVitePlugin({
      disable: !sentryAuthToken,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: sentryAuthToken,
      // depois de subir pro Sentry, os .map saem do dist — o stack trace
      // legível fica lá, não exposto no site
      sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
      // por padrão o plugin derruba o build se o upload falha (token expirado,
      // Sentry fora do ar) — ou seja, observabilidade bloqueando release.
      // Aqui vira aviso. O custo: a falha é silenciosa, então se as stacks
      // voltarem minificadas, o log do build da Vercel é onde olhar.
      errorHandler: (err) =>
        console.warn("[sentry] upload de source map falhou:", err.message),
    }),
  ],
  build: {
    sourcemap: Boolean(sentryAuthToken),
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
    // testes não devem depender de segredos reais nem do .env local: o CI
    // não injeta VITE_GOOGLE_BOOKS_API_KEY, e o nome que ele injeta para o
    // Supabase (VITE_SUPABASE_ANON_KEY) não bate com o que
    // src/lib/supabase.ts lê (VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) —
    // sem isso, createClient() lança "supabaseKey is required" já no import
    // em qualquer teste que carregue o módulo real (mockado ou não).
    // (A chave da ISBNDB saiu do frontend — vive na Edge Function isbndb.)
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
