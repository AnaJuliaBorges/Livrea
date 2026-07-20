# Backend Supabase — Livrea

Documentação do backend: tabelas, funções (RPCs), Edge Functions e Storage —
**como cada função funciona e onde é usada no projeto**. Para a arquitetura do
frontend, veja [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Convenções e fluxo de trabalho

- O schema é **inglês, snake_case** (`clubs.name`, `visibility`, `city_id`).
  Parâmetros de RPC têm prefixo **`p_*`**.
- Quase toda leitura/escrita passa por **RPCs `SECURITY DEFINER`**, chamadas com
  `supabase.rpc("nome", { p_param })`. A **autorização** (é membro? é admin? é
  dono?) vive **dentro da função SQL**, não no cliente — o frontend não é
  confiável.
- **Cadeia de uso:** cada RPC é chamada por um `service` → consumido por um
  `hook` (TanStack Query) → usado numa `page`/`component`. As três colunas
  "Service / Hook / Usado em" abaixo seguem essa cadeia.
- **Scripts SQL** ficam temporariamente em `supabase/sql/` e são **apagados após
  aplicados** no SQL Editor — a pasta guarda só os pendentes, não é histórico. O
  único versionado hoje é
  [`club_chat_spoiler_progress.sql`](../supabase/sql/club_chat_spoiler_progress.sql),
  a melhor referência de estilo (SECURITY DEFINER, `search_path` fixo, checagem
  de participação dentro da função).
- Código server-side versionado vive em `supabase/functions/` (Edge Functions Deno).

---

## 2. Tabelas

### Domínio de clubes
| Tabela | Colunas principais | Papel |
|---|---|---|
| `clubs` | id, name, description, rules, **visibility** (bool: true=público), city_id, frequency (enum), custom_frequency, type (enum), participant_limit, meeting_description, admin_id, cover_url, header_color, created_at | O clube |
| `club_members` | club_id, user_id, role (admin/member) | Participação (sem data de entrada) |
| `club_genres` | club_id, genre_id | Gêneros do clube |
| `club_join_requests` | id, club_id, user_id, status (pending/approved/rejected) | Pedidos para entrar |
| `club_readings` | id, club_id, book_id, status (enum reading_status), start_date, end_date, note | Leitura atual (`reading`) e histórico (`finished`) |
| `club_meetings` | id, club_id, **book_id (NOT NULL)**, location, status (enum), description, meeting_date, created_at | Encontros (sempre sobre um livro) |
| `meeting_attendance` | meeting_id, user_id | Presença = existência da linha |
| `club_messages` | id, club_id, user_id, content, is_spoiler, spoiler_progress, created_at | Chat (RLS sem policies de client; só via RPC) |

### Domínio de livros
| Tabela | Colunas principais | Papel |
|---|---|---|
| `books` | id, isbn (UNIQUE NOT NULL), title_original, title_pt, subtitle, authors, synopsis, publisher, total_pages, image_*, ratings, primary_genre, subjects | Catálogo (uma linha por edição/ISBN) |
| `book_genres` | book_id, genre_id | Gêneros do livro |
| `genres` | id, name, google_category | Gêneros (seed) |
| `user_library` | user_id, book_id, status (reading/read/want_to_read) | Biblioteca pessoal |
| `reading_logs` | id, user_id, book_id, current_page/pages_read, feeling, note, created_at | Registros de progresso |
| `book_highlights` | id, user_id, book_id, page, quote | Destaques/citações |

### Domínio de usuário e social
| Tabela | Colunas principais | Papel |
|---|---|---|
| `profiles` | id, name, bio, avatar_url, state_id, city_id, header_color | Perfil (trigger cria no signup) |
| `profile_genres` | user_id, genre_id | Gêneros favoritos |
| `follows` | follower_id, followed_id (PK composta) | Grafo de seguidores (SELECT público) |
| `notifications` | id, user_id, title, body, url, read, created_at | Central in-app (INSERT só service role) |
| `push_subscriptions` | id, user_id, endpoint, p256dh, auth | Inscrições de web push |

### Localização (seed IBGE)
| Tabela | Colunas |
|---|---|
| `states` | id, name, sigla |
| `cities` | id, state_id, name |

---

## 3. Edge Functions (`supabase/functions/`)

### `send-push` — notificações web push + histórico in-app
Recebe um evento, **valida tudo contra o banco via service role** (o payload
nunca é fonte de verdade), grava em `notifications` para todos os destinatários
e dispara o push. O JWT do chamador identifica quem disparou.

| Evento | Notifica | Validação | Disparado por |
|---|---|---|---|
| `join_request` | admins do clube | pedido pendente do chamador existe | `notifyClubJoinRequest` (após `request_to_join_club`) |
| `request_approved` | o aprovado | chamador é admin + alvo é membro | `notifyJoinRequestApproved` |
| `member_promoted` / `member_demoted` / `member_removed` | o alvo | chamador admin + estado do alvo | `sendClubPushNotification.ts` |
| `new_follower` | o seguido | linha em `follows` existe | `sendFollowPushNotification.ts` |
| `club_message` | demais membros | chamador é membro + mensagem recente dele (preview vem do banco, spoiler não vaza; anti-spam: quem tem notificação não-lida do chat não recebe outra) | `sendChatPushNotification.ts` |

Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

### `isbndb` — proxy autenticado da API ISBNDB
Guarda a chave paga da ISBNDB como secret (`ISBNDB_API_KEY`), fora do bundle.
Exige JWT (só usuário logado consome a cota). Ações no corpo POST:

| `action` | Endpoint upstream | Uso |
|---|---|---|
| `books` | `/books/{term}` | busca por texto |
| `subject` | `/subject/{term}` | busca por gênero |
| `book` | `/book/{isbn}` (404 → `{book:null}`) | livro único (mais completo) |

Chamado por `features/books/api/isbndb.ts` (`searchIsbndbByQuery`,
`searchIsbndbByGenre`, `getIsbndbBookByIsbn`).

---

## 4. Storage (buckets públicos)

| Bucket | Caminho | Origem |
|---|---|---|
| `avatars` | `{user_id}/avatar.{ext}` | `services/uploadAvatar.ts` (perfil, signup) |
| `club-covers` | `{user_id}/{timestamp}.{ext}` | `services/uploadClubCover.ts` (criar clube) |

Extensão derivada do **MIME validado** (jpg/png/webp), não do nome do arquivo
([`lib/imageUpload.ts`](../src/lib/imageUpload.ts)). Upsert com `upsert:true`
exige policy de SELECT em `storage.objects` além de INSERT/UPDATE.

---

## 5. Referência de RPCs

Todas `SECURITY DEFINER`. "Usado em" indica a página/componente final.

### 5.1 Clubes — CRUD e listagem  ·  `services/clubs.ts`

| RPC (params) | O que faz | Hook · Usado em |
|---|---|---|
| `create_club(p_name, p_description, p_rules, p_visibility, p_city_id, p_frequency, p_custom_frequency, p_type, p_participant_limit, p_meeting_description, p_genre_ids, p_cover_url)` | Cria o clube + gêneros + insere o criador como admin. Retorna `{id, name}`. | `useCreateClub` · CreateClub |
| `update_club(p_club_id, p_name, p_description, p_rules, p_meeting_description, p_genre_ids, p_city_id, p_type)` | Atualiza campos do clube; `null` = não alterar, `''` = limpar. **Admin-only.** | `useUpdateClub` · ClubSettings |
| `delete_club(p_club_id)` | Exclui o clube. **Admin/owner-only.** | `useDeleteClub` · ClubSettings |
| `get_club(p_club_id)` | Detalhe completo (header, overview, leitura atual/histórico, próximo encontro). Esconde `next_meeting` de não-membro de clube privado; resto visível pra convite por link. Retorna `null` só se id inexistente. | `useClub` · ClubDetails, ClubChat, ClubSettings |
| `list_clubs(p_only_mine, p_city_id, p_state_id, p_search, p_limit, p_offset)` | Públicos + clubes em que sou membro, ordenados por `match_group` (city > state > online > other) com base na cidade/estado do usuário. | `useListClubs` · ListClubs, MyClubs |
| `leave_club(p_club_id)` | Chamador sai do clube (e apaga pedido pendente). Dono não pode sair. | `useLeaveClub` · ClubDetails |
| `set_club_header_color(p_club_id, p_color)` | Define cor do cabeçalho (chave da paleta). **Admin-only.** | `useSetClubHeaderColor` · ClubSettings |

### 5.2 Participantes  ·  `services/clubMembers.ts`

| RPC (params) | O que faz | Hook · Usado em |
|---|---|---|
| `get_club_members(p_club_id)` | Lista membros (nome, avatar, is_admin, is_owner). | `useClubMembers` · MemberSection |
| `promote_club_member(p_club_id, p_user_id)` | Nomeia membro como admin. **Owner-only.** | `useClubMemberRole` · MemberSection |
| `demote_club_member(p_club_id, p_user_id)` | Rebaixa admin a membro. **Owner-only.** | `useClubMemberRole` · MemberSection |
| `remove_club_member(p_club_id, p_user_id)` | Remove membro. **Owner-only.** | `useClubMemberRole` · MemberSection |

### 5.3 Pedidos para entrar  ·  `services/joinRequests.ts`

| RPC (params) | O que faz | Hook · Usado em |
|---|---|---|
| `request_to_join_club(p_club_id)` | Público: entra direto. Privado: cria pedido pendente (idempotente, via upsert que volta a `pending`). | `useRequestToJoinClub` · ClubDetails |
| `get_pending_join_requests(p_club_id)` | Lista pedidos pendentes. **Admin-only** (vazio se não-admin). | `useJoinRequests` · MemberSection |
| `approve_join_request(p_request_id)` | Aprova → vira membro. | `useReviewJoinRequest` · MemberSection |
| `reject_join_request(p_request_id)` | Recusa o pedido. | `useReviewJoinRequest` · MemberSection |

### 5.4 Leituras do clube  ·  `services/clubReadings.ts`

| RPC (params) | O que faz | Hook · Usado em |
|---|---|---|
| `set_club_reading(p_club_id, p_book_id)` | Finaliza a leitura anterior (`finished` + end_date) e insere a nova. **Admin-only.** | `useSetClubReading` · SetClubReadingModal |
| `complete_club_reading(p_club_id)` | Fecha a leitura atual e o encontro agendado, sem exigir próximo livro. | `useCompleteClubReading` · ReadingSection |
| `delete_club_reading(p_club_id)` | Remove a leitura atual **sem** arquivar no histórico. | `useDeleteClubReading` · ReadingSection |
| `set_club_reading_note(p_reading_id, p_note)` | Nota do admin sobre a leitura; `''` limpa. **Admin-only.** | `useSetClubReadingNote` · PastReadingItem |
| `get_club_reading_readers(p_club_id, p_book_id)` | Progresso de cada membro (% da edição que ele lê). **De-para de edições equivalentes** por título+autores. Membro-only. | `useClubReadingReaders` · ReadersSection |
| `get_club_book_rating(p_club_id, p_book_id)` | Média das notas dos membros + minha nota (edição-aware). | `useClubBookRating` · BookRatingBox |
| `get_club_book_reviews(p_club_id, p_book_id)` | Resenhas dos membros (edição-aware). | `useClubBookReviews` · ReviewsSection |
| `get_club_book_highlights(p_club_id, p_book_id)` | Destaques crus (agrupamento por texto é no front, `utils/groupHighlights.ts`). | `useClubBookHighlights` · HighlightsSection |

> **De-para de edições** (`get_equivalent_editions`, funções auxiliares
> `strip_accents`/`normalize_book_title`/`normalize_book_author`): como `books`
> tem uma linha por ISBN, essas RPCs consideram equivalentes livros com título
> normalizado igual + ≥1 autor em comum, para que quem leu outra edição entre na
> média/leitores/resenhas.

### 5.5 Encontros  ·  `services/meetings.ts`

| RPC (params) | O que faz | Hook · Usado em |
|---|---|---|
| `upsert_next_meeting(p_club_id, p_location, p_meeting_date)` | Cria/atualiza o próximo encontro (vinculado ao livro da leitura atual; recusa sem leitura). **Admin-only.** | `useUpsertNextMeeting` · OverviewSection |
| `get_meeting_attendance(p_meeting_id)` | Lista membros e quem confirmou presença. | `useMeetingAttendance` · MeetingAttendanceModal |
| `confirm_meeting_attendance(p_meeting_id)` | Confirma presença (idempotente; valida que é membro). | `useConfirmMeetingAttendance` · OverviewSection |
| `cancel_meeting_attendance(p_meeting_id)` | Remove a confirmação. | `useCancelMeetingAttendance` · OverviewSection |

### 5.6 Chat  ·  `services/clubChat.ts`

| RPC (params) | O que faz | Hook · Usado em |
|---|---|---|
| `send_club_message(p_club_id, p_content, p_is_spoiler)` | Insere mensagem. **Member-only.** Se spoiler, grava snapshot da % de leitura do autor (`spoiler_progress`) via `get_member_reading_progress`. | `useSendClubMessage` · ClubChat |
| `get_club_messages(p_club_id, p_limit=100)` | Últimas mensagens (ordem cronológica) com autor. Calcula `hide_spoiler` **por leitor**: só libera o borrão se a % do leitor ≥ snapshot do autor; qualquer dado faltando mantém borrado. `[]` para não-membro. | `useClubMessages` · ClubChat |

> `get_member_reading_progress(p_book_id, p_user_id)` (auxiliar): % de leitura do
> membro na melhor edição equivalente (status `read` = 100; senão
> `current_page/total_pages` com teto de 100). Reusa a mesma regra da aba Leitores.

### 5.7 Livros  ·  `services/` de `features/books`

| RPC (params) | O que faz | Service · Hook · Usado em |
|---|---|---|
| `get_book(p_book_id)` | Retorna o livro do banco (RLS de `books` bloqueia SELECT direto do client). | `getBook` · `useBook` · BookDetail, RegisterRead |
| `complete_book_data(p_book_id, p_data)` | Aplica patch de enriquecimento (ISBNDB/Google) **sem sobrescrever** dado existente; reparte categorias em gênero/subjects. | `getBook`/`enrichBookWithGoogle` · `useBook` |
| `get_book_reviews(p_book_id)` | Resenhas do livro (global). | `getBookReviews` · `useBookReviews` · BookDetail |
| `save_user_books(...)` | Salva livros da biblioteca do usuário por status (usado no fim do cadastro). | `saveUserBooks` · `useSaveUserBooks` · Signup |
| `upsert_book(...)` | Cria registro mínimo por ISBN ao abrir um livro externo da busca. | `upsertBook` · `useUpsertBook` · ListBooks |
| `search_books(p_query, p_limit)` | Busca por título no banco (SECURITY DEFINER pois RLS bloqueia SELECT). | `searchClubReadingBooks` · SetClubReadingModal |

### 5.8 Perfil  ·  `services/` de `features/profile`

| RPC (params) | O que faz | Service · Hook · Usado em |
|---|---|---|
| `get_my_profile()` | Perfil do usuário logado: clubes (join `club_members`) + biblioteca (join `user_library`). | `getMyProfile` · `useMyProfile` · Profile, EditProfile, ListClubs |
| `get_user_profile(p_user_id)` | Perfil público de outro usuário. | `getUserProfile` · `useUserProfile` · Profile |
| `get_profile_header_color(p_user_id)` | Cor do cabeçalho do perfil (get_my_profile não retorna o campo). | `getProfileHeaderColor` · `useProfileHeaderColor` · Profile, EditProfile |

---

## 6. Acesso direto a tabelas (sem RPC)

Onde não há regra de autorização além da RLS padrão, o cliente usa
`supabase.from(...)`:

| Tabela | Operações | Arquivo · Uso |
|---|---|---|
| `user_library`, `reading_logs`, `book_highlights` | select/insert/delete | `books/services/readingTracking.ts` — progresso, sentimento, anotações e destaques (RegisterRead) |
| `follows` | select/insert/delete | `profile/services/follows.ts` — seguir/deixar de seguir |
| `profile_genres` | delete + insert | `profile/services/saveProfileGenres.ts` — gêneros favoritos |
| `notifications` | select + update(read) | `notifications/services/getNotifications.ts` |
| `push_subscriptions` | upsert/delete | `lib/push.ts` — inscrição de web push |
| `profiles` | update | `useSignUp`, EditProfile — dados do perfil (avatar_url, name, bio, localização) |
| `states`, `cities` | select | `hooks/useLocations.ts` — selects de estado/cidade |

---

## 7. Pendências operacionais (do usuário)

- **Rotacionar** a chave da ISBNDB (vazou em bundles antigos) e criar o secret
  `ISBNDB_API_KEY` + deploy da função `isbndb`; remover `VITE_ISBNDB_API_KEY` do
  Vercel. Restringir a chave do Google Books por referrer.
- Redeploy da `send-push` sempre que um novo evento é adicionado.
- Rodar os scripts SQL pendentes de `supabase/sql/` no SQL Editor antes de usar a
  feature correspondente.
