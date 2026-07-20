# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Livrea is a social reading / book-club web app (Portuguese-language product, "clubes de leitura"). Users sign up, pick genres and books they've read, join or create reading clubs, track reads, review books, chat in club chats and follow each other. Frontend-only SPA (installable PWA with web push, via vite-plugin-pwa) backed by Supabase (Postgres + Auth + Storage + Edge Functions) and two external book-metadata APIs.

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

All routes are declared in one place, `src/main.tsx`, via `createBrowserRouter` (not colocated with features), nested under two pathless layout routes from `src/components/LayoutWrapper.tsx`: `AuthLayout` (visitor shell, no MenuBar) and `AppLayout` (logged-in shell with MenuBar) — adding a route means picking the right layout parent, never editing a pathname list. `App.tsx` is the root element (scroll reset + `<Outlet />` + `Toaster`). All pages except Home/Login are code-split via the data router's `lazy` route property. Protected routes attach `loader: protectedLoader` (`src/routes/guards.ts`), which checks `supabase.auth.getSession()` and redirects to `/login` if absent — this is the only route-guarding mechanism (no wrapper component). Route paths are Portuguese (`/clubes`, `/meus-clubes`, `/livros`, `/perfil`).

`QueryClientProvider` wraps the router in `main.tsx` with global defaults: `staleTime: 5min`, `gcTime: 10min`, `retry: 2`, `refetchOnWindowFocus: false`.

### Feature-based structure

Code lives under `src/features/<feature>/`, each feature composing a subset of: `pages/`, `components/`, `hooks/`, `services/`, `api/`, `types/` or `dtos.ts`, `model/` (zod schemas + types), `store/` (Zustand), `steps/` (wizard steps). Not every feature has every subfolder — treat this as convention, not a required scaffold.

- `features/auth` — login/signup/password-reset pages and a nested `signUp/` sub-module (its own `hooks/`, `model/`, `steps/`, `store/`) implementing the multi-step signup wizard, including a Google OAuth variant (`GoogleFirstStep`).
- `features/books` — book search/detail/reading registration (progress logs, highlights, review); two external data sources (Google Books API and ISBNDB) normalized into a shared `Book` type via `services/mapGoogleBook.ts` / `mapIsbndb.ts`.
- `features/clubs` — club listing/detail/settings, join requests, members, club readings (readers/highlights/reviews sections), meetings, and a multi-step "create club" wizard (`store/useCreateClubStore.ts`).
- `features/profile` — profile view/edit, genre preferences, follows, customizable header color.
- `features/chat` — member-only club chat with progress-aware spoiler blur; polls via TanStack Query `refetchInterval` (no realtime, on purpose).
- `features/notifications` — in-app notification center (`/notificacoes`) + web-push opt-in; unread badge derives from the same `["notifications"]` query.

**Feature boundaries (enforced by ESLint):** from inside `src/features/`, another feature may only be imported through its public API — `@/features/<name>`, backed by that feature's `index.ts`. Deep imports (`@/features/books/hooks/...`) fail `npm run lint` (`no-restricted-imports` in `eslint.config.js`). To expose something new cross-feature, re-export it from the feature's `index.ts`. Pages are deliberately NOT in any index — only `src/main.tsx` imports them (directly, for per-route code splitting). Unit tests must mock the barrel too: `vi.mock("@/features/<name>")` (auto-mock) or the `importOriginal` spread pattern when only some exports should be mocked (see `searchClubReadingBooks.test.ts`).

Naming conventions going forward: prefer `model/` for zod schemas + domain types in new features (`types/` and `dtos.ts` exist in older features — don't churn them, but don't add a fourth variant); a helper used by 2+ features belongs in `src/lib/`, not in a feature's `utils/`.

