// Phiên đăng nhập: mỗi tài khoản chỉ 1 thiết bị + chặn đoán mật khẩu.
// Durable Object (SQLite, có ở gói miễn phí): mỗi tài khoản 1 đối tượng giữ phiên hiện tại;
// mỗi IP / tài khoản 1 đối tượng đếm số lần nhập sai.
import { DurableObject } from 'cloudflare:workers';

export class Sessions extends DurableObject {
  async claim(sid, dev) { const c = { sid, dev, at: Date.now() }; await this.ctx.storage.put('cur', c); return c; }
  async cur() { return (await this.ctx.storage.get('cur')) || null; }
  async drop(sid) { const c = await this.ctx.storage.get('cur'); if (c && c.sid === sid) await this.ctx.storage.delete('cur'); }
  async fails(win) { const n = Date.now(); return ((await this.ctx.storage.get('f')) || []).filter(t => n - t < win).length; }
  async fail(win) {
    const n = Date.now(); const a = ((await this.ctx.storage.get('f')) || []).filter(t => n - t < win);
    a.push(n); await this.ctx.storage.put('f', a.slice(-50)); return a.length;
  }
  async clear() { await this.ctx.storage.delete('f'); }
}

const stub = (env, name) => env.SESS.get(env.SESS.idFromName(name));
const memo = new Map();            // u → { sid, dev, at, t } : nhớ 20 giây trong instance, đỡ gọi DO mỗi lần tải ảnh
const TTL = 20e3;

// Tên thiết bị ngắn gọn từ User-Agent (chỉ chữ/số, an toàn để hiện ra)
export function deviceName(req) {
  const ua = req.headers.get('User-Agent') || '';
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'Thiết bị khác';
  const br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari' : '';
  return br ? `${os} · ${br}` : os;
}
export const newSid = () => { const b = new Uint8Array(16); crypto.getRandomValues(b); return [...b].map(x => x.toString(16).padStart(2, '0')).join(''); };

export async function claim(env, u, sid, dev) {
  if (!env.SESS) return;
  const c = await stub(env, 'u:' + u).claim(sid, dev);
  memo.set(u, { ...c, t: Date.now() });
}
// 'ok' | { kicked: {dev, at} } | 'none'
export async function check(env, u, sid) {
  if (!env.SESS) return 'ok';
  let c = memo.get(u);
  if (!c || Date.now() - c.t > TTL || c.sid !== sid) {
    const cur = await stub(env, 'u:' + u).cur();
    c = { ...(cur || { sid: null }), t: Date.now() }; memo.set(u, c);
  }
  if (c.sid === sid) return 'ok';
  return c.sid ? { kicked: { dev: c.dev || '', at: c.at || 0 } } : 'none';
}
export async function drop(env, u, sid) {
  if (!env.SESS) return;
  memo.delete(u);
  await stub(env, 'u:' + u).drop(sid);
}

// Chặn đoán mật khẩu: 1 IP sai quá 20 lần / 15 phút, hoặc 1 tài khoản sai quá 8 lần / 15 phút → khoá tạm
const WIN = 15 * 60e3, MAX_IP = 20, MAX_U = 8;
export async function limited(env, ip, u) {
  if (!env.SESS) return false;
  const [a, b] = await Promise.all([stub(env, 'ip:' + ip).fails(WIN), u ? stub(env, 'f:' + u).fails(WIN) : 0]);
  return a >= MAX_IP || b >= MAX_U;
}
export async function failed(env, ip, u) {
  if (!env.SESS) return;
  await Promise.all([stub(env, 'ip:' + ip).fail(WIN), u ? stub(env, 'f:' + u).fail(WIN) : null]);
}
export async function passed(env, u) { if (env.SESS) await stub(env, 'f:' + u).clear(); }
