import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), react()],
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
