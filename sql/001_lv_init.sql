-- 강의용 라이브 참여 도구 (lv_) — 테이블 · 권한 · 함수 · 실시간 알림
-- 같은 Supabase 프로젝트의 다른 앱과 겹치지 않게 모든 이름에 lv_ 접두어를 쓴다.
-- 학생(anon)은 테이블에 직접 접근하지 못하고, 아래 security definer 함수로만 읽고 쓴다.
-- 강사는 lv_admins 에 이메일이 있는 로그인 사용자만.

-- ───────── 테이블 ─────────
create table if not exists public.lv_rooms (
  id text primary key check (id ~ '^[a-z0-9_-]{1,20}$'),
  title text not null,
  active_question_id uuid,
  qa_enabled boolean not null default true,
  qa_moderation boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lv_questions (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.lv_rooms(id) on delete cascade,
  key text check (key ~ '^[a-z0-9_-]{1,30}$' and key not in ('live','qa')),
  type text not null check (type in ('choice','text','wordcloud')),
  prompt text not null check (char_length(prompt) between 1 and 200),
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  allow_change boolean not null default true,
  show_results boolean not null default false,
  multi boolean not null default false,          -- 객관식 복수 선택
  sort int not null default 0,
  created_at timestamptz not null default now(),
  unique (room_id, key)
);
create index if not exists lv_questions_room_idx on public.lv_questions(room_id, sort);

do $$ begin
  alter table public.lv_rooms add constraint lv_rooms_active_fk
    foreign key (active_question_id) references public.lv_questions(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists public.lv_responses (
  id bigint generated always as identity primary key,
  question_id uuid not null references public.lv_questions(id) on delete cascade,
  client_id text not null,
  value text not null,
  norm text not null default '',
  blocked boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lv_responses_q_idx on public.lv_responses(question_id, client_id);

create table if not exists public.lv_hidden_terms (
  question_id uuid not null references public.lv_questions(id) on delete cascade,
  norm text not null,
  primary key (question_id, norm)
);

create table if not exists public.lv_qa (
  id bigint generated always as identity primary key,
  room_id text not null references public.lv_rooms(id) on delete cascade,
  client_id text not null,
  body text not null check (char_length(body) between 1 and 150),
  status text not null default 'pending' check (status in ('pending','approved','answered','hidden')),
  blocked boolean not null default false,
  likes int not null default 0,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
create index if not exists lv_qa_room_idx on public.lv_qa(room_id, status);

create table if not exists public.lv_qa_likes (
  qa_id bigint not null references public.lv_qa(id) on delete cascade,
  client_id text not null,
  created_at timestamptz not null default now(),
  primary key (qa_id, client_id)
);

create table if not exists public.lv_blocked_words (
  word text primary key check (char_length(word) between 1 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.lv_admins (
  email text primary key
);

create table if not exists public.lv_rate (
  client_id text primary key,
  last_at timestamptz not null
);

-- ───────── 권한 (RLS) ─────────
-- 강사 확인: 로그인한 사람의 이메일이 lv_admins 에 있는가
create or replace function public.lv_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lv_admins a
                 where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

do $$ declare t text; begin
  foreach t in array array['lv_rooms','lv_questions','lv_responses','lv_hidden_terms','lv_qa',
                           'lv_qa_likes','lv_blocked_words','lv_admins','lv_rate'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke all on public.%I from authenticated', t);
    execute format('drop policy if exists lv_admin_all on public.%I', t);
  end loop;
  -- 강사는 아래 테이블 전부 읽기·쓰기 (lv_admins, lv_rate 는 함수로만)
  foreach t in array array['lv_rooms','lv_questions','lv_responses','lv_hidden_terms','lv_qa',
                           'lv_qa_likes','lv_blocked_words'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy lv_admin_all on public.%I for all to authenticated
                    using (public.lv_is_admin()) with check (public.lv_is_admin())', t);
  end loop;
end $$;

-- ───────── 도우미 ─────────
-- 같은 말 묶기: 공백 전부 제거 + 소문자
create or replace function public.lv_norm(t text) returns text
language sql immutable set search_path = public as $$ select lower(regexp_replace(coalesce(t,''), '\s+', '', 'g')) $$;

create or replace function public.lv_has_blocked(t text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lv_blocked_words w
                 where public.lv_norm(w.word) <> ''
                   and position(public.lv_norm(w.word) in public.lv_norm(t)) > 0);
$$;

-- 같은 기기 1초 1회
create or replace function public.lv_rate_ok(p_cid text) returns boolean
language plpgsql security definer set search_path = public as $$
declare ok int;
begin
  insert into public.lv_rate as r (client_id, last_at) values (p_cid, clock_timestamp())
  on conflict (client_id) do update set last_at = excluded.last_at
     where r.last_at < excluded.last_at - interval '1 second'
  returning 1 into ok;
  return ok is not null;
end $$;

create or replace function public.lv_cid_ok(p_cid text) returns boolean
language sql immutable set search_path = public as $$ select coalesce(p_cid ~ '^[A-Za-z0-9_-]{8,64}$', false) $$;

-- ───────── 학생 · 덱이 부르는 함수 (익명 가능) ─────────
-- 방 상태 + 지금 열린 질문
create or replace function public.lv_state(p_room text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when r.id is null then null else jsonb_build_object(
    'room', jsonb_build_object('id', r.id, 'title', r.title,
                               'qa_enabled', r.qa_enabled, 'qa_moderation', r.qa_moderation),
    'q', (select jsonb_build_object('id', q.id, 'key', q.key, 'type', q.type, 'prompt', q.prompt,
                 'options', q.options, 'allow_change', q.allow_change, 'show_results', q.show_results, 'multi', q.multi)
          from public.lv_questions q where q.id = r.active_question_id)) end
  from (select 1) x left join public.lv_rooms r on r.id = p_room;
$$;

-- 질문 하나의 집계 결과 (개인 식별 정보 없음)
create or replace function public.lv_results(p_qid uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q public.lv_questions; res jsonb; n int; open boolean;
begin
  select * into q from public.lv_questions where id = p_qid;
  if not found then return null; end if;
  select count(distinct client_id) into n from public.lv_responses where question_id = p_qid;
  select exists(select 1 from public.lv_rooms where id = q.room_id and active_question_id = q.id) into open;
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
    'options', q.options, 'multi', q.multi, 'open', open, 'n', n, 'data', res);
end $$;

-- 덱 위젯용: 키(또는 live)로 결과 한 번에
create or replace function public.lv_board(p_room text, p_key text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r public.lv_rooms; qid uuid;
begin
  select * into r from public.lv_rooms where id = p_room;
  if not found then return jsonb_build_object('err', 'no_room'); end if;
  if p_key is null or p_key = '' or p_key = 'live' then
    qid := r.active_question_id;
  else
    select id into qid from public.lv_questions where room_id = p_room and key = p_key;
    if qid is null then
      return jsonb_build_object('room', r.id, 'title', r.title, 'missing', true,
                                'active', r.active_question_id);
    end if;
  end if;
  return jsonb_build_object('room', r.id, 'title', r.title, 'active', r.active_question_id,
                            'result', case when qid is null then null else public.lv_results(qid) end);
end $$;

-- 내가 보낸 답
create or replace function public.lv_mine(p_qid uuid, p_cid text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(value order by created_at), '[]'::jsonb)
  from public.lv_responses where question_id = p_qid and client_id = p_cid;
$$;

-- 응답 보내기. p_values: 객관식 ['2'] (복수 선택이면 ['0','2'] — 고른 것 전체로 바꿈), 주관식 ['문장'], 워드클라우드 ['말1', ...] (기존 것에 더함, 최대 3)
create or replace function public.lv_submit(p_room text, p_qid uuid, p_cid text, p_values text[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare q public.lv_questions; r public.lv_rooms; v text; vals text[] := '{}'; norms text[] := '{}';
        have int; cur public.lv_responses; nv text;
begin
  if not public.lv_cid_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'invalid'); end if;
  select * into r from public.lv_rooms where id = p_room;
  select * into q from public.lv_questions where id = p_qid and room_id = p_room;
  if r.id is null or q.id is null or r.active_question_id is distinct from q.id then
    return jsonb_build_object('ok', false, 'err', 'closed');
  end if;
  -- 값 다듬기
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

-- Q&A 목록: 공개된 질문 + 내가 쓴 대기 질문
create or replace function public.lv_qa_list(p_room text, p_cid text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', a.id, 'body', a.body, 'likes', a.likes,
           'status', case when a.status = 'hidden' then 'pending' else a.status end,
           'mine', a.client_id = p_cid,
           'liked', exists (select 1 from public.lv_qa_likes l where l.qa_id = a.id and l.client_id = p_cid))
         order by (a.status = 'answered'), a.likes desc, a.created_at), '[]'::jsonb)
  from public.lv_qa a
  where a.room_id = p_room
    and ((a.status in ('approved','answered') and not a.blocked)
         or (coalesce(p_cid,'') <> '' and a.client_id = p_cid and a.status in ('pending','hidden')));
$$;

create or replace function public.lv_qa_post(p_room text, p_cid text, p_body text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.lv_rooms; b text; blk boolean;
begin
  if not public.lv_cid_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'invalid'); end if;
  select * into r from public.lv_rooms where id = p_room;
  if r.id is null or not r.qa_enabled then return jsonb_build_object('ok', false, 'err', 'closed'); end if;
  b := btrim(regexp_replace(coalesce(p_body,''), '\s+', ' ', 'g'));
  if b = '' then return jsonb_build_object('ok', false, 'err', 'empty'); end if;
  if char_length(b) > 150 then return jsonb_build_object('ok', false, 'err', 'long'); end if;
  if not public.lv_rate_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'slow'); end if;
  if (select count(*) from public.lv_qa where room_id = p_room and client_id = p_cid
        and created_at > now() - interval '1 minute') >= 5 then
    return jsonb_build_object('ok', false, 'err', 'slow');
  end if;
  blk := public.lv_has_blocked(b);
  insert into public.lv_qa (room_id, client_id, body, blocked, status)
  values (p_room, p_cid, b, blk, case when r.qa_moderation or blk then 'pending' else 'approved' end);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.lv_qa_like(p_qa bigint, p_cid text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.lv_qa;
begin
  if not public.lv_cid_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'invalid'); end if;
  select * into a from public.lv_qa where id = p_qa;
  if a.id is null or a.status <> 'approved' or a.blocked then
    return jsonb_build_object('ok', false, 'err', 'closed');
  end if;
  if not public.lv_rate_ok(p_cid) then return jsonb_build_object('ok', false, 'err', 'slow'); end if;
  insert into public.lv_qa_likes (qa_id, client_id) values (p_qa, p_cid) on conflict do nothing;
  if found then
    update public.lv_qa set likes = (select count(*) from public.lv_qa_likes where qa_id = p_qa)
     where id = p_qa;
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- 덱 Q&A 장표용: 공개된 질문만
create or replace function public.lv_qa_board(p_room text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('room', p_room,
    'enabled', (select qa_enabled from public.lv_rooms where id = p_room),
    'items', coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'body', a.body, 'likes', a.likes,
                                                   'status', a.status)
             order by (a.status = 'answered'), a.likes desc, a.created_at), '[]'::jsonb))
  from public.lv_qa a
  where a.room_id = p_room and a.status in ('approved','answered') and not a.blocked;
$$;

-- 결과 화면용: 응답이 있거나 지금 열린 질문만 (아직 안 연 질문은 미리 드러나지 않게)
create or replace function public.lv_room_slides(p_room text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when r.id is null then null else jsonb_build_object(
    'room', r.id, 'title', r.title, 'active', r.active_question_id,
    'qa', (select count(*) from public.lv_qa a where a.room_id = r.id and a.status in ('approved','answered') and not a.blocked),
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'type', q.type, 'prompt', q.prompt,
                 'n', (select count(distinct client_id) from public.lv_responses x where x.question_id = q.id),
                 'open', q.id = r.active_question_id) order by q.sort, q.created_at)
       from public.lv_questions q
       where q.room_id = r.id
         and (q.id = r.active_question_id or exists (select 1 from public.lv_responses x where x.question_id = q.id))), '[]'::jsonb)) end
  from (select 1) z left join public.lv_rooms r on r.id = p_room;
$$;

-- ───────── 강사 전용 함수 ─────────
create or replace function public.lv_admin_open(p_room text, p_qid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.lv_is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_qid is not null and not exists (select 1 from public.lv_questions where id = p_qid and room_id = p_room) then
    raise exception 'no question';
  end if;
  update public.lv_rooms set active_question_id = p_qid where id = p_room;
  return public.lv_state(p_room);
end $$;

-- 방 데이터 일괄 삭제 (응답 · Q&A, 원하면 질문까지)
create or replace function public.lv_admin_wipe(p_room text, p_questions boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare nr int; nq int; nqs int := 0;
begin
  if not public.lv_is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  perform set_config('lv.mute', '1', true);
  delete from public.lv_responses where question_id in (select id from public.lv_questions where room_id = p_room);
  get diagnostics nr = row_count;
  delete from public.lv_qa where room_id = p_room;
  get diagnostics nq = row_count;
  delete from public.lv_hidden_terms where question_id in (select id from public.lv_questions where room_id = p_room);
  if p_questions then
    update public.lv_rooms set active_question_id = null where id = p_room;
    delete from public.lv_questions where room_id = p_room;
    get diagnostics nqs = row_count;
  end if;
  perform set_config('lv.mute', '', true);
  begin perform realtime.send(jsonb_build_object('t','all'), 'lv', 'lv-' || p_room, false);
  exception when others then null; end;
  return jsonb_build_object('responses', nr, 'qa', nq, 'questions', nqs);
end $$;

-- ───────── 실시간 알림 (Broadcast) ─────────
-- 내용은 보내지 않고 "무엇이 바뀌었는지"만 방 채널(lv-<방>)로 알린다. 화면은 알림을 받으면 집계 함수를 다시 부른다.
create or replace function public.lv_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare rec record; room text; msg jsonb;
begin
  if current_setting('lv.mute', true) = '1' then return null; end if;
  if tg_op = 'DELETE' then rec := old; else rec := new; end if;
  if tg_table_name = 'lv_rooms' then
    room := rec.id; msg := jsonb_build_object('t','room');
  elsif tg_table_name = 'lv_questions' then
    room := rec.room_id; msg := jsonb_build_object('t','q','q',rec.id);
  elsif tg_table_name in ('lv_responses','lv_hidden_terms') then
    select room_id into room from public.lv_questions where id = rec.question_id;
    msg := jsonb_build_object('t','r','q',rec.question_id);
  elsif tg_table_name = 'lv_qa' then
    room := rec.room_id; msg := jsonb_build_object('t','qa');
  elsif tg_table_name = 'lv_qa_likes' then
    select room_id into room from public.lv_qa where id = rec.qa_id;
    msg := jsonb_build_object('t','qa');
  end if;
  if room is not null then
    begin perform realtime.send(msg, 'lv', 'lv-' || room, false);
    exception when others then null; end;
  end if;
  return null;
end $$;

do $$ declare t text; begin
  foreach t in array array['lv_rooms','lv_questions','lv_responses','lv_hidden_terms','lv_qa','lv_qa_likes'] loop
    execute format('drop trigger if exists lv_notify_trg on public.%I', t);
    execute format('create trigger lv_notify_trg after insert or update or delete on public.%I
                    for each row execute function public.lv_notify()', t);
  end loop;
end $$;

-- ───────── 함수 실행 권한 ─────────
do $$ declare f text; begin
  foreach f in array array['lv_is_admin()','lv_norm(text)','lv_has_blocked(text)','lv_rate_ok(text)',
      'lv_cid_ok(text)','lv_state(text)','lv_results(uuid)','lv_board(text,text)','lv_mine(uuid,text)',
      'lv_submit(text,uuid,text,text[])','lv_qa_list(text,text)','lv_qa_post(text,text,text)',
      'lv_qa_like(bigint,text)','lv_qa_board(text)','lv_room_slides(text)','lv_admin_open(text,uuid)',
      'lv_admin_wipe(text,boolean)','lv_notify()'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
  foreach f in array array['lv_state(text)','lv_results(uuid)','lv_board(text,text)','lv_mine(uuid,text)',
      'lv_submit(text,uuid,text,text[])','lv_qa_list(text,text)','lv_qa_post(text,text,text)',
      'lv_qa_like(bigint,text)','lv_qa_board(text)','lv_room_slides(text)'] loop
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
  execute 'grant execute on function public.lv_admin_open(text,uuid) to authenticated';
  execute 'grant execute on function public.lv_admin_wipe(text,boolean) to authenticated';
  execute 'grant execute on function public.lv_is_admin() to authenticated';
  execute 'grant execute on function public.lv_norm(text) to authenticated';
end $$;

-- ───────── 처음 상태: 방 3개 (질문은 0개 — 강사가 관리 화면에서 만든다) ─────────
insert into public.lv_rooms (id, title) values
  ('w1', '삼육대 취업특강 · 1주차'),
  ('w2', '삼육대 취업특강 · 2주차'),
  ('w3', '삼육대 취업특강 · 3주차')
on conflict (id) do nothing;

-- 금지어 기본 목록 (강사가 관리 화면에서 더하고 뺄 수 있음)
insert into public.lv_blocked_words (word) values
  ('씨발'),('씨빨'),('시발'),('ㅅㅂ'),('ㅆㅂ'),('씹'),('좆'),('존나'),('졸라'),('ㅈㄴ'),
  ('병신'),('븅신'),('ㅂㅅ'),('개새끼'),('개새기'),('개색'),('새끼'),('지랄'),('ㅈㄹ'),('미친놈'),('미친년'),
  ('또라이'),('등신'),('찐따'),('닥쳐'),('꺼져'),('엿먹'),('썅'),('니애미'),('느금'),('애미'),('애비'),
  ('한남충'),('김치녀'),('틀딱'),('급식충'),('맘충'),('fuck'),('shit'),('bitch'),('asshole')
on conflict do nothing;

-- 강사 계정 등록은 저장소에 이메일을 남기지 않도록 따로 한 번 실행:
--   insert into public.lv_admins (email) values ('강사 이메일');
