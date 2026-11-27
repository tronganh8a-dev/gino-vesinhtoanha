#!/usr/bin/env python3
"""Dựng GIÁO ÁN GIẢNG DẠY (Artifact) Vệ sinh toà nhà → src/ga/out/ (index.html, ga.json, ga_c<N>.json, img/).
Chạy: python3 src/ga/build_ga.py   (cần node, pillow, bs4)
- Câu sách: lấy NGUYÊN từ bài học trong app (public/app/p1+p2, <script id="src-chN">) — không chép tay.
- Nội dung giảng viết tay: src/ga/bai/<mã bài>.json, trỏ tới câu sách bằng chỉ số (atoms).
- Câu đề: EXD (bộ đề trong app); câu kiểm tra của app: QZ / QZ2 trong trang chương.
- 4 bước dùng chung với slide: src/ga/steps.py.
Script tự kiểm: câu/đoạn sách chưa có trong giáo án, câu đề không tìm thấy, chữ tiếng Anh trong phần tiếng Việt."""
import json, re, os, io, sys, html, base64, subprocess
from bs4 import BeautifulSoup
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(H))
sys.path.insert(0, H)
from steps import PHN, BAI, step_of

OUT = os.path.join(H, 'out')
os.makedirs(OUT + '/img', exist_ok=True)
S = open(ROOT + '/public/app/p1.html', encoding='utf-8').read() + open(ROOT + '/public/app/p2.html', encoding='utf-8').read()
EXD = json.JSONDecoder().raw_decode(S[S.index('const EXD = ') + 12:])[0]['exams']
WARN = []

KAN = '[一-鿿々〆ヶ〇]'
def R(s):
    """漢字[かな] → ruby (chữ đã là HTML)."""
    return re.sub('(' + KAN + r'+)\[([^\]]+)\]', r'<ruby>\1<rt>\2</rt></ruby>', s or '')
def plain(s): return re.sub(r'<[^>]+>', '', re.sub(r'<rt>.*?</rt>', '', re.sub(r'\[[^\]]*\]', '', s or '')))
def esc(s): return html.escape(s or '', quote=False)

# tiếng Việt lấy từ dữ liệu sách: bỏ từ tiếng Anh (giữ tên riêng/từ mượn quen)
VI_FIX = [(r'\bcheck-?in\b', 'nhận phòng'), (r'\bcheck-?out\b', 'trả phòng'), (r'\bwax\b', 'sáp'), (r'\bpolisher\b', 'máy chà sàn'),
          (r'\bsqueegee\b', 'cây gạt kính'), (r'\btoilet\b', 'nhà vệ sinh'), (r'\bteamwork\b', 'làm việc nhóm'), (r'\blogic\b', 'trình tự'), (r'\burethane\b', 'uretan'), (r'\bgas\b', 'ga'), (r'\bhandle\b', 'tay cầm'), (r'Ky hốt nước bẩn', 'Hót nước bẩn'), (r'[Kk]y hốt rác', 'hót rác'), (r'cái hốt nước bẩn', 'hót nước bẩn'), (r'cái hốt rác', 'hót rác cán dài'), (r'cây lau nhà dùng khăn \(lau khô\)', 'cây lau khăn khô'), (r'đồ gom rác khô', 'khăn lau khô'), (r'cái gạt nước sàn', 'cây gạt nước sàn'), (r'cái gạt nước kính', 'cây gạt kính')]
VI_OK = {'SNS', 'CBT', 'Video', 'Slide', 'Facebook', 'TikTok', 'Wi', 'Fi', 'pH', 'HORENSO', 'axit', 'clo', 'vinyl', 'virus', 'lavabo', 'nilon', 'inox', 'photo', 'photocopy', 'linoleum', 'tatami', 'acrylic', 'protein', 'uretan', 'sofa', 'manga', 'micromet', 'kekaki', 'axit', 'clo', 'Mai', 'Kei'}
def vi(s, where=''):
    s = s or ''
    for a, b in VI_FIX: s = re.sub(a, b, s, flags=re.I)
    for w in re.findall(r'\b[A-Za-z]{3,}\b', html.unescape(plain(s))):
        if w.lower() not in VI_OK and w not in VI_OK and not VISYL.fullmatch(w.lower()):
            WARN.append(f'Tiếng Anh trong phần tiếng Việt ({where}): {w}')
    return s
