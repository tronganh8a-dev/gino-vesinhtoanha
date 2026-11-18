/* Popup giới thiệu ngành mới: Tokutei Gino Logistics – Kho vận (物流倉庫) · Anh Trọng Dạy Gino
   Hiện 1 lần mỗi lần vào app (sessionStorage), cả bản chính lẫn bản dùng thử. Dùng chung cho 4 app: VSTN, Khách sạn, Chế biến, JFT. */
(function () {
  var D = document, KEY = 'logi_seen_v1', FB = 'https://www.facebook.com/anh.trongg.2024/';
  var IMG = (document.currentScript && document.currentScript.src || '').replace(/logi\.js.*$/, 'logi.webp?v=1');
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { }
  if (window.top !== window) return;   // không hiện trong khung con (chương, slide…)

  var css = '' +
    '.lgx-m{position:fixed;inset:0;z-index:2147483300;background:rgba(6,22,36,.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:16px;animation:lgxF .25s ease}' +
    '@keyframes lgxF{from{opacity:0}}@keyframes lgxU{from{opacity:0;transform:translateY(18px) scale(.97)}}' +
    '.lgx-b{position:relative;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.4);animation:lgxU .4s cubic-bezier(.2,.8,.2,1);font-family:Quicksand,"Be Vietnam Pro",system-ui,sans-serif;color:#0d2b40}' +
    '.lgx-h{position:relative;height:220px;background:#0d5a8c center/cover no-repeat}' +
    '.lgx-h:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,30,50,.05) 25%,rgba(6,30,50,.88) 100%)}' +
    '.lgx-t{position:absolute;left:22px;right:22px;bottom:16px;z-index:1;color:#fff}' +
    '.lgx-k{display:inline-block;background:#c42f66;color:#fff;font-size:11.5px;font-weight:800;letter-spacing:.08em;padding:5px 11px;border-radius:99px}' +
    '.lgx-t h3{margin:8px 0 0;font-size:27px;line-height:1.15;font-weight:800}' +
    '.lgx-t .jp{font-family:"Klee One","Hiragino Sans",sans-serif;font-size:15px;font-weight:600;opacity:.92;margin-top:4px}' +
    '.lgx-x{position:absolute;right:12px;top:12px;z-index:2;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#0d2b40;font-size:20px;line-height:1;cursor:pointer}' +
    '.lgx-c{padding:16px 22px 6px}' +
    '.lgx-c p{margin:0 0 10px;font-size:14.5px;line-height:1.55;color:#33495a}' +
    '.lgx-l{list-style:none;margin:0;padding:0;display:grid;gap:8px}' +
    '.lgx-l li{display:flex;gap:10px;align-items:flex-start;background:#f2f8fc;border-radius:12px;padding:9px 12px;font-size:14px;line-height:1.45}' +
    '.lgx-l b{flex:none;width:24px;height:24px;border-radius:50%;background:#0d5a8c;color:#fff;display:grid;place-items:center;font-size:12.5px;margin-top:1px}' +
    '.lgx-l span em{font-style:normal;font-weight:700;color:#0d5a8c}' +
    '.lgx-cta{margin:14px 22px 0;padding:14px 16px;border-radius:16px;background:linear-gradient(120deg,#fdeef4,#fff);border:1.5px solid #f1c3d4}' +
    '.lgx-cta h4{margin:0 0 4px;font-size:17px;font-weight:800;color:#c42f66}' +
    '.lgx-cta div{font-size:13.5px;color:#4f6577;line-height:1.5}' +
    '.lgx-a{display:flex;gap:10px;align-items:center;padding:14px 22px 20px;flex-wrap:wrap}' +
    '.lgx-go{flex:1;min-width:200px;display:flex;align-items:center;justify-content:center;gap:8px;background:#1877f2;color:#fff;text-decoration:none;font-weight:800;font-size:15.5px;padding:13px 18px;border-radius:14px;box-shadow:0 10px 22px rgba(24,119,242,.3)}' +
    '.lgx-go:hover{filter:brightness(1.06)}' +
    '.lgx-no{border:1.5px solid #cfdbe6;background:#fff;color:#4f6577;font:inherit;font-weight:700;font-size:14px;padding:12px 18px;border-radius:14px;cursor:pointer}' +
    '.lgx-s{padding:0 22px 16px;font-size:11px;color:#8aa0b3}' +
    '@media (max-width:520px){.lgx-go{min-width:0;font-size:15px}.lgx-a{flex-wrap:nowrap}.lgx-h{height:170px}.lgx-t h3{font-size:23px}.lgx-c,.lgx-a,.lgx-s{padding-left:16px;padding-right:16px}.lgx-cta{margin-left:16px;margin-right:16px}}';

  function show() {
    try { if (sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) { }
    var st = D.createElement('style'); st.textContent = css; D.head.appendChild(st);
    var m = D.createElement('div'); m.className = 'lgx-m';
    m.innerHTML = '<div class="lgx-b" role="dialog" aria-modal="true" aria-label="Ngành mới: Logistics – Kho vận">' +
      '<div class="lgx-h" style="background-image:url(' + IMG + ')"><button type="button" class="lgx-x" aria-label="Đóng">×</button>' +
      '<div class="lgx-t"><span class="lgx-k">NGÀNH MỚI · TOKUTEI GINO 1</span><h3>Logistics – Kho vận</h3><div class="jp">特定技能「物流倉庫（ぶつりゅうそうこ）」分野</div></div></div>' +
      '<div class="lgx-c"><p>Nhật Bản vừa bổ sung ngành <b>kho vận</b> vào visa Tokutei Gino (quyết định tháng 1/2026). Làm việc trong nhà kho.</p>' +
      '<ul class="lgx-l">' +
      '<li><b>1</b><span><em>Công việc:</em> nhận và kiểm hàng, xếp kho, lấy hàng theo đơn (picking), đóng gói, xuất hàng.</span></li>' +
      '<li><b>2</b><span><em>Kỳ thi 1号:</em> do 日本海事協会 tổ chức, nhận đăng ký thi theo đoàn từ 26/10/2026; thi trên máy (CBT) cho cá nhân dự kiến từ tháng 12/2026.</span></li>' +
      '<li><b>3</b><span><em>Tiếng Nhật:</em> cần N4 (hoặc tương đương A2) trở lên.</span></li>' +
      '</ul></div>' +
      '<div class="lgx-cta"><h4>Muốn học luyện thi ngành Logistics?</h4><div>Nhắn tin cho Anh Trọng để được tư vấn lộ trình và giữ chỗ lớp sớm nhất.</div></div>' +
      '<div class="lgx-a"><a class="lgx-go" href="' + FB + '" target="_blank" rel="noopener">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21z"/></svg>' +
      'Nhắn tin Facebook</a><button type="button" class="lgx-no">Để sau</button></div>' +
      '<div class="lgx-s">Thông tin kỳ thi theo Bộ Đất đai – Giao thông Nhật (国土交通省), cập nhật 10/2026.</div></div>';
    function close() { m.remove(); D.removeEventListener('keydown', esc, true); }
    function esc(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.lgx-x,.lgx-no')) close(); });
    m.querySelector('.lgx-go').addEventListener('click', function () { setTimeout(close, 300); });
    D.addEventListener('keydown', esc, true);
    D.body.appendChild(m);
  }
  // đợi trang app hiện xong (và không chen vào lúc đang làm bài thi)
  function ready() {
    var busy = D.querySelector('.cbt.on,#examScreen.on,body.locked,#login[style*="flex"]');
    if (busy) return setTimeout(ready, 1500);
    setTimeout(show, 900);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', ready); else ready();
})();
