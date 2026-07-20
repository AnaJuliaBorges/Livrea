import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Fronteira entre features: de dentro de uma feature, outra feature só
    // pode ser importada pela API pública dela (@/features/<nome>, o
    // index.ts). Imports profundos ficam livres apenas dentro da própria
    // feature (via caminho relativo) e no shell do app (src/main.tsx importa
    // páginas direto pro code splitting por rota).
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Importe de outra feature só pela API pública dela: @/features/<nome> (exporte o símbolo no index.ts da feature).',
            },
          ],
        },
      ],
    },
  },
])
