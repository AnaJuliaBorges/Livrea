# Arquitetura & Funcionalidades — Livrea

Documentação geral de como o projeto funciona: o que cada funcionalidade faz e
quais arquivos ela toca. Para o backend (tabelas, RPCs e Edge Functions), veja
[SUPABASE.md](./SUPABASE.md).

> Livrea é um app de clubes de leitura (PWA, pt-BR). O usuário se cadastra,
> escolhe gêneros e livros que já leu, entra/cria clubes, acompanha leituras,
> avalia livros, conversa no chat do clube e segue outros leitores.

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| UI | React 19 + TypeScript, Vite 7 (SWC) |
| Estilo | Tailwind CSS v4 (tokens via `@theme` em `src/index.css`), shadcn/ui ("new-york") |
| Rotas | React Router v7 (data router: loaders + `lazy`) |
| Estado servidor | TanStack Query v5 |
| Estado wizard | Zustand |
| Formulários | React Hook Form + Zod |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| APIs externas | Google Books, ISBNDB (via Edge Function proxy) |
| PWA/Push | vite-plugin-pwa + Web Push |

**Alias de path:** `@/*` → `src/*`.

---

## 2. Estrutura de pastas

```
src/
├── main.tsx              # router (createBrowserRouter) + QueryClientProvider
├── App.tsx               # elemento raiz: ScrollToTop + <Outlet /> + Toaster + Analytics
├── index.css             # tokens do tema (@theme) e escala tipográfica desktop
├── routes/guards.ts      # protectedLoader / publicOnlyLoader
├── components/
│   ├── layout/           # shell do app: MenuBar, LayoutWrapper (AuthLayout/AppLayout),
│   │                     #   RouteError (errorElement da raiz)
│   ├── shared/           # widgets genéricos: UserAvatar, AvatarPicker, LocationFields,
│   │                     #   SearchInput, ConfirmDialog, BackButton, Tag, SafeHtml...
│   └── ui/               # primitivas shadcn (button, input, select, tabs, carousel...)
├── hooks/                # hooks não-feature (useLocations: estados/cidades)
├── lib/                  # supabase.ts, queryClient.ts, sentry.ts, reportError.ts,
│                         #   dates.ts, imageUpload.ts, headerColors.ts, push.ts, utils.ts
└── features/
    ├── auth/             # login, cadastro (wizard), recuperação de senha
    ├── books/            # busca/detalhe/registro de leitura de livros
    ├── clubs/            # clubes: lista, detalhe, config, leituras, encontros
    ├── chat/             # chat do clube
    ├── profile/          # perfil, seguir, preferências
    └── notifications/    # central de notificações + opt-in de push
```

Cada feature compõe um subconjunto de `pages/`, `components/`, `hooks/`,
`services/`, `api/`, `model/` ou `types/`/`dtos.ts`, `store/`, `steps/`.

### Fronteira entre features (validada por ESLint)

De dentro de `src/features/`, outra feature só pode ser importada pela **API
pública** dela: `@/features/<nome>` (o `index.ts`). Import profundo
(`@/features/books/hooks/...`) **falha no lint** (`no-restricted-imports`). As
páginas ficam de fora dos barrels de propósito — só o `main.tsx` as importa,
direto, para o code splitting por rota.

---

## 3. Rotas e shell

Todas as rotas vivem em [`src/main.tsx`](../src/main.tsx), aninhadas em dois
layouts pathless de [`components/layout/LayoutWrapper.tsx`](../src/components/layout/LayoutWrapper.tsx):

- **`AuthLayout`** — shell do visitante, **sem** MenuBar.
- **`AppLayout`** — shell logado, **com** MenuBar (rodapé no mobile, topo no desktop).

Adicionar uma rota = escolher o layout pai; não existe mais lista de pathnames
duplicada. Rotas protegidas usam `loader: protectedLoader`
([`routes/guards.ts`](../src/routes/guards.ts)), que checa
`supabase.auth.getSession()` e redireciona pra `/login`. Todas as páginas exceto
Home/Login usam `lazy` (code splitting por rota).

