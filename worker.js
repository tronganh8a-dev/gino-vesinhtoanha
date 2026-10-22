// Lối vào Cloudflare Worker — dùng chung cho bản chính (gino-vesinhtoanha) và bản dùng thử (gino-vesinhtoanha-trial)
import { handle } from './auth.js';
export default { fetch: (req, env) => handle(req, env) };
