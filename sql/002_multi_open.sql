-- 002: 객관식 복수 선택 + 질문 여러 개 동시에 열기
-- 이제 「열린 질문」은 방에 하나가 아니라 질문마다 is_open 으로 표시한다.
-- lv_rooms.active_question_id 는 더 이상 쓰지 않는다 (옛 값은 is_open 으로 옮김).

alter table public.lv_questions add column if not exists multi boolean not null default false;
alter table public.lv_questions add column if not exists is_open boolean not null default false;
alter table public.lv_questions add column if not exists opened_at timestamptz;

update public.lv_questions q set is_open = true, opened_at = now()
  from public.lv_rooms r where r.active_question_id = q.id;
update public.lv_rooms set active_question_id = null where active_question_id is not null;

create index if not exists lv_questions_open_idx on public.lv_questions(room_id) where is_open;

-- 질문 하나를 학생 화면용 json 으로
create or replace function public.lv_qjson(q public.lv_questions) returns jsonb
language sql stable set search_path = public as $$
  select jsonb_build_object('id', q.id, 'key', q.key, 'type', q.type, 'prompt', q.prompt, 'options', q.options,
    'allow_change', q.allow_change, 'show_results', q.show_results, 'multi', q.multi);
$$;

-- 가장 최근에 연 질문 (덱 live 장표 · 결과 화면 자동 이동용)
create or replace function public.lv_latest_open(p_room text) returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.lv_questions where room_id = p_room and is_open
  order by opened_at desc nulls last, sort desc limit 1;
$$;

