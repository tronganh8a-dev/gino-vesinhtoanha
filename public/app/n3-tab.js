/* Tab JLPT N3 (12/11/2026): thêm mục "JLPT N3" vào thanh điều hướng, nhúng trang /n3/ (luyện đề N3 + từ vựng Mimikara).
   Trang n3 dùng chung với app JFT / Khách sạn / Chế biến thực phẩm — bản gốc ở repo anhtrong-jft-app (public/n3). */
(function(){
  function init(){
    var nav=document.getElementById('nav'), wrap=document.querySelector('.wrap'), home=document.getElementById('p-home');
    if(!nav||!home||document.getElementById('p-n3')) return;
    var sec=document.createElement('section'); sec.className='page'; sec.id='p-n3';
    sec.innerHTML='<iframe id="n3Fr" title="JLPT N3" style="display:block;width:100%;height:calc(100vh - 110px);min-height:560px;border:0;border-radius:14px;background:#f4f7fb"></iframe>';
    home.parentNode.appendChild(sec);
    var b=document.createElement('button'); b.className='tab'; b.type='button'; b.dataset.p='n3';
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 15V9l4 6V9M15 9h2.2a1.6 1.6 0 0 1 0 3.2H16h1.4a1.6 1.6 0 0 1 0 3.3H15"/></svg><span class="jx-nt">JLPT N3</span><span class="jp">能力試験</span>';
    var g=nav.querySelector('.jx-grow'); nav.insertBefore(b,g||null);
    var load=function(){var f=document.getElementById('n3Fr'); if(f&&!f.src) f.src='/n3/';};
    b.onclick=function(){ load(); if(typeof go==='function') go('n3'); };
    if(location.hash==='#n3'){ load(); if(typeof go==='function') go('n3'); }
    var st=document.createElement('style'); st.textContent='@media (max-width:900px){#n3Fr{height:calc(100vh - 150px)!important;border-radius:0!important}}'; document.head.appendChild(st);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
