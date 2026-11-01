-- 003: 워드클라우드 연결선 — 같은 학생이 함께 보낸 말 쌍과 그 사람 수

create or replace function public.lv_results(p_qid uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q public.lv_questions; res jsonb; n int; lk jsonb;
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
    -- 같은 학생이 함께 보낸 말끼리 (몇 명이 같이 썼나만, 누가 썼는지는 없음)
    select coalesce(jsonb_agg(jsonb_build_object('a', a, 'b', b, 'n', c) order by c desc), '[]'::jsonb) into lk
    from (select r1.norm a, r2.norm b, count(distinct r1.client_id) c
          from public.lv_responses r1
          join public.lv_responses r2 on r2.question_id = r1.question_id and r2.client_id = r1.client_id and r1.norm < r2.norm
          where r1.question_id = p_qid
            and not r1.hidden and not r1.blocked and not r2.hidden and not r2.blocked
            and not exists (select 1 from public.lv_hidden_terms h where h.question_id = p_qid and h.norm in (r1.norm, r2.norm))
          group by 1, 2 order by 3 desc limit 60) t;
  end if;
  return jsonb_build_object('id', q.id, 'key', q.key, 'type', q.type, 'prompt', q.prompt,
    'options', q.options, 'multi', q.multi, 'open', q.is_open, 'n', n, 'data', res, 'links', lk);
end $$;
