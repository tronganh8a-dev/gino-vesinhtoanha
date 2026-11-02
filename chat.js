// Trợ lý hỏi đáp (từ vựng, đáp án) — chỉ dành cho học viên đã đăng nhập.
// API key đặt trên Cloudflare (Settings → Variables and Secrets), KHÔNG để trong repo. Tự nhận theo tên hoặc tiền tố:
//   ANTHROPIC_API_KEY / CLAUDE_API_KEY (sk-ant-…) · OPENAI_API_KEY (sk-…) · GEMINI_API_KEY / GOOGLE_API_KEY (AIza…)
// Tuỳ chọn: CHAT_MODEL (đổi model), CHAT_LIMIT (số câu hỏi / người / giờ, mặc định 40).

const SYSTEM = `Bạn là "Trợ lý Gino" của lớp Anh Trọng Dạy Gino, giúp học viên Việt Nam ôn thi 特定技能1号評価試験 ngành ビルクリーニング (Vệ sinh toà nhà) do JBMA tổ chức, theo giáo trình 「目指せ！ビルクリーニング特定技能評価試験～学習テキスト～」.

Cách trả lời:
- Luôn trả lời bằng tiếng Việt, xưng "mình", gọi "bạn". Ngắn gọn, dễ hiểu, đi thẳng vào ý (thường 3–8 dòng). Dùng gạch đầu dòng khi liệt kê.
- Khi viết tiếng Nhật có chữ Hán, ghi cách đọc ngay sau từ theo dạng 漢字[かな], ví dụ 清掃[せいそう]. App sẽ hiện furigana trên đầu chữ.
- Hỏi TỪ VỰNG: cho nghĩa tiếng Việt, cách đọc, âm Hán Việt của từng chữ Hán (ví dụ 清掃: THANH TẢO), 1 ví dụ ngắn trong công việc vệ sinh toà nhà, và mẹo nhớ nếu có.
- Hỏi ĐÁP ÁN / câu hỏi đề: nói đáp án đúng, vì sao đúng, vì sao từng lựa chọn khác sai, và điểm cần nhớ khi đi thi.
- Phần [NGỮ CẢNH TỪ APP] (nếu có) là dữ liệu chính thức của lớp: câu hỏi, đáp án, giải thích, từ vựng. Ưu tiên bám theo đó; không tự đổi đáp án của đề.
- Không bịa số liệu, quy định hay trang giáo trình. Không chắc thì nói rõ và khuyên bạn hỏi thầy Anh Trọng.
- Nếu ngữ cảnh ghi học viên đang làm bài thi thử chưa nộp: KHÔNG nói đáp án, chỉ giải nghĩa từ và gợi ý cách suy luận.
- Chỉ hỗ trợ việc học (tiếng Nhật, kiến thức nghề, kỳ thi, cách học). Câu hỏi ngoài lề thì từ chối nhẹ nhàng và kéo về bài học.`;

const MAXQ = 1500, MAXCTX = 6000, MAXTURN = 12;
const hits = new Map();   // giới hạn số câu hỏi theo người dùng (trong 1 instance)

