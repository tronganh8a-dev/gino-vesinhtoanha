/* Popup giới thiệu ngành mới: Tokutei Gino Logistics – Kho vận (物流倉庫) · Anh Trọng Dạy Gino
   Hiện 1 lần mỗi lần vào app (sessionStorage). Dùng chung cho 4 app: VSTN, Khách sạn, Chế biến, JFT. */
(function () {
  var D = document, KEY = 'logi_seen_v1', FB = 'https://www.facebook.com/anh.trongg.2024/';
  var IMG = (document.currentScript && document.currentScript.src || '').replace(/logi\.js.*$/, 'logi.webp?v=1');
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { }
  if (location.pathname.indexOf('/trial') === 0 || /trial|dungthu/.test(location.hostname)) return;

  var css = '' +
    '.lg-m{position:fixed;inset:0;z-index:2147483300;background:rgba(6,22,36,.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:16px;animation:lgF .25s ease}' +
    '@keyframes lgF{from{opacity:0}}@keyframes lgU{from{opacity:0;transform:translateY(18px) scale(.97)}}' +
    '.lg-b{position:relative;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.4);animation:lgU .4s cubic-bezier(.2,.8,.2,1);font-family:Quicksand,"Be Vietnam Pro",system-ui,sans-serif;color:#0d2b40}' +
    '.lg-h{position:relative;height:220px;background:#0d5a8c center/cover no-repeat}' +
    '.lg-h:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,30,50,.05) 25%,rgba(6,30,50,.88) 100%)}' +
    '.lg-t{position:absolute;left:22px;right:22px;bottom:16px;z-index:1;color:#fff}' +
    '.lg-k{display:inline-block;background:#c42f66;color:#fff;font-size:11.5px;font-weight:800;letter-spacing:.08em;padding:5px 11px;border-radius:99px}' +
    '.lg-t h3{margin:8px 0 0;font-size:27px;line-height:1.15;font-weight:800}' +
    '.lg-t .jp{font-family:"Klee One","Hiragino Sans",sans-serif;font-size:15px;font-weight:600;opacity:.92;margin-top:4px}' +
    '.lg-x{position:absolute;right:12px;top:12px;z-index:2;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#0d2b40;font-size:20px;line-height:1;cursor:pointer}' +
    '.lg-c{padding:16px 22px 6px}' +
    '.lg-c p{margin:0 0 10px;font-size:14.5px;line-height:1.55;color:#33495a}' +
    '.lg-l{list-style:none;margin:0;padding:0;display:grid;gap:8px}' +
    '.lg-l li{display:flex;gap:10px;align-items:flex-start;background:#f2f8fc;border-radius:12px;padding:9px 12px;font-size:14px;line-height:1.45}' +
    '.lg-l b{flex:none;width:24px;height:24px;border-radius:50%;background:#0d5a8c;color:#fff;display:grid;place-items:center;font-size:12.5px;margin-top:1px}' +
    '.lg-l span em{font-style:normal;font-weight:700;color:#0d5a8c}' +
    '.lg-cta{margin:14px 22px 0;padding:14px 16px;border-radius:16px;background:linear-gradient(120deg,#fdeef4,#fff);border:1.5px solid #f1c3d4}' +
    '.lg-cta h4{margin:0 0 4px;font-size:17px;font-weight:800;color:#c42f66}' +
    '.lg-cta div{font-size:13.5px;color:#4f6577;line-height:1.5}' +
    '.lg-a{display:flex;gap:10px;align-items:center;padding:14px 22px 20px;flex-wrap:wrap}' +
    '.lg-go{flex:1;min-width:200px;display:flex;align-items:center;justify-content:center;gap:8px;background:#1877f2;color:#fff;text-decoration:none;font-weight:800;font-size:15.5px;padding:13px 18px;border-radius:14px;box-shadow:0 10px 22px rgba(24,119,242,.3)}' +
    '.lg-go:hover{filter:brightness(1.06)}' +
    '.lg-no{border:1.5px solid #cfdbe6;background:#fff;color:#4f6577;font:inherit;font-weight:700;font-size:14px;padding:12px 18px;border-radius:14px;cursor:pointer}' +
    '.lg-s{padding:0 22px 16px;font-size:11px;color:#8aa0b3}' +
    '@media (max-width:520px){.lg-go{min-width:0;font-size:15px}.lg-a{flex-wrap:nowrap}.lg-h{height:170px}.lg-t h3{font-size:23px}.lg-c,.lg-a,.lg-s{padding-left:16px;padding-right:16px}.lg-cta{margin-left:16px;margin-right:16px}}';

  function show() {
    try { if (sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) { }
    var st = D.createElement('style'); st.textContent = css; D.head.appendChild(st);
    var m = D.createElement('div'); m.className = 'lg-m';
    m.innerHTML = '<div class="lg-b" role="dialog" aria-modal="true" aria-label="Ngành mới: Logistics – Kho vận">' +
      '<div class="lg-h" style="background-image:url(' + IMG + ')"><button type="button" class="lg-x" aria-label="Đóng">×</button>' +
      '<div class="lg-t"><span class="lg-k">NGÀNH MỚI · TOKUTEI GINO 1</span><h3>Logistics – Kho vận</h3><div class="jp">特定技能「物流倉庫（ぶつりゅうそうこ）」分野</div></div></div>' +
      '<div class="lg-c"><p>Nhật Bản vừa bổ sung ngành <b>kho vận</b> vào visa Tokutei Gino (quyết định tháng 1/2026). Làm việc trong nhà kho.</p>' +
      '<ul class="lg-l">' +
      '<li><b>1</b><span><em>Công việc:</em> nhận và kiểm hàng, xếp kho, lấy hàng theo đơn (picking), đóng gói, xuất hàng.</span></li>' +
      '<li><b>2</b><span><em>Kỳ thi 1号:</em> do 日本海事協会 tổ chức, nhận đăng ký thi theo đoàn từ 26/10/2026; thi trên máy (CBT) cho cá nhân dự kiến từ tháng 12/2026.</span></li>' +
      '<li><b>3</b><span><em>Tiếng Nhật:</em> cần N4 (hoặc tương đương A2) trở lên.</span></li>' +
      '</ul></div>' +
      '<div class="lg-cta"><h4>Muốn học luyện thi ngành Logistics?</h4><div>Nhắn tin cho Anh Trọng để được tư vấn lộ trình và giữ chỗ lớp sớm nhất.</div></div>' +
      '<div class="lg-a"><a class="lg-go" href="' + FB + '" target="_blank" rel="noopener">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21z"/></svg>' +
      'Nhắn tin Facebook</a><button type="button" class="lg-no">Để sau</button></div>' +
      '<div class="lg-s">Thông tin kỳ thi theo Bộ Đất đai – Giao thông Nhật (国土交通省), cập nhật 10/2026.</div></div>';
    function close() { m.remove(); D.removeEventListener('keydown', esc, true); }
    function esc(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.lg-x,.lg-no')) close(); });
    m.querySelector('.lg-go').addEventListener('click', function () { setTimeout(close, 300); });
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
