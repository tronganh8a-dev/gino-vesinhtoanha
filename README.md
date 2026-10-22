# Anh Trọng Dạy Gino · Vệ sinh toà nhà (Cloudflare Workers)

- `public/index.html` — web học (chỉ tải được sau khi đăng nhập)
- `public/pub/` — ảnh trang đăng nhập (công khai)
- `worker.js` — đăng nhập phía máy chủ · `wrangler.jsonc` — cấu hình Cloudflare

## Tài khoản học viên (không nằm trong repo)
Cloudflare → Workers & Pages → gino-vesinhtoanha → Settings → Variables and Secrets:
- `ACCOUNTS` (Secret): `tendangnhap:matkhau:Tên hiển thị;tendangnhap2:matkhau2:Tên 2` (mỗi tài khoản cách nhau dấu `;`)
- `SECRET` (Secret): chuỗi dài bất kỳ để ký cookie

Khoá 1 bạn: xoá phần của bạn đó trong `ACCOUNTS` → Deploy. Bạn đó mất quyền ngay.

## Cập nhật web
Trang học nằm ở `public/app/p1.html` + `p2.html` (chia đôi để mỗi file < 10MB; worker ghép lại). Thay 2 file này (Add file → Upload files, trùng tên) → Commit → Cloudflare tự build lại sau 1–2 phút.
