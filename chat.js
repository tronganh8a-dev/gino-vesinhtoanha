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

async function callOne(p, key, model, system, msgs) {
  let r, d;
  if (p === 'anthropic') {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 1000, system, messages: msgs }) });
    d = await r.json().catch(() => ({}));
    if (r.ok) return { text: (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim() };
  } else if (p === 'openai') {
    r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 1000, messages: [{ role: 'system', content: system }, ...msgs] }) });
    d = await r.json().catch(() => ({}));
    if (r.ok) return { text: ((d.choices || [])[0] || {}).message?.content?.trim() || '' };
  } else {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, generationConfig: { maxOutputTokens: 2048 },
        contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }) });
    d = await r.json().catch(() => ({}));
    if (r.ok) return { text: (((d.candidates || [])[0] || {}).content?.parts || []).map(x => x.text || '').join('').trim() };
  }
  const msg = JSON.stringify(d.error || d).slice(0, 300);
  return { status: r.status, err: msg, modelMissing: r.status === 404 || /no longer available|not[_ ]found|not supported|deprecated/i.test(msg) && r.status >= 400 && r.status < 500 };
}

let picked = null;   // model dò được (nhớ trong instance)
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
      .filter(i => /^gemini-/.test(i) && !/image|tts|live|lite|preview|exp|embedding|thinking/.test(i)).sort((a, b) => ver(b) - ver(a));
    return ms.filter(i => /flash/.test(i)).concat(ms.filter(i => !/flash/.test(i)));
  } catch (e) { return []; }
}
async function ask(k, env, msgs) {
  const list = env.CHAT_MODEL ? [env.CHAT_MODEL] : picked ? [picked] : MODELS[k.p];
  let last;
  for (const model of list) {
    try { last = await callOne(k.p, k.key, model, SYSTEM, msgs); } catch (e) { last = { status: 502, err: String(e).slice(0, 200) }; }
    if (last.text) { picked = model; return last; }
    if (!last.modelMissing) return last;
  }
  if (!env.CHAT_MODEL) {
    // model cũ bị khai tử: thử model mà thông báo lỗi gợi ý, rồi model mới nhất trong danh sách của key
    const hint = (String(last && last.err || '').match(/use (?:models\/)?([a-z0-9][a-z0-9.\-]+[a-z0-9])/i) || [])[1];
    const tried = new Set(list), cands = [];
    for (const m of [hint, ...(await discover(k.p, k.key))]) if (m && !tried.has(m)) { tried.add(m); cands.push(m); }
    for (const m of cands.slice(0, 4)) {
      try { last = await callOne(k.p, k.key, m, SYSTEM, msgs); } catch (e) { last = { status: 502, err: String(e).slice(0, 200) }; }
      if (last.text) { picked = m; return last; }
      if (!last.modelMissing) break;
    }
  }
  return last || { status: 500, err: 'không có model' };
}
function friendly(last) {
  const st = last && last.status, e = String(last && last.err || '');
  if (/credit balance|billing|insufficient_quota|quota/i.test(e)) return 'Tài khoản API đã hết tiền / hết hạn mức — thầy cần nạp thêm credit.';
  if (st === 401 || st === 403 || /api[_ ]key|authentication|permission/i.test(e)) return 'API key không hợp lệ hoặc chưa được cấp quyền — báo thầy kiểm tra lại key.';
  if (st === 429 || st === 529 || /overloaded|rate/i.test(e)) return 'Trợ lý đang quá tải, thử lại sau ít phút nhé.';
  return 'Trợ lý đang gặp lỗi, thử lại sau nhé.';
}

export async function chatAPI(req, env, user) {
  const k = findKey(env);
  const url = new URL(req.url);
  if (req.method === 'GET' && url.pathname === '/api/chat/status') {
    const o = { ok: !!k, provider: k ? k.p : null, keyName: k ? k.name : null };
    if (k && url.searchParams.has('test')) {      // /api/chat/status?test=1 → gọi thử 1 câu để xem lỗi
      const r = await ask(k, env, [{ role: 'user', content: 'Trả lời đúng 1 từ: OK' }]);
      Object.assign(o, r.text ? { test: 'ok', model: picked, reply: r.text.slice(0, 50) } : { test: 'fail', httpStatus: r.status, detail: r.err, hint: friendly(r) });
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
  const ctx = typeof body.context === 'string' ? body.context.slice(0, MAXCTX).trim() : '';
  if (ctx) msgs[msgs.length - 1] = { role: 'user', content: `[NGỮ CẢNH TỪ APP]\n${ctx}\n[/NGỮ CẢNH]\n\n${msgs[msgs.length - 1].content}` };

  const last = await ask(k, env, msgs);
  if (last.text) return json({ reply: last.text });
  console.log('chat error', k.p, last.status, last.err);
  return json({ error: friendly(last), detail: `${last.status || ''} ${String(last.err || '').slice(0, 160)}`.trim() }, 502);
}