VISYL = re.compile(r'(ngh|ng|nh|ch|gh|gi|kh|ph|qu|th|tr|[bcdghklmnprstvx])?(uye|oai|oay|uay|uoi|uou|ieu|yeu|uya|ai|ao|au|ay|eo|eu|ia|ie|iu|oa|oe|oi|oo|ua|ue|ui|uo|uu|uy|ye|[aeiouy])(ch|ng|nh|[cmnpt])?')
VIWORDS = set('anh chi chị các cho con của cũng các mai kei nhe nha tan the thi tra trong theo thanh tam tran sang sinh song tren trong truoc'.split())

# ---------- đọc chương trong app ----------
def chapter(ch):
    i = S.index(f'id="src-ch{ch}"'); j = S.index('</script>', i)
    raw = S[S.index('>', i) + 1:j]
    soup = BeautifulSoup(raw, 'html.parser')
    secs = soup.select('section.lesson')
    for k, sec in enumerate(secs):
        if not sec.get('id'): sec['id'] = 's%d' % k
    return raw, soup, secs
def jsdata(raw, names):
    out = []
    for n in names:
        m = re.search(r'const ' + n + r'\s*=\s*\[', raw)
        if not m: continue
        i = m.end() - 1; d = 0
        for j in range(i, len(raw)):
            if raw[j] == '[': d += 1
            elif raw[j] == ']':
                d -= 1
                if d == 0: break
        out.append(f'const {n}={raw[i:j + 1]};')
    js = '\n'.join(out) + '\nconsole.log(JSON.stringify({' + ','.join(n for n in names if f'const {n}=' in '\n'.join(out)) + '}))'
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)

def head_of(sec):
    h = sec.select_one('.lesson-head')
    g = lambda q: (h.select_one(q).get_text(strip=True) if h and h.select_one(q) else '')
    return dict(kick=g('.kicker') or g('.kick'), vi=g('h1'), jp=(h.select_one('.jp-title').decode_contents().strip() if h and h.select_one('.jp-title') else ''))
def pages_of(sec):
    p = sorted({int(x) for x in re.findall(r'tr\.(\d+)', ' '.join(x.get_text() for x in sec.select('.frame .src')))})
    return ('tr.%d' % p[0] if p[0] == p[-1] else 'tr.%d–%d' % (p[0], p[-1])) if p else ''

CH = {}
for ch in (1, 2, 3):
    raw, soup, secs = chapter(ch)
    CH[ch] = dict(raw=raw, secs={s['id']: s for s in secs}, js=jsdata(raw, ['QZ', 'QZ2', 'V1'] if ch == 1 else ['QUICK', 'MT', 'VOCAB']))

# ---------- 1 bài: câu sách (atoms) ----------
def cards_of(ch, sids):
    out = []
    for sid in sids:
        for i, dc in enumerate(CH[ch]['secs'][sid].select('.dcard')):
            out.append((f'{sid}:{i}', dc))
    return out
def atoms_of(cards):
    A = []
    for key, dc in cards:
        for l in dc.select('.line'):
            A.append(dict(card=key, ava=(l.select_one('.ava')['class'][-1] if l.select_one('.ava') else 'n'),
                          name=l.select_one('.lname').get_text(strip=True) if l.select_one('.lname') else '',
                          jp=l.select_one('.ljp').decode_contents().strip(), vn=l.select_one('.lvn').decode_contents().strip()))
    return A
