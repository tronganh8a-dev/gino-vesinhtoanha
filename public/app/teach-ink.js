/* Bút giảng bài — Anh Trọng Dạy Gino
   Thanh công cụ nổi trên mọi màn hình của app: bút, highlight, gõ chữ ghi chú, tẩy, hoàn tác, sổ memo.
   Kéo thanh công cụ / nút bút / sổ memo đi bất cứ đâu. Nét vẽ giữ theo từng màn hình (mất khi tải lại trang);
   sổ memo lưu trên máy (localStorage). */
(function () {
  'use strict';
  if (window.__gti) return; window.__gti = 1;
  var D = document, W = window;
  var PEN = ['#e0245e', '#2f6fe4', '#1fa34a', '#f59e0b', '#1b2430'], HL = ['#fff06a', '#ffb3d9', '#b4f5a3', '#a8dcff', '#ffd59a'];
  var PW = [2, 3.5, 6], HW = [12, 20, 30], TS = [17, 24, 34];
  var FONT = "Quicksand,'Klee One','UD Digi Kyokasho NP-R','Noto Sans JP',system-ui,sans-serif";
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var st = { tool: null, pc: 0, hc: 0, sz: 1, open: false, hide: false, vert: !!LS.get('gti_vert', false), pages: {}, hist: {}, cur: null, erasing: false, edit: null, last: 'main' };

  // ---------- giao diện ----------
  var css = D.createElement('style');
  css.textContent =
    '.gti-cv{position:fixed;left:0;top:0;z-index:2147483200;pointer-events:none;mix-blend-mode:multiply;touch-action:none}' +
    '.gti-cv2{position:fixed;left:0;top:0;z-index:2147483201;pointer-events:none}' +
    '.gti-cv.on{pointer-events:auto}.gti-cv.pen{cursor:crosshair}.gti-cv.hl{cursor:text}.gti-cv.er{cursor:cell}.gti-cv.tx{cursor:text}.gti-hide{visibility:hidden!important}' +
    '.gti-ta{position:fixed;z-index:2147483205;margin:0;padding:2px 4px;border:1.5px dashed #c42f66;border-radius:6px;background:rgba(255,255,255,.88);outline:none;resize:none;overflow:hidden;white-space:pre;line-height:1.3;font-weight:700;min-width:60px;-webkit-user-select:text;user-select:text}' +
    '.gti-bar{position:fixed;z-index:2147483400;display:none;align-items:center;flex-wrap:wrap;gap:3px;padding:6px;max-width:min(96vw,1180px);border-radius:16px;background:#1b2430;' +
    'box-shadow:0 12px 32px rgba(10,20,30,.35);font:700 13px/1 Quicksand,system-ui,sans-serif;color:#e8eef3;user-select:none;-webkit-user-select:none;touch-action:none}' +
    '.gti-bar.on{display:flex}.gti-bar.vert{flex-direction:column;flex-wrap:nowrap;max-height:92vh;overflow-y:auto;scrollbar-width:none}.gti-bar.vert::-webkit-scrollbar{display:none}' +
    '.gti-bar button,.gti-fab,.gti-nb button{all:unset;box-sizing:border-box;cursor:pointer}' +
    '.gti-bar button{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;min-width:36px;padding:0 9px;border-radius:10px;color:#e8eef3;white-space:nowrap}' +
    '.gti-bar button:hover{background:rgba(255,255,255,.1)}.gti-bar button.on{background:#fff;color:#1b2430}' +
    '.gti-bar svg{width:18px;height:18px;flex:none}.gti-sep{flex:none;width:1px;height:22px;background:rgba(255,255,255,.18);margin:0 3px}.gti-bar.vert .gti-sep{width:22px;height:1px;margin:3px 0}' +
    '.gti-grip{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:36px;cursor:grab;color:#8fa3b5;touch-action:none}.gti-grip:active{cursor:grabbing}.gti-bar.vert .gti-grip{width:36px;height:20px}' +
    '.gti-bar .gti-c{padding:0;width:30px;min-width:30px}.gti-bar .gti-c i{display:block;width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}' +
    '.gti-bar .gti-c.on{background:none}.gti-bar .gti-c.on i{box-shadow:0 0 0 2px #1b2430,0 0 0 4px #fff}' +
    '.gti-bar .gti-s{padding:0;width:34px}.gti-bar .gti-s b{display:block;width:15px;border-radius:9px;background:currentColor}' +
    '.gti-bar.dis .gti-c,.gti-bar.dis .gti-s{opacity:.3;pointer-events:none}' +
    '.gti-bar.vert .gti-l{display:none}@media (max-width:760px){.gti-bar .gti-l{display:none}.gti-bar button{padding:0 7px}}' +
    '.gti-fab{position:fixed;z-index:2147483400;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#c42f66;color:#fff;' +
    'box-shadow:0 6px 18px rgba(196,47,102,.4);touch-action:none}.gti-fab:hover{background:#a8244f}.gti-fab svg{width:24px;height:24px}.gti-fab.off{display:none}' +
    '.gti-nb{position:fixed;z-index:2147483300;display:none;flex-direction:column;min-width:260px;min-height:220px;width:380px;height:460px;max-width:96vw;max-height:92vh;resize:both;overflow:hidden;' +
    'background:#fffdf6;border-radius:14px;box-shadow:0 18px 44px rgba(10,20,30,.32);border:1px solid #e8dfc6;font:600 14px/1.2 Quicksand,system-ui,sans-serif;color:#1b2430}' +
    '.gti-nb.on{display:flex}' +
    '.gti-nbh{flex:none;display:flex;align-items:center;gap:4px;padding:6px 8px;background:#0d5a8c;color:#fff;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.gti-nbh b{flex:1;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gti-nbh span{font-size:12.5px;opacity:.9;white-space:nowrap}' +
    '.gti-nb button{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;color:#fff}.gti-nb button:hover{background:rgba(255,255,255,.16)}.gti-nb button svg{width:17px;height:17px}' +
    '.gti-nbb{position:relative;flex:1;min-height:0}' +
    '.gti-nbt{position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;border:0;outline:0;resize:none;padding:6px 14px 6px 44px;background-color:transparent;' +
    'background-image:linear-gradient(90deg,transparent 34px,#f3b6c6 34px,#f3b6c6 36px,transparent 36px),repeating-linear-gradient(180deg,transparent 0,transparent 31px,#cfe0ee 31px,#cfe0ee 32px);' +
    'background-attachment:local;line-height:32px;font:600 17px/32px ' + FONT + ';color:#1b2430;-webkit-user-select:text;user-select:text}' +
    '.gti-nbc{position:absolute;left:0;top:0;pointer-events:none;touch-action:none;mix-blend-mode:multiply}.gti-nbc.on{pointer-events:auto;cursor:crosshair}';
  D.head.appendChild(css);

  var I = {
    cur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 7-6 2-2 6z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="M14.5 5.5l3 3"/></svg>',
    hl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-4 4v3h3l4-4"/><path d="M9 11l6-6 4 4-6 6z"/><path d="M4 21h16" stroke-width="3" opacity=".55"/></svg>',
    tx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
    er: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h12"/><path d="M5.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L13 18H8.5z"/><path d="M10 11l5 5"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    clr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    nb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18M3 7h3M3 12h3M3 17h3M10 8h6M10 12h6"/></svg>',
    rot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="12" height="6" rx="2"/><rect x="17" y="3" width="4" height="18" rx="2"/></svg>',
    min: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 12h12"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
  };

  var cv = D.createElement('canvas'); cv.className = 'gti-cv'; var cx = cv.getContext('2d');
  var cv2 = D.createElement('canvas'); cv2.className = 'gti-cv2'; var cx2 = cv2.getContext('2d');
  var bar = D.createElement('div'); bar.className = 'gti-bar';
  var fab = D.createElement('button'); fab.type = 'button'; fab.className = 'gti-fab'; fab.title = 'Bút giảng bài (kéo để di chuyển)'; fab.innerHTML = I.pen;
  var nb = D.createElement('div'); nb.className = 'gti-nb';
  nb.innerHTML = '<div class="gti-nbh"><b>Sổ memo</b><button type="button" data-n="prev" title="Trang trước">' + I.prev + '</button><span class="gti-pg"></span>' +
    '<button type="button" data-n="next" title="Trang sau">' + I.next + '</button><button type="button" data-n="add" title="Thêm trang mới">' + I.add + '</button>' +
    '<button type="button" data-n="del" title="Xoá trang này">' + I.clr + '</button><button type="button" data-n="x" title="Đóng sổ">' + I.x + '</button></div>' +
    '<div class="gti-nbb"><textarea class="gti-nbt" spellcheck="false" placeholder="Ghi chú ở đây… (chọn Bút trên thanh công cụ để viết tay lên sổ)"></textarea><canvas class="gti-nbc"></canvas></div>';
  var OWN = [cv, cv2, bar, fab, nb];
  function host() { var f = D.fullscreenElement || D.webkitFullscreenElement; return f && !/^(IFRAME|VIDEO|IMG|CANVAS)$/.test(f.tagName) ? f : D.body; }
  function mount() { var h = host(); OWN.forEach(function (n) { if (n.parentNode !== h) h.appendChild(n); }); if (ta && ta.parentNode !== h) h.appendChild(ta); }
  function isOwn(el) { if (!el) return false; if (el.id === '__gwm' || el === ta) return true; for (var i = 0; i < OWN.length; i++) if (OWN[i] === el || OWN[i].contains(el)) return true; return false; }

  // ---------- màn hình hiện tại ----------
  var ctxK = '', ctxFixed = false;
  function detect() {
    var fe = D.fullscreenElement || D.webkitFullscreenElement, k, fx = true;
    if (fe) k = 'fs:' + (fe.id || String(fe.className).split(' ')[0] || fe.tagName);
    else {
      var vw = W.innerWidth, vh = W.innerHeight, found = null, els = D.elementsFromPoint ? D.elementsFromPoint(vw / 2, vh / 2) : [];
      for (var i = 0; i < els.length; i++) {
        var e = els[i]; if (isOwn(e)) continue;
        for (var a = e; a && a !== D.body && a !== D.documentElement; a = a.parentElement) {
          if (getComputedStyle(a).position === 'fixed') { var r = a.getBoundingClientRect(); if (r.width >= vw * 0.6 && r.height >= vh * 0.6) found = a; break; }
        }
        break;
      }
      if (found) k = 'ov:' + (found.id || String(found.className).split(' ')[0] || found.tagName);
      else { var p = D.querySelector('.page.on'); k = 'pg:' + (p ? p.id : 'x'); fx = false; }
    }
    if (k !== ctxK) { commit(); ctxK = k; ctxFixed = fx; st.cur = null; draw(); }
  }

  // ---------- vẽ trên màn hình ----------
  var A = { w: 0, h: 0 }, dpr = 1;
  function toS(x, y) { return ctxFixed ? [x, y] : [x + W.scrollX, y + W.scrollY]; }
  function toC(p) { return ctxFixed ? [p[0], p[1]] : [p[0] - W.scrollX, p[1] - W.scrollY]; }
  function layout() {
    dpr = W.devicePixelRatio || 1; A.w = D.documentElement.clientWidth || W.innerWidth; A.h = W.innerHeight;
    [cv, cv2].forEach(function (c) { c.style.width = A.w + 'px'; c.style.height = A.h + 'px'; var w = Math.round(A.w * dpr), h = Math.round(A.h * dpr); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } });
    clampAll(); draw();
  }
  function strokePath(c, pts) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    if (pts.length < 3) { for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (pts.length === 1) c.lineTo(pts[0][0] + .1, pts[0][1]); }
    else { for (var j = 1; j < pts.length - 1; j++) c.quadraticCurveTo(pts[j][0], pts[j][1], (pts[j][0] + pts[j + 1][0]) / 2, (pts[j][1] + pts[j + 1][1]) / 2); c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); }
  }
  function paint(c, L, map) {
    c.lineJoin = 'round';
    L.forEach(function (s) { if (s.t !== 'hl') return; c.strokeStyle = s.c; c.lineWidth = s.w; c.lineCap = 'butt'; strokePath(c, s.p.map(map)); c.stroke(); });
    c.lineCap = 'round';
    L.forEach(function (s) { if (s.t !== 'pen') return; c.strokeStyle = s.c; c.lineWidth = s.w; strokePath(c, s.p.map(map)); c.stroke(); });
  }
  function draw() {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, A.w, A.h);
    cx2.setTransform(dpr, 0, 0, dpr, 0, 0); cx2.clearRect(0, 0, A.w, A.h);
    var L = (st.pages[ctxK] || []).concat(st.cur && st.curSurf === 'main' ? [st.cur] : []);
    paint(cx, L, toC);
    cx2.textBaseline = 'top';
    L.forEach(function (s) {
      if (s.t !== 'tx' || s === st.edit) return; var b = tbox(s), fs = s.w, pd = fs * 0.22;
      cx2.fillStyle = 'rgba(255,255,255,.9)'; cx2.beginPath();
      if (cx2.roundRect) cx2.roundRect(b[0] - pd, b[1] - pd * 0.6, b[2] + pd * 2, b[3] + pd * 0.6, pd); else cx2.rect(b[0] - pd, b[1] - pd * 0.6, b[2] + pd * 2, b[3] + pd * 0.6);
      cx2.fill(); cx2.font = '700 ' + fs + 'px ' + FONT; cx2.fillStyle = s.c;
      s.s.split('\n').forEach(function (ln, i) { cx2.fillText(ln, b[0], b[1] + fs * 0.12 + i * fs * 1.3); });
    });
  }
  var raf = 0; function later() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); if (st.curSurf === 'nb') nbDraw(); }); }
  function hist() { return st.hist[ctxK] || (st.hist[ctxK] = []); }
  function page() { return st.pages[ctxK] || (st.pages[ctxK] = []); }
  function tbox(s) {
    var o = toC(s.p[0]), fs = s.w, L = s.s.split('\n'), w = 0; cx.font = '700 ' + fs + 'px ' + FONT;
    L.forEach(function (l) { w = Math.max(w, cx.measureText(l).width); }); return [o[0], o[1], w, L.length * fs * 1.3];
  }
  function textAt(x, y) { var P = page(); for (var i = P.length - 1; i >= 0; i--) { var s = P[i]; if (s.t !== 'tx') continue; var b = tbox(s); if (x >= b[0] - 6 && x <= b[0] + b[2] + 6 && y >= b[1] - 6 && y <= b[1] + b[3] + 6) return s; } return null; }
  function hitStroke(s, map, x, y) {
    var pts = s.p.map(map), rr = 12 + s.w / 2;
    for (var j = 0; j < pts.length; j++) {
      var a = pts[j], b = pts[j + 1] || a, dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      var t = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0, ex = a[0] + t * dx - x, ey = a[1] + t * dy - y;
      if (ex * ex + ey * ey <= rr * rr) return true;
    }
    return false;
  }
  function erase(x, y) {
    var P = page(), hit = false;
    for (var i = P.length - 1; i >= 0; i--) {
      var s = P[i];
      if (s.t === 'tx' ? textAt(x, y) === s : hitStroke(s, toC, x, y)) { hist().push(['del', s, i]); P.splice(i, 1); hit = true; }
    }
    if (hit) draw();
  }
  // gõ chữ ghi chú
  var ta = null;
  function commit() {
    if (!ta) return;
    var s = st.edit, v = ta.value.replace(/\s+$/, ''), P = page(), was = s._old;
    ta.remove(); ta = null; st.edit = null;
    if (was == null) { if (v) { s.s = v; P.push(s); hist().push(['add', s]); } }
    else if (!v) { var i = P.indexOf(s); if (i >= 0) { P.splice(i, 1); s.s = was; hist().push(['del', s, i]); } }
    else if (v !== was) { s.s = v; hist().push(['edit', s, was]); }
    delete s._old; draw();
  }
  function fit() {
    if (!ta || !st.edit) return; var fs = st.edit.w, o = toC(st.edit.p[0]);
    ta.style.font = '700 ' + fs + 'px ' + FONT; ta.style.color = st.edit.c;
    ta.style.left = (o[0] - 5.5) + 'px'; ta.style.top = (o[1] - 3.5) + 'px';
    ta.style.height = 'auto'; ta.style.width = 'auto';
    ta.style.width = Math.min(A.w - o[0], Math.max(60, ta.scrollWidth + 12)) + 'px'; ta.style.height = (ta.scrollHeight + 2) + 'px';
  }
  function editText(s) {
    commit(); st.edit = s; if (s._old === undefined) s._old = null;
    ta = D.createElement('textarea'); ta.className = 'gti-ta'; ta.value = s.s || ''; ta.rows = 1; ta.spellcheck = false;
    ta.placeholder = 'Gõ chữ…'; host().appendChild(ta); fit(); draw();
    ta.focus(); setTimeout(function () { ta && ta.focus(); }, 30);
    ta.addEventListener('input', fit);
    ta.addEventListener('keydown', function (e) { e.stopPropagation(); if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') { e.preventDefault(); commit(); } });
    var me = ta; ta.addEventListener('blur', function () { setTimeout(function () { if (ta === me && D.activeElement !== me) commit(); }, 120); });
  }
  function newStroke(x, y, toP) { return { t: st.tool, c: st.tool === 'pen' ? PEN[st.pc] : HL[st.hc], w: st.tool === 'pen' ? PW[st.sz] : HW[st.sz], p: [toP(x, y)] }; }
  function grow(e, toP, map) {
    var ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev.length) ev = [e];
    ev.forEach(function (c) { var s = toP(c.clientX, c.clientY), l = st.cur.p[st.cur.p.length - 1], c2 = map(s), l2 = map(l); if (Math.abs(c2[0] - l2[0]) + Math.abs(c2[1] - l2[1]) > 1.5) st.cur.p.push(s); });
    if (st.cur.t === 'hl' && st.cur.p.length > 1) { var a = map(st.cur.p[0]), b = map(st.cur.p[st.cur.p.length - 1]); st.cur.straight = Math.abs(b[1] - a[1]) < 14 + Math.abs(b[0] - a[0]) * 0.08; }
  }
  function finish(s) { if (s.t === 'hl' && s.straight && s.p.length > 1) { var a = s.p[0], b = s.p[s.p.length - 1]; s.p = [a, [b[0], a[1]]]; } delete s.straight; return s; }

  cv.addEventListener('pointerdown', function (e) {
    if (!st.tool) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    st.last = 'main'; detect();
    if (st.tool === 'er') { st.erasing = 'main'; erase(e.clientX, e.clientY); return; }
    if (st.tool === 'tx') {
      if (ta) { commit(); return; }
      var hitT = textAt(e.clientX, e.clientY);
      if (hitT) { hitT._old = hitT.s; editText(hitT); }
      else editText({ t: 'tx', c: PEN[st.pc], w: TS[st.sz], s: '', p: [toS(e.clientX, e.clientY - TS[st.sz] * 0.6)], _old: null });
      return;
    }
    st.cur = newStroke(e.clientX, e.clientY, toS); st.curSurf = 'main'; later();
  });
  cv.addEventListener('pointermove', function (e) {
    if (st.erasing === 'main') { erase(e.clientX, e.clientY); return; }
    if (!st.cur || st.curSurf !== 'main') return; grow(e, toS, toC); later();
  });
  function end() {
    if (st.erasing === 'main') { st.erasing = false; return; }
    if (!st.cur || st.curSurf !== 'main') return;
    var s = finish(st.cur); st.cur = null; page().push(s); hist().push(['add', s]); draw();
  }
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('mousedown', function (e) { if (st.tool) e.preventDefault(); });

  // ---------- sổ memo ----------
  var NB = LS.get('gti_nb', null);
  if (!NB || !NB.pages || !NB.pages.length) NB = { pages: [{ t: '', s: [] }], i: 0 };
  var nbT = nb.querySelector('.gti-nbt'), nbC = nb.querySelector('.gti-nbc'), nbX = nbC.getContext('2d'), nbB = nb.querySelector('.gti-nbb'), nbHist = [];
  var nbSave = 0; function saveNB() { clearTimeout(nbSave); nbSave = setTimeout(function () { LS.set('gti_nb', NB); }, 400); }
  function nbPage() { return NB.pages[NB.i] || (NB.pages[NB.i] = { t: '', s: [] }); }
  function nbRect() { return nbB.getBoundingClientRect(); }
  function nbToS(x, y) { var r = nbRect(); return [x - r.left, y - r.top + nbT.scrollTop]; }
  function nbToC(p) { return [p[0], p[1] - nbT.scrollTop]; }
  function nbLayout() {
    var r = nbRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    nbC.style.width = w + 'px'; nbC.style.height = h + 'px';
    if (nbC.width !== Math.round(w * dpr) || nbC.height !== Math.round(h * dpr)) { nbC.width = Math.round(w * dpr); nbC.height = Math.round(h * dpr); }
    nbDraw();
  }
  function nbDraw() {
    var r = nbRect(); nbX.setTransform(dpr, 0, 0, dpr, 0, 0); nbX.clearRect(0, 0, r.width, r.height);
    paint(nbX, nbPage().s.concat(st.cur && st.curSurf === 'nb' ? [st.cur] : []), nbToC);
  }
  function nbShow() {
    var P = nbPage(); nbT.value = P.t || ''; nb.querySelector('.gti-pg').textContent = 'Trang ' + (NB.i + 1) + '/' + NB.pages.length;
    nbHist = []; nbT.scrollTop = 0; nbLayout();
  }
  function nbOpen(on) {
    nb.classList.toggle('on', on); LS.set('gti_nbo', on);
    if (on) { var p = LS.get('gti_nbp', null); if (p) { nb.style.left = p.l + 'px'; nb.style.top = p.t + 'px'; if (p.w) { nb.style.width = p.w + 'px'; nb.style.height = p.h + 'px'; } } else { nb.style.left = Math.max(10, W.innerWidth - 400) + 'px'; nb.style.top = '80px'; } clamp(nb); nbShow(); }
    render();
  }
  nbT.addEventListener('input', function () { nbPage().t = nbT.value; saveNB(); });
  nbT.addEventListener('scroll', nbDraw, { passive: true });
  nbT.addEventListener('keydown', function (e) { e.stopPropagation(); });
  nbC.addEventListener('pointerdown', function (e) {
    if (!/^(pen|hl|er)$/.test(st.tool || '')) return; e.preventDefault(); e.stopPropagation(); try { nbC.setPointerCapture(e.pointerId); } catch (_) {}
    st.last = 'nb';
    if (st.tool === 'er') { st.erasing = 'nb'; nbErase(e); return; }
    st.cur = newStroke(e.clientX, e.clientY, nbToS); st.curSurf = 'nb'; later();
  });
  function nbErase(e) {
    var r = nbRect(), x = e.clientX - r.left, y = e.clientY - r.top, S = nbPage().s, hit = false;
    for (var i = S.length - 1; i >= 0; i--) if (hitStroke(S[i], nbToC, x, y)) { nbHist.push(['del', S[i], i]); S.splice(i, 1); hit = true; }
    if (hit) { nbDraw(); saveNB(); }
  }
  nbC.addEventListener('pointermove', function (e) {
    if (st.erasing === 'nb') { nbErase(e); return; }
    if (!st.cur || st.curSurf !== 'nb') return; grow(e, nbToS, nbToC); later();
  });
  function nbEnd() {
    if (st.erasing === 'nb') { st.erasing = false; return; }
    if (!st.cur || st.curSurf !== 'nb') return;
    var s = finish(st.cur); st.cur = null; nbPage().s.push(s); nbHist.push(['add', s]); nbDraw(); saveNB();
  }
  nbC.addEventListener('pointerup', nbEnd); nbC.addEventListener('pointercancel', nbEnd);
  nb.querySelector('.gti-nbh').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var k = b.getAttribute('data-n');
    if (k === 'x') return nbOpen(false);
    if (k === 'prev' && NB.i > 0) NB.i--;
    else if (k === 'next' && NB.i < NB.pages.length - 1) NB.i++;
    else if (k === 'add') { NB.pages.splice(NB.i + 1, 0, { t: '', s: [] }); NB.i++; }
    else if (k === 'del') {
      var P = nbPage(); if ((P.t || P.s.length) && !nbDelArm) { nbDelArm = true; b.style.background = '#c42f66'; b.title = 'Bấm lần nữa để xoá trang'; setTimeout(function () { nbDelArm = false; b.style.background = ''; b.title = 'Xoá trang này'; }, 2500); return; }
      nbDelArm = false; b.style.background = ''; NB.pages.splice(NB.i, 1); if (!NB.pages.length) NB.pages.push({ t: '', s: [] }); NB.i = Math.min(NB.i, NB.pages.length - 1);
    }
    else return;
    saveNB(); nbShow();
  });
  var nbDelArm = false;
  if (W.ResizeObserver) new ResizeObserver(function () { if (nb.classList.contains('on')) { nbLayout(); var r = nb.getBoundingClientRect(); var p = LS.get('gti_nbp', {}) || {}; p.w = Math.round(r.width); p.h = Math.round(r.height); p.l = Math.round(r.left); p.t = Math.round(r.top); LS.set('gti_nbp', p); } }).observe(nb);

  // ---------- kéo thả ----------
  function clamp(el) {
    if (!el.offsetParent && getComputedStyle(el).display === 'none') return;
    var want = parseFloat(el.style.left); if (el === bar) el.style.left = '0px';   // đo bề rộng thật của thanh (không bị ép hẹp khi nằm sát mép phải)
    var r = el.getBoundingClientRect(), vw = W.innerWidth, vh = W.innerHeight;
    if (el === bar && !isNaN(want)) r = { left: want, top: r.top, width: r.width, height: r.height };
    var l = Math.min(Math.max(4, r.left), Math.max(4, vw - Math.min(r.width, vw) - 4)), t = Math.min(Math.max(4, r.top), Math.max(4, vh - Math.min(r.height, vh) - 4));
    if (el === nb) t = Math.min(t, vh - 40);
    el.style.left = l + 'px'; el.style.top = t + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
  }
  function clampAll() { [bar, fab, nb].forEach(clamp); }
  function dragger(handle, el, key, onTap) {
    var d = null;
    handle.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return; if (handle !== el && e.target.closest('button')) return;
      var r = el.getBoundingClientRect(); d = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, moved: false, id: e.pointerId };
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    handle.addEventListener('pointermove', function (e) {
      if (!d || e.pointerId !== d.id) return; var dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return; d.moved = true;
      el.style.left = (d.l + dx) + 'px'; el.style.top = (d.t + dy) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    function up(e) {
      if (!d || e.pointerId !== d.id) return; var m = d.moved; d = null; clamp(el);
      var r = el.getBoundingClientRect(), p = LS.get(key, {}) || {}; p.l = Math.round(r.left); p.t = Math.round(r.top); LS.set(key, p);
      if (!m && onTap) onTap();
    }
    handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
  }
  function place(el, key, l, t) { var p = LS.get(key, null); el.style.left = (p ? p.l : l) + 'px'; el.style.top = (p ? p.t : t) + 'px'; }

  // ---------- thanh công cụ ----------
  function btn(k, html, label, title, on) { return '<button type="button" data-k="' + k + '" title="' + title + '"' + (on ? ' class="on"' : '') + '>' + html + (label ? '<span class="gti-l">' + label + '</span>' : '') + '</button>'; }
  function render() {
    fab.classList.toggle('off', st.open); bar.classList.toggle('on', st.open); bar.classList.toggle('vert', st.vert);
    cv.className = 'gti-cv' + (st.tool ? ' on ' + st.tool : '') + (st.hide ? ' gti-hide' : ''); cv2.className = 'gti-cv2' + (st.hide ? ' gti-hide' : '');
    nbC.classList.toggle('on', /^(pen|hl|er)$/.test(st.tool || ''));
    if (!st.open) { bar.innerHTML = ''; return; }
    bar.classList.toggle('dis', st.tool === 'er' || !st.tool);
    var hl = st.tool === 'hl', cols = hl ? HL : PEN, ci = hl ? st.hc : st.pc, nbOn = nb.classList.contains('on');
    var h = '<span class="gti-grip" title="Kéo để di chuyển thanh công cụ">' + I.grip + '</span>';
    h += btn('cur', I.cur, '', 'Con trỏ: bấm vào trang bình thường, nét vẫn giữ (Esc)', !st.tool) + btn('pen', I.pen, 'Bút', 'Bút viết', st.tool === 'pen') +
      btn('hl', I.hl, 'Highlight', 'Bút highlight', hl) + btn('tx', I.tx, 'Chữ', 'Gõ chữ: bấm vào chỗ cần ghi. Bấm vào chữ đã gõ để sửa. Enter xong, Shift+Enter xuống dòng', st.tool === 'tx') +
      btn('er', I.er, 'Tẩy', 'Tẩy: quẹt lên nét cần xoá', st.tool === 'er');
    h += '<span class="gti-sep"></span>';
    cols.forEach(function (c, i) { h += '<button type="button" class="gti-c' + (i === ci ? ' on' : '') + '" data-c="' + i + '" title="Màu"><i style="background:' + c + '"></i></button>'; });
    h += '<span class="gti-sep"></span>';
    [3, 6, 10].forEach(function (px, i) { h += '<button type="button" class="gti-s' + (i === st.sz ? ' on' : '') + '" data-s="' + i + '" title="Độ dày / cỡ chữ"><b style="height:' + px + 'px"></b></button>'; });
    h += '<span class="gti-sep"></span>' + btn('undo', I.undo, '', 'Hoàn tác (Ctrl+Z)') + btn('clr', I.clr, '', 'Xoá hết nét trên màn hình này') +
      btn('hide', I.eye, '', st.hide ? 'Hiện lại nét' : 'Ẩn nét', st.hide) + '<span class="gti-sep"></span>' +
      btn('nb', I.nb, 'Sổ memo', 'Mở / đóng sổ memo', nbOn) + btn('rot', I.rot, '', st.vert ? 'Xếp thanh công cụ nằm ngang' : 'Xếp thanh công cụ dọc') + btn('min', I.min, '', 'Thu gọn thành nút bút (nét vẫn giữ)');
    bar.innerHTML = h;
    clamp(bar);
  }
  bar.addEventListener('mousedown', function (e) { if (ta && e.target.closest('.gti-c,.gti-s')) e.preventDefault(); });
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k'), c = b.getAttribute('data-c'), z = b.getAttribute('data-s');
    if (c != null) { if (st.tool === 'hl') st.hc = +c; else st.pc = +c; if (st.edit) { st.edit.c = PEN[st.pc]; fit(); } return render(); }
    if (z != null) { st.sz = +z; if (st.edit) { st.edit.w = TS[st.sz]; fit(); } return render(); }
    if (k === 'cur') setTool(null);
    else if (k === 'pen' || k === 'hl' || k === 'tx' || k === 'er') setTool(st.tool === k ? null : k);
    else if (k === 'undo') undo();
    else if (k === 'clr') clear();
    else if (k === 'hide') { st.hide = !st.hide; if (st.hide) st.tool = null; setTool(st.tool); }
    else if (k === 'nb') nbOpen(!nb.classList.contains('on'));
    else if (k === 'rot') { st.vert = !st.vert; LS.set('gti_vert', st.vert); render(); }
    else if (k === 'min') { st.open = false; setTool(null); }
  });
  function setTool(t) { commit(); if (t && st.hide) st.hide = false; st.tool = t; if (t) detect(); render(); }
  function undo() {
    if (st.last === 'nb' && nb.classList.contains('on')) {
      var h = nbHist.pop(), S = nbPage().s; if (!h) return;
      if (h[0] === 'add') { var j = S.lastIndexOf(h[1]); if (j >= 0) S.splice(j, 1); } else if (h[0] === 'del') S.splice(Math.min(h[2], S.length), 0, h[1]); else if (h[0] === 'clr') nbPage().s = h[1];
      nbDraw(); saveNB(); return;
    }
    var H = hist(), P = page(), g = H.pop(); if (!g) return;
    if (g[0] === 'add') { var i = P.lastIndexOf(g[1]); if (i >= 0) P.splice(i, 1); }
    else if (g[0] === 'del') P.splice(Math.min(g[2], P.length), 0, g[1]);
    else if (g[0] === 'clr') st.pages[ctxK] = g[1];
    else if (g[0] === 'edit') g[1].s = g[2];
    draw();
  }
  function clear() {
    if (st.last === 'nb' && nb.classList.contains('on')) { var S = nbPage().s; if (!S.length) return; nbHist.push(['clr', S.slice()]); nbPage().s = []; nbDraw(); saveNB(); return; }
    var P = page(); if (!P.length) return; hist().push(['clr', P.slice()]); st.pages[ctxK] = []; draw();
  }
  D.addEventListener('keydown', function (e) {
    if (!st.open) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); e.stopImmediatePropagation(); undo(); }
    else if (e.key === 'Escape' && st.tool) { e.preventDefault(); e.stopImmediatePropagation(); setTool(null); }
  }, true);

  // ---------- khởi động ----------
  function start() {
    mount();
    place(fab, 'gti_fab', 16, Math.max(80, W.innerHeight - 150));
    place(bar, 'gti_pos', 16, Math.max(80, W.innerHeight - 220));
    dragger(fab, fab, 'gti_fab', function () { st.open = true; render(); });
    bar.addEventListener('pointerdown', function (e) { if (e.target.closest('.gti-grip')) gripDown(e); });
    dragger(nb.querySelector('.gti-nbh'), nb, 'gti_nbp');
    layout(); detect(); render();
    if (LS.get('gti_nbo', false)) nbOpen(true);
  }
  // thanh công cụ được vẽ lại liên tục nên kéo bằng tay nắm theo cách riêng
  var gd = null;
  function gripDown(e) { var r = bar.getBoundingClientRect(); gd = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, id: e.pointerId }; try { bar.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
  bar.addEventListener('pointermove', function (e) { if (!gd || e.pointerId !== gd.id) return; bar.style.left = (gd.l + e.clientX - gd.x) + 'px'; bar.style.top = (gd.t + e.clientY - gd.y) + 'px'; });
  function gripUp(e) { if (!gd || e.pointerId !== gd.id) return; gd = null; clamp(bar); var r = bar.getBoundingClientRect(); LS.set('gti_pos', { l: Math.round(r.left), t: Math.round(r.top) }); }
  bar.addEventListener('pointerup', gripUp); bar.addEventListener('pointercancel', gripUp);

  W.addEventListener('resize', function () { layout(); fit(); if (nb.classList.contains('on')) nbLayout(); });
  W.addEventListener('scroll', function () { if (ta) fit(); later(); }, { passive: true });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (t) { D.addEventListener(t, function () { mount(); layout(); detect(); }); });
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(draw);
  setInterval(function () { mount(); if (st.open || (st.pages[ctxK] || []).length || Object.keys(st.pages).length) detect(); }, 400);
  if (D.body) start(); else D.addEventListener('DOMContentLoaded', start);
  W.GinoTeachInk = { open: function () { st.open = true; render(); }, close: function () { st.open = false; setTool(null); } };
})();