| Rota | Página | Layout |
|---|---|---|
| `/` | Home | Auth |
| `/login`, `/cadastrar` | Login, Signup wizard | Auth |
| `/recuperar-senha`, `/redefinir-senha` | Forgot/Reset password | Auth |
| `/clubes`, `/clubes/:id` | ListClubs, ClubDetails | App |
| `/clubes/:id/configuracoes`, `/clubes/:id/chat` | ClubSettings, ClubChat | App |
| `/meus-clubes`, `/meus-clubes/criar` | MyClubs, CreateClub | App |
| `/livros`, `/livros/:id`, `/livros/:id/registro` | ListBooks, BookDetail, RegisterRead | App |
| `/perfil`, `/perfil/:id`, `/perfil/editar` | Profile, EditProfile | App |
| `/notificacoes` | Notifications | App |

`QueryClient` global: `staleTime` 5min, `gcTime` 10min, `retry` 2,
`refetchOnWindowFocus` false.

---

## 4. Gestão de estado (3 padrões, por natureza)

- **Estado remoto** → TanStack Query. Hooks colocados em `features/*/hooks/`,
  chamando um `services/` ou `api/` dentro de `queryFn`/`mutationFn`. Mutations
  invalidam as query keys afetadas.
- **Wizards multi-step** → Zustand. `useSignUpWizardStore` (persistido em
  localStorage; a senha é removida do `partialize`) e `useCreateClubStore` (sem
  persistência).
- **Estado local de UI** → `useState`.

Query keys principais: `["club", id]`, `["clubs", ...filtros]`,
`["club-members", id]`, `["club-messages", id]`, `["club-reading-readers", id, bookId]`,
`["book", id]`, `["reading-tracking", bookId]`, `["user-book-status", bookId]`,
`["my-profile"]`, `["follow-info", userId]`, `["notifications"]`, `["isbndb", ...]`.

---

## 5. Funcionalidades (o que faz + arquivos que toca)

Cada funcionalidade segue a cadeia **página → hook → service → Supabase**. As
RPCs citadas estão detalhadas em [SUPABASE.md](./SUPABASE.md).

### 5.1 Autenticação e cadastro — `features/auth`

- **Login / OAuth Google** — [`pages/LoginPage.tsx`](../src/features/auth/pages/LoginPage.tsx),
  [`pages/Home.tsx`](../src/features/auth/pages/Home.tsx), `hooks/useLogin.ts`,
  `hooks/useAuthRedirect.ts`, `services/signInWithGoogle.ts`.
- **Recuperação de senha** — `pages/ForgotPasswordPage.tsx`,
  `pages/ResetPasswordPage.tsx`, `services/passwordReset.ts`.
- **Wizard de cadastro (4 passos)** — [`pages/SignUpPage.tsx`](../src/features/auth/pages/SignUpPage.tsx)
  + `signUp/`:
  - `store/useSignUpWizardStore.ts` — estado do wizard (Zustand + persist; **senha
    nunca vai pro localStorage**).
  - `steps/FirstStep.tsx` (dados + foto + localização) / `GoogleFirstStep.tsx`
    (completa perfil pós-OAuth), `SecondStep.tsx` (gêneros), `Third`/`Fourth`
    (livros lidos / quero ler).
  - `hooks/useSignUp.ts` — orquestra `supabase.auth.signUp`, update de `profiles`,
    `save_user_books`, upload de avatar.
  - Reusa `AvatarPicker` e `LocationFields` de `components/shared/`.

### 5.2 Livros — `features/books`

- **Recomendações + busca** — [`pages/ListBooks.tsx`](../src/features/books/pages/ListBooks.tsx).
  Sem busca: recomenda por gênero (banco via `useBooksByGenres` + ISBNDB via
  `useSearchBooks`, deduplicado por ISBN). Com busca: texto debounced. Livro
  externo clicado vira registro mínimo (`useUpsertBook` → `upsert_book`) e navega.
- **Detalhe do livro** — [`pages/BookDetail.tsx`](../src/features/books/pages/BookDetail.tsx):
  `useBook` (`get_book`, com enriquecimento ISBNDB síncrono e Google em 2º plano),
  `useUserBookStatus`/`useSetUserBookStatus` (status na biblioteca), `useReadingTracking`,
  `useBookReviews` (`get_book_reviews`). Sinopse sanitizada via `SafeHtml` (DOMPurify).
