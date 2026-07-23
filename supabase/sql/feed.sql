-- Feed social (MVP). Rodar no SQL Editor e apagar depois.
--
-- Mostra, para o usuário logado, as atualizações de quem ele segue (follows),
-- ordenadas por tempo. Eventos do MVP (todos centrados na pessoa seguida):
--   1. started_book  — começou a ler um livro
--   2. finished_book — terminou de ler um livro
--   3. reviewed_book — avaliou/resenhou um livro
--   4. joined_club   — entrou num clube PÚBLICO (privado nunca aparece)
--
-- Os eventos não tinham timestamp: "começou/terminou/resenha" moram em
-- user_library (status/rating/review) e club_members não tinha data de entrada.
-- Adicionamos colunas nullable SEM backfill; o feed só emite eventos com
-- timestamp NOT NULL, então o histórico pré-feature não é despejado de uma vez.

-- 1. Colunas de timestamp (idempotentes, sem backfill) -----------------------

alter table public.user_library add column if not exists started_at  timestamptz;
alter table public.user_library add column if not exists finished_at timestamptz;
alter table public.user_library add column if not exists reviewed_at timestamptz;

alter table public.club_members add column if not exists joined_at timestamptz;
-- cobre novos ingressos; linhas antigas ficam NULL (não aparecem no feed)
alter table public.club_members alter column joined_at set default now();

-- started_at é gravado no client, em ensureLibraryRow (readingTracking.ts),
-- só no início genuíno (upsert com ignoreDuplicates). save_user_books (cadastro)
-- não seta, então os imports do signup não viram evento.

-- 2. Trigger: finished_at / reviewed_at em user_library ----------------------
-- BEFORE UPDATE (não INSERT): livros "já lidos" importados no cadastro fazem
-- INSERT e não disparam. "Terminar" e "resenhar" de verdade passam por UPDATE
-- e são pegos aqui, venha o UPDATE do client ou de uma RPC.

create or replace function public.set_user_library_milestones()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  -- passou a 'read' agora → marca o momento de conclusão
  if new.status = 'read' and old.status is distinct from 'read' then
    new.finished_at := now();
  end if;

  -- primeira vez que ganha nota ou resenha → marca o momento da avaliação
  if (new.review is not null or new.rating is not null)
     and (old.review is null and old.rating is null) then
    new.reviewed_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_library_milestones on public.user_library;
create trigger trg_user_library_milestones
  before update on public.user_library
  for each row
  execute function public.set_user_library_milestones();

-- 3. RPC get_feed ------------------------------------------------------------
-- UNION ALL das tabelas existentes filtrado pelo grafo de follows. SECURITY
-- DEFINER: lê books/clubs/profiles sem depender da RLS de cada uma. A regra de
-- clube privado vive aqui (joined_club só quando clubs.visibility = true).

create or replace function public.get_feed(
  p_limit integer default 20,
  p_offset integer default 0
)
returns json
language sql
security definer
set search_path to 'public'
as $$
  with followed as (
    select followed_id from follows where follower_id = auth.uid()
  ),
  events as (
    -- começou a ler
    select
      'started_book:' || ul.user_id || ':' || ul.book_id       as id,
      'started_book'                                            as type,
      ul.started_at                                             as created_at,
      ul.user_id                                                as actor_id,
      b.id                                                      as book_id,
      coalesce(b.title_pt, b.title_original)                    as book_title,
      coalesce(b.image_medium, b.image_thumbnail)               as book_image,
      null::uuid                                                as club_id,
      null::text                                                as club_name,
      null::text                                                as club_cover,
      null::numeric                                             as rating,
      null::text                                                as review
    from user_library ul
    join books b on b.id = ul.book_id
    where ul.user_id in (select followed_id from followed)
      and ul.started_at is not null

    union all
    -- terminou de ler
    select
      'finished_book:' || ul.user_id || ':' || ul.book_id,
      'finished_book',
      ul.finished_at,
      ul.user_id,
      b.id,
      coalesce(b.title_pt, b.title_original),
      coalesce(b.image_medium, b.image_thumbnail),
      null, null, null, null, null
    from user_library ul
    join books b on b.id = ul.book_id
    where ul.user_id in (select followed_id from followed)
      and ul.status = 'read'
      and ul.finished_at is not null

    union all
    -- avaliou/resenhou
    select
      'reviewed_book:' || ul.user_id || ':' || ul.book_id,
      'reviewed_book',
      ul.reviewed_at,
      ul.user_id,
      b.id,
      coalesce(b.title_pt, b.title_original),
      coalesce(b.image_medium, b.image_thumbnail),
      null, null, null,
      ul.rating,
      ul.review
    from user_library ul
    join books b on b.id = ul.book_id
    where ul.user_id in (select followed_id from followed)
      and ul.reviewed_at is not null
      and (ul.review is not null or ul.rating is not null)

    union all
    -- entrou num clube público
    select
      'joined_club:' || cm.user_id || ':' || cm.club_id,
      'joined_club',
      cm.joined_at,
      cm.user_id,
      null, null, null,
      c.id,
      c.name,
      c.cover_url,
      null, null
    from club_members cm
    join clubs c on c.id = cm.club_id
    where cm.user_id in (select followed_id from followed)
      and cm.joined_at is not null
      and c.visibility = true
  )
  select coalesce(
    json_agg(
      json_build_object(
        'id', e.id,
        'type', e.type,
        'created_at', e.created_at,
        'actor', json_build_object(
          'id', p.id,
          'name', p.name,
          'avatar_url', p.avatar_url
        ),
        'book', case
          when e.book_id is not null then json_build_object(
            'id', e.book_id, 'title', e.book_title, 'image', e.book_image
          )
        end,
        'club', case
          when e.club_id is not null then json_build_object(
            'id', e.club_id, 'name', e.club_name, 'cover_url', e.club_cover
          )
        end,
        'rating', e.rating,
        'review', e.review
      )
      order by e.created_at desc
    ),
    '[]'::json
  )
  from (
    select * from events
    order by created_at desc
    limit p_limit offset p_offset
  ) e
  join profiles p on p.id = e.actor_id;
$$;
