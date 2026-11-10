/* Bảo vệ nội dung — Anh Trọng Dạy Gino
   1) In chìm tên học viên (window.__GWM do máy chủ chèn, chỉ bản chính) phủ mọi màn hình, kể cả video, toàn màn hình, khung chương.
   2) Chặn chuột phải, bôi đen, sao chép, kéo ảnh, lưu trang, in. Ô nhập chữ (chat) vẫn gõ / dán được. */
(function () {
  'use strict';
  var W = window.__GWM || null;
  var CSS = '*{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}' +
    'input,textarea,[contenteditable]:not([contenteditable="false"]),[contenteditable]:not([contenteditable="false"]) *{-webkit-user-select:text!important;user-select:text!important}' +
    'img,svg,video,canvas{-webkit-user-drag:none!important}' +
    '@media print{html,body{display:none!important}}';
  var editable = function (t) {
    return t && t.closest && t.closest('input,textarea,[contenteditable]:not([contenteditable="false"])');
  };

  // ---------- ảnh in chìm (SVG lát gạch) ----------
  var BG = '';
  if (W && W.n) {
    var d = new Date(), date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var line1 = esc(W.n), line2 = esc((W.u ? W.u + ' · ' : '') + date);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="210" viewBox="0 0 340 210">' +
      '<g transform="rotate(-24 170 105)" font-family="Quicksand,Segoe UI,Arial,sans-serif" text-anchor="middle">' +
      '<text x="170" y="100" font-size="17" font-weight="700" fill="rgb(120,132,145)" fill-opacity="0.20">' + line1 + '</text>' +
      '<text x="170" y="124" font-size="12" font-weight="600" fill="rgb(120,132,145)" fill-opacity="0.18">' + line2 + '</text></g></svg>';
    BG = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }
  var WM_STYLE = 'position:fixed!important;inset:0!important;left:0!important;top:0!important;width:100%!important;height:100%!important;' +
    'pointer-events:none!important;z-index:2147483646!important;display:block!important;opacity:1!important;visibility:visible!important;' +
    'background-repeat:repeat!important;background-image:' + BG + '!important;mix-blend-mode:normal!important;transform:none!important';

  function makeWM(doc) {
    var el = doc.createElement('div');
    el.id = '__gwm'; el.setAttribute('aria-hidden', 'true'); el.setAttribute('style', WM_STYLE);
    return el;
  }
  function ensureWM(doc) {
    if (!BG || !doc || !doc.body) return;
    var host = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (host && /^(IFRAME|VIDEO|IMG|CANVAS)$/.test(host.tagName)) host = null;   // không chứa được phần tử con
    var top = true; try { top = doc.defaultView === doc.defaultView.top; } catch (e) {}
    if (!top && !host) {   // khung con: lớp in chìm của trang ngoài đã phủ lên rồi, chỉ cần khi khung con bật toàn màn hình
      var old = doc.getElementById('__gwm'); if (old) old.remove(); return;
    }
    host = host || doc.body;
    var el = doc.getElementById('__gwm');
    if (!el) el = makeWM(doc);
    if (el.getAttribute('style') !== WM_STYLE) el.setAttribute('style', WM_STYLE);
    if (el.parentNode !== host || host.lastElementChild !== el) host.appendChild(el);
  }

  // ---------- chặn sao chép ----------
  function block(e) { if (!editable(e.target)) { e.preventDefault(); e.stopPropagation(); return false; } }
  function keys(e) {
    var k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && (k === 's' || k === 'p' || k === 'u')) { e.preventDefault(); e.stopPropagation(); return; }
    if (mod && (k === 'c' || k === 'x' || k === 'a') && !editable(e.target)) { e.preventDefault(); e.stopPropagation(); return; }
    if (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) { e.preventDefault(); e.stopPropagation(); }
    if (k === 'f12') { e.preventDefault(); e.stopPropagation(); }
  }

  function hook(doc) {
    if (!doc || doc.__gwmHooked) return;
    doc.__gwmHooked = true;
    try {
      var st = doc.createElement('style'); st.id = '__gprot'; st.textContent = CSS;
      (doc.head || doc.documentElement).appendChild(st);
    } catch (e) {}
    ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach(function (t) { doc.addEventListener(t, block, true); });
    doc.addEventListener('keydown', keys, true);
    var win = doc.defaultView;
    if (win) win.addEventListener('beforeprint', function () { try { doc.body.style.visibility = 'hidden'; } catch (e) {} });
    if (win) win.addEventListener('afterprint', function () { try { doc.body.style.visibility = ''; } catch (e) {} });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (t) { doc.addEventListener(t, function () { ensureWM(doc); }); });
    ensureWM(doc);
    // canh: ai xoá / sửa lớp in chìm thì dựng lại; khung (iframe) mới mở cũng được bảo vệ
    try {
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) {
          var m = ms[i];
          for (var j = 0; j < m.addedNodes.length; j++) scanFrames(m.addedNodes[j]);
        }
        ensureWM(doc);
        if (!doc.getElementById('__gprot')) { doc.__gwmHooked = false; hook(doc); }
      }).observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'id'] });
    } catch (e) {}
    scanFrames(doc);
  }
  function hookFrame(f) {
    var go = function () { try { var d = f.contentDocument; if (d && d.documentElement) hook(d); } catch (e) {} };  // khác tên miền (YouTube) thì bỏ qua
    if (!f.__gwmL) { f.__gwmL = true; f.addEventListener('load', function () { setTimeout(go, 0); }); }
    go();
  }
  function scanFrames(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.tagName === 'IFRAME') hookFrame(root);
    var fs = root.querySelectorAll('iframe');
    for (var i = 0; i < fs.length; i++) hookFrame(fs[i]);
  }

  // trang chương / slide mở bằng blob (khung hoặc tab riêng) cũng tự mang lớp bảo vệ
  try {
    if (window === window.top && !URL.__gwm) {
      var ocu = URL.createObjectURL; URL.__gwm = true;
      URL.createObjectURL = function (o) {
        try {
          if (o instanceof Blob && /html/i.test(o.type || '')) {
            var tail = '\n<script>window.__GWM=' + JSON.stringify(W).replace(/</g, '\\u003c') + '<\/script><script src="' + location.origin + '/pub/protect.js?v=1"><\/script>\n';
            return ocu.call(URL, new Blob([o, tail], { type: o.type }));
          }
        } catch (e) {}
        return ocu.apply(URL, arguments);
      };
    }
  } catch (e) {}
  function start() {
    hook(document);
    setInterval(function () {
      ensureWM(document);
      var fs = document.querySelectorAll('iframe');
      for (var i = 0; i < fs.length; i++) { try { var d = fs[i].contentDocument; if (d && d.body) { hook(d); ensureWM(d); } } catch (e) {} }
    }, 1500);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
