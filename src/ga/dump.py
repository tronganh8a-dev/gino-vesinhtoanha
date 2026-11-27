#!/usr/bin/env python3
"""In dữ liệu 1 bài để soạn giáo án: python3 src/ga/dump.py b17
Câu sách (chỉ số atom), thẻ, từ vựng, câu bộ đề theo trang, câu Ôn nhanh / Trắc nghiệm tổng hợp của chương."""
import sys, os, re, json
H = os.path.dirname(os.path.abspath(__file__))
bid = sys.argv[1]; sys.argv = ['x']
src = open(H + '/build_ga.py', encoding='utf-8').read()
exec(src[:src.index('# ---------- dựng ----------')])
ch, sids = next((c, x[1]) for c, l in BAI.items() for x in l if x[0] == bid)
cards = cards_of(ch, sids); A = atoms_of(cards)
for s_ in sids: print(s_, head_of(CH[ch]['secs'][s_]), pages_of(CH[ch]['secs'][s_]))
cur = None
for i, a in enumerate(A):
    if a['card'] != cur:
        cur = a['card']; dc = dict(cards)[cur]
        print(f'\n## {cur} {dc.select_one(".dno").get_text(strip=True) if dc.select_one(".dno") else ""} {dc.select_one("h3").get_text(strip=True) if dc.select_one("h3") else ""}')
    print(f'{i:3d} {a["name"][:14]:14s} {plain(a["jp"])} || {plain(a["vn"])}')
for key, dc in cards:
    if not dc.select('.line'):
        print(f'\n## {key} (bảng) {dc.select_one("h3").get_text(strip=True) if dc.select_one("h3") else ""}\n', re.sub(r'\s+', ' ', dc.select_one('.dbody').get_text(' ', strip=True))[:1500])
V = vocab_of(cards, ch, {'vtopic': []})
print('\n## TỪ (bảng từ trong bài):', ' · '.join(f'{v["k"]}={v["m"]}' for v in V))
js = CH[ch]['js']
for n in ('QUICK', 'MT'):
    for i, x in enumerate(js.get(n, [])):
        print(f'{n}[{i}] {x.get("c", "")} {plain(x["q"])} → {plain(x["o"][x["a"]])}')
pp = [int(x) for s_ in sids for x in re.findall(r'\d+', pages_of(CH[ch]['secs'][s_]))]
qs = auto_q1(ch, (min(pp), max(pp)))
print(f'\n## CÂU BỘ ĐỀ tr.{min(pp)}–{max(pp)}: {len(qs)} câu')
for r in qs:
    e, q = exq(r)
    ans = str(q['ans'])
    ok = [plain(o['jp']) or o.get('vn', '') for o in q['opts'] if o['k'].lower() in ans.lower().split(',')]
    print(f'{r:6s} {q.get("sec", "") or ""} {q["ref"][:12]} {plain(q["jp"])[:70]} → {ans} {"/".join(ok)[:40]}')
