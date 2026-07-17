-- Chat do clube (só membros) com marcação de spoiler.
-- Rodar no SQL Editor e apagar depois.
--
-- Tabela travada por RLS sem policies de client: todo acesso passa pelas
-- RPCs SECURITY DEFINER, que validam a participação no clube.

create table public.club_messages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  is_spoiler boolean not null default false,
  created_at timestamptz not null default now()
);

create index club_messages_club_created_idx
  on public.club_messages (club_id, created_at desc);

alter table public.club_messages enable row level security;

-- Últimas p_limit mensagens do clube, em ordem cronológica, com autor.
-- Não-membro recebe [] (a página também bloqueia pela UI).
create or replace function public.get_club_messages(
  p_club_id uuid,
  p_limit integer default 100
)
returns json
language sql
security definer
set search_path to 'public'
as $$
  select coalesce(
    json_agg(
      json_build_object(
        'id', sub.id,
        'content', sub.content,
        'is_spoiler', sub.is_spoiler,
        'created_at', sub.created_at,
        'is_mine', sub.is_mine,
        'author', json_build_object(
          'id', sub.author_id,
          'name', sub.author_name,
          'avatar_url', sub.author_avatar_url,
          'is_admin', sub.author_is_admin
        )
      )
      order by sub.created_at asc
    ),
    '[]'::json
  )
  from (
    select
      cm.id,
      cm.content,
      cm.is_spoiler,
      cm.created_at,
      cm.user_id = auth.uid() as is_mine,
      p.id as author_id,
      p.name as author_name,
      p.avatar_url as author_avatar_url,
      exists (
        select 1 from club_members a
        where a.club_id = cm.club_id
          and a.user_id = cm.user_id
          and a.role = 'admin'
      ) as author_is_admin
    from club_messages cm
    join profiles p on p.id = cm.user_id
    where cm.club_id = p_club_id
      and exists (
        select 1 from club_members me
        where me.club_id = p_club_id and me.user_id = auth.uid()
      )
    order by cm.created_at desc
    limit p_limit
  ) sub;
$$;

create or replace function public.send_club_message(
  p_club_id uuid,
  p_content text,
  p_is_spoiler boolean default false
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not exists (
    select 1 from club_members m
    where m.club_id = p_club_id and m.user_id = auth.uid()
  ) then
    raise exception 'apenas participantes podem enviar mensagens';
  end if;

  if length(trim(coalesce(p_content, ''))) = 0 then
    raise exception 'mensagem vazia';
  end if;

  insert into club_messages (club_id, user_id, content, is_spoiler)
  values (p_club_id, auth.uid(), trim(p_content), coalesce(p_is_spoiler, false));
end;
$$;