Shared, non-feature code lives in `src/components/layout/` (app shell: `MenuBar`, `LayoutWrapper` with the AuthLayout/AppLayout route layouts), `src/components/shared/` (page-agnostic widgets: `SearchInput`, `UserAvatar`, `AvatarPicker`, `LocationFields`, `ConfirmDialog`...), `src/components/ui/` (shadcn primitives — regenerate/add via `npx shadcn add <component>`, config in `components.json`), `src/hooks/`, and `src/lib/` (`supabase.ts` client, `dates.ts`, `imageUpload.ts`, `utils.ts` with the shadcn `cn()` helper).

### State management — three patterns in use, by concern

- **Server/remote state:** TanStack Query. Query hooks are colocated under each feature's `hooks/` (e.g. `useListClubs`, `useSearchBooks`, `useSaveProfileGenres`), calling either a `supabase.from(...)`/`supabase.rpc(...)` call or a `services/`/`api/` function directly inside `queryFn`/`mutationFn`.
- **Multi-step wizard state:** Zustand stores — signup uses `useSignUpWizardStore` (persisted to `localStorage` via the `persist` middleware; `partialize` deliberately strips `account.password` so the plaintext password never hits storage — keep it that way), club creation uses `useCreateClubStore` (no persistence).
- **Local/UI state:** plain `useState` inside hooks/components.

### Data layer

Supabase is the backend: Postgres tables/RPCs plus Auth and Storage (public buckets `avatars`, `club-covers`). The DB schema is **English snake_case** (`clubs.name`, `visibility`, `city_id`; RPC params prefixed `p_*`). Most reads/writes go through **SECURITY DEFINER RPCs** called with `supabase.rpc("name", { p_param })`, with authorization checks (membership/admin) inside the SQL function, not in the client. Service modules group RPCs by aggregate (e.g. `clubs/services/clubs.ts`, `clubMembers.ts`, `joinRequests.ts`, `clubReadings.ts`, `meetings.ts`) — add a new RPC call to the aggregate it belongs to, not a new one-function file. Service test files remain granular (named after the function under test) and mock `@/lib/supabase`, not the service module. SQL scripts live temporarily in `supabase/sql/` (they're run manually in the SQL Editor and deleted after applying — the folder holds only pending scripts, it's not history). Server-side code lives in `supabase/functions/` (Deno Edge Functions): `send-push` (web-push notifications, validates everything against the DB via service role) and `isbndb` (authenticated proxy that holds the paid ISBNDB key as a secret).

Book metadata comes from two external sources normalized into the internal `Book`/`BookTemp` shape via `services/mapGoogleBook.ts` / `mapIsbndb.ts`: Google Books (`features/books/api/googleBooks.ts`, direct `fetch`, browser API key) and ISBNDB (`features/books/api/isbndb.ts`, via `supabase.functions.invoke("isbndb")` — never call api2.isbndb.com directly from the frontend). Book-related types are English/mixed case (`Book.info.title`, `BookTemp.title_pt`).

### Styling

Tailwind v4 with no `tailwind.config.js` — theme tokens (colors, font, radii) are defined via `@theme` in `src/index.css`. Brand colors: `primary` `#8c11dc`, `secondary` `#470d9d`. shadcn/ui component config (`components.json`): style `new-york`, base color `slate`, icon library `lucide-react`, CSS variables enabled, no class prefix.

### Testing

- Unit/component tests: Vitest + Testing Library, jsdom environment, global test APIs enabled (no need to import `describe`/`it`). Setup file `src/test/setup.ts` runs `cleanup()` after each test. Tests are colocated as `*.test.ts(x)` next to the source file — coverage is broad (100+ test files; services and hooks are expected to ship with tests).
- E2E tests: Playwright, specs in `tests/*.spec.tsx` (own `tests/tsconfig.json`), run against `npm run dev` on port 5173, with all network mocked via `page.route` (Supabase REST/RPC/auth and the book APIs). Two projects: Desktop Chrome and Mobile Safari (iPhone 13). Video capture is always on.
- Vitest's `exclude` config explicitly skips `tests/**` and `*.spec.ts`, so unit and e2e suites never collide.
