# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Livrea is a social reading / book-club web app (Portuguese-language product, "clubes de leitura"). Users sign up, pick genres and books they've read, join or create reading clubs, track reads, and review books. Frontend-only SPA backed by Supabase (Postgres + Auth) and two external book-metadata APIs.

## Commands

```bash
npm run dev              # start Vite dev server (http://localhost:5173)
npm run build             # tsc typecheck + vite build
npm run lint               # eslint . --ext ts,tsx (zero warnings allowed)
npm run preview            # preview production build

npm run test                # vitest (watch mode)
npm run test:ui             # vitest with UI
npm run test:coverage       # vitest run --coverage (thresholds: 80% lines/functions/statements, 70% branches)

npm run test:e2e            # playwright test (auto-starts dev server on :5173)
npm run test:e2e:ui         # playwright UI mode
npm run test:e2e:debug      # playwright debug mode
npm run test:e2e:report     # open last html report
```

Run a single unit test file: `npx vitest run src/components/ui/button.test.tsx`. Run a single Playwright spec: `npx playwright test tests/auth.spec.tsx`.

Required env vars (`.env`, not committed): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `VITE_GOOGLE_BOOKS_API_KEY`. The ISBNDB key is NOT a frontend var — it lives as the `ISBNDB_API_KEY` secret of the `isbndb` Edge Function (`supabase/functions/isbndb`), which proxies all ISBNDB calls so the paid key never ships in the bundle.

> Note: neither CI workflow depends on real secrets for these vars anymore. `vite.config.ts` sets fake values for all three via `test.env` (used by `vitest.yml`), and `.github/workflows/playwright.yml` sets fake values directly as step `env:` for the `npm run dev` server Playwright's `webServer` spins up — `src/lib/supabase.ts` calls `createClient()` at module load and throws if these are missing, which previously made the whole app fail to render in the Playwright pipeline (surfaced as the `warmup.setup.ts` step timing out waiting for the login page). Real network calls in tests are intercepted via mocks (`vi.mock`/`page.route`), so fake values are sufficient — no GitHub secrets required for either pipeline.

## Architecture

**Stack:** React 19 + TypeScript, Vite 7 (SWC plugin), Tailwind CSS v4, shadcn/ui ("new-york" style, Radix via the unified `radix-ui` package), React Router v7 (data router / loaders), TanStack Query v5, Supabase JS v2, Zustand, React Hook Form + Zod.

**Path alias:** `@/*` → `src/*` (configured in `vite.config.ts` and both `tsconfig.*.json`).

### Routing and app shell

All routes are declared in one place, `src/main.tsx`, via `createBrowserRouter` (not colocated with features). `App.tsx` is the root layout (`Layout` wrapper + `<Outlet />` + `Toaster`). Protected routes attach `loader: protectedLoader` (`src/routes/ProtectedRoute.tsx`), which checks `supabase.auth.getSession()` and redirects to `/login` if absent — this is the only route-guarding mechanism (no wrapper component). Route paths are Portuguese (`/clubes`, `/meus-clubes`, `/livros`, `/perfil`).

`QueryClientProvider` wraps the router in `main.tsx` with global defaults: `staleTime: 5min`, `gcTime: 10min`, `retry: 2`, `refetchOnWindowFocus: false`.

### Feature-based structure

Code lives under `src/features/<feature>/`, each feature composing a subset of: `pages/`, `components/`, `hooks/`, `services/`, `api/`, `types/` or `dtos.ts`, `model/` (zod schemas + types), `store/` (Zustand), `steps/` (wizard steps). Not every feature has every subfolder — treat this as convention, not a required scaffold.

- `features/auth` — login/signup pages, `useAuth`/`useLogin` hooks, and a nested `signUp/` sub-module (its own `context/`, `hooks/`, `model/`, `steps/`, `storage/`) implementing the multi-step signup wizard.
- `features/books` — book search/detail/registration; two external data sources (Google Books API and ISBNDB) normalized into a shared `Book` type via `services/mapGoogleBook.ts` / `mapIsbndb.ts`.
- `features/clubs` — club listing, detail, and a multi-step "create club" wizard driven by Zustand (`store/useCreateClubStore.ts`) rather than the Context+localStorage pattern used by signup.
- `features/profile` — profile view/edit, genre preferences.
- `features/chat` — placeholder, currently empty.

