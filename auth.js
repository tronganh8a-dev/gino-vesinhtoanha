// Anh Trọng Dạy Gino · Vệ sinh toà nhà — đăng nhập phía máy chủ (Cloudflare Workers + static assets)
// Tài khoản: biến ACCOUNTS (Settings → Variables and Secrets), mỗi dòng 1 tài khoản:
//   tendangnhap:matkhau:Tên hiển thị        (Tên hiển thị có thể bỏ trống)
// Hoặc mỗi tài khoản 1 biến riêng (Secret): Name = TK_tendangnhap, Value = matkhau hoặc matkhau:Tên hiển thị.
// Khoá 1 bạn: xoá dòng/biến của bạn đó → Save → tạo deployment mới. Biến SECRET: chuỗi dài bất kỳ để ký cookie.
const COOKIE = 'gino_s', DAYS = 30, enc = new TextEncoder();
const LOGIN = "<!DOCTYPE html>\n<html lang=\"vi\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Anh Trọng Dạy Gino · Luyện thi Tokutei Gino — Vệ sinh toà nhà</title>\n<meta name=\"robots\" content=\"noindex\"><meta name=\"theme-color\" content=\"#0a4670\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link href=\"https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap\" rel=\"stylesheet\">\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nhtml,body{min-height:100%}\nbody{min-height:100vh;display:grid;grid-template-columns:1.15fr 1fr;font-family:\"M PLUS Rounded 1c\",\"Hiragino Maru Gothic ProN\",\"Segoe UI\",system-ui,sans-serif;color:#17222c;background:#f3f6f8;-webkit-user-select:none;user-select:none}\n.side{position:relative;overflow:hidden;color:#fff;padding:48px 56px;display:flex;flex-direction:column;background:radial-gradient(900px 600px at 90% 0%,#1a78b4 0%,rgba(26,120,180,0) 60%),linear-gradient(140deg,#0b3d60 0%,#0d5a8c 55%,#0a4670 100%)}\n.side::after{content:\"\";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:44px 44px;-webkit-mask-image:linear-gradient(180deg,#000,transparent 80%);mask-image:linear-gradient(180deg,#000,transparent 80%);pointer-events:none}\n.brand{display:flex;align-items:center;gap:12px;font-weight:700;font-size:18px;position:relative;z-index:1}\n.logo{width:42px;height:42px;border-radius:11px;background:#c42f66;color:#fff;display:grid;place-items:center;font-weight:800;font-size:16px;flex:none}\n.side h1{position:relative;z-index:1;font-size:46px;line-height:1.2;margin:52px 0 20px;letter-spacing:-.01em;font-weight:800}\n.side h1 span{color:#ffd166;white-space:nowrap}\n.lead{position:relative;z-index:1;font-size:17px;color:#d4e6f3;max-width:480px;line-height:1.55}\n.chips{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}\n.chips span{border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:6px 14px;font-size:13.5px;font-weight:600}\n.stage{position:relative;z-index:1;margin-top:auto;height:270px;display:flex;align-items:flex-end;gap:26px}\n.book{width:170px;flex:none;border-radius:8px;border:5px solid #fff;box-shadow:0 18px 40px rgba(0,0,0,.45);transform-origin:50% 100%;transform:rotate(-6deg);animation:wob 3s ease-in-out infinite;margin-bottom:-74px;display:block}\n@keyframes wob{0%,100%{transform:rotate(-6deg) translateY(0)}20%{transform:rotate(-9deg) translateY(-7px)}40%{transform:rotate(-3.5deg) translateY(-2px)}60%{transform:rotate(-7.5deg) translateY(-8px)}80%{transform:rotate(-5deg) translateY(-1px)}}\n@media (prefers-reduced-motion:reduce){.book{animation:none}}\n.org{background:#fff;border-radius:14px;padding:12px 14px;color:#17222c;box-shadow:0 12px 30px rgba(0,0,0,.25);max-width:280px;margin-bottom:6px}\n.org small{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7b8893;margin-bottom:7px}\n.org img{width:100%;height:auto;display:block}\n.org p{font-size:12px;color:#5a6873;margin-top:7px;line-height:1.45}\nmain{display:grid;place-items:center;padding:32px 20px}\nform{background:#fff;border-radius:20px;padding:34px 32px;width:100%;max-width:400px;box-shadow:0 24px 60px rgba(13,40,60,.14);border:1px solid #e3e9ee}\nform h2{font-size:24px;margin:0 0 4px}\nform>p{margin:0 0 18px;color:#5a6873;font-size:14.5px}\nlabel{display:block;font-weight:600;font-size:13px;margin:14px 0 6px;color:#2a3a47}\ninput{width:100%;border:1.5px solid #dbe2e7;border-radius:12px;padding:13px 14px;font:inherit;font-size:17px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0d5a8c;background:#f8fafb;transition:border-color .15s,box-shadow .15s,background .15s;-webkit-user-select:text;user-select:text}\ninput::placeholder{letter-spacing:.06em;font-weight:500;color:#aab7c0}\ninput:focus{outline:0;border-color:#0d5a8c;background:#fff;box-shadow:0 0 0 4px rgba(13,90,140,.12)}\nbutton{width:100%;margin-top:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#0d5a8c,#0a4670);color:#fff;font-family:inherit;font-weight:700;font-size:16.5px;padding:14px;cursor:pointer;box-shadow:0 8px 20px rgba(13,90,140,.28);transition:transform .15s,box-shadow .15s}\nbutton:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(13,90,140,.34)}\nbutton:disabled{opacity:.65;cursor:progress;transform:none}\n.bar{height:6px;border-radius:99px;background:#e6ecf0;overflow:hidden;margin-top:14px;display:none}\n.bar.on{display:block}\n.bar i{display:block;height:100%;width:30%;background:linear-gradient(90deg,#2f8fd0,#0d5a8c);animation:sl 1.1s ease-in-out infinite}\n@keyframes sl{0%{margin-left:-32%}100%{margin-left:102%}}\n.msg{margin-top:12px;font-size:13.5px;font-weight:600;min-height:20px}\n.msg.err{color:#b3261e}.msg.ok{color:#1d7a4b}\n.help{margin-top:16px;font-size:13px;color:#5a6873;text-align:center}\n.soc{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}\n.soc a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;text-decoration:none;color:#fff;transition:transform .15s,box-shadow .15s}\n.soc a:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(0,0,0,.15)}\n.soc svg{width:22px;height:22px;flex:none}.soc span{display:flex;flex-direction:column;line-height:1.2;min-width:0}.soc b{font-size:14px}.soc small{font-size:11.5px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.soc .fb{background:#1877f2}.soc .tt{background:#111}\nsmall.cr{display:block;margin-top:20px;color:#9aa6b0;font-size:11.5px;text-align:center;line-height:1.55}\n@media (max-width:880px){\n body{grid-template-columns:1fr}\n .side{padding:24px 20px 0;min-height:auto}\n .side h1{font-size:28px;margin:22px 0 8px}.lead{font-size:14.5px}.chips{display:none}\n .stage{height:150px;margin-top:16px;gap:16px;justify-content:center}\n .book{width:104px;margin-bottom:-46px;border-width:3px}\n .org{max-width:190px;padding:9px 10px}.org p{display:none}\n main{padding:22px 16px 32px}form{padding:26px 22px;margin-top:-8px}\n}\n</style>\n<meta name=\"robots\" content=\"noindex\"><style>.pw{position:relative}.pw input{padding-right:70px}\n#eye{all:unset;box-sizing:border-box;position:absolute;right:8px;top:50%;transform:translateY(-50%);background:#e8eef3;color:#0d5a8c;font-size:12.5px;font-weight:700;border-radius:8px;padding:6px 10px;cursor:pointer;line-height:1.2}\n.msg:empty{display:none}.keep{display:flex!important;align-items:center;gap:9px;margin:12px 0 0!important;font-weight:600;font-size:13.5px;color:#2a3a47;cursor:pointer;user-select:none}.keep input{all:revert;width:18px;height:18px;accent-color:#0d5a8c;margin:0;cursor:pointer}</style></head>\n<body>\n<aside class=\"side\">\n <div class=\"brand\"><span class=\"logo\">AT</span>Anh Trọng Dạy Gino</div>\n <h1>Học và Luyện thi <span>Vệ sinh toà nhà</span></h1>\n <p class=\"lead\">Tokutei Gino 1号 · ビルクリーニング分野 — video bài giảng, tài liệu song ngữ, flashcard và bộ đề trên giao diện CBT.</p>\n <div class=\"chips\"><span>学科試験</span><span>実技試験</span><span>資器材</span><span>単語カード</span></div>\n <div class=\"stage\" aria-hidden=\"true\">\n  <img class=\"book\" src=\"/pub/img1.jpg\" alt=\"\">\n  <div class=\"org\"><small>Đơn vị tổ chức thi</small><img src=\"/pub/img2.png\" alt=\"\"><p>公益社団法人 全国ビルメンテナンス協会 (JBMA)</p></div>\n </div>\n</aside>\n<main>\n<form method=\"post\" action=\"/login\">\n <input type=\"hidden\" name=\"next\" value=\"__NEXT__\">\n <h2>Đăng nhập</h2><p>Nhập tài khoản thầy đã cấp riêng cho bạn.</p>\n <label for=\"u\">Tên đăng nhập</label>\n <input id=\"u\" name=\"u\" value=\"__USER__\" placeholder=\"vd: hv01\" autocomplete=\"username\" autocapitalize=\"none\" spellcheck=\"false\" required autofocus style=\"text-transform:none;letter-spacing:.04em\">\n <label for=\"p\">Mật khẩu</label>\n <div class=\"pw\"><input id=\"p\" name=\"p\" type=\"password\" placeholder=\"••••••\" autocomplete=\"current-password\" spellcheck=\"false\" required><button type=\"button\" id=\"eye\" onclick=\"const i=document.getElementById('p');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'Hiện':'Ẩn'\">Hiện</button></div>\n <label class=\"keep\"><input type=\"checkbox\" name=\"keep\" value=\"1\" checked><span>Lưu đăng nhập trên máy này (30 ngày)</span></label>\n <button id=\"btn\" type=\"submit\">Vào học →</button>\n <div class=\"msg err\" role=\"alert\">__ERR__</div>\n <div class=\"help\">Chưa có tài khoản? Nhắn Anh Trọng Dạy Gino để được cấp:</div>\n <div class=\"soc\"><a class=\"fb\" href=\"https://www.facebook.com/anh.trongg.2024/\" target=\"_blank\" rel=\"noopener\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M14 8V6.5c0-.7.5-1 1-1h2V2h-3c-3 0-4 2-4 4.3V8H7.5v3.5H10V22h4V11.5h2.8l.5-3.5H14z\"/></svg><span><b>Facebook</b><small>Anh Trọng</small></span></a><a class=\"tt\" href=\"https://www.tiktok.com/@anhtrong.daygino\" target=\"_blank\" rel=\"noopener\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.4 6.4 0 1 0 5.4 6.3V8.8a8 8 0 0 0 4.4 1.3V6.7a4.6 4.6 0 0 1-4.4-4.7z\"/></svg><span><b>TikTok</b><small>@anhtrong.daygino</small></span></a></div>\n <small class=\"cr\">Mỗi học viên một tài khoản riêng — vui lòng không chia sẻ tài khoản.<br>© 2026 Anh Trọng Dạy Gino · 出典：公益社団法人全国ビルメンテナンス協会「目指せ！ビルクリーニング特定技能評価試験～学習テキスト～」。表紙の著作権は同協会に帰属します。</small>\n</form>\n</main>\n</body></html>";

