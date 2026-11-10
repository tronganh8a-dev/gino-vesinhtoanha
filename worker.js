// Lối vào Cloudflare Worker — dùng chung cho bản chính (gino-vesinhtoanha) và bản dùng thử (gino-vesinhtoanha-trial)
import { handle } from './auth.js';
export { Sessions } from './session.js';     // phiên đăng nhập 1 thiết bị (Durable Object, chỉ bản chính khai báo)
export default { fetch: (req, env, ctx) => handle(req, env, ctx) };
