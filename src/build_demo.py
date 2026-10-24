# Bản dùng thử (không đăng nhập) — sinh TỪ bản chính vừa build, để hai bản luôn cùng nội dung.
#   vào : public/app/p1.html + public/app/p2.html   (bản chính)
#   ra  : public/trial/index.html                    (nếu > 9,5MB thì chia thêm p1/p2 cho dễ upload)
# Phần bị khoá được GỠ HẲN khỏi file (ID video, câu hỏi, ảnh) — không chỉ ẩn bằng CSS/JS.
import json, os, re, sys

# ===================== CÀI ĐẶT (sửa ở đây) =====================
OPEN_VIDEOS = [1]          # buổi video được mở
OPEN_EXAMS = [1, 2]        # đề được mở
OPEN_VOCAB_CH = ['ch1']    # chương mở từ vựng (Flashcard)
OPEN_DOCS = ['ch1']        # chương mở trong tab Tài liệu — chương khác bị XOÁ nội dung
EQ_OPEN_PER_GROUP = 10     # thiết bị mở mỗi nhóm (tay/may) — còn lại khoá
APP_NAME = 'Vệ sinh toà nhà'
FB = 'https://www.facebook.com/anh.trongg.2024/'
TIKTOK = 'https://www.tiktok.com/@anhtrong.daygino'
REGISTER_URL = FB          # link nút "Đăng ký khoá học" (chưa có form riêng → nhắn Facebook)
PRICES = [
    ('Học qua Zoom', 'Lớp tập trung 5–7 người, thầy kèm trực tiếp', '10.000', '1 man', True),
    ('Tự học qua app + video', 'Toàn bộ app, video bài giảng, 16 đề thi thử', '7.000', '7 sen', False),
    ('Combo tự học: Vệ sinh toà nhà + Khách sạn', 'Tự học qua app + video của cả 2 ngành', '9.000', '9 sen', 'combo'),
    ('Học theo nhóm', 'Đăng ký từ 2 người trở lên, mỗi người được giá ưu đãi', '7.000', '7 sen/người', 'group'),
]
# ===============================================================

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
LIMIT = 9_500_000

def rep(s, a, b, cnt=1):
    n = s.count(a)
    assert n == cnt, f'không tìm thấy đúng {cnt} chỗ ({n}): {a[:80]!r}'
    return s.replace(a, b)