- **Registro de leitura** — [`pages/RegisterRead.tsx`](../src/features/books/pages/RegisterRead.tsx)
  com abas: `RegisterReadHistory` (progresso + anotação + sentimento →
  `reading_logs`), `RegisterReadHighlights` (`book_highlights`), `RegisterReadReview`.
  Serviço: `services/readingTracking.ts` (acesso direto a `user_library`,
  `reading_logs`, `book_highlights`).
- **Fontes externas** — `api/googleBooks.ts` (fetch direto, chave no browser),
  `api/isbndb.ts` (via Edge Function `isbndb`), normalizadas por
  `services/mapGoogleBook.ts` / `mapIsbndb.ts` no tipo `Book`/`BookTemp`.

### 5.3 Clubes — `features/clubs`

- **Listagem geral** — [`pages/ListClubs.tsx`](../src/features/clubs/pages/ListClubs.tsx):
  `useListClubs` (`list_clubs`), agrupado por proximidade (cidade > estado >
  online > outros), carrossel de recomendados por gênero, filtros
  (`utils/clubListFilters.ts`), busca sem acento.
- **Meus clubes** — `pages/MyClubs.tsx` (`useListClubs({ onlyMine })`).
- **Detalhe do clube** — [`pages/ClubDetails.tsx`](../src/features/clubs/pages/ClubDetails.tsx):
  `useClub` (`get_club`), pedir para entrar (`useRequestToJoinClub`), sair
  (`useLeaveClub`), compartilhar link, ir pro chat. Abas:
  - **Overview** — `components/OverviewSection.tsx`: sobre + próximo encontro
    (confirmar/cancelar presença, agendar via admin).
  - **Participantes** — `components/MemberSection.tsx`: `useClubMembers`,
    pedidos pendentes (`useJoinRequests` + `useReviewJoinRequest`), gestão de
    cargo (`useClubMemberRole`).
  - **Leitura** — `components/reading/ReadingSection.tsx`: leitura atual,
    definir leitura (`SetClubReadingModal` → `search_books` + `useSetClubReading`),
    Leitores (`useClubReadingReaders`), Resenhas (`useClubBookReviews`),
    Destaques (`useClubBookHighlights` + agrupamento em `utils/groupHighlights.ts`),
    nota do clube (`BookRatingBox` → `useClubBookRating`).
- **Configurações (admin)** — `pages/ClubSettings.tsx`: `useUpdateClub`,
  `useDeleteClub`, `useSetClubHeaderColor`, `useGenres`.
- **Criar clube** — `pages/CreateClub.tsx` (wizard 4 passos, `store/useCreateClubStore.ts`,
  `steps/`, `useCreateClub` → `create_club`, capa via `uploadClubCover`).
- **Encontros** — `useUpsertNextMeeting`, `useMeetingAttendance`
  (`MeetingAttendanceModal`), `useConfirmMeetingAttendance`, `useCancelMeetingAttendance`.
- **Services** agrupados por agregado: `services/clubs.ts`, `clubMembers.ts`,
  `joinRequests.ts`, `clubReadings.ts`, `meetings.ts`.

### 5.4 Chat do clube — `features/chat`

- [`pages/ClubChat.tsx`](../src/features/chat/pages/ClubChat.tsx): só participante
  acessa; mensagens agrupadas por dia; **polling de 2s** via `refetchInterval`
  (sem realtime, de propósito). `hooks/useClubChat.ts` (`useClubMessages` →
  `get_club_messages`, `useSendClubMessage` → `send_club_message`).
- **Spoiler ciente de progresso** — `components/MessageBubble.tsx`: mensagem
  marcada como spoiler chega borrada; só é revelada automaticamente se o leitor
  já passou do ponto de leitura do autor (calculado pela RPC). Notificação de
  mensagem é fire-and-forget (`services/sendChatPushNotification.ts`).

### 5.5 Perfil e social — `features/profile`

- **Perfil (próprio ou de terceiro)** — [`pages/Profile.tsx`](../src/features/profile/pages/Profile.tsx):
  `useMyProfile` (`get_my_profile`) ou `useUserProfile` (`get_user_profile`),
  seguir/deixar de seguir (`useFollowInfo`/`useFollowUser`/`useUnfollowUser`),
  cor do cabeçalho (`useProfileHeaderColor`), sino com badge de não-lidas
  (`useUnreadNotificationsCount`). Abas: clubes e biblioteca (lido/lendo/quero ler).
