/* Tab JLPT N3: luyện đề (24 đề, có đáp án + giải thích) và từ vựng Mimikara N3. Trang độc lập, nhúng vào app bằng iframe. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const ALL=Array.from({length:24},(_,k)=>String(k+1).padStart(2,'0'));
const SECS=['文字・語彙','文法','読解'],SECVI={'文字・語彙':'Chữ & từ vựng','文法':'Ngữ pháp','読解':'Đọc hiểu'};
const MARK=['①','②','③','④'];
if(LS.get('n3furi',1)===0)document.body.classList.add('nofuri');

/* ---------- tab ---------- */
function tab(t){$$('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));$('#pDe').classList.toggle('on',t==='de');$('#pTv').classList.toggle('on',t==='tv');
 try{history.replaceState(null,'','#'+t)}catch(_){}if(t==='tv')vInit()}
$$('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.tab));

/* ---------- danh sách đề ---------- */
let IDX=[];
function deTitle(no){return 'Đề '+(+no)}
async function deInit(){
 try{IDX=await (await fetch('data/index.json',{cache:'no-cache'})).json()}catch(_){IDX=[]}
 const have={};IDX.forEach(e=>have[e.f.replace(/\D/g,'')]=e);
 $('#pDe').innerHTML=`<p class="hint">Mỗi đề gồm 文字・語彙 (chữ & từ vựng) + 文法・読解 (ngữ pháp & đọc hiểu), không có phần nghe. Chọn <b>Thi thử</b> để làm có giờ và chấm điểm cuối bài, hoặc <b>Luyện tập</b> để xem đáp án và giải thích ngay sau mỗi câu.</p>
 <div class="exgrid">${ALL.map(no=>{const e=have[no];const b=e&&LS.get('n3best_'+e.id,null);
  return `<button class="ex${e?'':' soon'}" type="button" ${e?`data-f="${e.f}"`:''}><b>${deTitle(no)}</b><small>${e?e.n+' câu · 100 phút':'Đang cập nhật'}</small>${b!=null?`<span class="sc">${b}%</span><div class="bar"><i style="width:${b}%"></i></div>`:''}</button>`}).join('')}</div>
 <p class="src">Nguồn đề: bộ đề thi thử JLPT N3 (tài liệu luyện thi, 24 đề không trùng). Đáp án đã được kiểm tra lại; giải thích tiếng Việt do Anh Trọng soạn.</p>`;
 $$('#pDe .ex[data-f]').forEach(b=>b.onclick=()=>pickMode(b.dataset.f));
}
function pickMode(f){const e=IDX.find(x=>x.f===f);let m=$('#modeDlg');if(!m){m=document.createElement('div');m.id='modeDlg';m.className='mask';document.body.appendChild(m)}
 m.innerHTML=`<div class="dlg"><button class="x" type="button" aria-label="Đóng">×</button><h3>${esc(e.title)} · JLPT N3</h3><p>${e.n} câu · 文字・語彙 + 文法・読解</p>
 <button class="mode" data-m="exam" type="button"><b>Thi thử</b><small>Có đồng hồ 100 phút (30 + 70), nộp bài mới xem điểm, đáp án và giải thích.</small></button>
 <button class="mode" data-m="prac" type="button"><b>Luyện tập</b><small>Không tính giờ, chọn xong là biết đúng sai kèm giải thích.</small></button></div>`;
 m.classList.add('on');m.onclick=ev=>{if(ev.target===m||ev.target.closest('.x'))m.classList.remove('on');const b=ev.target.closest('[data-m]');if(b){m.classList.remove('on');start(f,b.dataset.m)}}}

/* ---------- làm bài ---------- */
let S=null,TMR=0;
async function start(f,mode){let E;try{E=await (await fetch('data/'+f,{cache:'no-cache'})).json()}catch(_){alert('Không tải được đề, em thử lại nhé.');return}
 const secs=SECS.map(n=>({n,idx:[]}));E.qs.forEach((q,i)=>{const k=SECS.indexOf(q.s);(secs[k<0?0:k]).idx.push(i)});
 S={E,mode,ans:{},chk:{},i:0,sec:0,secs:secs.filter(s=>s.idx.length),left:100*60,done:false};
 clearInterval(TMR);if(mode==='exam')TMR=setInterval(()=>{if(S.done)return;S.left--;const t=$('#qTm');if(t){t.textContent=fmt(S.left);t.classList.toggle('low',S.left<300)}if(S.left<=0)submit(true)},1000);
 $('#quiz').classList.add('on');$('#quiz').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';render()}
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function curSec(){return S.secs.findIndex(s=>s.idx.includes(S.i))}
function nOf(q){return q.k.slice(1)}
function render(){const E=S.E,q=E.qs[S.i],sk=curSec(),sec=S.secs[sk],pos=sec.idx.indexOf(S.i),free=S.mode==='prac'||S.done;
 const sel=S.ans[S.i],show=free&&(S.done||S.chk[S.i]);
 let g='';if(q.g!=null&&E.groups[q.g]){const G=E.groups[q.g];g=G.img?`<div class="psg big">${G.img.map(s=>`<img src="${s}" alt="Bài đọc" loading="lazy">`).join('')}</div>`:`<div class="psg">${G.h}</div>`}
 const h=`<div class="qh"><span class="t">${esc(E.title)} · N3</span>${S.mode==='exam'&&!S.done?`<span class="tm" id="qTm">${fmt(S.left)}</span>`:''}<span class="sp"></span>
  <button class="btn" id="qFuri" type="button">${document.body.classList.contains('nofuri')?'Hiện':'Ẩn'} furigana</button>
  ${S.done?`<button class="btn" id="qRes" type="button">Xem điểm</button>`:`<button class="btn pk" id="qSub" type="button">Nộp bài</button>`}<button class="btn" id="qX" type="button" aria-label="Thoát">✕</button></div>
 <div class="secs">${S.secs.map((s,k)=>{const n=s.idx.filter(i=>S.ans[i]!=null).length;return `<button type="button" data-sk="${k}" class="${k===sk?'on':''}">${s.n}<small>${SECVI[s.n]} ${n}/${s.idx.length}</small></button>`}).join('')}</div>
 <div class="qb" id="qB"><div class="qin">
  <span class="mon">問題 · ${esc(q.m)}</span>${q.ins?`<div class="ins">${q.ins}</div>`:''}${g}
  <div class="q"><span class="n">${nOf(q)}</span>${q.t||''}</div>
  <div class="ops">${q.o.map((o,k)=>{let c='';if(sel===k)c=' sel';if(show&&q.a!=null){if(k===q.a)c=' ok';else if(sel===k)c=' ng'}return `<button class="op${c}" type="button" data-k="${k}"><span class="k">${k+1}</span><span>${o}</span></button>`}).join('')}</div>
  ${show&&q.ex?`<div class="exp">${q.ex}</div>`:''}
 </div></div>
 <div class="nums">${sec.idx.map((i,n)=>{let c='';if(S.ans[i]!=null)c+=' a';if(i===S.i)c+=' cur';if((S.done||S.chk[i])&&S.ans[i]!=null){c+=S.ans[i]===S.E.qs[i].a?' r':' w'}return `<button type="button" data-i="${i}" class="${c.trim()}">${nOf(S.E.qs[i])}</button>`}).join('')}</div>
 <div class="qf"><button class="btn" id="qPrev" type="button"${S.i===0?' disabled':''}>← Câu trước</button><span class="sp muted">${pos+1}/${sec.idx.length} · ${SECVI[sec.n]}</span><button class="btn pri" id="qNext" type="button">${S.i===E.qs.length-1?(S.done?'Kết quả':'Nộp bài'):'Câu sau →'}</button></div>`;
 $('#quiz').innerHTML=h;
 $$('#quiz .op').forEach(b=>b.onclick=()=>{if(S.done||(S.mode==='prac'&&S.chk[S.i]))return;S.ans[S.i]=+b.dataset.k;if(S.mode==='prac')S.chk[S.i]=1;render()});
 $$('#quiz [data-sk]').forEach(b=>b.onclick=()=>{S.i=S.secs[+b.dataset.sk].idx[0];render()});
 $$('#quiz .nums [data-i]').forEach(b=>b.onclick=()=>{S.i=+b.dataset.i;render()});
 $('#qPrev').onclick=()=>{if(S.i>0){S.i--;render()}};
 $('#qNext').onclick=()=>{if(S.i<E.qs.length-1){S.i++;render()}else if(S.done)result();else submit()};
 $('#qFuri').onclick=()=>{const on=document.body.classList.toggle('nofuri');LS.set('n3furi',on?0:1);render()};
 const sb=$('#qSub');if(sb)sb.onclick=()=>submit();const rb=$('#qRes');if(rb)rb.onclick=result;
 $('#qX').onclick=()=>{if(!S.done&&Object.keys(S.ans).length&&!confirm('Thoát bài đang làm?'))return;close()};
 const cn=$('.nums .cur');if(cn)cn.scrollIntoView({block:'nearest',inline:'center'})}
function close(){clearInterval(TMR);$('#quiz').classList.remove('on');$('#quiz').setAttribute('aria-hidden','true');document.body.style.overflow='';deInit()}
function submit(auto){if(!auto){const un=S.E.qs.length-Object.keys(S.ans).length;if(!confirm(un?`Còn ${un} câu chưa làm. Nộp bài?`:'Nộp bài?'))return}
 S.done=true;clearInterval(TMR);const pct=Math.round(score().ok/S.E.qs.length*100);const k='n3best_'+S.E.id;LS.set(k,Math.max(LS.get(k,0),pct));result()}
function score(){let ok=0;const per=S.secs.map(s=>{let c=0;s.idx.forEach(i=>{if(S.ans[i]===S.E.qs[i].a)c++});ok+=c;return {n:s.n,c,t:s.idx.length}});return {ok,per}}
function result(){const {ok,per}=score(),T=S.E.qs.length,pct=Math.round(ok/T*100),pass=pct>=60&&per.every(p=>p.c/p.t>=1/3);
 $('#quiz').innerHTML=`<div class="qh"><span class="t">${esc(S.E.title)} · Kết quả</span><span class="sp"></span><button class="btn" id="qRv" type="button">Xem lại đáp án & giải thích</button><button class="btn" id="qX" type="button">✕</button></div>
 <div class="qb"><div class="res"><p class="muted">Số câu đúng</p><div class="big">${ok}/${T} <small style="font-size:1.1rem;color:var(--mut)">(${pct}%)</small></div>
 <p style="margin-top:8px"><span class="pass ${pass?'y':'n'}">${pass?'Đạt mức an toàn (≥60%)':'Chưa đạt mức an toàn 60%'}</span></p>
 <div class="rows">${per.map(p=>`<div><span class="muted jp">${p.n}</span><b>${p.c}/${p.t}</b><small class="muted">${Math.round(p.c/p.t*100)}%</small></div>`).join('')}</div>
 <p class="hint">Thi thật N3 còn phần nghe (聴解). Đề này không có phần nghe nên điểm chỉ để tham khảo: nên đạt từ 60% trở lên ở mỗi phần cho chắc.</p>
 <button class="btn pri" id="qRv2" type="button">Xem lại từng câu</button> <button class="btn" id="qAg" type="button">Làm lại đề này</button></div></div>`;
 const rv=()=>{S.i=0;render()};$('#qRv').onclick=rv;$('#qRv2').onclick=rv;$('#qX').onclick=close;$('#qAg').onclick=()=>{const f='de'+S.E.id.replace('n3-','');start(IDX.find(e=>e.id===S.E.id).f,S.mode)}}

/* ---------- từ vựng Mimikara ---------- */
let V=null,VP=0,VM='list',FC={i:0,list:[]},VQ=null;const PER=40;
async function vInit(){if(V){vRender();return}$('#pTv').innerHTML='<p class="muted">Đang tải từ vựng…</p>';
 try{V=await (await fetch('data/vocab.json',{cache:'no-cache'})).json()}catch(_){V=[]}
 vRender()}
function parts(){const n=Math.ceil(V.length/PER);return Array.from({length:n},(_,k)=>V.slice(k*PER,(k+1)*PER))}
function vRender(){const P=parts();
 if(!V.length){$('#pTv').innerHTML='<div class="card">Từ vựng Mimikara N3 đang được cập nhật.</div>';return}
 const cur=VP<0?V:P[VP];
 let h=`<div class="vhead"><img src="img/mimikara.jpg" alt="Mimikara N3"><div><h2>Từ vựng Mimikara N3</h2><p>耳から覚える 語彙トレーニング N3 · ${V.length} từ · Hán Việt · cách đọc · nghĩa tiếng Việt</p></div></div>
 <div class="parts"><button type="button" data-p="-1" class="${VP<0?'on':''}">Tất cả</button>${P.map((p,k)=>`<button type="button" data-p="${k}" class="${k===VP?'on':''}">Phần ${k+1} <small>(${p[0].n}–${p[p.length-1].n})</small></button>`).join('')}</div>
 <div class="vtool"><div class="vmodes"><button class="btn${VM==='list'?' pri':''}" data-vm="list" type="button">Bảng từ</button><button class="btn${VM==='fc'?' pri':''}" data-vm="fc" type="button">Thẻ ghi nhớ</button><button class="btn${VM==='qz'?' pri':''}" data-vm="qz" type="button">Kiểm tra</button></div>${VM==='list'?'<input id="vS" type="search" placeholder="Tìm: kanji, cách đọc, Hán Việt hoặc nghĩa…">':''}</div><div id="vBody"></div>
 <p class="src">Nguồn: bảng tổng hợp 880 từ vựng Mimikara N3 (Minato Dorimu), theo sách 耳から覚える 語彙トレーニング N3 (アルク).</p>`;
 $('#pTv').innerHTML=h;
 $$('#pTv [data-p]').forEach(b=>b.onclick=()=>{VP=+b.dataset.p;FC={i:0,list:[]};VQ=null;vRender()});
 $$('#pTv [data-vm]').forEach(b=>b.onclick=()=>{VM=b.dataset.vm;FC={i:0,list:[]};VQ=null;vRender()});
 if(VM==='list'){const draw=f=>{const s=(f||'').trim().toLowerCase();const L=s?V.filter(w=>[w.k,w.r,w.h,w.m].join(' ').toLowerCase().includes(s)):cur;
   $('#vBody').innerHTML=`<table class="vt"><thead><tr><th>#</th><th>Từ</th><th>Cách đọc</th><th class="h">Hán Việt</th><th>Nghĩa</th></tr></thead><tbody>${L.map(w=>`<tr><td class="no">${w.n}</td><td class="k">${esc(w.k)}</td><td class="r">${w.r!==w.k?esc(w.r):''}</td><td class="h">${esc(w.h)}</td><td>${esc(w.m)}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">Không tìm thấy.</td></tr>'}</tbody></table>`};
  draw('');$('#vS').oninput=e=>draw(e.target.value)}
 else if(VM==='fc')fcDraw(cur);else qzDraw(cur)}
function fcDraw(cur){if(!FC.list.length)FC.list=cur.slice();const w=FC.list[FC.i];
 $('#vBody').innerHTML=`<div class="fc"><div class="fcard" id="fcC"><div class="in"><div class="f"><div class="w">${esc(w.k)}</div><small class="muted" style="margin-top:10px">Bấm để lật thẻ</small></div><div class="b"><div class="w" style="font-size:1.6rem">${esc(w.k)}</div>${w.r!==w.k?`<div class="rd">${esc(w.r)}</div>`:''}<div class="hv">${esc(w.h)}</div><div class="mn">${esc(w.m)}</div></div></div></div>
 <div class="fnav"><button class="btn" id="fcP" type="button">←</button><span class="muted">${FC.i+1}/${FC.list.length}</span><button class="btn" id="fcN" type="button">→</button><button class="btn" id="fcS" type="button">Trộn thẻ</button></div></div>`;
 $('#fcC').onclick=()=>$('#fcC').classList.toggle('flip');
 $('#fcP').onclick=()=>{FC.i=(FC.i-1+FC.list.length)%FC.list.length;fcDraw(cur)};$('#fcN').onclick=()=>{FC.i=(FC.i+1)%FC.list.length;fcDraw(cur)};
 $('#fcS').onclick=()=>{FC.list.sort(()=>Math.random()-.5);FC.i=0;fcDraw(cur)}}
function qzDraw(cur){if(!VQ){const pool=cur.slice().sort(()=>Math.random()-.5).slice(0,Math.min(10,cur.length));VQ={qs:pool.map(w=>{const ty=(w.r!==w.k&&Math.random()<.5)?'r':'m';const others=V.filter(x=>x!==w&&x[ty]!==w[ty]&&(ty==='m'||x.r!==x.k)).sort(()=>Math.random()-.5).slice(0,3);const o=[w,...others].sort(()=>Math.random()-.5);return {w,ty,o,a:o.indexOf(w)}}),i:0,ok:0,pick:null}}
 const Q=VQ.qs[VQ.i];if(!Q){$('#vBody').innerHTML=`<div class="card" style="text-align:center"><b style="font-size:1.3rem">${VQ.ok}/${VQ.qs.length} câu đúng</b><p class="muted">Làm lượt mới để ôn tiếp.</p><button class="btn pri" id="qzA" type="button">Làm lượt mới</button></div>`;$('#qzA').onclick=()=>{VQ=null;qzDraw(cur)};return}
 $('#vBody').innerHTML=`<div class="card vq"><p class="muted">Câu ${VQ.i+1}/${VQ.qs.length} · ${Q.ty==='m'?'Chọn nghĩa đúng':'Chọn cách đọc đúng'}</p><div class="q jp">${esc(Q.w.k)}</div>
 <div class="ops">${Q.o.map((w,k)=>{let c='';if(VQ.pick!=null){if(k===Q.a)c=' ok';else if(k===VQ.pick)c=' ng'}return `<button class="op${c}" data-k="${k}" type="button"><span class="k">${k+1}</span><span>${esc(Q.ty==='m'?w.m:w.r)}</span></button>`}).join('')}</div>
 ${VQ.pick!=null?`<div class="exp"><b class="jp">${esc(Q.w.k)}</b>${Q.w.r!==Q.w.k?'（'+esc(Q.w.r)+'）':''}${Q.w.h?' · '+esc(Q.w.h):''} — ${esc(Q.w.m)}</div><p style="margin-top:10px"><button class="btn pri" id="qzN" type="button">Câu tiếp →</button></p>`:''}</div>`;
 $$('#vBody .op').forEach(b=>b.onclick=()=>{if(VQ.pick!=null)return;VQ.pick=+b.dataset.k;if(VQ.pick===Q.a)VQ.ok++;qzDraw(cur)});
 const n=$('#qzN');if(n)n.onclick=()=>{VQ.i++;VQ.pick=null;qzDraw(cur)}}

addEventListener('keydown',e=>{if(!S||!$('#quiz').classList.contains('on'))return;if(e.key==='ArrowRight'){$('#qNext')&&$('#qNext').click()}else if(e.key==='ArrowLeft'){$('#qPrev')&&$('#qPrev').click()}else if(/^[1-4]$/.test(e.key)){const b=$$('#quiz .op')[+e.key-1];b&&b.click()}});
deInit();tab(location.hash==='#tv'?'tv':'de');
})();
