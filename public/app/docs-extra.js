/* Thẻ "Slide giảng" thêm vào đầu tab Tài liệu (16/11/2026). Mỗi bộ slide là 1 file HTML trong /app/slides/ (cần đăng nhập). */
(function(){
  var DECKS=[{href:'/app/slides/c2a.html',k:'第2章 · 日常清掃 · SLIDE GIẢNG',t:'Chương 2 · Vệ sinh hằng ngày (phần 1)',p:'Từ mở đầu đến lau bàn, lau kính · 104 slide · có bút viết, highlight'}];
  function init(){
    var pg=document.getElementById('p-docs'); if(!pg||document.getElementById('dxDecks')) return;
    var w=document.createElement('div'); w.id='dxDecks';
    w.innerHTML=DECKS.map(function(d){return '<a class="dxcard" href="'+d.href+'" target="_blank" rel="noopener"><span class="dxic">▶</span><span class="dxb"><small>'+d.k+'</small><b>'+d.t+'</b><em>'+d.p+'</em></span><span class="dxgo">Mở slide →</span></a>';}).join('');
    var anchor=pg.querySelector('.tgcard');
    if(anchor) anchor.parentNode.insertBefore(w,anchor); else { var h=pg.querySelector('h1,h2'); (h&&h.parentNode===pg)?pg.insertBefore(w,h.nextSibling):pg.insertBefore(w,pg.firstChild); }
    var st=document.createElement('style');
    st.textContent='#dxDecks{max-width:900px;margin:0 0 14px;display:grid;gap:10px}.dxcard{display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:16px;background:linear-gradient(135deg,#c42f66,#9c1f4e);color:#fff;text-decoration:none;box-shadow:0 10px 24px rgba(196,47,102,.25);transition:transform .15s}.dxcard:hover{transform:translateY(-2px)}.dxic{flex:none;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:22px}.dxb{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.dxb small{font-size:11px;letter-spacing:.06em;opacity:.85}.dxb b{font-size:17px}.dxb em{font-style:normal;font-size:13px;opacity:.9}.dxgo{flex:none;font-weight:700;font-size:14px;background:#fff;color:#c42f66;border-radius:999px;padding:7px 14px}@media(max-width:640px){.dxgo{display:none}}';
    document.head.appendChild(st);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