- **Editar perfil** — `pages/EditProfile.tsx`: `useUpdateProfile`, upload de avatar
  (`services/uploadAvatar.ts`), seletor de cor, gêneros favoritos, trocar
  email/senha via Supabase Auth.
- **Seguir** — `services/follows.ts` (acesso direto à tabela `follows`),
  push de novo seguidor (`services/sendFollowPushNotification.ts`).

### 5.6 Notificações — `features/notifications`

- [`pages/Notifications.tsx`](../src/features/notifications/pages/Notifications.tsx):
  `useNotifications` (tabela `notifications`), abrir a tela marca tudo como lido
  (`useMarkAllNotificationsRead`), opt-in de web push (`lib/push.ts`), clique
  navega pra `notification.url`.
- O badge de não-lidas no perfil deriva da mesma query `["notifications"]`.

---

## 6. Temas transversais

### Auth & proteção de rota
Só `routes/guards.ts` (loaders). Sem componente wrapper. `App.tsx` re-inscreve o
push silenciosamente para quem já concedeu permissão.

### Storage (buckets públicos)
`avatars/{user_id}/avatar.{ext}` e `club-covers/{user_id}/{timestamp}.{ext}`.
Uploads validam MIME contra whitelist jpg/png/webp e derivam a extensão do MIME
validado, não do nome do arquivo ([`lib/imageUpload.ts`](../src/lib/imageUpload.ts)).

### PWA & Web Push
vite-plugin-pwa (generateSW, autoUpdate). Handlers de push em `public/push-sw.js`.
Inscrição em `lib/push.ts` (tabela `push_subscriptions`). Envio pela Edge Function
`send-push`. Push só funciona em produção (HTTPS) e, no iOS, com o PWA instalado.

### Cor de cabeçalho
Paleta em [`lib/headerColors.ts`](../src/lib/headerColors.ts) (6 chaves →
gradientes Tailwind). Usada em Profile, BookDetail, ClubDetails, ClubChat.
No desktop os gradientes são removidos (`md:bg-none`).

### Observabilidade
- **Tráfego e performance**: `@vercel/analytics` + `@vercel/speed-insights`,
  montados em `App.tsx` (pageviews e Web Vitals).
- **Erros**: Sentry (`@sentry/react`). O setup do SDK vive em
  [`lib/sentry.ts`](../src/lib/sentry.ts) (`initSentry()`, chamado no topo de
  `main.tsx`) e [`lib/reportError.ts`](../src/lib/reportError.ts) é o adapter —
  os call sites falam `{ source, detail }` e não conhecem o SDK, então trocar de
  serviço de erro é mexer só nesse arquivo. `source` vira tag (filtra
  query/mutation/route no Sentry), `detail` vira extra. Chega nele por dois
  caminhos:
  - `QueryCache`/`MutationCache` de
    [`lib/queryClient.ts`](../src/lib/queryClient.ts), que pegam **toda** falha de
    query/mutation, inclusive as que a tela ignora. Só reportam, não notificam —
    as mutations já dão `toast.error` no próprio call site e um toast global
    duplicaria a mensagem.
  - [`components/layout/RouteError.tsx`](../src/components/layout/RouteError.tsx),
    `errorElement` da rota raiz: erro de render, falha de loader e 404 (rota que
    não casa com nenhum path). Chunk de versão antiga (import dinâmico falhando
    após deploy) e 404 são esperados e **não** são reportados.
- Os `console.error` espalhados nas telas continuam onde estão; migrá-los para
  `reportError` é um passo separado.

Decisões do setup do Sentry, todas em `lib/sentry.ts`:
- `initSentry()` só faz algo com `VITE_SENTRY_DSN` **e** em produção
  (`import.meta.env.PROD`) — em dev/CI/testes ele retorna antes do `Sentry.init`.
  Não é só pra não queimar quota: com o DSN presente no `.env`, o Vite dev servia
  o SDK e o Replay sem bundle e engordava o grafo de módulos de todo page load.
  O efeito era medível no e2e — a suíte caiu de 9,4 min para 5,8 min e as falhas
  intermitentes de timeout no WebKit sumiram. Consequência aceita: não dá pra
  testar o Sentry rodando `npm run dev`; é preciso um build de produção.