def main():
    s = (open(os.path.join(PUB, 'app/p1.html'), encoding='utf-8').read()
         + open(os.path.join(PUB, 'app/p2.html'), encoding='utf-8').read())
    LOCK_TXT = 'Thuộc khoá học đầy đủ'
    FBJ = json.dumps(FB)

    # ---------- 1. tiêu đề + noindex ----------
    s = re.sub(r'<title>[^<]*</title>', f'<title>Bản trải nghiệm · {APP_NAME} · Anh Trọng Dạy Gino</title>'
               '<meta name="robots" content="noindex,nofollow">', s, count=1)

    # ---------- 2. video: xoá ID các buổi khoá ----------
    a = s.index('const SES = ['); b = s.index('];', a)
    ses = s[a:b]
    locked_ids = []
    def fix(m):
        n = int(m.group(1))
        if n in OPEN_VIDEOS:
            return m.group(0)
        if m.group(2): locked_ids.append(m.group(2))
        return m.group(0).replace(f"id: '{m.group(2)}'", "id: '', lock: true")
    ses = re.sub(r"\{ n: (\d+),[^\n]*?id: '([^']*)'[^\n]*\}", fix, ses)
    s = s[:a] + ses + s[b:]
    LOCKV = (f'`<div class="card vcard vlock tlock"><div class="vthumb"><span class="vplay"><i>🔒</i></span></div>'
             f'<div class="vbody"><span class="no">Buổi ${{s.n}}</span><h3>${{s.t}}</h3><div class="jpt">${{s.jp}}</div>'
             f'<div class="lockmsg">🔒 {LOCK_TXT}</div><a class="lockfb" href="{FB}" target="_blank" rel="noopener">Nhắn Facebook để học đủ</a></div></div>`')
    s = rep(s, "$('#vgrid').innerHTML = SES.map(s => {\n  if (!s.id)",
            "$('#vgrid').innerHTML = SES.map(s => {\n  if (s.lock) return " + LOCKV + ";\n  if (!s.id)")
    s = rep(s, "${s.id ? 'Đã có video' : 'Sắp có'}", "${s.lock ? '🔒 Khoá học đầy đủ' : s.id ? 'Đã có video' : 'Sắp có'}")
    s = rep(s, '<span class="st ${s.id ? \'ok\' : \'wait\'}">', '<span class="st ${s.lock ? \'wait\' : s.id ? \'ok\' : \'wait\'}">')

    # ---------- 3. đề thi: xoá câu hỏi các đề khoá + ảnh chỉ đề khoá dùng ----------
    key = 'const EXD = '
    a = s.index(key) + len(key)
    exd, end = json.JSONDecoder().raw_decode(s[a:])
    locked_q = []
    for k, e in exd['exams'].items():
        if e['no'] not in OPEN_EXAMS:
            locked_q += e['questions']
            e['questions'] = []
            e['lock'] = True
    s = s[:a] + json.dumps(exd, ensure_ascii=False, separators=(',', ':')) + s[a + end:]
    used = set()
    for e in exd['exams'].values():
        for q in e['questions']:
            used |= {f for f in q.get('figs', []) if isinstance(f, int)}
            used |= {o['img'] for o in q['opts'] if o.get('img') is not None}
    key = 'const EXIMG = '
    a = s.index(key) + len(key)
    imgs, end = json.JSONDecoder().raw_decode(s[a:])
    removed_imgs = [imgs[i] for i in range(len(imgs)) if i not in used]
    imgs = [im if i in used else '' for i, im in enumerate(imgs)]
    s = s[:a] + json.dumps(imgs, separators=(',', ':')) + s[a + end:]

    LOCKE = (f'`<div class="excard tlock"><div class="ex-top"><div class="ex-no"><span class="k">Đề luyện thi</span><small>Đề</small><em>${{e.no}}</em></div>'
             f'<h3>${{e.title}}</h3><div class="jpt">${{furi(e.jp)}}</div></div><div class="ex-body"><p>${{e.desc}}</p>'
             f'<div class="ex-meta"><span>${{e.n}} câu</span><span>${{e.minutes}} phút</span></div>'
             f'<div class="lockmsg">🔒 {LOCK_TXT}</div><div class="ex-act"><a class="lockfb" href="{FB}" target="_blank" rel="noopener">Nhắn Facebook để mở đề</a></div></div></div>`')
    s = rep(s, "  g.innerHTML = Object.values(EXAMS).map(e => {\n    const nimg",
            "  g.innerHTML = Object.values(EXAMS).map(e => {\n    if (e.lock) return " + LOCKE + ";\n    const nimg")
    s = rep(s, "function openExam(no, mode) {\n  const e = EXAMS[no];",
            "function openExam(no, mode) {\n  const e = EXAMS[no];\n  if (!e || e.lock) return;")
    # số câu trên trang chủ: đề khoá vẫn tính số câu gốc
    s = rep(s, "nQ += (EXAMS[k].questions || []).length;", "nQ += EXAMS[k].lock ? (EXAMS[k].n || 0) : (EXAMS[k].questions || []).length;")


    # ---------- 3b. từ vựng: chỉ giữ chương mở; thiết bị: mở 1 nửa ----------
    key = 'const V = '
    a = s.index(key) + len(key)
    V, end = json.JSONDecoder().raw_decode(s[a:])
    v_locked = [v for v in V if v[3] not in OPEN_VOCAB_CH]
    V = [v for v in V if v[3] in OPEN_VOCAB_CH]
    s = s[:a] + json.dumps(V, ensure_ascii=False, separators=(',', ':')) + s[a + end:]
    key = 'const TOPIC = '
    a = s.index(key) + len(key)
    TP, end = json.JSONDecoder().raw_decode(s[a:])
    TP = {k: v for k, v in TP.items() if k.split(':')[0] in OPEN_VOCAB_CH}
    s = s[:a] + json.dumps(TP, ensure_ascii=False, separators=(',', ':')) + s[a + end:]
    for ch, nm in (('ch2', 'Chương 2'), ('ch3', 'Chương 3')):
        if ch not in OPEN_VOCAB_CH:
            s = rep(s, f'<button class="fchip" data-ch="{ch}">{nm}</button>',
                    f'<a class="fchip lockchip" href="{FB}" target="_blank" rel="noopener" title="{LOCK_TXT}">🔒 {nm}</a>')
    key = 'const EQ = '
    a = s.index(key) + len(key)
    EQ, end = json.JSONDecoder().raw_decode(s[a:])
    seen = {}; eq_locked = []
    for e in EQ:
        seen[e[3]] = seen.get(e[3], 0) + 1
        if seen[e[3]] > EQ_OPEN_PER_GROUP:
            eq_locked.append(e[5]); e[4] = ''; e[5] = ''; e.append(1)   # giữ tên, xoá ảnh + cách dùng
    s = s[:a] + json.dumps(EQ, ensure_ascii=False, separators=(',', ':')) + s[a + end:]
    LOCKEQ = (f'`<div class="ei tlock"><div class="ph lockph">🔒</div><div class="n">${{furi(e[0])}}</div><div class="v">${{esc(e[2])}}</div>'
              f'<a class="lockfb sm" href="{FB}" target="_blank" rel="noopener">{LOCK_TXT}</a></div>`')
    s = rep(s, "$('#egrid').innerHTML = list.map(([e, i]) => `<div class=\"ei\" data-e=\"${i}\">",
            "$('#egrid').innerHTML = list.map(([e, i]) => e[6] ? " + LOCKEQ + " : `<div class=\"ei\" data-e=\"${i}\">")
    s = rep(s, "  const pool = shuffle(EQ).slice(0, 15);", "  const EQO = EQ.filter(e => !e[6]);\n  const pool = shuffle(EQO).slice(0, 15);")
    s = rep(s, "    const same = EQ.filter(x => x[3] === e[3] && x !== e);", "    const same = EQO.filter(x => x[3] === e[3] && x !== e);")
    n_open_eq = sum(1 for e in EQ if len(e) < 7)
    NOTE = (f'<div class="tlockbar">🔒 Bản trải nghiệm: mở từ vựng Chương 1 ({len(V)} từ) và {n_open_eq}/{len(EQ)} thiết bị. '
            f'Từ vựng Chương 2–3 và thiết bị còn lại {LOCK_TXT.lower()}. <a href="{FB}" target="_blank" rel="noopener">Nhắn Facebook</a></div>')
    s = rep(s, '  <div class="subnav" id="subnav">', NOTE + '\n  <div class="subnav" id="subnav">')

    # ---------- 3c. tài liệu: xoá hẳn nội dung chương khoá ----------
    doc_locked = re.findall(r"\{ k: '(ch\d)'", s[s.index('const DOCS = ['):s.index('];', s.index('const DOCS = ['))])
    doc_locked = [k for k in doc_locked if k not in OPEN_DOCS]
    doc_probe = []
    for k in doc_locked:
        m = re.search(r'<script type="text/plain" id="src-' + k + r'">(.*?)</script>', s, re.S)
        assert m, ('không thấy nội dung', k)
        body = m.group(1)
        doc_probe += [body[j:j + 80] for j in range(len(body) // 5, len(body), len(body) // 5)][:4]
        s = s[:m.start()] + s[m.end():]
    DLJ = json.dumps(doc_locked)
    LOCKD = (f'`<div class="card dcard tlock dlock"><div class="dcover"><span class="badge">${{d.t}}</span><img src="${{COVER[d.k]}}" alt="${{d.t}}" loading="lazy"><span class="dlk">🔒</span></div>'
             f'<div class="dbody"><h3>${{d.t}} 🔒</h3><div class="jpt">${{d.jp}}</div><div class="lockmsg">🔒 {LOCK_TXT}</div>'
             f'<a class="lockfb" href="{FB}" target="_blank" rel="noopener">Nhắn Facebook để học đủ</a></div></div>`')
    s = rep(s, "$('#dgrid').innerHTML = DOCS.map(d => `<div class=\"card dcard\" data-doc=\"${d.k}\">",
            "const DLOCK = " + DLJ + ";\n$('#dgrid').innerHTML = DOCS.map(d => DLOCK.includes(d.k) ? " + LOCKD + " : `<div class=\"card dcard\" data-doc=\"${d.k}\">")
    s = rep(s, "function openDoc(k, sec) {\n",
            "function openDoc(k, sec) {\n  if (typeof DLOCK !== 'undefined' && DLOCK.includes(k)) { tDocLock(k); return; }\n")
    s = rep(s, "const blobCache = {};",
            "function tDocLock(k) { const d = DOCS.find(x => x.k === k) || { t: '' }; let m = document.getElementById('tdlm');"
            " if (!m) { m = document.createElement('div'); m.id = 'tdlm'; m.addEventListener('click', e => { if (e.target === m || e.target.closest('.tdlx')) m.remove(); }); }"
            " m.innerHTML = '<div class=\"tdlbox tlock\"><button class=\"tdlx\" aria-label=\"Đóng\">×</button><div class=\"tdli\">🔒</div><b>' + d.t + ' · " + LOCK_TXT + "</b>"
            "<p>Bản trải nghiệm mở tài liệu Chương 1. Đăng ký khoá học để đọc đủ Chương 2 và 3.</p><a class=\"lockfb\" href=\"" + FB + "\" target=\"_blank\" rel=\"noopener\">Nhắn Facebook để học đủ</a></div>';"
            " document.body.appendChild(m); }\nconst blobCache = {};")

    # ---------- 3d. tài liệu: khoá link "Tải Slide bài giảng" (xoá hẳn link) ----------
    m = re.search(r'<!--SLIDE-START-->(.*?)<!--SLIDE-END-->', s, re.S)
    assert m, 'không thấy link slide'
    slide_url = re.search(r'href="([^"]+)"', m.group(1)).group(1)
    LOCKS = ('<a class="jx-pbtn dslide tslock" href="' + FB + '" target="_blank" rel="noopener" style="text-decoration:none">'
             '<span style="font-size:20px;flex:none">🔒</span><span><b>Tải Slide bài giảng</b><small>' + LOCK_TXT + ' · nhắn Facebook</small></span><i>↗</i></a>')
    s = s[:m.start()] + LOCKS + s[m.end():]

    # ---------- 3e. slide tổng ôn: gỡ hẳn trình xem + đáp án, thay bằng thẻ khoá ----------
    m = re.search(r'<!--TONGON-START-->.*?<!--TONGON-END-->', s, re.S)
    if m:
        LOCKT = ('<a class="jx-pbtn tslock" href="' + FB + '" target="_blank" rel="noopener" style="text-decoration:none;max-width:900px;margin:0 0 16px">'
                 '<span style="font-size:20px;flex:none">🔒</span><span><b>Slide tổng ôn Vệ sinh toà nhà</b><small>' + LOCK_TXT
                 + ' · 84 slide, 46 câu luyện tập có đáp án · nhắn Facebook</small></span><i>↗</i></a>')
        s = s[:m.start()] + LOCKT + s[m.end():]

    # ---------- 4. bỏ đăng nhập/đăng xuất ----------
    s = re.sub(r"function jxLogout\(\) \{[^}]*\}", f"function jxLogout() {{ window.open({FBJ}, '_blank'); }}", s, count=1)
    s = rep(s, 'onclick="jxLogout()">Đăng xuất</button>', 'onclick="jxLogout()">Đăng ký khoá học</button>')
    s = rep(s, 'onclick="jxLogout()">Thoát</button>', 'onclick="jxLogout()">Đăng ký</button>')
    s = rep(s, "  const ht = document.querySelector('.jx-ht');\n  if (!ht) return;", "  const ht = null;\n  if (!ht) return;")

    # ---------- 5. bảng giá trên trang chủ ----------
    cards = ''.join(
        f'<div class="tp-card{" hot" if hot is True else ""}{" combo" if hot == "combo" else ""}{" group" if hot == "group" else ""}">{"<span class=tp-hot>Khuyên dùng</span>" if hot is True else ""}{"<span class=tp-hot>Combo 2 ngành</span>" if hot == "combo" else ""}{"<span class=tp-hot>Nhóm từ 2 người</span>" if hot == "group" else ""}'
        f'<h4>{t}</h4><p>{d}</p><div class="tp-price"><b>{p}</b><span>{"yên/người" if hot == "group" else "yên"}</span><small>({note})</small></div></div>'
        for t, d, p, note, hot in PRICES)
    PRICE = (f'\n\n  <div class="jx-card tprice" id="tprice"><div class="tp-h"><b>Học phí khoá đầy đủ</b><span class="jpt">受講料</span><span class="tp-pledge"><i class="fl">🔥</i>Cam kết học tới khi đậu<i class="fl r">🔥</i></span>'
             f'</div>'
             f'<div class="tp-grid">{cards}</div>'
             f'<a class="tp-reg" href="{REGISTER_URL}" target="_blank" rel="noopener">Đăng ký khoá học →</a></div>')
    s = rep(s, '\n\n  <div class="jx-card jx-sched">', PRICE + '\n\n  <div class="jx-card jx-sched">')

    # ---------- 6. dải "Bản trải nghiệm" + nút nổi FB/TikTok (luôn hiện) ----------
    FB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 8V6.5c0-.7.5-1 1-1h2V2h-3c-3 0-4 2-4 4.3V8H7.5v3.5H10V22h4V11.5h2.8l.5-3.5H14z"/></svg>'
    TT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.4 6.4 0 1 0 5.4 6.3V8.8a8 8 0 0 0 4.4 1.3V6.7a4.6 4.6 0 0 1-4.4-4.7z"/></svg>'
    BAR = (f'<div class="trialbar" role="banner"><span class="tb-t">🎁 <b>Bản trải nghiệm</b><span class="tb-s"> · mở video buổi 1 &amp; 2 đề đầu</span></span>'
           f'<a class="tb-reg" href="{REGISTER_URL}" target="_blank" rel="noopener">Đăng ký</a>'
           f'<a class="tb-ic fb" href="{FB}" target="_blank" rel="noopener" aria-label="Facebook">{FB_SVG}</a>'
           f'<a class="tb-ic tt" href="{TIKTOK}" target="_blank" rel="noopener" aria-label="TikTok">{TT_SVG}</a></div>'
           f'<div class="trialfab"><a class="fb" href="{FB}" target="_blank" rel="noopener" aria-label="Nhắn Facebook">{FB_SVG}</a>'
           f'<a class="tt" href="{TIKTOK}" target="_blank" rel="noopener" aria-label="TikTok">{TT_SVG}</a></div>')
    CSS = '''<style id="trial-css">
:root{--tbh:38px}
body{padding-top:var(--tbh)!important}
.trialbar{position:fixed;top:0;left:0;right:0;height:var(--tbh);z-index:1000;display:flex;align-items:center;gap:8px;padding:0 12px;background:linear-gradient(90deg,#c42f66,#e0573f);color:#fff;font:600 13.5px/1 "Quicksand","Segoe UI",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.15)}
.trialbar .tb-t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trialbar .tb-reg{background:#fff;color:#c42f66;text-decoration:none;font-weight:800;padding:6px 12px;border-radius:999px;font-size:12.5px;white-space:nowrap}
.trialbar .tb-ic{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;flex:none}
.trialbar .tb-ic.fb{background:#1877f2}.trialbar .tb-ic.tt{background:#111}
.trialbar svg,.trialfab svg{width:16px;height:16px}
.trialfab{position:fixed;right:14px;bottom:84px;z-index:1000;display:flex;flex-direction:column;gap:10px}
.trialfab a{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.trialfab a svg{width:22px;height:22px}
.trialfab .fb{background:#1877f2}.trialfab .tt{background:#111}
.jx-side{top:var(--tbh)!important;height:calc(100vh - var(--tbh))!important}
.cbt,.reader,.glb,.imgov,.emodal{top:var(--tbh)!important}
.tlock{position:relative;opacity:.96}
.tlock .lockmsg{margin:10px 0 8px;font-weight:700;color:#8a5a12;background:#fdf6e7;border:1px solid #f0d9a8;border-radius:10px;padding:7px 10px;font-size:13.5px}
.tlock .lockfb{display:inline-block;background:#1877f2;color:#fff!important;text-decoration:none;font-weight:700;border-radius:10px;padding:9px 14px;font-size:14px}
.vlock.tlock .vplay i{font-size:26px;font-style:normal}
.tlockbar{margin:0 0 12px;padding:9px 12px;border-radius:12px;background:#fdf6e7;border:1px solid #f0d9a8;color:#6b4a10;font-size:13.5px;font-weight:600}.tlockbar a{color:#1877f2;font-weight:800;margin-left:4px}
.lockchip{text-decoration:none;color:#8a5a12!important;background:#fdf6e7!important;border-color:#f0d9a8!important}
.ei.tlock{cursor:default}.ei.tlock .lockph{display:grid;place-items:center;font-size:30px;background:#f3f5f7;width:100%;height:110px;border-radius:10px}.lockfb.sm{display:inline-block;margin-top:6px;font-size:11.5px!important;padding:5px 8px!important;border-radius:8px!important}
.tprice{border-top:4px solid #c42f66}
.tprice .tp-h b{font-size:20px}.tprice .tp-h .jpt{margin-left:8px;color:#8794a0}
.tp-pledge{position:relative;display:inline-flex;align-items:center;gap:5px;margin-left:10px;vertical-align:middle;color:#fff;font-weight:900;font-size:13px;letter-spacing:.01em;border-radius:999px;padding:5px 12px;background:linear-gradient(90deg,#ff3d00,#ff9100,#ffd600,#ff9100,#ff3d00);background-size:300% 100%;text-shadow:0 1px 2px rgba(120,20,0,.55);animation:tpFire 2.4s linear infinite,tpGlow 1.2s ease-in-out infinite alternate}
.tp-pledge .fl{font-style:normal;display:inline-block;animation:tpFlick .45s ease-in-out infinite alternate;transform-origin:50% 90%}
.tp-pledge .fl.r{animation-delay:.22s}
@keyframes tpFire{0%{background-position:0% 50%}100%{background-position:300% 50%}}
@keyframes tpGlow{0%{box-shadow:0 0 6px rgba(255,90,0,.45),0 0 0 0 rgba(255,145,0,.0)}100%{box-shadow:0 0 16px rgba(255,90,0,.85),0 0 28px 4px rgba(255,170,0,.35)}}
@keyframes tpFlick{0%{transform:scale(1) rotate(-6deg)}100%{transform:scale(1.25) rotate(6deg)}}
@media (prefers-reduced-motion:reduce){.tp-pledge,.tp-pledge .fl{animation:none}}
.tprice .tp-h{margin-bottom:14px}
.tprice .tp-h p{margin:6px 0 14px;color:#4a5b68}
.tp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.tp-card.group{border-color:#7a4fc2;background:linear-gradient(180deg,#f6f1fd,#fff)}.tp-card.group .tp-hot{background:#7a4fc2}.tp-card.group .tp-price b{color:#7a4fc2}
@media (max-width:1200px){.tp-grid{grid-template-columns:1fr 1fr}}
.jx-pbtn.tslock{background:#eef1f4;color:#5b6b77;box-shadow:none;border:1.5px dashed #c5cfd8}.jx-pbtn.tslock small{color:#8a5a12;opacity:1}
.dlock{cursor:default}.dlock .dcover{position:relative}.dlock .dcover img{filter:grayscale(.6) blur(1.5px);opacity:.75}.dlk{position:absolute;inset:0;display:grid;place-items:center;font-size:34px}
#tdlm{position:fixed;inset:0;z-index:99999;background:rgba(15,25,35,.55);display:grid;place-items:center;padding:16px}.tdlbox{position:relative;background:#fff;border-radius:18px;padding:24px 22px 20px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.25)}.tdlbox .tdli{font-size:34px}.tdlbox b{display:block;margin:6px 0;font-size:16px}.tdlbox p{color:#5b6b77;font-size:14px;margin:0 0 14px}.tdlx{all:unset;position:absolute;top:8px;right:12px;font-size:24px;cursor:pointer;color:#8794a0}
.mm-br.c2 .mm-leaf b::after{content:' 🔒';font-size:11px}.mm-br.c3 .mm-leaf b::after{content:' 🔒';font-size:11px}
.tp-card.combo{border-color:#1f7a4d;background:linear-gradient(180deg,#f2faf6,#fff)}.tp-card.combo .tp-hot{background:#1f7a4d}.tp-card.combo .tp-price b{color:#1f7a4d}
.tp-card{position:relative;border:1.5px solid #dbe2e7;border-radius:16px;padding:18px;background:#fff}
.tp-card.hot{border-color:#c42f66;box-shadow:0 8px 24px rgba(196,47,102,.12)}
.tp-hot{position:absolute;top:-11px;right:14px;background:#c42f66;color:#fff;font-size:12px;font-weight:800;padding:3px 10px;border-radius:999px}
.tp-card h4{margin:0 0 4px;font-size:17px}.tp-card p{margin:0 0 12px;color:#5b6b77;font-size:14px}
.tp-price b{font-size:32px;color:#0d5a8c;letter-spacing:-.01em}.tp-price span{margin-left:4px;font-weight:700}.tp-price small{margin-left:6px;color:#8794a0}
.tp-reg{display:inline-block;margin-top:16px;background:#c42f66;color:#fff;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:12px}
@media (max-width:880px){.trialfab{right:10px;gap:8px}.trialfab a{width:40px;height:40px}.trialfab a svg{width:18px;height:18px}.trialbar .tb-s{display:none}.jx-side{top:auto!important;height:auto!important}.tp-grid{grid-template-columns:1fr}.trialfab{bottom:calc(84px + env(safe-area-inset-bottom))}}
@media (max-width:640px){.jx-mtop{top:var(--tbh)!important}.tprice{padding:14px 12px!important}.tprice .tp-h{margin-bottom:12px}.tprice .tp-h b{font-size:17px}.tprice .tp-h .jpt{font-size:12px}.tp-pledge{margin:6px 0 0;font-size:12px;padding:4px 10px}.tp-grid{grid-template-columns:1fr 1fr!important;gap:8px}.tp-card{padding:13px 10px 10px;border-radius:12px}.tp-card h4{font-size:14px}.tp-card p{font-size:11.5px;margin-bottom:6px;line-height:1.4}.tp-price b{font-size:23px}.tp-price span{font-size:12px}.tp-price small{display:block;margin-left:0;font-size:11px}.tp-hot{font-size:10.5px;top:-9px;right:8px;padding:2px 7px}.tp-reg{display:block;text-align:center;margin-top:10px;padding:10px 14px;font-size:14.5px}}
</style>'''
    i = s.index('</head>'); s = s[:i] + CSS + s[i:]   # </head> đầu tiên = trang chính
    s = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + BAR, s, count=1)

    # ---------- 7. kiểm tra: không còn nội dung bị khoá ----------
    assert slide_url not in s and '1RO-eu7-JmugTLkHC4dZ26KxrmVhV723o' not in s, 'còn link slide'
    assert '/app/slides/tongon' not in s and 'TONGON' not in s, 'còn slide tổng ôn'
    for k in doc_locked: assert f'id="src-{k}"' not in s, ('còn nội dung tài liệu', k)
    assert not [x for x in doc_probe if x in s], 'còn đoạn nội dung tài liệu khoá'
    assert all(v[3] in OPEN_VOCAB_CH for v in V)
    leak_eq = sum(1 for im in eq_locked if im and im in s)
    assert leak_eq == 0, ('còn ảnh thiết bị khoá', leak_eq)
    bad = [v for v in locked_ids if v in s]
    assert not bad, ('còn ID video khoá', bad)
    open_txt = {q.get(f) for e in exd['exams'].values() for q in e['questions'] for f in ('evi', 'jp', 'ejp')}
    OPEN_BLOB = '\n'.join(t for t in open_txt if t)   # nội dung trùng với đề mở thì được phép còn
    lk = [q for q in locked_q]
    leak = [q[f][:40] for q in lk for f in ('evi', 'jp', 'ejp') if q.get(f) and len(q[f]) > 25 and q[f] not in OPEN_BLOB and q[f] in s]
    assert not leak, ('còn giải thích của đề khoá', leak[:3])
    leak_img = sum(1 for im in removed_imgs if im and im in s)
    assert leak_img == 0, ('còn ảnh của đề khoá', leak_img)

    # ---------- 8. ghi file ----------
    out = os.path.join(PUB, 'trial'); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    data = s.encode('utf-8')
    if len(data) <= LIMIT and False:   # luôn chia p1/p2 cho khớp file trên repo
        open(os.path.join(out, 'index.html'), 'wb').write(data)
        files = ['index.html']
    else:
        cut = data.index(b'\n', len(data) // 2) + 1
        open(os.path.join(out, 'p1.html'), 'wb').write(data[:cut])
        open(os.path.join(out, 'p2.html'), 'wb').write(data[cut:])
        files = ['p1.html', 'p2.html']
    print(f'build_demo ok · {len(data):,} byte → trial/{"+".join(files)} · khoá {len(locked_ids)} video, '
          f'{len(locked_q)} câu hỏi, {len(removed_imgs)} ảnh đề, {len(v_locked)} từ vựng, {len(eq_locked)} thiết bị, tài liệu {doc_locked}')

if __name__ == '__main__':
    main()