def vocab_of(cards, ch, d):
    """từ vựng bài: bảng từ trong các đoạn + V1 cùng chủ đề + vx của giáo án; Hán Việt từ d['hv']."""
    seen, V = set(), []
    def add(w, m, x=''):
        k = plain(w).strip()
        if not k or k in seen: return
        seen.add(k); kk = re.sub('(する|で)$', '', k)
        V.append(dict(w=w, k=k, hv=d.get('hv', {}).get(k) or d.get('hv', {}).get(kk, ''), m=m, x=x))
    for key, dc in cards:
        for tb in dc.select('table.vtable'):
            hd = [th.get_text(strip=True) for th in tb.select('th')]
            im = next((i for i, h in enumerate(hd) if h.startswith('Nghĩa')), 1)
            ix = next((i for i, h in enumerate(hd) if h.startswith('Ghi chú')), None)
            for tr in tb.select('tr'):
                td = tr.select('td')
                if len(td) > im:
                    add(td[0].decode_contents().replace('<b>', '').replace('</b>', '').strip(), td[im].get_text(' ', strip=True),
                        td[ix].get_text(' ', strip=True) if ix is not None and len(td) > ix else '')
    for w, m in d.get('vx', []): add(w, m)
    tp = d.get('vtopic', 'kt'); tp = [tp] if isinstance(tp, str) else tp
    allv = CH[ch]['js'].get('V1', []) + CH[ch]['js'].get('VOCAB', [])
    for v in allv:
        if v[3] in tp: add(v[0], v[2])
    n_own = len(V)
    # từ của cả chương (chỉ hiện ở Phân tích câu khi có trong câu)
    for v in allv: add(v[0], v[2])
    for i, v in enumerate(V): v['own'] = i < n_own
    return V

def img_file(bid, key, k, src):
    m = re.match(r'data:image/\w+;base64,(.*)', src)
    if not m: return ''
    im = Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGB')
    if im.width > 900: im = im.resize((900, int(im.height * 900 / im.width)), Image.LANCZOS)
    fn = f'img/{bid}-{key.replace(":", "-")}-{k}.webp'
    im.save(OUT + '/' + fn, 'WEBP', quality=80, method=6)
    return fn

# ---------- HTML từng phần ----------
def line_html(a):
    return (f'<div class="sl {"sn" if a["ava"] == "n" else "sd"}">' + (f'<div class="who">{R(esc(a["name"]))}</div>' if a['name'] and a['name'] != '●' else '')
            + f'<div class="j">{"・" if a["name"] == "●" else ""}{R(a["jp"])}</div><div class="v">{vi(a["vn"], "câu sách")}</div></div>')
def L(cls, label, body): return f'<div class="ly {cls}"><h4>{label}</h4><div>{body}</div></div>' if body else ''
def pt_auto(text, V):
    out, seen = [], set()
    for v in V:
        k = re.sub('(する|で)$', '', v['k'])
        if len(k) >= 2 and k in text and k not in seen and not any(k in x for x in seen):
            seen.add(k)
            out.append(f'<span><span class="j">{R(v["w"])}</span>{(" · " + esc(v["hv"])) if v["hv"] else ""} · {esc(v["m"])}</span>')
    return out
def card_unit_html(u, n, i):
    hl = u.get('hl'); hl = f'<p>{R(hl[0])}</p><p class="ans">→ {R(hl[1])}</p>' if hl else ''
    pt = ''.join(f'<span>{R(x)}</span>' for x in u.get('ng', []))
    return (f'<article class="unit"><div class="no">MỤC {i} / {n}</div><div class="layers">'
            + L('pt-l', 'Từ khó', ('<div class="pt">' + pt + '</div>') if pt else '')
            + L('lg', 'Lời giảng', R(u.get('lg', ''))) + L('tt', 'Ví dụ thực tế', R(u.get('tt', ''))) + L('ask', 'Hỏi lớp', hl)
            + L('de', 'Liên hệ đề thi', R(u.get('de', ''))) + L('gv', 'Ghi chú cho giáo viên', R(u.get('gv', ''))) + '</div></article>')
def unit_html(u, A, V, n, i):
    src = ''.join(line_html(A[k]) for k in u['a'])
    text = ''.join(plain(A[k]['jp']) for k in u['a'])
    ngp = ' '.join(plain(x).split(':')[0] for x in u.get('ng', []))
    pt = [x for x in pt_auto(text, V) if plain(re.sub(r'<span class="j">(.*?)</span>.*', r'\1', x)).strip() not in ngp] + [f'<span>{R(x)}</span>' for x in u.get('ng', [])]
    hl = u.get('hl'); hl = f'<p>{R(hl[0])}</p><p class="ans">→ {R(hl[1])}</p>' if hl else ''
    return (f'<article class="unit"><div class="no">CÂU {i} / {n}</div><div class="src">{src}</div><div class="layers">'
            + L('pt-l', 'Phân tích câu', ('<div class="pt">' + ''.join(pt) + '</div>') if pt else '')
            + L('lg', 'Lời giảng', R(u.get('lg', ''))) + L('tt', 'Ví dụ thực tế', R(u.get('tt', ''))) + L('ask', 'Hỏi lớp', hl)
            + L('de', 'Liên hệ đề thi', R(u.get('de', ''))) + L('gv', 'Ghi chú cho giáo viên', R(u.get('gv', ''))) + '</div></article>')