function accounts(env) {
  const m = new Map();
  for (const line of String(env.ACCOUNTS || '').split(/[\n;]+/)) {
    const a = line.split(':');
    if (a.length < 2) continue;
    const u = a[0].trim().toLowerCase(), p = a[1].trim(), name = a.slice(2).join(':').trim();
    if (u && p) m.set(u, { p, name });
  }
  // Thêm từng tài khoản bằng 1 biến riêng: Name = TK_tendangnhap, Value = matkhau  (hoặc matkhau:Tên hiển thị)
  for (const [k, v] of Object.entries(env || {})) {
    const mk = /^TK_([A-Za-z0-9_]+)$/.exec(k);
    if (!mk || typeof v !== 'string') continue;
    const a = v.split(':'), p = a[0].trim(), name = a.slice(1).join(':').trim();
    if (p) m.set(mk[1].toLowerCase(), { p, name });
  }
  return m;
}
async function sign(env, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(env.SECRET || 'anh-trong-day-gino-vstn'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c]));
}
function getCookie(req, name) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
async function currentUser(req, env) {
  const v = getCookie(req, COOKIE);
  if (!v) return null;
  const [u, exp, sig] = v.split('|');
  if (!u || !exp || !sig || Date.now() > Number(exp)) return null;
  const acc = accounts(env).get(u);
  if (!acc) return null;                       // tài khoản bị xoá → mất quyền ngay
  return (await sign(env, `${u}|${exp}|${acc.p}`)) === sig ? u : null;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const safeNext = n => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/');
function loginPage(err = '', user = '', next = '/') {
  const html = LOGIN.replace('__ERR__', esc(err)).replace('__USER__', esc(user)).replace('__NEXT__', esc(next));
  return new Response(html, { status: err ? 401 : 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
const norm = s => String(s || '').trim().toUpperCase();
// trang app được chia 2 phần (mỗi file < 10MB) — ghép lại khi trả về
async function appPage(req, env) {
  const base = new URL(req.url).origin;
  const parts = await Promise.all(['/app/p1.html', '/app/p2.html'].map(p => env.ASSETS.fetch(new Request(base + p))));
  if (parts.some(r => !r.ok)) return new Response('Thiếu file trang học', { status: 500 });
  const { readable, writable } = new TransformStream();
  (async () => { for (const r of parts) await r.body.pipeTo(writable, { preventClose: true }); await writable.close(); })();
  return new Response(readable, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
}

// ===== BẢN DÙNG THỬ: kiểm tra ĐẦU TIÊN, trước mọi bước đăng nhập =====
//  - đường dẫn /trial, /trial/...            → bản dùng thử (mọi tên miền)
//  - tên miền có chữ "trial": / , /index.html, /login → bản dùng thử; /logout → về /
//  - tên miền khác: giữ nguyên luồng đăng nhập của bản chính
const isTrialHost = url => url.hostname.toLowerCase().includes('trial');
async function trialPage(req, env) {
  const base = new URL(req.url).origin;
  let parts = [await env.ASSETS.fetch(new Request(base + '/trial/index.html'))];
  if (!parts[0].ok) parts = await Promise.all(['/trial/p1.html', '/trial/p2.html'].map(p => env.ASSETS.fetch(new Request(base + p))));
  if (parts.some(r => !r.ok)) return new Response('Thiếu file bản dùng thử', { status: 500 });
  const { readable, writable } = new TransformStream();
  (async () => { for (const r of parts) await r.body.pipeTo(writable, { preventClose: true }); await writable.close(); })();
  return new Response(readable, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex' } });
}
function trialRoute(req, env, url) {
  const p = url.pathname;
  if (p === '/trial' || p.startsWith('/trial/')) return trialPage(req, env);
  if (isTrialHost(url)) {
    if (p === '/' || p === '/index.html' || p === '/login') return trialPage(req, env);
    if (p === '/logout') return new Response(null, { status: 302, headers: { Location: '/', 'Cache-Control': 'no-cache' } });
  }
  return null;
}

export async function handle(req, env) {
  const url = new URL(req.url);
  const trial = trialRoute(req, env, url);
  if (trial) return trial;
  const next = () => env.ASSETS.fetch(req);

  if (url.pathname === '/login' && req.method === 'POST') {
    const f = await req.formData();
    const u = String(f.get('u') || '').trim().toLowerCase();
    const p = String(f.get('p') || '');
    const dest = safeNext(f.get('next'));
    const acc = accounts(env).get(u);
    if (!acc || norm(acc.p) !== norm(p)) return loginPage('Sai tên đăng nhập hoặc mật khẩu, hoặc tài khoản đã bị khoá.', u, dest);
    const exp = Date.now() + DAYS * 864e5;
    const val = `${u}|${exp}|${await sign(env, `${u}|${exp}|${acc.p}`)}`;
    const h = new Headers({ Location: dest, 'Cache-Control': 'no-store' });
    h.append('Set-Cookie', `${COOKIE}=${encodeURIComponent(val)}; Path=/; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`);
    h.append('Set-Cookie', `gino_user=${encodeURIComponent(u)}; Path=/; Max-Age=${DAYS * 86400}; Secure; SameSite=Lax`);
    h.append('Set-Cookie', `gino_name=${encodeURIComponent(acc.name)}; Path=/; Max-Age=${DAYS * 86400}; Secure; SameSite=Lax`);
    // vé dùng 1 lần: mở app ngay sau khi đăng nhập; tải lại trang = đăng nhập lại (giống app JFT)
    h.append('Set-Cookie', `gino_once=1; Path=/; Max-Age=120; HttpOnly; Secure; SameSite=Lax`);
    if (f.get('keep')) h.append('Set-Cookie', `gino_keep=1; Path=/; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`);
    else h.append('Set-Cookie', `gino_keep=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
    return new Response(null, { status: 303, headers: h });
  }
  if (url.pathname === '/logout') {
    const h = new Headers({ Location: '/login', 'Cache-Control': 'no-store' });
    for (const c of [COOKIE, 'gino_user', 'gino_name', 'gino_once', 'gino_keep']) h.append('Set-Cookie', `${c}=; Path=/; Max-Age=0; Secure; SameSite=Lax`);
    return new Response(null, { status: 303, headers: h });
  }
  if (url.pathname.startsWith('/pub/') && req.method === 'GET') return next();
  if (url.pathname === '/login') return loginPage('', '', safeNext(url.searchParams.get('next')));

  const user = await currentUser(req, env);
  if (!user) {
    if (req.method === 'GET' && (req.headers.get('Accept') || '').includes('text/html'))
      return Response.redirect(`${url.origin}/login?next=${encodeURIComponent(url.pathname + url.search)}`, 302);
    return new Response('Cần đăng nhập', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const dest = req.headers.get('Sec-Fetch-Dest');
  const isDoc = req.method === 'GET' && (dest === 'document' || (!dest && (req.headers.get('Accept') || '').includes('text/html')));
  if (isDoc && (url.pathname === '/' || url.pathname === '/index.html')) {
    // không tick "Lưu đăng nhập" → tải lại trang là phải đăng nhập lại
    if (!getCookie(req, 'gino_once') && !getCookie(req, 'gino_keep')) return new Response(null, { status: 302, headers: { Location: '/login', 'Cache-Control': 'no-store' } });
    const o = await appPage(req, env);
    o.headers.set('Cache-Control', 'no-store');
    o.headers.set('X-Robots-Tag', 'noindex');
    o.headers.append('Set-Cookie', `gino_once=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
    return o;
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'private, max-age=3600');
  out.headers.set('X-Robots-Tag', 'noindex');
  return out;
}
