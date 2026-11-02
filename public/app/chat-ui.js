/* Trợ lý Gino — nút chat hỏi từ vựng, giải thích đáp án (gọi /api/chat của worker; API key nằm trên máy chủ) */
(function () {
  if (window.__ginoChat) return; window.__ginoChat = 1;
  const D = document;
  const css = D.createElement('style');
  css.textContent = `
.gc-fab{position:fixed;right:18px;bottom:22px;z-index:2147483000;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;color:#fff;
 background:linear-gradient(135deg,#0d5a8c,#c42f66);box-shadow:0 10px 26px rgba(13,90,140,.38);display:grid;place-items:center;transition:transform .15s}
.gc-fab:hover{transform:translateY(-2px) scale(1.04)}.gc-fab svg{width:28px;height:28px}
.gc-fab .gc-tip{position:absolute;right:66px;white-space:nowrap;background:#17222c;color:#fff;font:700 12.5px/1 Quicksand,system-ui,sans-serif;padding:8px 11px;border-radius:10px;opacity:0;pointer-events:none;transition:opacity .2s}
.gc-fab:hover .gc-tip{opacity:1}
.gc-fab.gc-incbt{bottom:70px}
.gc-p{position:fixed;right:18px;bottom:92px;z-index:2147483001;width:400px;max-width:calc(100vw - 24px);height:min(600px,calc(100vh - 120px));background:#fff;border-radius:20px;
 box-shadow:0 24px 60px rgba(13,40,60,.28);display:none;flex-direction:column;overflow:hidden;font-family:Quicksand,"Segoe UI",system-ui,sans-serif;color:#17222c;border:1px solid #dbe2e7}
.gc-p.on{display:flex}
.gc-h{display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#0d5a8c,#0a4670);color:#fff}
.gc-h .gc-lg{width:38px;height:38px;border-radius:11px;background:#fff;display:grid;place-items:center;flex:none}.gc-h .gc-lg img{width:28px}
.gc-h b{display:block;font-size:16px}.gc-h small{display:block;font-size:12px;opacity:.85}
.gc-h button{all:unset;cursor:pointer;margin-left:auto;font-size:13px;font-weight:700;opacity:.9;padding:6px 8px;border-radius:8px}.gc-h button:hover{background:rgba(255,255,255,.15)}
.gc-h .gc-x{margin-left:4px;font-size:22px;line-height:1}
.gc-m{flex:1;overflow-y:auto;padding:14px;background:#f5f8fa;display:flex;flex-direction:column;gap:10px}
.gc-b{max-width:88%;padding:10px 13px;border-radius:16px;font-size:14.5px;line-height:1.6;word-wrap:break-word}
.gc-b.u{align-self:flex-end;background:#0d5a8c;color:#fff;border-bottom-right-radius:5px;white-space:pre-wrap}
.gc-b.a{align-self:flex-start;background:#fff;border:1px solid #e1e8ed;border-bottom-left-radius:5px}
.gc-b.a ruby rt{font-size:.55em;color:#2f6ea8}.gc-b.a ruby{font-family:"UD Digi Kyokasho NP-R","Klee One",serif}
.gc-b.a ul{margin:4px 0;padding-left:18px}.gc-b.a p{margin:0 0 6px}.gc-b.a p:last-child{margin:0}
.gc-b.err{background:#fdf2f6;border-color:#f1c4d4;color:#9b2350}
.gc-dots span{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#8aa4b8;animation:gcb 1s infinite}
.gc-dots span:nth-child(2){animation-delay:.15s}.gc-dots span:nth-child(3){animation-delay:.3s}
@keyframes gcb{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}
.gc-hi{background:#fff;border:1px solid #e1e8ed;border-radius:16px;padding:14px;font-size:14px;color:#30414e}
.gc-hi b{display:block;font-size:15px;color:#0d5a8c;margin-bottom:4px}
.gc-ch{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.gc-ch button{all:unset;cursor:pointer;background:#e5eff6;color:#0d5a8c;font-weight:700;font-size:13px;padding:7px 11px;border-radius:999px}
.gc-ch button:hover{background:#d3e4f0}.gc-ch button.hot{background:#c42f66;color:#fff}
.gc-ctx{font-size:12px;color:#5a6873;padding:6px 14px 0;background:#fff}.gc-ctx:empty{display:none}
.gc-f{display:flex;gap:8px;padding:10px 12px 12px;background:#fff;border-top:1px solid #e6ecf0;align-items:flex-end}
.gc-f textarea{flex:1;resize:none;border:1.5px solid #dbe2e7;border-radius:14px;padding:10px 12px;font:500 15px/1.4 Quicksand,system-ui,sans-serif;max-height:120px;min-height:44px;outline:0;color:#17222c}
.gc-f textarea:focus{border-color:#0d5a8c}
.gc-f button{all:unset;cursor:pointer;width:44px;height:44px;border-radius:12px;background:#c42f66;color:#fff;display:grid;place-items:center;flex:none}
.gc-f button[disabled]{opacity:.5;cursor:default}.gc-f button svg{width:20px;height:20px}
.gc-note{font-size:11px;color:#8794a0;text-align:center;padding:0 12px 8px;background:#fff}
@media (max-width:880px){.gc-fab{bottom:calc(84px + env(safe-area-inset-bottom));right:12px;width:52px;height:52px}.gc-fab.gc-incbt{bottom:70px}
 .gc-p{right:8px;left:8px;width:auto;max-width:none;bottom:calc(8px + env(safe-area-inset-bottom));top:calc(56px + env(safe-area-inset-top));height:auto}}
@media print{.gc-fab,.gc-p{display:none!important}}
.gc-pm{position:fixed;inset:0;z-index:2147483002;background:rgba(10,30,45,.55);display:grid;place-items:center;padding:16px;animation:gcf .25s ease}
.gc-pb{position:relative;background:#fff;border-radius:22px;max-width:620px;width:100%;max-height:calc(100vh - 32px);overflow:auto;box-shadow:0 30px 80px rgba(0,0,0,.35);font-family:Quicksand,"Segoe UI",system-ui,sans-serif;color:#17222c;animation:gcu .35s cubic-bezier(.2,.8,.2,1)}
.gc-pb .gc-im{display:block;width:100%;aspect-ratio:1200/760;background:#dce9f4;border-radius:22px 22px 0 0;object-fit:cover}
.gc-pc{padding:18px 22px 20px}
.gc-new2{display:inline-block;background:#c42f66;color:#fff;font-weight:800;font-size:12.5px;border-radius:99px;padding:3px 11px;letter-spacing:.02em}
.gc-pc h3{font-size:22px;margin:8px 0 6px;line-height:1.3}.gc-pc h3 span{color:#0d5a8c}
.gc-pc p{color:#4a5b68;font-size:15px;line-height:1.55;margin:0 0 10px}
.gc-pc ul{margin:0 0 14px;padding:0;list-style:none;display:grid;gap:6px}.gc-pc li{font-size:14.5px;padding-left:24px;position:relative;line-height:1.45}
.gc-pc li::before{content:'✓';position:absolute;left:2px;top:0;color:#1d7a4b;font-weight:900}
.gc-pa{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.gc-pa .go{all:unset;cursor:pointer;background:linear-gradient(135deg,#0d5a8c,#c42f66);color:#fff;font-weight:800;padding:12px 22px;border-radius:12px;font-size:15.5px}
.gc-pa .later{all:unset;cursor:pointer;color:#5a6873;font-weight:700;padding:12px 10px;font-size:14.5px}
.gc-pa label{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:13px;color:#8794a0;cursor:pointer}
.gc-px{all:unset;cursor:pointer;position:absolute;top:10px;right:12px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;font-size:22px;color:#17222c;box-shadow:0 2px 8px rgba(0,0,0,.15)}
@keyframes gcf{from{opacity:0}}@keyframes gcu{from{opacity:0;transform:translateY(24px) scale(.97)}}
@media (max-width:640px){.gc-pc{padding:14px 16px 16px}.gc-pc h3{font-size:19px}.gc-pc p{font-size:14px}.gc-pa label{margin-left:0;width:100%}}
@media print{.gc-pm{display:none!important}}`;
  D.head.appendChild(css);

  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/><path d="M8.5 10.5h7M8.5 13.8h4.5"/></svg>';
  const SEND = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>';
  const fab = D.createElement('button');
  fab.className = 'gc-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Hỏi Trợ lý Gino');
  fab.innerHTML = ICON + '<span class="gc-tip">Hỏi từ vựng · đáp án</span>';
  const P = D.createElement('div');
  P.className = 'gc-p'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'Trợ lý Gino');
  P.innerHTML = `<div class="gc-h"><span class="gc-lg"><img src="/pub/brand/mark.png" alt=""></span><div><b>Trợ lý Gino</b><small>Hỏi từ vựng · giải thích đáp án</small></div>
    <button type="button" class="gc-new" title="Cuộc trò chuyện mới">Mới</button><button type="button" class="gc-x" aria-label="Đóng">×</button></div>
    <div class="gc-m"></div><div class="gc-ctx"></div>
    <div class="gc-f"><textarea rows="1" placeholder="Hỏi từ, câu hỏi, đáp án…"></textarea><button type="button" class="gc-s" aria-label="Gửi">${SEND}</button></div>
    <div class="gc-note">Trợ lý AI có thể nhầm — câu quan trọng hãy hỏi lại thầy Anh Trọng.</div>`;
  const M = P.querySelector('.gc-m'), TA = P.querySelector('textarea'), SB = P.querySelector('.gc-s'), CX = P.querySelector('.gc-ctx');

  let hist = [];
  try { hist = JSON.parse(sessionStorage.getItem('gc_hist') || '[]'); } catch (e) { hist = []; }
  const save = () => { try { sessionStorage.setItem('gc_hist', JSON.stringify(hist.slice(-30))); } catch (e) { } };

  const escH = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const fu = s => (typeof furi === 'function' ? furi(s) : s.replace(/([一-龯々〇ヶ]+)\[([^\]]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>'));
  function md(t) {
    const lines = escH(t).split('\n'); let out = '', ul = false;
    for (let l of lines) {
      l = fu(l).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<i>$2</i>').replace(/^#{1,4}\s*(.*)$/, '<b>$1</b>');
      const m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) { if (!ul) { out += '<ul>'; ul = true; } out += '<li>' + m[1] + '</li>'; continue; }
      if (ul) { out += '</ul>'; ul = false; }
      if (l.trim()) out += '<p>' + l + '</p>';
    }
    return out + (ul ? '</ul>' : '');
  }

  /* ---- ngữ cảnh: câu đề đang mở + từ vựng khớp trong câu hỏi ---- */
  const inExam = () => { try { return !!D.querySelector('.cbt.on') && typeof S === 'object' && S.qs && S.qs.length && S.view !== 'intro'; } catch (e) { return false; } };
  function qText(q, i, reveal) {
    const pl = s => String(s || '');
    let t = `Đề ${S.de}${typeof EXAMS === 'object' && EXAMS[S.de] ? ' (' + EXAMS[S.de].title + ')' : ''} · Câu ${i + 1}${q.sec ? ' · ' + q.sec : ''}\n`;
    t += `Câu hỏi: ${pl(q.jp)}\nNghĩa: ${pl(q.vn)}\n`;
    if (q.note) t += `Ghi chú: ${pl(q.note)}\n`;
    (q.opts || []).forEach((o, k) => { t += `${o.k || 'ABCDEFG'[k]}. ${o.img != null ? '[ảnh] ' : ''}${pl(o.jp)}${o.vn ? ' — ' + o.vn : ''}${o.seq ? ' ' + JSON.stringify(o.seq) : ''}\n`; });
    if (reveal) {
      t += `Đáp án đúng: ${Array.isArray(q.ans) ? q.ans.join(', ') : q.ans}\n`;
      if (q.evi) t += `Giải thích của lớp: ${q.evi}\n`;
      if (q.ejp) t += `Giải thích (tiếng Nhật): ${q.ejp}\n`;
      if (q.ref) t += `Nguồn giáo trình: ${q.ref}\n`;
      try { if (S.ans && S.ans[i] !== undefined) t += `Học viên đã chọn: ${JSON.stringify(S.ans[i])}\n`; } catch (e) { }
    } else t += '(Học viên ĐANG LÀM bài thi thử, chưa nộp — không được nói đáp án, chỉ gợi ý.)\n';
    return t;
  }
  function examCtx(text) {
    if (!inExam()) return '';
    let i = S.i;
    const m = String(text).match(/câu\s*(?:số\s*)?(\d{1,2})/i);
    if (m && S.view !== 'q') i = +m[1] - 1;
    const q = S.qs[i]; if (!q) return '';
    const reveal = S.view === 'full' || S.view === 'score' || (S.instant && S.done && S.done[i]) || S.mode === 'prac' && S.done && S.done[i];
    return qText(q, i, !!reveal);
  }
  function vocabCtx(text) {
    const out = [];
    try {
      const strip = s => String(s || '').replace(/\[[^\]]*\]/g, '');
      if (typeof V !== 'undefined') for (const v of V) {
        const w = strip(v[0]);
        if ((w.length >= 2 && text.includes(w)) || (v[1] && v[1].length >= 3 && text.includes(v[1])) || (v[2] && v[2].length >= 4 && text.toLowerCase().includes(String(v[2]).toLowerCase().split(/[,(]/)[0].trim())))
          out.push(`${v[0]} (${v[1]}) = ${v[2]}`);
        if (out.length >= 8) break;
      }
      if (typeof EQ !== 'undefined') for (const e of EQ) {
        const w = strip(e[0]);
        if (w.length >= 2 && (text.includes(w) || text.includes(e[1]))) out.push(`Thiết bị ${e[0]} (${e[1]}) = ${e[2]}${e[4] ? ' — ' + e[4] : ''}`);
        if (out.length >= 12) break;
      }
    } catch (e) { }
    return out.length ? 'Từ vựng trong app khớp với câu hỏi:\n' + out.join('\n') : '';
  }
  function buildCtx(text) { return [examCtx(text), vocabCtx(text)].filter(Boolean).join('\n\n'); }
  function ctxLabel() { if (!inExam()) return ''; return S.view === 'q' ? `Đang xem: Đề ${S.de} · câu ${S.i + 1} — trợ lý sẽ dựa vào câu này` : `Đề ${S.de} · gõ "câu 5" để hỏi đúng câu`; }

  function render() {
    M.innerHTML = '';
    if (!hist.length) {
      const ex = inExam();
      M.innerHTML = `<div class="gc-hi"><b>Chào bạn 👋 Mình là Trợ lý Gino</b>Hỏi mình nghĩa từ vựng, cách đọc chữ Hán, hoặc vì sao đáp án đúng/sai nhé.
        <div class="gc-ch">${ex ? '<button type="button" class="hot" data-q="Giải thích giúp mình câu này">Giải thích câu đang làm</button>' : ''}
        <button type="button" data-q="清掃 và 掃除 khác nhau thế nào?">清掃 vs 掃除</button>
        <button type="button" data-q="Phân biệt 乾式モップ và 湿式モップ">乾式 vs 湿式</button>
        <button type="button" data-q="ポリッシャー dùng thế nào, cần chú ý gì?">ポリッシャー</button>
        <button type="button" data-q="Mẹo nhớ các loại vết bẩn trong giáo trình">Mẹo nhớ vết bẩn</button></div></div>`;
    }
    for (const m of hist) add(m.role, m.content, m.err, false);
    CX.textContent = ctxLabel();
    M.scrollTop = M.scrollHeight;
  }
  function add(role, text, err, scroll = true) {
    const b = D.createElement('div');
    b.className = 'gc-b ' + (role === 'user' ? 'u' : 'a') + (err ? ' err' : '');
    if (role === 'user') b.textContent = text; else b.innerHTML = md(text);
    M.appendChild(b); if (scroll) M.scrollTop = M.scrollHeight; return b;
  }
  let busy = false;
  async function send(q) {
    q = (q || TA.value).trim(); if (!q || busy) return;
    TA.value = ''; fitTA();
    if (!hist.length) M.innerHTML = '';
    hist.push({ role: 'user', content: q }); add('user', q); save();
    busy = true; SB.disabled = true;
    const wait = add('assistant', ''); wait.innerHTML = '<span class="gc-dots"><span></span><span></span><span></span></span>';
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ messages: hist.filter(m => !m.err).slice(-12).map(m => ({ role: m.role, content: m.content })), context: buildCtx(q) }) });
      const d = await r.json().catch(() => ({}));
      wait.remove();
      if (r.status === 401) throw new Error('Phiên đăng nhập đã hết — tải lại trang và đăng nhập lại nhé.');
      if (!r.ok || !d.reply) throw new Error((d.error || 'Trợ lý đang lỗi, thử lại sau nhé.') + (d.detail ? '\n(Mã lỗi: ' + d.detail + ')' : ''));
      hist.push({ role: 'assistant', content: d.reply }); add('assistant', d.reply);
    } catch (e) {
      wait.remove();
      hist.push({ role: 'assistant', content: e.message, err: 1 }); add('assistant', e.message, 1);
    }
    save(); busy = false; SB.disabled = false; TA.focus();
  }
  function fitTA() { TA.style.height = 'auto'; TA.style.height = Math.min(TA.scrollHeight, 120) + 'px'; }
  function selText() {
    let t = '';
    try { t = String(window.getSelection() || ''); } catch (e) { }
    if (!t) D.querySelectorAll('iframe').forEach(f => { try { const s = String(f.contentWindow.getSelection() || ''); if (s) t = s; } catch (e) { } });
    t = t.trim(); return t.length > 0 && t.length <= 200 ? t : '';
  }
  function open() {
    const s = selText();
    P.classList.add('on'); render();
    if (s && !TA.value) { TA.value = `Giải thích giúp mình: 「${s}」`; fitTA(); }
    setTimeout(() => TA.focus(), 50);
  }
  fab.addEventListener('mousedown', e => e.preventDefault());   // giữ vùng chữ đang bôi đen
  fab.onclick = () => P.classList.contains('on') ? P.classList.remove('on') : open();
  P.querySelector('.gc-x').onclick = () => P.classList.remove('on');
  P.querySelector('.gc-new').onclick = () => { hist = []; save(); render(); TA.focus(); };
  SB.onclick = () => send();
  TA.addEventListener('input', fitTA);
  TA.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } e.stopPropagation(); });
  M.addEventListener('click', e => { const c = e.target.closest('[data-q]'); if (c) send(c.dataset.q); });
  ['keydown', 'keyup', 'keypress'].forEach(t => P.addEventListener(t, e => e.stopPropagation()));   // không kích phím tắt của app (bút, slide)

  setInterval(() => { const on = !!D.querySelector('.cbt.on'); fab.classList.toggle('gc-incbt', on); if (P.classList.contains('on')) CX.textContent = ctxLabel(); }, 800);


  /* ---- popup giới thiệu chức năng mới (mỗi lần vào app 1 lần, có "Không hiện lại") ---- */
  function promo() {
    try { if (localStorage.getItem('gc_promo_off') === '1' || sessionStorage.getItem('gc_promo_seen')) return; } catch (e) { }
    if (D.querySelector('.cbt.on')) return;
    try { sessionStorage.setItem('gc_promo_seen', '1'); } catch (e) { }
    const m = D.createElement('div'); m.className = 'gc-pm';
    m.innerHTML = `<div class="gc-pb" role="dialog" aria-label="Chức năng mới: Hỏi đáp cùng AI"><button type="button" class="gc-px" aria-label="Đóng">×</button>
      <img class="gc-im" src="/app/ai-promo.webp?v=1" alt="Trợ lý Gino giải thích đáp án ngay khi làm đề">
      <div class="gc-pc"><span class="gc-new2">MỚI</span><h3>Chức năng mới: <span>Hỏi đáp cùng AI</span></h3>
      <p>Làm đề mà chưa hiểu vì sao sai? Bấm nút chat góc dưới màn hình — Trợ lý Gino giải thích ngay tại chỗ.</p>
      <ul><li>Giải thích đáp án đúng và vì sao các lựa chọn khác sai</li><li>Nghĩa từ vựng, cách đọc, âm Hán Việt của chữ Hán</li><li>Đang thi thử chưa nộp bài: chỉ gợi ý, không lộ đáp án</li></ul>
      <div class="gc-pa"><button type="button" class="go">Thử hỏi ngay →</button><button type="button" class="later">Để sau</button>
      <label><input type="checkbox" class="off"> Không hiện lại</label></div></div></div>`;
    const close = () => { try { if (m.querySelector('.off').checked) localStorage.setItem('gc_promo_off', '1'); } catch (e) { } m.remove(); };
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('.gc-px,.later')) close(); });
    m.querySelector('.go').onclick = () => { close(); open(); };
    m.addEventListener('keydown', e => { if (e.key === 'Escape') close(); e.stopPropagation(); });
    D.body.appendChild(m);
  }
  fetch('/api/chat/status', { credentials: 'same-origin' }).then(r => r.json()).then(d => {
    if (!d.ok) return;            // chưa có API key → không hiện nút
    D.body.appendChild(fab); D.body.appendChild(P);
    setTimeout(promo, 1200);
  }).catch(() => { });
})();