LETTERS = 'ABCD'
EXIMG = json.JSONDecoder().raw_decode(S[S.index('const EXIMG = ') + 14:])[0]
EXF = {}
def eximg(i):
    if i is None: return ''
    if i not in EXF:
        m = re.match(r'data:image/(\w+);base64,(.*)', EXIMG[i])
        im = Image.open(io.BytesIO(base64.b64decode(m.group(2)))).convert('RGB')
        if im.width > 480: im = im.resize((480, int(im.height * 480 / im.width)), Image.LANCZOS)
        EXF[i] = f'img/ex-{i}.webp'; im.save(OUT + '/' + EXF[i], 'WEBP', quality=78, method=6)
    return f'<img class="qi" src="{EXF[i]}" alt="" loading="lazy">'
def exq(ref):
    e, n = ref.split(':')
    q = next((x for x in EXD[e]['questions'] if str(x['n']) == n), None)
    if not q: WARN.append(f'Không thấy câu đề {ref}')
    return e, q
def qcard(head, jp, vn, opts, ans_idx, expl, tag='', figs='', order=''):
    ops = ''.join(f'<li class="{"ok" if i in ans_idx else ""}{" pic" if len(o) > 2 and o[2] else ""}"><b>{k}</b><div>{o[2] if len(o) > 2 else ""}{("<div class=j>" + R(o[0]) + "</div>") if o[0] else ""}{("<div class=v>" + esc(vi(o[1], "phương án")) + "</div>") if o[1] else ""}</div></li>' for i, (k, o) in enumerate(opts))
    return (f'<div class="qq card"><div class="qh">{head}{(" <span class=tg>" + tag + "</span>") if tag else ""}</div>{figs}<div class="j">{R(jp)}</div>'
            + (f'<div class="v">{esc(vi(vn, "câu đề"))}</div>' if vn else '') + f'<ol class="{"pics" if any(len(o) > 2 and o[2] for _, o in opts) else ""}">{ops}</ol>'
            + (f'<div class="ord">Thứ tự đúng: <b>{order}</b></div>' if order else '')
            + (f'<details class="ex"><summary>Giải thích của app</summary><div>{expl}</div></details>' if expl else '') + '</div>')
def short_q(q):
    if not q: return ''
    t = re.sub(r'\*\*', '', q['jp'])
    return re.sub(r'正[ただ]?(\[ただ\])?しいと思[おも]?(\[おも\])?う場合[ばあい]?(\[ばあい\])?は.*$', '', t).strip()
BAD = re.compile(r'Mẹo|Bẫy|bẫy|Ghi nhớ|Lưu ý quan trọng')
def clean_expl(t):
    parts = re.split(r'(?<=[.!?])\s+', plain(t))
    return esc(vi(' '.join(p for p in parts if not BAD.search(p)), 'giải thích'))
def bank_q(ref, no):
    e, q = exq(ref)
    if not q: return ''
    ans = [a.strip().lower() for a in str(q['ans']).split(',')]
    opts = [(o['k'], (o['jp'], o.get('vn', ''), eximg(o.get('img')))) for o in q['opts']]
    order = q.get('type') == 'order'
    idx = [] if order else [i for i, (k, _) in enumerate(opts) if k.lower() in ans]
    tag = q.get('sec') or ''
    expl = (('<p class="j">' + R(q['ejp']) + '</p>') if q.get('ejp') else '') + '<p>' + clean_expl(q.get('evi', '')) + '</p>'
    kind = ' · sắp xếp' if order else (' · chọn %d' % len(ans) if len(ans) > 1 else '')
    figs = ''.join(eximg(f) for f in q.get('figs') or [])
    return qcard(f'{no}. Đề {e} · câu {q["n"]}{kind}', re.sub(r'\*\*', '', q['jp']), q.get('vn', ''), opts, idx, expl, tag,
                 f'<div class="figs">{figs}</div>' if figs else '', ' → '.join(a.upper() for a in ans) if order else '')