function findKey(env) {
  const named = [['ANTHROPIC_API_KEY', 'anthropic'], ['CLAUDE_API_KEY', 'anthropic'], ['OPENAI_API_KEY', 'openai'],
    ['GEMINI_API_KEY', 'gemini'], ['GOOGLE_API_KEY', 'gemini']];
  for (const [k, p] of named) if (typeof env[k] === 'string' && env[k].trim()) return { p: guess(env[k].trim()) || p, key: env[k].trim(), name: k };
  for (const [k, v] of Object.entries(env || {})) {
    if (typeof v !== 'string' || !/KEY|API|TOKEN|CLAUDE|OPENAI|GEMINI|ANTHROPIC/i.test(k) || /^TK_/.test(k)) continue;
    const p = guess(v.trim()); if (p) return { p, key: v.trim(), name: k };
  }
  return null;
}
function guess(v) {
  if (v.startsWith('sk-ant-')) return 'anthropic';
  if (/^AIza[0-9A-Za-z_-]{20,}/.test(v)) return 'gemini';
  if (/^sk-[A-Za-z0-9_-]{20,}/.test(v)) return 'openai';
  return null;
}
const MODELS = {
  anthropic: ['claude-haiku-5-5', 'claude-haiku-4-5', 'claude-3-5-haiku-latest'],
  openai: ['gpt-4.1-mini', 'gpt-4o-mini'],
  gemini: ['gemini-flash-latest', 'gemini-2.5-flash'],
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

// ---- gọi AI theo kiểu "stream": chữ hiện dần ngay khi model bắt đầu trả lời ----
const enc = new TextEncoder();
function reqFor(p, key, model, system, msgs, think) {
  if (p === 'anthropic') return ['https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1000, system, messages: msgs, stream: true }) }];
  if (p === 'openai') return ['https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1000, stream: true, messages: [{ role: 'system', content: system }, ...msgs] }) }];
  const gc = { maxOutputTokens: 2048 };
  if (think === 0) gc.thinkingConfig = { thinkingBudget: 0 };          // tắt "suy nghĩ" → trả lời nhanh (Gemini 2.5)
  else if (think === 1) gc.thinkingConfig = { thinkingLevel: 'low' };  // Gemini 3 trở lên: suy nghĩ ít
  return [`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, generationConfig: gc,
      contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }) }];
}
function pick(p, ev) {
  if (p === 'anthropic') return ev.type === 'content_block_delta' && ev.delta && ev.delta.text || '';
  if (p === 'openai') return ((ev.choices || [])[0] || {}).delta?.content || '';
  return (((ev.candidates || [])[0] || {}).content?.parts || []).filter(x => !x.thought).map(x => x.text || '').join('');
}
// SSE của nhà cung cấp → luồng chữ thuần gửi về trình duyệt
function toText(p, body) {
  const dec = new TextDecoder(); let buf = '';
  return body.pipeThrough(new TransformStream({
    transform(chunk, ctl) {
      buf += dec.decode(chunk, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
        try { const t = pick(p, JSON.parse(d)); if (t) ctl.enqueue(enc.encode(t)); } catch (e) { }
      }
    }
  }));
}
const thinkMode = {};   // model → cách cấu hình "suy nghĩ" đã chạy được (0: tắt, 1: low, 2: không gửi)
async function callOne(p, key, model, system, msgs) {
  let think = p === 'gemini' ? (thinkMode[model] ?? 0) : 2;
  for (;;) {
    const [u, o] = reqFor(p, key, model, system, msgs, think);
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 20000);
    let r;
    try { r = await fetch(u, { ...o, signal: ac.signal }); }
    catch (e) { clearTimeout(to); return { status: 504, err: 'timeout ' + model, retry: true }; }
    clearTimeout(to);
    if (r.ok) { if (p === 'gemini') thinkMode[model] = think; return { stream: toText(p, r.body), model }; }
    const d = await r.json().catch(() => ({}));
    const msg = JSON.stringify(d.error || d).slice(0, 300);
    if (p === 'gemini' && r.status === 400 && think < 2 && /think/i.test(msg)) { think++; continue; }   // model không nhận kiểu cấu hình này → thử kiểu khác
    return { status: r.status, err: msg,
      modelMissing: r.status === 404 || /no longer available|not[_ ]found|not supported|deprecated/i.test(msg) && r.status >= 400 && r.status < 500,
      retry: [429, 500, 502, 503, 504, 529].includes(r.status) || /UNAVAILABLE|overloaded|high demand/i.test(msg) };
  }
}

// model chạy được thì nhớ lại (trong instance + bộ nhớ đệm Cloudflare 1 ngày) để lần sau khỏi dò lại
let picked = null;
const CK = p => new Request('https://gino-chat.internal/model/' + p);
async function getPicked(p) {
  if (picked) return picked;
  try { const r = await caches.default.match(CK(p)); if (r) picked = (await r.text()) || null; } catch (e) { }
  return picked;
}
function setPicked(p, m, ctx) {
  if (picked === m) return; picked = m;
  try { const w = caches.default.put(CK(p), new Response(m, { headers: { 'Cache-Control': 'max-age=86400' } })); ctx && ctx.waitUntil ? ctx.waitUntil(w) : w.catch(() => { }); } catch (e) { }
}
async function discover(p, key) {
  try {
    if (p === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/models?limit=100', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } });
      const ids = ((await r.json()).data || []).map(m => m.id);
      return ids.filter(i => /haiku/.test(i)).concat(ids.filter(i => /sonnet/.test(i)));
    }
    if (p === 'openai') {
      const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + key } });
      const ids = ((await r.json()).data || []).map(m => m.id).filter(i => /^gpt-/.test(i) && !/audio|realtime|search|transcribe|tts|image/.test(i)).sort().reverse();
      return ids.filter(i => /mini/.test(i)).concat(ids.filter(i => !/mini/.test(i)));
    }
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
    const ver = i => parseFloat((i.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
    const ms = ((await r.json()).models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace('models/', ''))
      .filter(i => /^gemini-/.test(i) && !/image|tts|live|preview|exp|embedding|thinking|pro/.test(i)).sort((a, b) => ver(b) - ver(a));
    // flash trước, flash-lite làm dự phòng khi flash quá tải
    return ms.filter(i => /flash/.test(i) && !/lite/.test(i)).concat(ms.filter(i => /lite/.test(i)));
  } catch (e) { return []; }
}
async function ask(k, env, msgs, ctx) {
  if (env.CHAT_MODEL) {
    try { return await callOne(k.p, k.key, env.CHAT_MODEL, SYSTEM, msgs); } catch (e) { return { status: 502, err: String(e).slice(0, 200) }; }
  }
  const pk = await getPicked(k.p);
  const tried = new Set(); let last, n = 0, discovered = false;
  let queue = [pk, ...MODELS[k.p]].filter(Boolean);
  while (n < 6) {
    const m = queue.shift();
    if (!m) {
      if (discovered) break;
      discovered = true;
      const hint = (String(last && last.err || '').match(/use (?:models\/)?([a-z0-9][a-z0-9.\-]+[a-z0-9])/i) || [])[1];
      queue = [hint, ...(await discover(k.p, k.key))].filter(x => x && !tried.has(x));
      continue;
    }
    if (tried.has(m)) continue;
    tried.add(m); n++;
    try { last = await callOne(k.p, k.key, m, SYSTEM, msgs); } catch (e) { last = { status: 502, err: String(e).slice(0, 200), retry: true }; }
    if (last.stream) { setPicked(k.p, m, ctx); return last; }
    if (!last.modelMissing && !last.retry) break;            // lỗi key / hết tiền → dừng luôn
    if (last.modelMissing && m === picked) picked = null;
  }
  return last || { status: 500, err: 'không có model' };
}
function friendly(last) {
  const st = last && last.status, e = String(last && last.err || '');
  if (/credit balance|billing|insufficient_quota|exceeded your current quota/i.test(e)) return 'Tài khoản API đã hết tiền / hết hạn mức — thầy cần nạp thêm credit.';
  if (st === 401 || st === 403 || /api[_ ]key not valid|authentication|permission/i.test(e)) return 'API key không hợp lệ hoặc chưa được cấp quyền — báo thầy kiểm tra lại key.';
  if ([429, 503, 504, 529].includes(st) || /overloaded|rate|UNAVAILABLE|high demand|timeout/i.test(e)) return 'Máy chủ AI của Google đang quá tải, bạn đợi vài giây rồi hỏi lại nhé.';
  return 'Trợ lý đang gặp lỗi, thử lại sau nhé.';
}
async function readAll(stream) {
  const rd = stream.getReader(), dec = new TextDecoder(); let t = '';
  for (;;) { const { done, value } = await rd.read(); if (done) break; t += dec.decode(value, { stream: true }); }
  return t.trim();
}

export async function chatAPI(req, env, user, ctx) {
  const k = findKey(env);
  const url = new URL(req.url);
  if (req.method === 'GET' && url.pathname === '/api/chat/status') {
    const o = { ok: !!k, provider: k ? k.p : null, keyName: k ? k.name : null };
    if (k && url.searchParams.has('test')) {      // /api/chat/status?test=1 → gọi thử 1 câu để xem lỗi
      const t0 = Date.now();
      const r = await ask(k, env, [{ role: 'user', content: 'Trả lời đúng 1 từ: OK' }], ctx);
      const text = r.stream ? await readAll(r.stream) : '';
      Object.assign(o, r.stream ? { test: text ? 'ok' : 'empty', model: r.model, reply: text.slice(0, 50), ms: Date.now() - t0 }
        : { test: 'fail', httpStatus: r.status, detail: r.err, hint: friendly(r) });
    }
    return json(o);
  }
  if (req.method !== 'POST') return json({ error: 'Sai phương thức' }, 405);
  if (!k) return json({ error: 'Trợ lý chưa được bật (chưa có API key trên máy chủ).' }, 503);

  const limit = Number(env.CHAT_LIMIT) || 40, now = Date.now();
  const arr = (hits.get(user) || []).filter(t => now - t < 3600e3);
  if (arr.length >= limit) return json({ error: `Bạn đã hỏi ${limit} câu trong 1 giờ qua. Nghỉ một chút rồi hỏi tiếp nhé!` }, 429);
  arr.push(now); hits.set(user, arr);

  let body; try { body = await req.json(); } catch { return json({ error: 'Dữ liệu không hợp lệ' }, 400); }
  let msgs = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAXTURN).map(m => ({ role: m.role, content: m.content.slice(0, MAXQ) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ error: 'Chưa có câu hỏi' }, 400);
  const c = typeof body.context === 'string' ? body.context.slice(0, MAXCTX).trim() : '';
  if (c) msgs[msgs.length - 1] = { role: 'user', content: `[NGỮ CẢNH TỪ APP]\n${c}\n[/NGỮ CẢNH]\n\n${msgs[msgs.length - 1].content}` };

  const last = await ask(k, env, msgs, ctx);
  if (last.stream) return new Response(last.stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
  console.log('chat error', k.p, last.status, last.err);
  return json({ error: friendly(last), detail: `${last.status || ''} ${String(last.err || '').slice(0, 160)}`.trim() }, 502);
}
