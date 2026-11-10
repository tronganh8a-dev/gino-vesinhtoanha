// Phiên đăng nhập: mỗi tài khoản chỉ 1 thiết bị + chặn đoán mật khẩu.
// Durable Object (SQLite, có ở gói miễn phí): mỗi tài khoản 1 đối tượng giữ phiên hiện tại;
// mỗi IP / tài khoản 1 đối tượng đếm số lần nhập sai.
import { DurableObject } from 'cloudflare:workers';

export class Sessions extends DurableObject {
  // Đăng nhập: nếu tài khoản đang được dùng trên THIẾT BỊ KHÁC (còn hoạt động trong ACTIVE ms)
  // → đá cả hai ra và khoá tài khoản LOCK ms. Cùng thiết bị (did) hoặc máy cũ đã tắt app → máy mới thay máy cũ.
  async login(sid, dev, did, active, lock) {
    const now = Date.now();
    const lk = (await this.ctx.storage.get('lock')) || 0;
    if (lk > now) return { lock: lk };
    const c = await this.ctx.storage.get('cur');
    if (c && c.sid && c.did && c.did !== did && now - (c.seen || c.at) < active) {
      await this.ctx.storage.delete('cur'); await this.ctx.storage.put('lock', now + lock);
      return { lock: now + lock, conflict: true };
    }
    const n = { sid, dev, did, at: now, seen: now };
    await this.ctx.storage.put('cur', n); return { cur: n };
  }
  async claim(sid, dev) { const c = { sid, dev, at: Date.now(), seen: Date.now() }; await this.ctx.storage.put('cur', c); return c; }
  async cur() { const c = (await this.ctx.storage.get('cur')) || null; const lock = (await this.ctx.storage.get('lock')) || 0; return { c, lock }; }
  async touch(sid) {    // máy đang mở app báo "còn hoạt động" (ghi tối đa 1 lần / 45 giây)
    const c = await this.ctx.storage.get('cur'); if (!c || c.sid !== sid) return false;
    const now = Date.now(); if (now - (c.seen || 0) > 45e3) { c.seen = now; await this.ctx.storage.put('cur', c); }
    return true;
  }
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

export const ACTIVE = 150e3, LOCK = 5 * 60e3;   // máy được coi là "đang dùng" nếu mở app trong 2,5 phút gần nhất; khoá 5 phút
// trả về { ok } hoặc { lock: thời điểm hết khoá }
export async function claim(env, u, sid, dev, did) {
  if (!env.SESS) return { ok: true };
  const r = await stub(env, 'u:' + u).login(sid, dev, did, ACTIVE, LOCK);
  if (r.lock) { memo.set(u, { sid: null, lock: r.lock, t: Date.now() }); return r; }
  memo.set(u, { ...r.cur, lock: 0, t: Date.now() }); return { ok: true };
}
export async function touch(env, u, sid) { if (env.SESS) return stub(env, 'u:' + u).touch(sid); return true; }
// 'ok' | { kicked: {dev, at, lock} } | 'none'
export async function check(env, u, sid) {
  if (!env.SESS) return 'ok';
  let c = memo.get(u);
  if (!c || Date.now() - c.t > TTL || c.sid !== sid) {
    const r = await stub(env, 'u:' + u).cur();
    c = { ...(r.c || { sid: null }), lock: r.lock, t: Date.now() }; memo.set(u, c);
  }
  if (c.sid === sid) return 'ok';
  if (c.lock > Date.now()) return { kicked: { lock: c.lock } };
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