def auto_q1(ch, pages):
    """câu bộ đề có ref thuộc chương + trang của bài; bỏ câu trùng chữ."""
    lo, hi = pages; out, seen = [], set()
    for e in sorted(EXD, key=int):
        for q in EXD[e]['questions']:
            m = re.match(r'Ch\.(\d)\s*tr\.(\d+)', q.get('ref') or '')
            if not m or int(m.group(1)) != ch or not lo <= int(m.group(2)) <= hi: continue
            k = plain(q['jp']) + '|' + '|'.join(plain(o['jp']) + str(o.get('img')) for o in q['opts'])
            if k in seen: continue
            seen.add(k); out.append((int(m.group(2)), int(e), int(re.sub(r'\D', '', q['n']) or 0), f'{e}:{q["n"]}'))
    return [r for *_, r in sorted(out)]
def app_q(item, head):
    opts = [(LETTERS[i], (o, '')) for i, o in enumerate(item['o'])]
    return qcard(head, item['q'], '', opts, [item['a']], '<p>' + clean_expl(item.get('e', '')) + '</p>')

# ---------- dựng ----------
IDX = {'chs': []}
CHD = {}
num = 0
for ch, lst in BAI.items():
    secs = CH[ch]['secs']
    cinfo = dict(ch=ch, cat={1: '第[だい]1章[しょう] ビルクリーニングの仕事[しごと]', 2: '第[だい]2章[しょう] 日常清掃[にちじょうせいそう]', 3: '第[だい]3章[しょう] 定期清掃[ていきせいそう]'}[ch],
                 catv={1: 'Quy tắc & tác phong', 2: 'Vệ sinh hằng ngày', 3: 'Vệ sinh định kỳ'}[ch], bai=[])
    CHD[ch] = dict(ch=ch, bai=[])
    for bid, sids, *tt in lst:
        num += 1
        h0 = head_of(secs[sids[0]])
        tj = R(h0['jp']) if len(sids) == 1 else R(head_of(secs[sids[0]])['jp'])
        pg = ', '.join(pages_of(secs[s]) for s in sids)
        pg = re.sub(r'tr\.(\d+), tr\.(\d+)', r'tr.\1–\2', pg)
        tv = tt[0] if tt else h0['vi']
        fn = f'{H}/bai/{bid}.json'
        ready = os.path.exists(fn)
        b = dict(id=bid, no=num, tj=tj, tv=tv, pg=pg, ready=ready)
        cinfo['bai'].append(dict(b))
        if not ready:
            CHD[ch]['bai'].append(b); continue
        d = json.load(open(fn, encoding='utf-8'))
        cards = cards_of(ch, sids); A = atoms_of(cards); V = vocab_of(cards, ch, d)
        cardmap = dict(cards)
        # tự kiểm: câu sách nào chưa có trong giáo án
        used = [k for u in d['units'] for k in u.get('a', [])]
        for key, dc in cards:
            if not dc.select('.line') and not any(u.get('c') == key for u in d['units']): WARN.append(f'{bid}: bảng {key} chưa có lời giảng')
        miss = [k for k in range(len(A)) if k not in used]
        for k in miss: WARN.append(f'{bid}: câu sách #{k} chưa có trong giáo án: {plain(A[k]["jp"])[:40]}')
        for k in set(used):
            if used.count(k) > 1: WARN.append(f'{bid}: câu sách #{k} bị giảng 2 lần')
        incards = [c for p in d['pages'] for c in p.get('cards', [])]
        for key, _ in cards:
            if key not in incards: WARN.append(f'{bid}: đoạn {key} chưa nằm trong trang nào')
        n_units = len(d['units'])
        pages = [dict(k='0', t='Tổng quan bài', p=0), dict(k='mo', t='Mở bài', p=d['mo']['p'])]
        ui = 0
        for P in d['pages']:
            k = P['k']; ph = P['ph']
            assert step_of(k) == ph, (bid, k, ph)
            if k.startswith('a'):
                body = f'<h1><span class="j">{P["t"]}</span><span class="min">{P["p"]}′</span></h1><div class="sv">{esc(P["tv"])}</div>'
                for key in P['cards']:
                    dc = cardmap[key]
                    imgs = ''.join(f'<img src="{img_file(bid, key, i, im["src"])}" alt="{esc(im.get("alt", ""))}" loading="lazy">' for i, im in enumerate(dc.select('.frame img')))
                    cap = dc.select_one('.frame .src').get_text(strip=True).replace('Giáo trình gốc', 'Giáo trình') if dc.select_one('.frame .src') else ''
                    dno = dc.select_one('.dno').get_text(strip=True) if dc.select_one('.dno') else ''
                    h3 = dc.select_one('h3').get_text(strip=True) if dc.select_one('h3') else ''
                    extra = ''
                    if not dc.select('.line') and dc.select_one('.dbody'):
                        db = BeautifulSoup(str(dc.select_one('.dbody')), 'html.parser')
                        for x in db.select('.lnav, script'): x.decompose()
                        extra = f'<div class="dbody">{R(vi(db.decode_contents(), "bảng sách"))}</div>'
                    body += f'<section class="dc"><div class="dch"><span>{esc(dno)}</span> {esc(vi(h3, "tiêu đề đoạn"))}</div><figure>{imgs}<figcaption>{esc(cap)}</figcaption></figure>{extra}</section>'
                    for u in d['units']:
                        if u.get('c') == key:
                            ui += 1; body += card_unit_html(u, n_units, ui)
                    for u in d['units']:
                        if u.get('a') and A[u['a'][0]]['card'] == key:
                            ui += 1; body += unit_html(u, A, V, n_units, ui)
                pages.append(dict(k=k, t=plain(P['t']), tv=P['tv'], p=P['p'], ph=ph, html=body))
            elif k == 'de':
                D = d['de']; body = f'<h1>Đề thi sẽ hỏi gì<span class="min">{P["p"]}′</span></h1><div class="ov">{R(D["intro"])}</div>'
                for it in D['items']:
                    refs = ''.join(f'<li><b>Đề {e} · câu {n}</b> <span class="j">{R(short_q(exq(e + ":" + n)[1]))}</span></li>' for e, n in it.get('q', []))
                    body += f'<article class="unit"><div class="layers"><div class="dek"><span class="tg">{it["k"]}</span><b class="dt">{esc(it["t"])}</b></div>{R(it["lg"])}{("<ul class=refs>" + refs + "</ul>") if refs else ""}</div></article>'
                if D.get('gv'): body += f'<article class="unit"><div class="layers">{L("gv", "Ghi chú cho giáo viên", R(D["gv"]))}</div></article>'
                pages.append(dict(k=k, t='Đề thi sẽ hỏi gì', p=P['p'], ph=ph, html=body))
            elif k == 'q1':
                if d['q1'] == 'auto' or isinstance(d['q1'], dict):
                    pp = [int(x) for x in re.findall(r'\d+', pg)]; ex = d['q1'].get('bo', []) if isinstance(d['q1'], dict) else []
                    d['q1'] = [r for r in auto_q1(ch, (min(pp), max(pp))) if r not in ex] + (d['q1'].get('them', []) if isinstance(d['q1'], dict) else [])
                body = (f'<h1>Câu trong bộ đề của app · {len(d["q1"])} câu<span class="min">{P["p"]}′</span></h1>'
                        '<div class="sv">Giáo trình không có phần bài tập; đây là các câu của bộ đề trong app thuộc tr. của bài. Bấm “Giải thích của app” để mở lời giải.</div>')
                body += '<div class="kq">' + ''.join(bank_q(r, i + 1) for i, r in enumerate(d['q1'])) + '</div>'
                pages.append(dict(k=k, t='Câu trong bộ đề · %d câu' % len(d['q1']), p=P['p'], ph=ph, html=body))
            elif k == 'q2':
                js = CH[ch]['js']; NM = {'QZ2': 'Trắc nghiệm tổng hợp', 'QZ': 'Câu chốt', 'QUICK': 'Ôn nhanh', 'MT': 'Trắc nghiệm tổng hợp'}
                items = [(s_, i) for s_ in ('QUICK', 'QZ2', 'MT', 'QZ') for i in d['q2'].get(s_, [])]
                src_ = 'cuối bài Chương 1 (“28 câu càn quét” và “8 câu chốt”)' if ch == 1 else f'cuối bài Chương {ch} (“Ôn nhanh” và “Trắc nghiệm tổng hợp”)'
                body = f'<h1>Câu kiểm tra của app · {len(items)} câu<span class="min">{P["p"]}′</span></h1><div class="sv">Lấy từ phần ôn tập {src_} trong app.</div>'
                body += '<div class="kq">' + ''.join(app_q(js[s_][i], f'{j + 1}. {NM[s_]} · câu {i + 1}') for j, (s_, i) in enumerate(items)) + '</div>'
                pages.append(dict(k=k, t='Câu kiểm tra của app · %d câu' % len(items), p=P['p'], ph=ph, html=body))
            elif k == 'tk':
                T = d['tk']; body = f'<h1>Tổng kết<span class="min">{P["p"]}′</span></h1><article class="unit">'
                if T['src']: body += '<div class="no">CÂU CHÍNH CỦA SÁCH</div><div class="src">' + ''.join(line_html(A[i]) for i in T['src']) + '</div>'
                body += f'<div class="layers">{L("lg", "Lời chốt", R(T["lg"]))}</div></article>'
                pages.append(dict(k=k, t='Tổng kết', p=P['p'], ph=ph, html=body))
            elif k == 'ket':
                K = d['ket']; body = f'<h1>Kết bài<span class="min">{P["p"]}′</span></h1><article class="unit"><div class="layers">{L("lg", "Lời giảng", R(K["lg"]))}{L("tt", "Bài về nhà", R(K["bt"]))}</div></article>'
                pages.append(dict(k=k, t='Kết bài', p=P['p'], ph=ph, html=body))
        # tổng quan + mở bài
        mx = max(p['p'] for p in pages)
        tl = ''.join(f'<a href="#{bid}-{p["k"]}"><span class="bar"><i style="width:{p["p"] / mx * 100:.0f}%"></i><span>{esc(p["t"])}</span></span><em>{p["p"]}′</em></a>' for p in pages[1:])
        ov = (f'<h1><span class="j">{tj}</span></h1><div class="sv">{esc(tv)} · {pg} · khoảng {sum(p["p"] for p in pages)} phút</div>'
              f'<section class="ov"><h3>Mục tiêu</h3><ul>{"".join("<li>" + R(x) + "</li>" for x in d["mt"])}</ul></section>'
              f'<section class="ov"><h3>Chuẩn bị</h3><ul>{"".join("<li>" + R(x) + "</li>" for x in d["cb"])}</ul></section>'
              f'<section class="ov"><h3>Mạch bài giảng</h3><div class="tl">{tl}</div></section>')
        pages[0]['html'] = ov
        hl = d['mo'].get('hl', '')
        pages[1]['html'] = f'<h1>Mở bài<span class="min">{d["mo"]["p"]}′</span></h1><article class="unit"><div class="layers">{L("lg", "Lời giảng", R(d["mo"]["lg"]))}{L("ask", "Hỏi lớp", R(hl))}</div></article>'
        b.update(pages=pages, phut=sum(p['p'] for p in pages),
                 vo=[[R(v['w']), plain(v['w']) + (('（' + ''.join(re.findall(r'\[([^\]]+)\]', v['w'])) + '）') if '[' in v['w'] else ''), v['hv'], v['m'], v['x']] for v in V if v['own']])
        cinfo['bai'][-1].update(phut=b['phut'])
        CHD[ch]['bai'].append(b)
    IDX['chs'].append(dict(cinfo, cat=R(cinfo['cat'])))

json.dump(IDX, open(OUT + '/ga.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
for ch, d in CHD.items(): json.dump(d, open(f'{OUT}/ga_c{ch}.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
PAGE = open(H + '/page.html', encoding='utf-8').read()
open(OUT + '/index.html', 'w', encoding='utf-8').write(PAGE)
# bản xem thử ở máy: thêm khung trang giống lúc publish
SK = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box}body{margin:0;font:14px sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
open(OUT + '/local.html', 'w', encoding='utf-8').write(SK + PAGE + '</body></html>')
print('ga.json', sum(len(c['bai']) for c in IDX['chs']), 'bài ·', sum(1 for c in IDX['chs'] for b in c['bai'] if b['ready']), 'bài đã soạn')
print('\n'.join(sorted(set(WARN))) or 'Tự kiểm: không thiếu câu sách nào.')
