/* ── 라이브 참여 결과 위젯 + 공용 연결 코드 ─────────────────────────
   덱 장표:  <div class="lv-box" data-room="w1" data-q="agi"></div>
             <div class="lv-box" data-room="w1" data-q="live"></div>
             <div class="lv-box" data-room="w1" data-q="qa"></div>
   학생 페이지 · 관리 페이지도 이 파일의 window.LV 를 같이 쓴다.
   외부 파일 없이 동작 (QR 생성기 포함). 이름은 전부 lv- / LV. */
(function () {
  'use strict';
  if (window.LV && window.LV.version) return;

  var CFG = Object.assign({
    url: 'https://gxyckkinlygeasruapmj.supabase.co',
    key: '@@ANON_KEY@@',
    site: 'https://ceaser501.github.io/lecture-survey/'
  }, window.LV_CONFIG || {});

  /* ───────── QR 생성기 (qrcode-generator, MIT, Kazuhiko Arase) ───────── */
  var qrcode = /*@@QRCODE@@*/ null;

  function qrSvg(text) {
    var qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount(), d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges"><path fill="#000" d="' + d + '"/></svg>';
  }

  /* ───────── 작은 도우미 ───────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var store = (function () {
    var mem = {};
    function ok() { try { localStorage.setItem('lv-t', '1'); localStorage.removeItem('lv-t'); return true; } catch (e) { return false; } }
    var has = ok();
    return {
      get: function (k) { try { return has ? localStorage.getItem(k) : (mem[k] || null); } catch (e) { return mem[k] || null; } },
      set: function (k, v) { mem[k] = v; try { if (has) localStorage.setItem(k, v); } catch (e) {} },
      del: function (k) { delete mem[k]; try { if (has) localStorage.removeItem(k); } catch (e) {} }
    };
  })();
  function clientId() {
    var id = store.get('lv-cid');
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      var a = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(a);
      id = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      store.set('lv-cid', id);
    }
    return id;
  }
  function roomUrl(room) { return CFG.site.replace(/\/?$/, '/') + '?r=' + encodeURIComponent(room); }
  function shortUrl(room) { return roomUrl(room).replace(/^https?:\/\//, ''); }
  function urlLines(room) { // 첫 줄 도메인, 둘째 줄 경로 (QR 아래 좁은 칸용)
    var u = shortUrl(room), i = u.indexOf('/');
    return esc(u.slice(0, i)) + '<br><b>' + esc(u.slice(i)) + '</b>';
  }
  function debounce(fn, ms) { // 마지막 호출 뒤 ms, 계속 불려도 ms×3 안에는 한 번 실행
    var t = null, first = 0;
    return function () {
      var now = Date.now();
      if (!t) first = now;
      clearTimeout(t);
      t = setTimeout(function () { t = null; fn(); }, Math.max(0, Math.min(ms, first + ms * 3 - now)));
    };
  }

  /* ───────── 연결 상태 ───────── */
  var netFns = [], netState = { rest: true, rt: false };
  function setNet(k, v) {
    if (netState[k] === v) return;
    netState[k] = v;
    netFns.forEach(function (f) { try { f(netState); } catch (e) {} });
  }
  function onNet(f) { netFns.push(f); f(netState); return function () { netFns = netFns.filter(function (x) { return x !== f; }); }; }

  /* ───────── 로그인 (강사) ───────── */
  var AUTH_KEY = 'lv-auth';
  var auth = {
    get: function () { try { return JSON.parse(store.get(AUTH_KEY) || 'null'); } catch (e) { return null; } },
    save: function (s) {
      if (!s) { store.del(AUTH_KEY); return; }
      store.set(AUTH_KEY, JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token,
        expires_at: s.expires_at || (Math.floor(Date.now() / 1000) + (s.expires_in || 3600)),
        email: (s.user && s.user.email) || s.email || '' }));
    },
    login: function (email, password) {
      return fetch(CFG.url + '/auth/v1/token?grant_type=password', {
        method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function (r) { return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error_description || j.msg || j.message || '로그인 실패');
        auth.save(j); return rpc('lv_is_admin', {}, true).then(function (isAdmin) {
          if (!isAdmin) { auth.save(null); throw new Error('강사로 등록된 계정이 아니에요'); }
          return auth.get();
        });
      }); });
    },
    logout: function () {
      var s = auth.get();
      auth.save(null);
      if (s) fetch(CFG.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: CFG.key, Authorization: 'Bearer ' + s.access_token } }).catch(function () {});
    },
    _refreshing: null,
    token: function () {
      var s = auth.get();
      if (!s) return Promise.resolve(null);
      if (s.expires_at - 120 > Date.now() / 1000) return Promise.resolve(s.access_token);
      if (auth._refreshing) return auth._refreshing;
      auth._refreshing = fetch(CFG.url + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token })
      }).then(function (r) { return r.json().then(function (j) {
        if (!r.ok) { if (r.status === 400 || r.status === 401) auth.save(null); return null; }
        auth.save(j); return j.access_token;
      }); }).catch(function () { return s.access_token; })
        .then(function (t) { auth._refreshing = null; return t; });
      return auth._refreshing;
    }
  };

  /* ───────── REST · RPC ───────── */
  function call(path, opt, useAuth) {
    opt = opt || {};
    return (useAuth ? auth.token() : Promise.resolve(null)).then(function (tok) {
      if (useAuth && !tok) { var e = new Error('강사 로그인이 필요해요'); e.code = 'auth'; throw e; }
      var headers = Object.assign({ apikey: CFG.key, Authorization: 'Bearer ' + (tok || CFG.key),
        'Content-Type': 'application/json' }, opt.headers || {});
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = ctl && setTimeout(function () { ctl.abort(); }, opt.timeout || 8000);
      return fetch(CFG.url + path, { method: opt.method || 'GET', headers: headers, cache: 'no-store',
        body: opt.body == null ? undefined : JSON.stringify(opt.body), signal: ctl ? ctl.signal : undefined })
        .then(function (r) {
          clearTimeout(timer);
          setNet('rest', true);
          return r.text().then(function (t) {
            var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
            if (!r.ok) {
              var err = new Error((j && (j.message || j.msg || j.error_description)) || ('HTTP ' + r.status));
              err.status = r.status; err.code = (r.status === 401 || r.status === 403 || (j && j.code === '42501')) ? 'auth' : 'http';
              throw err;
            }
            return j;
          });
        }, function (e) {
          clearTimeout(timer);
          setNet('rest', false);
          var err = new Error('연결 안 됨'); err.code = 'net'; throw err;
        });
    });
  }
  function rpc(name, args, useAuth) { return call('/rest/v1/rpc/' + name, { method: 'POST', body: args || {} }, useAuth); }

  /* ───────── 실시간 (Supabase Realtime Broadcast, 라이브러리 없이) ───────── */
  var rt = {
    ws: null, subs: {}, joined: {}, ref: 0, hb: null, hbRef: null, hbTimer: null, backoff: 1000, retryT: null,
    topic: function (room) { return 'realtime:lv-' + room; },
    send: function (m) { try { if (rt.ws && rt.ws.readyState === 1) rt.ws.send(JSON.stringify(m)); } catch (e) {} },
    join: function (room) {
      var r = String(++rt.ref);
      rt.joined[room] = r;
      rt.send({ topic: rt.topic(room), event: 'phx_join', ref: r, join_ref: r,
        payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, postgres_changes: [], private: false },
                   access_token: CFG.key } });
    },
    emit: function (room, msg) { (rt.subs[room] || []).forEach(function (f) { try { f(msg); } catch (e) {} }); },
    emitAll: function (msg) { Object.keys(rt.subs).forEach(function (room) { rt.emit(room, msg); }); },
    connect: function () {
      if (typeof WebSocket === 'undefined') return;
      if (rt.ws && (rt.ws.readyState === 0 || rt.ws.readyState === 1)) return;
      clearTimeout(rt.retryT);
      var url = CFG.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(CFG.key) + '&vsn=1.0.0';
      var ws;
      try { ws = new WebSocket(url); } catch (e) { rt.later(); return; }
      rt.ws = ws;
      ws.onopen = function () {
        rt.backoff = 1000; rt.joined = {};
        Object.keys(rt.subs).forEach(rt.join);
        clearInterval(rt.hb);
        rt.hb = setInterval(rt.beat, 20000);
      };
      ws.onmessage = function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.topic === 'phoenix') { if (m.ref === rt.hbRef) { clearTimeout(rt.hbTimer); rt.hbRef = null; } return; }
        var room = String(m.topic || '').replace(/^realtime:lv-/, '');
        if (m.event === 'phx_reply' && m.ref && m.ref === rt.joined[room]) {
          if (m.payload && m.payload.status === 'ok') { setNet('rt', true); rt.emit(room, { t: 'resync' }); }
          else setTimeout(function () { if (rt.subs[room]) rt.join(room); }, 3000);
        } else if (m.event === 'broadcast' && m.payload) {
          rt.emit(room, m.payload.payload || {});
        } else if (m.event === 'phx_error' || m.event === 'phx_close') {
          if (rt.subs[room]) setTimeout(function () { rt.join(room); }, 2000);
        }
      };
      ws.onclose = function () {
        if (rt.ws !== ws) return;
        clearInterval(rt.hb); clearTimeout(rt.hbTimer);
        rt.ws = null; rt.joined = {};
        setNet('rt', false);
        rt.later();
      };
      ws.onerror = function () { try { ws.close(); } catch (e) {} };
    },
    later: function () {
      clearTimeout(rt.retryT);
      if (!Object.keys(rt.subs).length) return;
      rt.retryT = setTimeout(rt.connect, rt.backoff);
      rt.backoff = Math.min(rt.backoff * 2, 10000);
    },
    beat: function () {
      if (!rt.ws || rt.ws.readyState !== 1) return;
      rt.hbRef = String(++rt.ref);
      rt.send({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: rt.hbRef });
      clearTimeout(rt.hbTimer);
      rt.hbTimer = setTimeout(function () { if (rt.ws) try { rt.ws.close(); } catch (e) {} }, 10000);
    },
    kick: function () { // 화면이 다시 보이거나 네트워크가 돌아오면 즉시 확인
      if (!rt.ws || rt.ws.readyState > 1) { rt.backoff = 1000; rt.connect(); }
      else rt.beat();
      rt.emitAll({ t: 'resync' });
    },
    sub: function (room, fn) {
      (rt.subs[room] = rt.subs[room] || []).push(fn);
      if (rt.ws && rt.ws.readyState === 1 && !rt.joined[room]) rt.join(room);
      rt.connect();
      return function () {
        rt.subs[room] = (rt.subs[room] || []).filter(function (f) { return f !== fn; });
        if (!rt.subs[room].length) {
          delete rt.subs[room];
          if (rt.joined[room]) { rt.send({ topic: rt.topic(room), event: 'phx_leave', payload: {}, ref: String(++rt.ref) }); delete rt.joined[room]; }
        }
      };
    }
  };
  window.addEventListener('online', function () { rt.kick(); });
  window.addEventListener('offline', function () { setNet('rest', false); setNet('rt', false); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) rt.kick(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) rt.kick(); });

  /* ───────── 결과 그리기 ───────── */
  function pct(n, total) { return total ? Math.round(n * 100 / total) : 0; }

  function renderChoice(body, res) {
    var opts = res.options || [], counts = res.data || [], total = 0, max = 0;
    counts.forEach(function (c) { total += c; if (c > max) max = c; });
    if (res.multi) total = res.n || 0; // 복수 선택: 응답한 사람 중 몇 %가 골랐나
    var sig = res.id + '|' + JSON.stringify(opts) + (res.multi ? '|m' : '');
    var wrap = body.querySelector('.lv-bars');
    if (!wrap || wrap.getAttribute('data-sig') !== sig) {
      body.innerHTML = '';
      wrap = h('div', 'lv-bars lv-n' + opts.length);
      if (res.multi) wrap.appendChild(h('div', 'lv-multi', '복수 선택 · 응답자 중 고른 비율'));
      wrap.setAttribute('data-sig', sig);
      opts.forEach(function (o) {
        var b = h('div', 'lv-bar', '<div class="lv-bar-row"><span class="lv-bar-t">' + esc(o) +
          '</span><span class="lv-bar-p"><span class="lv-v">0</span><small>%</small><span class="lv-bar-n"></span></span></div>' +
          '<div class="lv-bar-track"><div class="lv-bar-fill"></div></div>');
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
      wrap.offsetWidth; // 0%에서 자라도록
    }
    Array.prototype.forEach.call(wrap.querySelectorAll('.lv-bar'), function (b, i) {
      var c = counts[i] || 0, p = pct(c, total);
      b.classList.toggle('lv-top', max > 0 && c === max);
      b.querySelector('.lv-v').textContent = p;
      b.querySelector('.lv-bar-n').textContent = c + '명';
      b.querySelector('.lv-bar-fill').style.width = p + '%';
    });
  }

  function renderText(body, res, o) {
    var items = (res.data || []).slice(0, o.compact ? 30 : 40);
    if (!items.length) { body.innerHTML = '<div class="lv-msg">아직 답변이 없어요</div>'; return; }
    var wrap = body.querySelector('.lv-cards');
    if (!wrap || wrap.getAttribute('data-q') !== res.id) {
      body.innerHTML = ''; wrap = h('div', 'lv-cards'); wrap.setAttribute('data-q', res.id); body.appendChild(wrap);
      wrap._first = true;
    }
    var have = {};
    Array.prototype.forEach.call(wrap.children, function (c) { have[c.getAttribute('data-id') + '|' + c.textContent] = c; });
    var frag = document.createDocumentFragment();
    items.forEach(function (it) {
      var k = it.id + '|' + it.v, el = have[k];
      if (!el) { el = h('div', 'lv-card' + (wrap._first ? '' : ' lv-new')); el.setAttribute('data-id', it.id); el.textContent = it.v; }
      frag.appendChild(el);
    });
    wrap.innerHTML = ''; wrap.appendChild(frag); wrap._first = false;
  }

  var measureCtx = null;
  function textWidth(t, size) {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    measureCtx.font = '800 ' + size + 'px Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif';
    return measureCtx.measureText(t).width;
  }
  // 많이 나온 말일수록 크게, 가운데부터 나선으로 겹치지 않게 놓는다
  function layoutCloud(words, W, H, compact) {
    if (!words.length || W < 50 || H < 50) return [];
    var max = words[0].n, min = words[words.length - 1].n;
    var big = Math.min(compact ? 54 : 128, H * 0.26), small = compact ? (words.length <= 12 ? 18 : 15) : (words.length <= 12 ? 34 : 24);
    if (words.length > 30) big *= 0.85;
    if (words.length > 55) big *= 0.85;
    var placed = [], out = [], cx = W / 2, cy = H / 2, ratio = W / H;
    function hit(r) {
      if (r.x < 4 || r.y < 2 || r.x + r.w > W - 4 || r.y + r.h > H - 2) return true;
      for (var i = 0; i < placed.length; i++) {
        var p = placed[i];
        if (r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y) return true;
      }
      return false;
    }
    words.forEach(function (wd, idx) {
      var t = max === min ? (idx === 0 ? 1 : 0.55) : (wd.n - min) / (max - min);
      var fs = Math.round(small + (big - small) * Math.sqrt(t));
      for (var attempt = 0; attempt < 4; attempt++) {
        // 말이 적을수록 사이를 넓게 띄워서 둥둥 떠 있는 느낌이 나게
        var gap = (compact ? 0.5 : 1) * (words.length <= 8 ? 70 : words.length <= 16 ? 44 : 16);
        var w = textWidth(wd.w, fs) + fs * 0.6 + 10 + gap, hh = fs * 1.3 + 8 + gap * 0.6;
        if (w > W * 0.94) { fs = Math.floor(fs * (W * 0.94) / w); continue; }
        var done = false;
        for (var s = 0; s < 1400; s++) {
          var a = s * 0.32, rad = (fs * 0.06 + 1.6) * a;
          var x = cx + rad * Math.cos(a) * Math.max(1, ratio * 0.8), y = cy + rad * Math.sin(a);
          var rect = { x: x - w / 2, y: y - hh / 2, w: w, h: hh };
          if (!hit(rect)) { placed.push(rect); out.push({ k: wd.k, w: wd.w, n: wd.n, x: x, y: y, fs: fs, rank: idx, bw: w - gap, bh: hh - gap * 0.6 }); done = true; break; }
        }
        if (done) break;
        fs = Math.max(small * 0.7, Math.floor(fs * 0.8));
      }
    });
    return out;
  }
  // 함께 쓴 말끼리 가까이 오도록 자리를 다듬는다 (용수철 + 겹침 밀어내기). 이전 자리에서 시작해 크게 튀지 않게
  function relaxCloud(spots, links, W, H, prev) {
    if (!links.length || spots.length < 2) return spots;
    var at = {}; spots.forEach(function (sp) { at[sp.k] = sp; if (prev && prev[sp.k]) { sp.x = prev[sp.k].x; sp.y = prev[sp.k].y; } });
    var L = links.filter(function (l) { return at[l.a] && at[l.b]; });
    var cx = W / 2, cy = H / 2, sc = Math.min(1, W / 1300), gapX = 90 * sc, gapY = 46 * sc;
    for (var it = 0; it < 260; it++) {
      var cool = 1 - it / 300;
      L.forEach(function (l) {
        var A = at[l.a], B = at[l.b], dx = B.x - A.x, dy = B.y - A.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var want = (A.bw + B.bw) / 2 + 110 * sc;
        var f = (d - want) / d * 0.04 * Math.min(3, l.n) * cool;
        A.x += dx * f; A.y += dy * f; B.x -= dx * f; B.y -= dy * f;
      });
      spots.forEach(function (sp) { sp.x += (cx - sp.x) * 0.002; sp.y += (cy - sp.y) * 0.004; });
      for (var i = 0; i < spots.length; i++) for (var j = i + 1; j < spots.length; j++) {
        var P = spots[i], Q = spots[j];
        var ox = (P.bw + Q.bw) / 2 + gapX - Math.abs(P.x - Q.x), oy = (P.bh + Q.bh) / 2 + gapY - Math.abs(P.y - Q.y);
        if (ox > 0 && oy > 0) {
          if (ox / (P.bw + Q.bw) < oy / (P.bh + Q.bh)) { var sx = (P.x < Q.x ? -1 : 1) * ox / 2; P.x += sx; Q.x -= sx; }
          else { var sy = (P.y < Q.y ? -1 : 1) * oy / 2; P.y += sy; Q.y -= sy; }
        }
      }
      spots.forEach(function (sp) {
        sp.x = Math.max(sp.bw / 2 + 4, Math.min(W - sp.bw / 2 - 4, sp.x));
        sp.y = Math.max(sp.bh / 2 + 2, Math.min(H - sp.bh / 2 - 2, sp.y));
      });
    }
    return spots;
  }

  // 같은 학생이 함께 보낸 말끼리 선으로 잇는다. 굵을수록 같이 쓴 사람이 많다
  function drawLinks(box, spots, links, W, H, o) {
    var svgNS = 'http://www.w3.org/2000/svg', svg = box.querySelector('.lv-links'), legend = box.querySelector('.lv-legend');
    var at = {}; spots.forEach(function (sp) { at[sp.k] = sp; });
    var max = 1; links.forEach(function (l) { if (l.n > max) max = l.n; });
    function edge(sp, ux, uy) {
      var hw = sp.bw / 2 - 2, hh = sp.bh / 2 - 4;
      return Math.min(ux ? hw / Math.abs(ux) : Infinity, uy ? hh / Math.abs(uy) : Infinity);
    }
    var out = '', shown = 0;
    links.slice(0, o.compact ? 20 : 40).forEach(function (l) {
      var A = at[l.a], B = at[l.b]; if (!A || !B) return;
      var dx = B.x - A.x, dy = B.y - A.y, d = Math.sqrt(dx * dx + dy * dy); if (!d) return;
      var ux = dx / d, uy = dy / d, ea = edge(A, ux, uy) + 6, eb = edge(B, ux, uy) + 6;
      if (ea + eb + 8 > d) return;
      var x1 = A.x + ux * ea, y1 = A.y + uy * ea, x2 = B.x - ux * eb, y2 = B.y - uy * eb;
      // 다른 말을 가로지르면 그리지 않는다 (읽기 어려워짐)
      for (var j = 0; j < spots.length; j++) {
        var O = spots[j]; if (O === A || O === B) continue;
        for (var u = 0.05; u < 0.96; u += 0.05) {
          var px = x1 + (x2 - x1) * u, py = y1 + (y2 - y1) * u;
          if (Math.abs(px - O.x) < O.bw / 2 - 2 && Math.abs(py - O.y) < O.bh / 2 - 4) return;
        }
      }
      var t = max > 1 ? (l.n - 1) / (max - 1) : 0, sw = (o.compact ? 1 : 1.6) + t * (o.compact ? 3 : 5);
      out += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
        '" stroke-width="' + sw.toFixed(1) + '" class="' + (l.n === max && max > 1 ? 'lv-strong' : '') + '"/>';
      if (l.n >= 2 && !o.compact && Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) > 80) {
        out += '<text x="' + ((x1 + x2) / 2).toFixed(1) + '" y="' + ((y1 + y2) / 2 - 8).toFixed(1) + '">' + l.n + '명</text>';
      }
      shown++;
    });
    if (!svg) { svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('class', 'lv-links'); box.insertBefore(svg, box.firstChild); }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = out;
    if (!legend) { legend = h('div', 'lv-legend', '선: 같은 사람이 함께 쓴 말 · 굵을수록 많이'); box.appendChild(legend); }
    legend.style.display = shown ? '' : 'none';
  }

  function renderCloud(body, res, o) {
    var words = res.data || [];
    if (!words.length) { body.innerHTML = '<div class="lv-msg">아직 들어온 말이 없어요</div>'; return; }
    var box = body.querySelector('.lv-cloud');
    if (!box || box.getAttribute('data-q') !== res.id) {
      body.innerHTML = ''; box = h('div', 'lv-cloud'); box.setAttribute('data-q', res.id); body.appendChild(box); box._first = true;
    }
    if (o.compact && !body.style.height) body.style.height = '260px';
    var W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) { box._pending = res; return; }
    var LH = (res.links || []).length ? H - (o.compact ? 18 : 32) : H; // 아래 설명 한 줄 자리
    var spots = relaxCloud(layoutCloud(words, W, LH, o.compact), res.links || [], W, LH, box._pos), have = {};
    box._pos = {}; spots.forEach(function (sp) { box._pos[sp.k] = { x: sp.x, y: sp.y }; });
    Array.prototype.forEach.call(box.querySelectorAll('.lv-word'), function (c) { have[c.getAttribute('data-k')] = c; });
    var keep = {};
    drawLinks(box, spots, res.links || [], W, H, o);
    spots.forEach(function (s, i) {
      var el = have[s.k];
      if (!el) {
        el = h('span', 'lv-word' + (box._first ? '' : ' lv-new'), '<span class="lv-wi"></span>'); el.setAttribute('data-k', s.k); box.appendChild(el);
        // 말마다 속도 · 시작점이 달라야 둥둥 떠 있는 느낌이 난다
        var seed = 0; for (var c = 0; c < s.k.length; c++) seed = (seed * 31 + s.k.charCodeAt(c)) % 997;
        el.firstChild.style.animationDuration = (4.5 + (seed % 30) / 10) + 's';
        el.firstChild.style.animationDelay = (-(seed % 50) / 10) + 's';
      }
      el.firstChild.textContent = s.w;
      el.className = 'lv-word' + (s.rank < 3 ? ' lv-hot' : s.rank < 10 ? ' lv-r1' : '') + (el.classList.contains('lv-new') ? ' lv-new' : '');
      el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; el.style.fontSize = s.fs + 'px';
      el.title = s.n + '번';
      keep[s.k] = 1;
    });
    Object.keys(have).forEach(function (k) { if (!keep[k]) have[k].remove(); });
    box._first = false; box._last = res;
  }

  function renderResult(body, res, o) {
    o = o || {};
    if (!res) { body.innerHTML = ''; return; }
    if (res.type === 'choice') renderChoice(body, res, o);
    else if (res.type === 'text') renderText(body, res, o);
    else renderCloud(body, res, o);
  }

  function renderQA(body, data, o) {
    o = o || {};
    var items = (data && data.items) || [];
    if (data && data.enabled === false) { body.innerHTML = '<div class="lv-msg">Q&amp;A가 꺼져 있어요</div>'; return; }
    if (!items.length) { body.innerHTML = '<div class="lv-msg">아직 공개된 질문이 없어요</div>'; return; }
    var open = items.filter(function (i) { return i.status !== 'answered'; }).slice(0, o.max || 5);
    var done = items.filter(function (i) { return i.status === 'answered'; }).slice(0, open.length >= 4 ? 1 : 2);
    var wrap = body.querySelector('.lv-qa');
    if (!wrap) { body.innerHTML = ''; wrap = h('div', 'lv-qa'); body.appendChild(wrap); wrap._first = true; }
    var have = {};
    Array.prototype.forEach.call(wrap.children, function (c) { have[c.getAttribute('data-id')] = c; });
    var frag = document.createDocumentFragment();
    open.concat(done).forEach(function (it) {
      var el = have[it.id];
      if (!el) {
        el = h('button', 'lv-qa-i' + (wrap._first ? '' : ' lv-new'));
        el.type = 'button'; el.setAttribute('data-id', it.id);
        el.innerHTML = '<span class="lv-qa-b"></span><span class="lv-qa-l"><b></b>나도 궁금해</span>';
      }
      el.classList.toggle('lv-done', it.status === 'answered');
      el.setAttribute('data-status', it.status);
      el.querySelector('.lv-qa-b').textContent = it.body;
      el.querySelector('.lv-qa-l b').textContent = it.likes;
      el.querySelector('.lv-qa-l').lastChild.textContent = it.status === 'answered' ? '답변 완료' : '나도 궁금해';
      frag.appendChild(el);
    });
    wrap.innerHTML = ''; wrap.appendChild(frag); wrap._first = false;
  }

  /* ───────── 토스트 · 강사 로그인 창 ───────── */
  function toast(msg) {
    var t = h('div', 'lv-toast'); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function stopAll(el) {
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown', 'keyup', 'keypress', 'wheel']
      .forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  }
  function loginDialog(done) {
    if (document.querySelector('.lv-pop')) return;
    var s = auth.get();
    var pop = h('div', 'lv-pop');
    stopAll(pop);
    if (s) {
      pop.innerHTML = '<form><h3>강사 로그인 중</h3><p>' + esc(s.email) + '<br>장표에 들어오면 연결된 질문이 자동으로 열립니다.</p>' +
        '<div class="lv-row"><button type="button" class="lv-out">로그아웃</button><button type="submit" class="lv-go">닫기</button></div></form>';
      pop.querySelector('.lv-out').onclick = function () { auth.logout(); pop.remove(); done && done(); };
      pop.querySelector('form').onsubmit = function (e) { e.preventDefault(); pop.remove(); };
    } else {
      pop.innerHTML = '<form><h3>강사 로그인</h3><p>이 PC에서 한 번만 하면 됩니다. 로그인하면 장표에 들어올 때 질문이 자동으로 열려요.</p>' +
        '<input type="email" name="e" placeholder="이메일" autocomplete="username" required>' +
        '<input type="password" name="p" placeholder="비밀번호" autocomplete="current-password" required>' +
        '<div class="lv-err"></div><div class="lv-row"><button type="button" class="lv-x">취소</button><button type="submit" class="lv-go">로그인</button></div></form>';
      var f = pop.querySelector('form');
      pop.querySelector('.lv-x').onclick = function () { pop.remove(); };
      f.onsubmit = function (e) {
        e.preventDefault();
        f.querySelector('.lv-err').textContent = '';
        auth.login(f.e.value.trim(), f.p.value).then(function () { pop.remove(); toast('강사 로그인 완료'); done && done(); },
          function (err) { f.querySelector('.lv-err').textContent = err.code === 'net' ? '인터넷 연결을 확인해 주세요' : err.message; });
      };
    }
    pop.addEventListener('click', function (e) { if (e.target === pop) pop.remove(); });
    document.body.appendChild(pop);
    var first = pop.querySelector('input,button.lv-go'); if (first) first.focus();
  }

  /* ───────── 덱 위젯 ───────── */
  var boxes = [];
  function mount(box) {
    if (box._lv) return box._lv;
    var room = box.getAttribute('data-room') || 'w1';
    var qid = box.getAttribute('data-qid') || ''; // 관리 화면 · 전체보기용: 질문 id 로 직접
    var key = qid ? '' : (box.getAttribute('data-q') || 'live').trim();
    var isQA = key === 'qa', isLive = key === 'live';
    var showPrompt = box.getAttribute('data-prompt') ? box.getAttribute('data-prompt') !== 'hide' : (isLive || !!qid);
    var autoOpen = qid ? false : box.getAttribute('data-open') !== '0';
    var autoClose = box.getAttribute('data-close') === '1';
    var showSide = box.getAttribute('data-qr') !== '0';
    var slide = box.closest('section.slide, .slide');

    var w = h('div', 'lv-w' + (showSide ? '' : ' lv-noside'));
    var main = h('div', 'lv-main');
    var prompt = h('div', 'lv-prompt');
    var body = h('div', 'lv-body');
    main.appendChild(prompt); main.appendChild(body);
    w.appendChild(main);
    var side = h('div', 'lv-side',
      '<div class="lv-qr">' + qrSvg(roomUrl(room)) + '</div><div class="lv-url">' + urlLines(room) + '</div><div class="lv-count"><b>0</b><span>' + (isQA ? '개 질문' : '명 참여') + '</span></div><div class="lv-state"></div>');
    if (showSide) w.appendChild(side);
    var foot = h('div', 'lv-foot', '<span class="lv-net">연결 안 됨</span>');
    var keyBtn = h('button', 'lv-key'); keyBtn.type = 'button';
    foot.appendChild(keyBtn);
    box.innerHTML = ''; box.appendChild(w); box.appendChild(foot);

    var st = { active: false, unsub: null, poll: null, data: null, opening: false, lastOpenedId: null };
    function setKeyBtn() { var s = auth.get(); keyBtn.classList.toggle('lv-in', !!s); keyBtn.textContent = s ? '강사' : '로그인'; }
    setKeyBtn();
    keyBtn.addEventListener('click', function (e) { e.stopPropagation(); loginDialog(function () { setKeyBtn(); refresh(); }); });

    var offT = null;
    var unNet = onNet(function (n) {
      clearTimeout(offT);
      // 실시간이 안 붙어도 3초마다 새로 읽으므로, 서버에 아예 닿지 않을 때만 표시
      if (n.rest) box.classList.remove('lv-off');
      else offT = setTimeout(function () { if (!netState.rest) box.classList.add('lv-off'); }, 1500);
    });

    function showMsg(html, small) { body.innerHTML = '<div class="lv-msg' + (small ? ' lv-small' : '') + '">' + html + '</div>'; }
    function setCount(n) { var b = side.querySelector('.lv-count b'); if (b && b.textContent !== String(n)) b.textContent = n; }
    function setState(open) {
      var s = side.querySelector('.lv-state');
      s.className = 'lv-state' + (open ? ' lv-on' : '');
      s.textContent = open == null ? '' : open ? '받는 중' : '마감';
    }

    function draw(d) {
      st.data = d;
      if (isQA) {
        prompt.textContent = showPrompt ? '' : '';
        setCount((d.items || []).filter(function (i) { return i.status !== 'answered'; }).length);
        setState(d.enabled === false ? false : null);
        renderQA(body, d);
        return;
      }
      if (d.err === 'no_room') { showMsg('방 <code>' + esc(room) + '</code> 이 없어요', true); return; }
      if (d.missing && qid) { prompt.textContent = ''; setCount(0); setState(null); showMsg('질문을 찾을 수 없어요 (삭제됐을 수 있어요)', true); return; }
      if (d.missing) {
        prompt.textContent = ''; setCount(0); setState(null);
        showMsg('관리 화면에서 <code>' + esc(key) + '</code> 키로 질문을 등록하세요', true); return;
      }
      var res = d.result;
      if (!res) { prompt.textContent = ''; setCount(0); setState(null); showMsg('질문을 열면 결과가 여기에 나타나요'); return; }
      prompt.textContent = showPrompt ? res.prompt : '';
      setCount(res.n || 0);
      setState(!!res.open);
      if (body.querySelector('.lv-msg') && (res.type !== 'text' || (res.data || []).length)) body.innerHTML = '';
      renderResult(body, res, {});
    }

    var busy = false, again = false;
    function refresh() {
      if (busy) { again = true; return; }
      busy = true;
      var p = isQA ? rpc('lv_qa_board', { p_room: room })
        : qid ? rpc('lv_results', { p_qid: qid }).then(function (r) { return r ? { room: room, result: r } : { room: room, missing: true }; })
        : rpc('lv_board', { p_room: room, p_key: key });
      p.then(function (d) { if (d) { draw(d); maybeOpen(d); } }, function () {})
        .then(function () { busy = false; if (again) { again = false; refresh(); } });
    }
    var soon = debounce(refresh, 250);

    function maybeOpen(d) {
      if (!st.active || isQA || isLive || qid || !autoOpen || !auth.get() || st.opening) return;
      if (!d.result || d.result.open || st.lastOpenedId === d.result.id) return;
      st.opening = true; st.lastOpenedId = d.result.id;
      rpc('lv_admin_open', { p_room: room, p_qid: d.result.id }, true)
        .then(function () { refresh(); }, function (e) { if (e.code === 'auth') { auth.save(null); setKeyBtn(); } })
        .then(function () { st.opening = false; });
    }

    function start() {
      if (st.active) return;
      st.active = true; st.lastOpenedId = null;
      st.unsub = rt.sub(room, function (m) {
        if (isQA ? (m.t === 'qa' || m.t === 'room' || m.t === 'all' || m.t === 'resync') : m.t !== 'qa') soon();
      });
      refresh();
      (function loop() {
        st.poll = setTimeout(function () { refresh(); loop(); }, netState.rt ? 20000 : 3000);
      })();
    }
    function stop() {
      if (!st.active) return;
      st.active = false;
      clearTimeout(st.poll);
      if (st.unsub) st.unsub();
      if (autoClose && !isQA && !isLive && auth.get() && st.data && st.data.result && st.data.result.open) {
        rpc('lv_admin_close', { p_qid: st.data.result.id }, true).catch(function () {});
      }
    }

    // Q&A 장표: 강사 로그인 상태면 질문을 누를 때 답변 완료 ↔ 되돌리기
    body.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.lv-qa-i');
      if (!b) return;
      e.stopPropagation();
      if (!auth.get()) { toast('오른쪽 아래 「로그인」 후 답변 완료로 바꿀 수 있어요'); return; }
      var done = b.getAttribute('data-status') === 'answered';
      call('/rest/v1/lv_qa?id=eq.' + encodeURIComponent(b.getAttribute('data-id')), {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: { status: done ? 'approved' : 'answered', answered_at: done ? null : new Date().toISOString() }
      }, true).then(refresh, function (err) { toast(err.code === 'auth' ? '강사 로그인이 필요해요' : '바꾸지 못했어요'); });
    });

    // 워드클라우드는 크기가 바뀌면 다시 배치
    if (window.ResizeObserver) {
      var lastW = 0, lastH = 0;
      new ResizeObserver(function () {
        if (body.clientWidth === lastW && body.clientHeight === lastH) return;
        lastW = body.clientWidth; lastH = body.clientHeight;
        if (st.data && st.data.result && st.data.result.type === 'wordcloud') renderResult(body, st.data.result, {});
      }).observe(body);
    }

    function check() {
      var on = !slide || slide.classList.contains('active');
      if (on) start(); else stop();
    }
    if (slide) new MutationObserver(check).observe(slide, { attributes: true, attributeFilter: ['class'] });
    check();
    if (!st.active) { refresh(); } // 장표 밖에서도 처음 모양은 미리 채워 둔다

    var api = { refresh: refresh, start: start, stop: stop, box: box, destroy: function () { stop(); unNet(); } };
    box._lv = api; boxes.push(api);
    return api;
  }

  function mountAll(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('.lv-box'), mount);
  }

  // 글꼴이 늦게 오면 워드클라우드 크기 재계산
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', function () {
      boxes.forEach(function (b) { if (b.box._lv) b.refresh(); });
    });
  }

  window.LV = {
    version: '1.0.0', cfg: CFG, rpc: rpc, call: call, auth: auth, rt: rt, onNet: onNet, net: netState,
    clientId: clientId, roomUrl: roomUrl, shortUrl: shortUrl, urlLines: urlLines, qrSvg: qrSvg, esc: esc, toast: toast,
    renderResult: renderResult, renderQA: renderQA, layoutCloud: layoutCloud, mount: mount, mountAll: mountAll,
    loginDialog: loginDialog
  };

  if (!(window.LV_CONFIG && window.LV_CONFIG.manual)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); });
    else mountAll();
  }
})();
