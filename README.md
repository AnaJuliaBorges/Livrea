# Livrea

App de **clubes de leitura** (PWA, pt-BR). O usuário se cadastra, escolhe gêneros
e livros que já leu, entra ou cria clubes de leitura, acompanha suas leituras,
avalia livros, conversa no chat do clube e segue outros leitores.

SPA frontend-only (React 19 + TypeScript + Vite) sobre Supabase (Postgres + Auth
+ Storage + Edge Functions) e duas APIs de metadados de livros (Google Books e
ISBNDB).

## Documentação

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — como o projeto funciona:
  stack, estrutura de pastas, rotas, gestão de estado e cada funcionalidade com
  os arquivos que toca.
- **[docs/SUPABASE.md](./docs/SUPABASE.md)** — o backend: tabelas, Edge
  Functions, Storage e a referência de RPCs (o que cada função faz e onde é usada).
- **[CLAUDE.md](./CLAUDE.md)** — guia rápido de convenções para trabalhar no repo.

## Começando

```bash
npm install
npm run dev          # dev server em http://localhost:5173
```

Crie um `.env` (não commitado) com:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
VITE_GOOGLE_BOOKS_API_KEY=...
```

> A chave da ISBNDB **não** é variável de frontend — vive como secret da Edge
> Function `isbndb` (ver [docs/SUPABASE.md](./docs/SUPABASE.md)).

## Scripts

```bash
npm run build        # tsc -b + vite build
npm run typecheck    # tsc -b
npm run lint         # eslint (zero warnings)
npm run test         # vitest (watch)
npm run test:coverage
npm run test:e2e     # playwright
```

## Stack

React 19 · TypeScript · Vite 7 (SWC) · Tailwind CSS v4 · shadcn/ui · React Router
v7 · TanStack Query v5 · Zustand · React Hook Form + Zod · Supabase JS v2 ·
vite-plugin-pwa.
