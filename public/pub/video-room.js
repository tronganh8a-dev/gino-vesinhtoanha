/* Xem video bài giảng: màn hình lớn + khung Lý thuyết chương bên cạnh + ảnh bìa ghim che logo YouTube
   (giống app Khách sạn, 06/11/2026). auth.js chèn file này vào cuối trang app và bản dùng thử —
   không cần build lại p1/p2. Bắt cú bấm thẻ video ở #vgrid trước code cũ (capture). */
(function () {
  if (window.__ginoVR) return; window.__ginoVR = 1;
  var D = document;
  var css = D.createElement('style');
  css.textContent = `
body.jv-on{overflow:hidden}
body.jv-on .gc-fab,body.jv-on .gc-p,body.jv-on .trialfab{display:none!important}
.jv{position:fixed;inset:0;z-index:2147483100;background:#070d14;display:flex;flex-direction:column;font-family:'Quicksand',system-ui,sans-serif;color:#e8eef3}
.jv *{box-sizing:border-box}
.jv-top{display:flex;align-items:center;gap:14px;height:54px;padding:0 18px;flex:none}
.jv-x{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:99px;padding:7px 16px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}
.jv-x small{opacity:.6;margin-left:4px}
.jv-tt{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.9}
.jv-main{flex:1;display:flex;min-height:0}
.jv-stage{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;padding:0 22px 18px;position:relative}
.jv-box{width:min(100%,calc((100vh - 140px) * 16 / 9));background:#0b1117;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.jv-pl{position:relative;aspect-ratio:16/9;background:#000;overflow:hidden}
.jv-pl iframe{position:absolute;left:0;top:-90px;width:100%;height:calc(100% + 180px);border:0}
.jv-sh{position:absolute;inset:0;z-index:1;cursor:pointer}
.jv-cv{position:absolute;inset:0;z-index:2;border:0;padding:0;background:#0b1117;display:grid;place-items:center;cursor:pointer;width:100%}
.jv-cv.off{display:none}
.jv-pb{position:absolute;left:66%;top:34%;z-index:2;width:86px;height:86px;border-radius:50%;background:rgba(255,255,255,.95);display:grid;place-items:center;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .2s}
.jv-pb::after{content:"";margin-left:7px;border-style:solid;border-width:17px 0 17px 28px;border-color:transparent transparent transparent #c42f66}
.jv-cv:hover .jv-pb{transform:scale(1.07)}
.jv-th .tx{width:50cqw!important}
.jv-cv.wait .jv-pb::after{margin:0;width:30px;height:30px;border-radius:50%;border:4px solid rgba(196,47,102,.25);border-top-color:#c42f66;animation:jvspin .8s linear infinite}
@keyframes jvspin{to{transform:rotate(360deg)}}
.jv-res{position:absolute;z-index:3;left:16px;bottom:16px;background:rgba(11,17,23,.84);color:#fff;font-size:13px;font-weight:700;border-radius:99px;padding:6px 14px}
.jv-th{position:absolute;inset:0;container-type:inline-size;overflow:hidden;color:#fff;text-align:left;
 background:radial-gradient(90% 120% at 100% 0%,#2a8fd0 0%,rgba(42,143,208,0) 60%),linear-gradient(140deg,#0a3a5e 0%,#0d5a8c 55%,#0a4670 100%)}
.jv-th::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:4.5cqw 4.5cqw;-webkit-mask-image:linear-gradient(160deg,#000 20%,transparent 75%);mask-image:linear-gradient(160deg,#000 20%,transparent 75%)}
.jv-th::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1.3cqw;background:linear-gradient(90deg,#5aaee0 0 25%,#e8772e 25% 50%,#2d4f9e 50% 75%,#74b04c 75% 100%)}
.jv-th .tx{position:absolute;left:6cqw;top:6.5cqw;width:52cqw;z-index:1}
.jv-th .k{display:block;font-size:2.3cqw;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.jv-th .n{display:block;font-size:9.5cqw;font-weight:700;line-height:1.05;margin:1.4cqw 0 1.6cqw;color:#ffd166}
.jv-th .t{display:block;font-size:3.3cqw;font-weight:700;line-height:1.3}
.jv-th .j{display:inline-block;margin-top:2cqw;font-size:2.4cqw;border:1px solid rgba(255,255,255,.45);border-radius:99px;padding:.4cqw 1.8cqw;font-weight:700}
.jv-th .br{position:absolute;left:6cqw;bottom:5cqw;display:flex;align-items:center;gap:1.3cqw;font-size:2.3cqw;font-weight:700;z-index:1}
.jv-th .br i{width:4.6cqw;height:4.6cqw;background:#fff url(/pub/brand/mark.png) center/76% no-repeat;border-radius:1.1cqw;display:block}
.jv-th .bk{position:absolute;right:7cqw;bottom:-4cqw;width:24cqw}
.jv-th .bk img{width:100%;border-radius:1cqw;box-shadow:0 2cqw 4cqw rgba(0,0,0,.45);transform:rotate(6deg);display:block}
.jv-ctl{display:flex;align-items:center;gap:2px;padding:6px 10px 8px;background:#0b1117;user-select:none;-webkit-user-select:none}
.jv-ctl button{background:none;border:0;color:inherit;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;flex:none;padding:0;cursor:pointer}
.jv-ctl button:hover{background:rgba(255,255,255,.1)}
.jv-ctl svg{width:22px;height:22px}
.jv-ctl .jv-rt{width:auto;padding:0 10px;font-weight:700;font-size:13.5px;font-family:inherit}
.jv-tm{font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;opacity:.9;padding:0 6px}
.jv-sk{flex:1;min-width:60px;position:relative;height:30px;display:flex;align-items:center;cursor:pointer;touch-action:none;margin:0 8px}
.jv-sk .tr{position:absolute;left:0;right:0;height:5px;border-radius:9px;background:rgba(255,255,255,.18);overflow:hidden;transition:height .12s}
.jv-sk .bf{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,255,255,.28)}
.jv-sk .pl{position:absolute;left:0;top:0;bottom:0;width:0;background:#c42f66}
.jv-sk .kn{position:absolute;left:0;width:14px;height:14px;border-radius:50%;background:#fff;margin-left:-7px;box-shadow:0 0 0 4px rgba(196,47,102,.4);transform:scale(0);transition:transform .12s}
.jv-sk:hover .kn,.jv-sk.drag .kn{transform:scale(1)}.jv-sk:hover .tr,.jv-sk.drag .tr{height:7px}
.jv-sk .tip{position:absolute;bottom:28px;transform:translateX(-50%);background:#fff;color:#111;font-size:12px;font-weight:700;padding:2px 7px;border-radius:6px;display:none;pointer-events:none;white-space:nowrap}
.jv-sk:hover .tip,.jv-sk.drag .tip{display:block}
.jv-tab{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:3;writing-mode:vertical-rl;background:#c42f66;color:#fff;border:0;border-radius:14px 0 0 14px;padding:18px 11px;font-weight:700;font-size:15px;letter-spacing:.04em;cursor:pointer;box-shadow:-6px 0 22px rgba(0,0,0,.35);font-family:inherit}
.jv-tab:hover{padding-right:15px}
.jv.side .jv-tab{display:none}
.jv-side{display:none;width:var(--jvw,42vw);flex:none;background:#eef3f7;color:#0d2b40;flex-direction:column;box-shadow:-12px 0 34px rgba(0,0,0,.4)}
.jv.side .jv-side{display:flex}
.jv-sh2{display:flex;align-items:center;gap:6px;padding:9px 10px 9px 16px;background:#fff;border-bottom:1px solid #dbe5ee}
.jv-sh2 b{flex:1;font-size:15px}
.jv-sh2 button{border:1px solid #cfdbe6;background:#fff;border-radius:9px;height:34px;min-width:34px;padding:0 10px;font-weight:700;font-size:13px;color:#33536e;cursor:pointer;font-family:inherit}
.jv-sh2 button:hover{background:#f1f6fa}
.jv-chs{display:flex;gap:6px;padding:8px 10px;overflow-x:auto;background:#fff;border-bottom:1px solid #dbe5ee;scrollbar-width:thin}
.jv-chs button{flex:none;white-space:nowrap;border:1px solid #cfdbe6;background:#fff;border-radius:99px;padding:6px 13px;font-weight:700;font-size:13px;color:#33536e;cursor:pointer;font-family:inherit}
.jv-chs button.on{background:#0d5a8c;color:#fff;border-color:#0d5a8c}
.jv-chs button small{font-weight:600;opacity:.75;margin-left:4px}
.jv-if{flex:1;width:100%;border:0;background:#fff}
.jv-lk{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;font-weight:700;color:#33536e}
.jv-lk[hidden],.jv-if[hidden]{display:none}
.jv-lk a{background:#c42f66;color:#fff;border-radius:10px;padding:8px 16px;text-decoration:none}
.jv:fullscreen .jv-top{display:none}.jv:fullscreen .jv-box{width:min(100%,calc((100vh - 70px) * 16 / 9))}
@media (max-width:900px){
  .jv-top{height:46px;padding:0 10px}.jv-tt{font-size:14px}
  .jv-main{flex-direction:column}
  .jv-stage{flex:none;flex-direction:column;padding:0}
  .jv-box{width:100%;border-radius:0}
  .jv-ctl{padding:4px 4px 6px}.jv-ctl button{width:36px;height:36px}.jv-tm{font-size:12px;padding:0 2px}.jv-sk{margin:0 6px}
  .jv-hm,#jvB,#jvF,#jvW{display:none!important}
  .jv-pb{width:60px;height:60px}.jv-pb::after{border-width:13px 0 13px 21px;margin-left:5px}
  .jv-tab{position:static;transform:none;writing-mode:horizontal-tb;border-radius:0;width:100%;padding:12px;box-shadow:none}
  .jv-side{width:100%;flex:1;min-height:0;box-shadow:none}
}`;
  D.head.appendChild(css);

  var JV = { id: '', yt: null, tick: 0, played: false, ch: 'ch1', rate: 1, drag: false, meta: null };
  var JV_W = ['34vw', '42vw', '52vw'];
  var CHS = [['ch1', 'Chương 1', 'Tác phong'], ['ch2', 'Chương 2', 'Vệ sinh hằng ngày'], ['ch3', 'Chương 3', 'Vệ sinh định kỳ']];
  function st(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function txt(h) { var d = D.createElement('div'); d.innerHTML = h; return d.textContent; }
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = ('0' + t % 60).slice(-2); return h ? h + ':' + ('0' + m).slice(-2) + ':' + s : m + ':' + s; }
  function ok() { return JV.yt && typeof JV.yt.getCurrentTime === 'function'; }
  function $(i) { return D.getElementById(i); }
  function api() {
    return new Promise(function (res) {
      if (window.YT && YT.Player) return res();
      var prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
      if (!$('ytapi')) { var sc = D.createElement('script'); sc.id = 'ytapi'; sc.src = 'https://www.youtube.com/iframe_api'; D.head.appendChild(sc); }
    });
  }
  function hasCh(k) { return !!D.getElementById('src-' + k); }
  var I = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    b10: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/><text x="12" y="15.5" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">10</text></svg>',
    f10: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/><text x="12" y="15.5" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">10</text></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/></svg>'
  };
  function thumb(m) {
    var cv = (typeof COVER === 'object' && COVER[m.ch]) ? COVER[m.ch] : '';
    return '<span class="jv-th" aria-hidden="true"><span class="tx"><span class="k">Bài giảng · Vệ sinh toà nhà</span><span class="n">' + esc(m.no) + '</span>'
      + '<span class="t">' + esc(m.t) + '</span>' + (m.jp ? '<span class="j">' + esc(m.jp) + '</span>' : '') + '</span>'
      + '<span class="br"><i></i>Anh Trọng Dạy Gino</span>' + (cv ? '<span class="bk"><img src="' + cv + '" alt=""></span>' : '') + '</span>';
  }

  function open(id, m) {
    close(); JV.id = id; JV.meta = m; JV.ch = m.ch && hasCh(m.ch) ? m.ch : (m.ch || 'ch1');
    var ov = D.createElement('div'); ov.id = 'jvOv'; ov.className = 'jv'; ov.style.setProperty('--jvw', JV_W[+(st('gvJvW') || 1) % 3]);
    ov.innerHTML = '<div class="jv-top"><button class="jv-x" type="button" id="jvX">✕ Đóng <small>Esc</small></button><b class="jv-tt">' + esc(m.no) + ' · ' + esc(m.t) + '</b></div>'
      + '<div class="jv-main"><div class="jv-stage"><div class="jv-box"><div class="jv-pl"><div id="jvYT"></div><div class="jv-sh" id="jvSh"></div>'
      + '<button class="jv-cv wait" id="jvCv" type="button" aria-label="Phát video">' + thumb(m) + '<span class="jv-pb"></span><span class="jv-res" hidden></span></button></div>'
      + '<div class="jv-ctl"><button type="button" id="jvPP" aria-label="Phát">' + I.play + '</button><button type="button" id="jvB" title="Lùi 10 giây">' + I.b10 + '</button><button type="button" id="jvF" title="Tới 10 giây">' + I.f10 + '</button>'
      + '<span class="jv-tm" id="jvTm">0:00</span><div class="jv-sk" id="jvSk"><div class="tr"><div class="bf"></div><div class="pl"></div></div><div class="kn"></div><div class="tip"></div></div>'
      + '<button type="button" id="jvM" class="jv-hm" title="Tắt / bật tiếng">' + I.vol + '</button><button type="button" id="jvR" class="jv-rt" title="Tốc độ phát">1x</button>'
      + '<button type="button" id="jvD" title="Lý thuyết chương (bên cạnh)">' + I.book + '</button><button type="button" id="jvFS" title="Toàn màn hình">' + I.fs + '</button></div></div>'
      + '<button class="jv-tab" type="button" id="jvTab">📖 Lý thuyết chương</button></div>'
      + '<aside class="jv-side"><div class="jv-sh2"><b>📖 Lý thuyết</b><button type="button" id="jvW" title="Đổi độ rộng khung">⇔</button><button type="button" id="jvO" title="Mở tab riêng">↗</button><button type="button" id="jvSX" title="Đóng khung lý thuyết">✕</button></div>'
      + '<div class="jv-chs" id="jvChs"></div><div class="jv-lk" id="jvLk" hidden></div><iframe class="jv-if" id="jvIf" title="Lý thuyết" allow="fullscreen"></iframe></aside></div>';
    D.body.appendChild(ov); D.body.classList.add('jv-on');
    $('jvX').onclick = close;
    $('jvCv').onclick = function () { if (ok()) JV.yt.playVideo(); };
    $('jvSh').onclick = function () { if (ok()) JV.yt.pauseVideo(); };
    $('jvPP').onclick = function () { if (!ok()) return; var s = JV.yt.getPlayerState(); s === 1 || s === 3 ? JV.yt.pauseVideo() : JV.yt.playVideo(); };
    $('jvB').onclick = function () { if (ok()) JV.yt.seekTo(Math.max(0, JV.yt.getCurrentTime() - 10), true); };
    $('jvF').onclick = function () { if (ok()) JV.yt.seekTo(JV.yt.getCurrentTime() + 10, true); };
    $('jvM').onclick = function () { if (!ok()) return; JV.yt.isMuted() ? JV.yt.unMute() : JV.yt.mute(); setTimeout(sync, 80); };
    $('jvR').onclick = function () { var R = [1, 1.25, 1.5, 0.75]; JV.rate = R[(R.indexOf(JV.rate) + 1) % R.length]; $('jvR').textContent = JV.rate + 'x'; if (ok()) JV.yt.setPlaybackRate(JV.rate); };
    $('jvD').onclick = function () { side(!ov.classList.contains('side')); };
    $('jvTab').onclick = function () { side(true); };
    $('jvSX').onclick = function () { side(false); };
    $('jvW').onclick = function () { var k = (+(st('gvJvW') || 1) + 1) % 3; st('gvJvW', k); ov.style.setProperty('--jvw', JV_W[k]); };
    $('jvO').onclick = function () { if (hasCh(JV.ch) && typeof chapterURL === 'function') window.open(chapterURL(JV.ch), '_blank'); };
    $('jvFS').onclick = function () {
      var d = D; if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      var rq = ov.requestFullscreen || ov.webkitRequestFullscreen; if (rq) Promise.resolve(rq.call(ov)).then(function () { try { screen.orientation.lock('landscape').catch(function () { }); } catch (e) { } }).catch(function () { });
    };
    $('jvChs').onclick = function (e) { var b = e.target.closest('[data-c]'); if (b) { JV.ch = b.dataset.c; sideLoad(); } };
    var sk = $('jvSk'), frac = function (e) { var r = sk.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
    var tip = function (e) { var d = ok() ? JV.yt.getDuration() : 0, f = frac(e), t = sk.querySelector('.tip'); t.style.left = f * 100 + '%'; t.textContent = d ? fmt(f * d) : ''; };
    sk.onpointermove = function (e) { tip(e); if (JV.drag && ok()) seekUI(frac(e), JV.yt.getDuration()); };
    sk.onpointerdown = function (e) { if (!ok()) return; JV.drag = true; sk.classList.add('drag'); sk.setPointerCapture(e.pointerId); tip(e); seekUI(frac(e), JV.yt.getDuration()); };
    sk.onpointerup = sk.onpointercancel = function (e) { if (!JV.drag) return; JV.drag = false; sk.classList.remove('drag'); if (ok()) JV.yt.seekTo(frac(e) * JV.yt.getDuration(), true); };
    if (innerWidth > 900 && st('gvJvSide') !== '0') side(true);   /* máy tính: mở sẵn khung lý thuyết */
    start();
  }
  function side(on) { var ov = $('jvOv'); if (!ov) return; ov.classList.toggle('side', on); if (innerWidth > 900) st('gvJvSide', on ? '1' : '0'); if (on) sideLoad(); }
  function sideLoad() {
    var F = $('jvIf'), L = $('jvLk');
    $('jvChs').innerHTML = CHS.map(function (c) { return '<button type="button" data-c="' + c[0] + '" class="' + (c[0] === JV.ch ? 'on' : '') + '">' + c[1] + (hasCh(c[0]) ? '<small>' + c[2] + '</small>' : ' 🔒') + '</button>'; }).join('');
    if (!hasCh(JV.ch) || typeof chapterURL !== 'function') {
      F.hidden = true; F.removeAttribute('src'); F.dataset.k = ''; L.hidden = false;
      var fb = D.querySelector('.trialfab a[href*="facebook"]');
      L.innerHTML = '🔒 Lý thuyết ' + esc((CHS.find(function (c) { return c[0] === JV.ch; }) || ['', 'chương này'])[1]) + ' thuộc khoá học đầy đủ.' + (fb ? '<a href="' + fb.href + '" target="_blank" rel="noopener">Nhắn Anh Trọng để học</a>' : '');
      return;
    }
    L.hidden = true; F.hidden = false;
    if (F.dataset.k === JV.ch) return; F.dataset.k = JV.ch; F.src = chapterURL(JV.ch);
  }
  function cover(s) {
    var c = $('jvCv'); if (!c) return; if (s === 1) JV.played = true;
    var show = !(s === 1 || (s === 3 && JV.played)); c.classList.toggle('off', !show); c.classList.toggle('wait', s === 3 || (s === -1 && !JV.played));
    var r = c.querySelector('.jv-res'); if (s === 2 && ok()) { r.hidden = false; r.textContent = '▶ Tiếp tục từ ' + fmt(JV.yt.getCurrentTime()); } else if (s !== -1) r.hidden = true;
  }
  function seekUI(f, d) { f = Math.min(1, Math.max(0, f || 0)); var sk = $('jvSk'); if (!sk) return; sk.querySelector('.pl').style.width = f * 100 + '%'; sk.querySelector('.kn').style.left = f * 100 + '%'; if (d) $('jvTm').textContent = fmt(f * d) + ' / ' + fmt(d); }
  function save() { if (!ok() || !JV.id) return; var t = JV.yt.getCurrentTime(), d = JV.yt.getDuration(); if (t > 5) st('gvVidPos_' + JV.id, d && t > d - 20 ? '0' : String(Math.floor(t))); }
  function sync() {
    var pp = $('jvPP'); if (!pp || !ok()) return;
    var t = JV.yt.getCurrentTime() || 0, d = JV.yt.getDuration() || 0, s = JV.yt.getPlayerState ? JV.yt.getPlayerState() : -1, pl = s === 1 || s === 3;
    if (pp.dataset.p !== String(pl)) { pp.dataset.p = pl; pp.innerHTML = pl ? I.pause : I.play; }
    if (!JV.drag && d) seekUI(t / d, d);
    var bf = D.querySelector('#jvSk .bf'); if (bf) bf.style.width = ((JV.yt.getVideoLoadedFraction && JV.yt.getVideoLoadedFraction()) || 0) * 100 + '%';
    $('jvM').innerHTML = (JV.yt.isMuted && JV.yt.isMuted()) ? I.mute : I.vol;
    if (s === 1 && (sync.n = (sync.n || 0) + 1) % 12 === 0) save();
  }
  function start() {
    var id = JV.id, s0 = +(st('gvVidPos_' + id) || 0), r = D.querySelector('#jvCv .jv-res');
    if (s0 > 10 && r) { r.hidden = false; r.textContent = '▶ Xem tiếp từ ' + fmt(s0); }
    api().then(function () {
      if (JV.id !== id || !$('jvYT')) return;
      var pv = { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1, fs: 0, cc_load_policy: 0 };
      if (s0 > 10) pv.start = s0 - 3; if (/^https?:/.test(location.origin)) pv.origin = location.origin;
      JV.yt = new YT.Player('jvYT', {
        host: 'https://www.youtube-nocookie.com', videoId: id, playerVars: pv,
        events: {
          onReady: function (e) { try { e.target.setPlaybackRate(JV.rate); e.target.playVideo(); } catch (_) { } sync(); },
          onStateChange: function (e) { sync(); cover(e.data); if (e.data === 0) { st('gvVidPos_' + JV.id, '0'); JV.played = false; try { JV.yt.seekTo(0, true); JV.yt.pauseVideo(); } catch (_) { } cover(5); } }
        }
      });
      JV.tick = setInterval(sync, 400);
    });
  }
  function close() {
    var ov = $('jvOv'); clearInterval(JV.tick); if (JV.yt) { save(); try { JV.yt.destroy(); } catch (e) { } } JV.yt = null; JV.played = false;
    if (ov) { var d = D; if (d.fullscreenElement === ov || d.webkitFullscreenElement === ov) try { (d.exitFullscreen || d.webkitExitFullscreen).call(d); } catch (e) { } ov.remove(); }
    D.body.classList.remove('jv-on');
  }
  D.addEventListener('keydown', function (e) {
    if (!$('jvOv')) return;
    if (e.key === 'Escape' && !(D.fullscreenElement || D.webkitFullscreenElement)) { e.stopPropagation(); close(); return; }
    if (!ok() || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); e.stopPropagation(); $('jvPP').click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); $('jvB').click(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); $('jvF').click(); }
  }, true);
  D.addEventListener('visibilitychange', save); window.addEventListener('pagehide', save);

  /* bắt cú bấm thẻ video (trước code phát tại chỗ cũ) */
  D.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('#vgrid'); if (!g) return;
    if (e.target.closest('[data-doc]')) return;              /* nút "Mở tài liệu" giữ như cũ */
    var c = e.target.closest('[data-vid]'); if (!c || !c.dataset.vid) return;
    e.stopPropagation(); e.preventDefault();
    var id = c.dataset.vid, s = (typeof SES !== 'undefined' && SES.find) ? SES.find(function (x) { return x.id === id; }) : null;
    var q = function (sel) { var el = c.querySelector(sel); return el ? el.textContent.trim() : ''; };
    open(id, s ? { no: 'Buổi ' + s.n, t: txt(s.t), jp: s.jp, ch: s.ch || 'ch1' } : { no: q('.no'), t: q('h3'), jp: q('.jpt'), ch: 'ch1' });
  }, true);
  window.ginoVideoRoom = { open: open, close: close };
})();
