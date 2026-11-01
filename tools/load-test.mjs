// 가짜 학생 N명이 지금 열린 질문에 동시에 답하는 부하 시험
//   node tools/load-test.mjs w1 40          (Node 20 이상, 설치할 것 없음)
//   node tools/load-test.mjs w1 40 --qa     (Q&A 질문도 N개 보냄 · 승인 대기로 들어감)
// 끝나면 관리 화면에서 「결과 초기화」 또는 방 「응답 · Q&A 모두 삭제」로 지우세요.
import { readFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const { supabaseUrl: URL_, anonKey: KEY } = JSON.parse(readFileSync(root + 'config.json', 'utf8'));
const room = process.argv[2] || 'w1';
const N = +(process.argv[3] || 40);
const withQA = process.argv.includes('--qa');
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const rpc = async (fn, body) => {
  const r = await fetch(`${URL_}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const t = await r.text(); if (!r.ok) throw new Error(fn + ' ' + r.status + ' ' + t); return t ? JSON.parse(t) : null;
};
const cid = (i) => 'loadtest' + String(i).padStart(4, '0') + Math.random().toString(36).slice(2, 8);
const WORDS = ['미래', '변화', '도구', '일자리', '편리함', '걱정', '창의성', '속도', '공부', '기회', 'AI', 'ai', ' A I ', '챗봇', '자동화'];
const TEXTS = ['끝까지 해내는 사람이라서', '배운 걸 바로 써먹어요', '처음 보는 일도 겁내지 않아요', '꾸준함 하나는 자신 있어요'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const stats = (a) => { a = a.slice().sort((x, y) => x - y); const q = (p) => a[Math.min(a.length - 1, Math.floor(a.length * p))]; return `중간 ${q(.5)}ms · 90% ${q(.9)}ms · 최대 ${a[a.length - 1]}ms`; };

// 실시간 알림이 도착하는 시간도 잰다
const events = [];
let ws;
try {
  ws = new WebSocket(`${URL_.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${KEY}&vsn=1.0.0`);
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; setTimeout(no, 5000); });
  ws.send(JSON.stringify({ topic: `realtime:lv-${room}`, event: 'phx_join', ref: '1', join_ref: '1',
    payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [], private: false }, access_token: KEY } }));
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.event === 'broadcast') events.push(Date.now()); };
  await new Promise((r) => setTimeout(r, 800));
  console.log('실시간 연결: 됨');
} catch { console.log('실시간 연결: 실패 (화면은 3~5초마다 새로고침으로 대신함)'); }

const st = await rpc('lv_state', { p_room: room });
if (!st) { console.log('방이 없어요:', room); process.exit(1); }
const q = st.q;
if (!q) console.log('열린 질문이 없어요. 관리 화면에서 질문을 연 뒤 다시 실행하세요.');
else {
  console.log(`질문: [${q.type}] ${q.prompt} — 가짜 학생 ${N}명 동시 응답`);
  const t0 = Date.now(), lat = [], errs = {};
  await Promise.all(Array.from({ length: N }, async (_, i) => {
    const id = cid(i);
    const vals = q.type === 'choice' ? [String(Math.floor(Math.random() * q.options.length))]
      : q.type === 'text' ? [pick(TEXTS)] : [pick(WORDS)];
    const s = Date.now();
    try { const r = await rpc('lv_submit', { p_room: room, p_qid: q.id, p_cid: id, p_values: vals }); if (!r.ok) errs[r.err] = (errs[r.err] || 0) + 1; }
    catch (e) { errs.http = (errs.http || 0) + 1; }
    lat.push(Date.now() - s);
  }));
  console.log(`보내기: ${stats(lat)} · 전체 ${Date.now() - t0}ms · 오류 ${JSON.stringify(errs)}`);
  const res = await rpc('lv_results', { p_qid: q.id });
  console.log(`집계: ${res.n}명 참여`);
  if (events.length) console.log(`실시간 알림 ${events.length}개 받음 · 첫 알림까지 ${events[0] - t0}ms · 마지막 알림까지 ${events[events.length - 1] - t0}ms`);

  // 같은 기기 도배 · 1기기 1표 확인
  const one = cid(9999);
  const v0 = q.type === 'choice' ? ['0'] : ['도배시험'];
  const a = await rpc('lv_submit', { p_room: room, p_qid: q.id, p_cid: one, p_values: v0 });
  const b = await rpc('lv_submit', { p_room: room, p_qid: q.id, p_cid: one, p_values: v0 });
  console.log(`도배 방지: 첫 번째 ${a.ok ? '저장' : a.err} → 바로 다음 ${b.ok ? '저장 (문제!)' : b.err}`);
}
if (withQA) {
  const lat = [];
  await Promise.all(Array.from({ length: N }, async (_, i) => {
    const s = Date.now();
    await rpc('lv_qa_post', { p_room: room, p_cid: cid(i), p_body: `부하 시험 질문 ${i + 1}` }).catch(() => {});
    lat.push(Date.now() - s);
  }));
  console.log(`Q&A 보내기 ${N}개: ${stats(lat)}`);
}
ws && ws.close();
