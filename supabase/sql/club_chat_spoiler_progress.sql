alter table public.club_messages
  add column if not exists spoiler_progress integer;

create or replace function public.get_member_reading_progress(
  p_book_id uuid,
  p_user_id uuid
)
returns integer
language sql
security definer
set search_path to 'public'
as $$
  select pct
  from (
    select
      case
        when ul.status = 'read' then 100
        when coalesce(e.total_pages, 0) > 0 then
          least(
            100,
            round(coalesce(ul.current_page, 0)::numeric * 100 / e.total_pages)
          )::int
        else 0
      end as pct,
      (ul.book_id = p_book_id) as exact_edition
    from user_library ul
    join get_equivalent_editions(p_book_id) e on e.id = ul.book_id
    where ul.user_id = p_user_id
  ) sub
  order by pct desc, exact_edition desc
  limit 1;
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
declare
  v_book_id uuid;
  v_progress integer;
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

  if coalesce(p_is_spoiler, false) then
    select cr.book_id into v_book_id
    from club_readings cr
    where cr.club_id = p_club_id and cr.status = 'reading'
    order by cr.start_date desc nulls last
    limit 1;

    if v_book_id is not null then
      v_progress := get_member_reading_progress(v_book_id, auth.uid());
    end if;
  end if;

  insert into club_messages (club_id, user_id, content, is_spoiler, spoiler_progress)
  values (
    p_club_id,
    auth.uid(),
    trim(p_content),
    coalesce(p_is_spoiler, false),
    v_progress
  );
end;
$$;

create or replace function public.get_club_messages(
  p_club_id uuid,
  p_limit integer default 100
)
returns json
language sql
security definer
set search_path to 'public'
as $$
  with current_book as (
    select cr.book_id
    from club_readings cr
    where cr.club_id = p_club_id and cr.status = 'reading'
    order by cr.start_date desc nulls last
    limit 1
  ),
  my_progress as (
    select get_member_reading_progress(
      (select book_id from current_book),
      auth.uid()
    ) as pct
  )
  select coalesce(
    json_agg(
      json_build_object(
        'id', sub.id,
        'content', sub.content,
        'is_spoiler', sub.is_spoiler,
        'hide_spoiler', sub.hide_spoiler,
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
      (
        cm.is_spoiler
        and not (
          cm.spoiler_progress is not null
          and (select pct from my_progress) is not null
          and (select pct from my_progress) >= cm.spoiler_progress
        )
      ) as hide_spoiler,
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