Cross-feature imports happen directly via `@/features/<x>/...` (e.g. signup wizard types import `Book` from `@/features/books/types/book`) — there's no shared/public API boundary between features.

Shared, non-feature code lives in `src/components/` (page-agnostic UI like `MenuBar`, `layoutWrapper`, `SearchInput`), `src/components/ui/` (shadcn primitives — regenerate/add via `npx shadcn add <component>`, config in `components.json`), `src/hooks/`, and `src/lib/` (`supabase.ts` client, `utils.ts` with the shadcn `cn()` helper).

### State management — three patterns in use, by concern

- **Server/remote state:** TanStack Query. Query hooks are colocated under each feature's `hooks/` (e.g. `useListClubs`, `useSearchBooks`, `useSaveProfileGenres`), calling either a `supabase.from(...)`/`supabase.rpc(...)` call or a `services/`/`api/` function directly inside `queryFn`/`mutationFn`.
- **Multi-step wizard state:** two different implementations exist for the same kind of problem — signup uses React Context + a custom hook (`useSignUpWizard`) persisted to `localStorage` (`storage/signUpStorage.ts`); club creation uses a Zustand store (`useCreateClubStore`) with no persistence. Match whichever pattern the wizard you're editing already uses; don't mix them.
- **Local/UI state:** plain `useState` inside hooks/components.

### Data layer

Supabase is the backend: Postgres tables/RPCs plus Auth. Domain types and DB-facing fields are largely **Portuguese and snake_case** (`Club.nome`, `descricao`, `privacidade`, `estado_sigla`, RPC params like `p_privacidade`), while book-related types sourced from external APIs are **English and mixed case** (`Book.info.title`, `BookTemp.title_pt`). Don't normalize one into the other without checking which system (Supabase schema vs. external API) actually owns the field.

Book metadata comes from two external, unauthenticated-by-key REST APIs called directly with `fetch` (no client wrapper): Google Books (`features/books/api/googleBooks.ts`) and ISBNDB (`features/books/api/isbndb.ts`). Raw API responses are mapped into the internal `Book`/`BookTemp` shape via `services/mapGoogleBook.ts` and `services/mapIsbndb.ts` before use.

### Mock data

`src/mocks/` (`books.tsx`, `clubes.tsx`, `clubsSummary.tsx`, `profile.tsx`) holds static fixture data and is actively imported by real pages (club/book listing and detail pages, profile page) — this is not test-only fixture data, it's load-bearing for parts of the UI that aren't yet wired to live Supabase/API data. When working on a page that imports from `mocks/`, check whether the intent is to keep using the mock or to wire it to a real query.

### Styling

Tailwind v4 with no `tailwind.config.js` — theme tokens (colors, font, radii) are defined via `@theme` in `src/index.css`. Brand colors: `primary` `#8c11dc`, `secondary` `#470d9d`. shadcn/ui component config (`components.json`): style `new-york`, base color `slate`, icon library `lucide-react`, CSS variables enabled, no class prefix.

### Testing

- Unit/component tests: Vitest + Testing Library, jsdom environment, global test APIs enabled (no need to import `describe`/`it`). Setup file `src/test/setup.ts` runs `cleanup()` after each test. Tests are colocated as `*.test.tsx` next to the source file (currently only `src/components/ui/button.test.tsx` — most features have no unit tests yet).
- E2E tests: Playwright, specs in `tests/*.spec.tsx` (own `tests/tsconfig.json`), run against `npm run dev` on port 5173. Two projects: Desktop Chrome and Mobile Safari (iPhone 13). Video capture is always on.
- Vitest's `exclude` config explicitly skips `tests/**` and `*.spec.ts`, so unit and e2e suites never collide.
