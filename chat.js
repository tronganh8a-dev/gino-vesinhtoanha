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
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash'],
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
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, generationConfig: { maxOutputTokens: 1000 },
        contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }) });
    d = await r.json().catch(() => ({}));
    if (r.ok) return { text: (((d.candidates || [])[0] || {}).content?.parts || []).map(x => x.text || '').join('').trim() };
  }
  const msg = JSON.stringify(d.error || d).slice(0, 300);
  return { status: r.status, err: msg, modelMissing: r.status === 404 || /model|not[_ ]found/i.test(msg) && r.status === 400 };
}

export async function chatAPI(req, env, user) {
  const k = findKey(env);
  const url = new URL(req.url);
  if (req.method === 'GET' && url.pathname === '/api/chat/status')
    return json({ ok: !!k, provider: k ? k.p : null, keyName: k ? k.name : null });
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

  const list = env.CHAT_MODEL ? [env.CHAT_MODEL] : MODELS[k.p];
  let last;
  for (const model of list) {
    try { last = await callOne(k.p, k.key, model, SYSTEM, msgs); }
    catch (e) { last = { status: 502, err: String(e).slice(0, 200) }; }
    if (last.text) return json({ reply: last.text });
    if (!last.modelMissing) break;
  }
  console.log('chat error', k.p, last && last.status, last && last.err);
  const st = last && last.status;
  const msg = st === 401 || st === 403 ? 'API key không hợp lệ hoặc chưa được cấp quyền — báo thầy kiểm tra lại key.'
    : st === 429 ? 'Trợ lý đang quá tải hoặc hết hạn mức API, thử lại sau ít phút nhé.'
    : 'Trợ lý đang gặp lỗi, thử lại sau nhé.';
  return json({ error: msg }, 502);
}