- `Sentry.setUser({ id })` no `onAuthStateChange` do Supabase: só o id, nunca
  e-mail ou nome. Sem isso todo evento chega anônimo e não dá pra dizer quantas
  pessoas um erro afetou.
- Sem tracing de performance: isso já vem do `@vercel/speed-insights`, e ligar os
  dois duplicaria o dado gastando quota.
- Session Replay ligado (10% das sessões, 100% das com erro), com os defaults de
  privacidade (`maskAllText`, `blockAllMedia`) — grava o fluxo, não o conteúdo do
  chat nem os dados de perfil.
- Falha de rede é descartada no `beforeSend`: usuário sem sinal não é bug da
  aplicação e dominaria o volume. O filtro mora no `init`, não em `reportError`,
  pra valer também pros erros que o SDK captura sozinho.
- **Source maps**: [`vite.config.ts`](../vite.config.ts) roda o
  `@sentry/vite-plugin` e emite `.map` **apenas** quando `SENTRY_AUTH_TOKEN`
  existe (env var de *build*, nunca `VITE_*` — iria pro bundle). Depois do upload
  os `.map` são apagados do `dist`, pra não ficarem servidos publicamente — o do
  service worker é desligado à parte (`workbox.sourcemap: false`), porque o SW é
  gerado depois dessa limpeza. Sem o token o build local é idêntico ao de antes.
- **Falha de upload não quebra o deploy.** Por padrão o `@sentry/vite-plugin`
  aborta o build quando o upload falha (verificado: token inválido → `exit 255`),
  o que na Vercel significa *deploy barrado por causa de source map* — token
  expirado ou Sentry fora do ar impediriam de publicar. O `errorHandler` no
  `vite.config.ts` rebaixa isso a um `console.warn`: ferramenta de
  observabilidade não deve bloquear release.
  O trade-off é real e foi escolhido de propósito: **a falha passa a ser
  silenciosa**. Se as stacks voltarem minificadas no Sentry, o lugar de
  investigar é o log do build na Vercel (procurar por `[sentry]`). Para inverter
  a decisão — falhar alto e nunca deixar passar despercebido — basta remover o
  `errorHandler`; o padrão do plugin volta a valer.
- **DSN na Vercel**: a integração Sentry↔Vercel cadastra o DSN como `SENTRY_DSN`,
  que o Vite não injeta no bundle (só expõe `VITE_*`). O `vite.config.ts` mapeia
  essa var — e **só** ela — para `VITE_SENTRY_DSN` via `define`. Não usar
  `envPrefix: ["VITE_", "SENTRY_"]` para resolver isso: exporia junto o
  `SENTRY_AUTH_TOKEN` no bundle público. Localmente o `VITE_SENTRY_DSN` do `.env`
  tem precedência e o `define` nem entra.

---

## 7. Testes

- **Unit/componente** — Vitest + Testing Library (jsdom), colocados como
  `*.test.ts(x)`. Services mockam `@/lib/supabase`; um `*.test.ts` por módulo de
  service agregado. 500+ testes.
- **E2E** — Playwright em `tests/*.spec.tsx`, toda a rede mockada via `page.route`
  (Supabase REST/RPC/auth + APIs de livro). Projetos: Desktop Chrome e Mobile
  Safari. Specs: auth, books, clubs, profile, chat, notifications, password-reset.
- **CI** — `.github/workflows/`: `vitest.yml` (unit + coverage), `playwright.yml`
  (e2e), `quality.yml` (lint + typecheck).

---

## 8. Comandos

```bash
npm run dev          # dev server (:5173)
npm run build        # tsc -b + vite build
npm run typecheck    # tsc -b
npm run lint         # eslint (zero warnings)
npm run test         # vitest (watch)
npm run test:coverage
npm run test:e2e     # playwright
```

Variáveis de ambiente (`.env`, não commitado): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `VITE_GOOGLE_BOOKS_API_KEY`. A chave da
ISBNDB **não** é var de frontend — vive como secret da Edge Function `isbndb`.