-- 방 상태: qs = 지금 열린 질문 전부 (질문 순서대로), q = 가장 최근에 연 것
create or replace function public.lv_state(p_room text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when r.id is null then null else jsonb_build_object(
    'room', jsonb_build_object('id', r.id, 'title', r.title,
                               'qa_enabled', r.qa_enabled, 'qa_moderation', r.qa_moderation),
    'q', (select public.lv_qjson(q) from public.lv_questions q where q.id = public.lv_latest_open(r.id)),
    'qs', coalesce((select jsonb_agg(public.lv_qjson(q) order by q.sort, q.created_at)
                    from public.lv_questions q where q.room_id = r.id and q.is_open), '[]'::jsonb)) end
  from (select 1) x left join public.lv_rooms r on r.id = p_room;
$$;

create or replace function public.lv_results(p_qid uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q public.lv_questions; res jsonb; n int;
begin
  select * into q from public.lv_questions where id = p_qid;
  if not found then return null; end if;
  select count(distinct client_id) into n from public.lv_responses where question_id = p_qid;
  if q.type = 'choice' then
    select coalesce(jsonb_agg(coalesce(c.cnt,0) order by i.idx), '[]'::jsonb) into res
    from generate_series(0, greatest(jsonb_array_length(q.options)-1, -1)) as i(idx)
    left join (select value::int as idx, count(*) cnt from public.lv_responses
               where question_id = p_qid and value ~ '^[0-9]+$' group by 1) c on c.idx = i.idx;
  elsif q.type = 'text' then
    select coalesce(jsonb_agg(jsonb_build_object('id', id, 'v', value) order by created_at desc), '[]'::jsonb)
      into res
    from (select id, value, created_at from public.lv_responses
          where question_id = p_qid and not hidden and not blocked
          order by created_at desc limit 200) t;
  else
    select coalesce(jsonb_agg(jsonb_build_object('w', disp, 'n', cnt, 'k', norm)
                    order by cnt desc, first_at), '[]'::jsonb) into res
    from (select r.norm, count(*) cnt, min(r.created_at) first_at,
                 (select r2.value from public.lv_responses r2
                   where r2.question_id = p_qid and r2.norm = r.norm
                   group by r2.value order by count(*) desc, min(r2.created_at) limit 1) disp
          from public.lv_responses r
          where r.question_id = p_qid and not r.hidden and not r.blocked
            and not exists (select 1 from public.lv_hidden_terms h
                            where h.question_id = p_qid and h.norm = r.norm)
          group by r.norm order by count(*) desc, min(r.created_at) limit 80) w;
  end if;
  return jsonb_build_object('id', q.id, 'key', q.key, 'type', q.type, 'prompt', q.prompt,
    'options', q.options, 'multi', q.multi, 'open', q.is_open, 'n', n, 'data', res);
end $$;

create or replace function public.lv_board(p_room text, p_key text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r public.lv_rooms; qid uuid; act uuid;
begin
  select * into r from public.lv_rooms where id = p_room;
  if not found then return jsonb_build_object('err', 'no_room'); end if;
  act := public.lv_latest_open(p_room);
  if p_key is null or p_key = '' or p_key = 'live' then
    qid := act;
  else
    select id into qid from public.lv_questions where room_id = p_room and key = p_key;
    if qid is null then
      return jsonb_build_object('room', r.id, 'title', r.title, 'missing', true, 'active', act);
    end if;
  end if;
  return jsonb_build_object('room', r.id, 'title', r.title, 'active', act,
                            'result', case when qid is null then null else public.lv_results(qid) end);
end $$;

create or replace function public.lv_submit(p_room text, p_qid uuid, p_cid text, p_values text[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare q public.lv_questions; v text; vals text[] := '{}'; norms text[] := '{}';
        have int; cur public.lv_responses; nv text;
begin
  if not public.lv_cid_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'invalid'); end if;
  select * into q from public.lv_questions where id = p_qid and room_id = p_room;
  if q.id is null or not q.is_open then
    return jsonb_build_object('ok', false, 'err', 'closed');
  end if;
  foreach v in array coalesce(p_values, '{}') loop
    v := btrim(regexp_replace(coalesce(v,''), '\s+', ' ', 'g'));
    nv := public.lv_norm(v);
    if v <> '' and not nv = any(norms) then vals := vals || v; norms := norms || nv; end if;
  end loop;
  if cardinality(vals) = 0 then return jsonb_build_object('ok', false, 'err', 'empty'); end if;
  if not public.lv_rate_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'slow'); end if;

  perform pg_advisory_xact_lock(hashtext(p_qid::text || p_cid));

  if q.type = 'choice' then
    foreach v in array vals loop
      if v !~ '^[0-9]+$' or v::int >= jsonb_array_length(q.options) then
        return jsonb_build_object('ok', false, 'err', 'invalid');
      end if;
    end loop;
  end if;
  if q.type = 'choice' and q.multi then
    -- 복수 선택: 보낸 목록이 그 사람의 답 전체
    select count(*) into have from public.lv_responses where question_id = q.id and client_id = p_cid;
    if have > 0 and not q.allow_change then return jsonb_build_object('ok', false, 'err', 'locked'); end if;
    delete from public.lv_responses where question_id = q.id and client_id = p_cid and not (value = any(vals));
    insert into public.lv_responses (question_id, client_id, value, norm)
    select q.id, p_cid, x, x from unnest(vals) x
    where not exists (select 1 from public.lv_responses e where e.question_id = q.id and e.client_id = p_cid and e.value = x);
  elsif q.type in ('choice','text') then
    v := vals[1];
    if q.type = 'text' and char_length(v) > 100 then
      return jsonb_build_object('ok', false, 'err', 'long');
    end if;
    select * into cur from public.lv_responses where question_id = q.id and client_id = p_cid limit 1;
    if cur.id is not null then
      if not q.allow_change then return jsonb_build_object('ok', false, 'err', 'locked'); end if;
      if cur.value <> v then
        update public.lv_responses set value = v, norm = public.lv_norm(v),
               blocked = (q.type = 'text' and public.lv_has_blocked(v)), hidden = false,
               updated_at = now(),
               created_at = case when q.type = 'text' then now() else created_at end
         where id = cur.id;
      end if;
    else
      insert into public.lv_responses (question_id, client_id, value, norm, blocked)
      values (q.id, p_cid, v, public.lv_norm(v), q.type = 'text' and public.lv_has_blocked(v));
    end if;
  else -- wordcloud
    select count(*) into have from public.lv_responses where question_id = q.id and client_id = p_cid;
    foreach v in array vals loop
      if char_length(v) > 10 then return jsonb_build_object('ok', false, 'err', 'long'); end if;
    end loop;
    foreach v in array vals loop
      continue when exists (select 1 from public.lv_responses where question_id = q.id
                            and client_id = p_cid and norm = public.lv_norm(v));
      if have >= 3 then return jsonb_build_object('ok', false, 'err', 'full',
                                                  'mine', public.lv_mine(q.id, p_cid)); end if;
      insert into public.lv_responses (question_id, client_id, value, norm, blocked)
      values (q.id, p_cid, v, public.lv_norm(v), public.lv_has_blocked(v));
      have := have + 1;
    end loop;
  end if;
  return jsonb_build_object('ok', true, 'mine', public.lv_mine(q.id, p_cid));
end $$;

create or replace function public.lv_room_slides(p_room text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when r.id is null then null else jsonb_build_object(
    'room', r.id, 'title', r.title, 'active', public.lv_latest_open(r.id),
    'qa', (select count(*) from public.lv_qa a where a.room_id = r.id and a.status in ('approved','answered') and not a.blocked),
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'type', q.type, 'prompt', q.prompt,
                 'n', (select count(distinct client_id) from public.lv_responses x where x.question_id = q.id),
                 'open', q.is_open) order by q.sort, q.created_at)
       from public.lv_questions q
       where q.room_id = r.id
         and (q.is_open or exists (select 1 from public.lv_responses x where x.question_id = q.id))), '[]'::jsonb)) end
  from (select 1) z left join public.lv_rooms r on r.id = p_room;
$$;

-- 강사: 질문 열기 (다른 열린 질문은 그대로). p_qid 가 null 이면 이 방 질문 모두 닫기
create or replace function public.lv_admin_open(p_room text, p_qid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.lv_is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_qid is null then
    update public.lv_questions set is_open = false where room_id = p_room and is_open;
  else
    update public.lv_questions set is_open = true, opened_at = now() where id = p_qid and room_id = p_room;
    if not found then raise exception 'no question'; end if;
  end if;
  return public.lv_state(p_room);
end $$;

-- 강사: 질문 하나 닫기
create or replace function public.lv_admin_close(p_qid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare room text;
begin
  if not public.lv_is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  update public.lv_questions set is_open = false where id = p_qid returning room_id into room;
  return public.lv_state(room);
end $$;

revoke all on function public.lv_qjson(public.lv_questions) from public, anon, authenticated;
revoke all on function public.lv_latest_open(text) from public, anon, authenticated;
revoke all on function public.lv_admin_close(uuid) from public, anon, authenticated;
grant execute on function public.lv_admin_close(uuid) to authenticated;
grant execute on function public.lv_room_slides(text) to anon, authenticated;
