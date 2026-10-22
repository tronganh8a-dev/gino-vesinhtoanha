# Anh Trọng Dạy Gino · Vệ sinh toà nhà (Cloudflare Workers)

- `public/app/p1.html` + `p2.html` — web học bản chính (chia đôi để mỗi file < 10MB; worker ghép lại). Chỉ tải được sau khi đăng nhập.
- `public/trial/` — bản dùng thử (không đăng nhập), sinh tự động từ bản chính bằng `src/build_demo.py`.
- `public/pub/` — ảnh trang đăng nhập (công khai).
- `auth.js` — đăng nhập + định tuyến bản dùng thử · `worker.js` — lối vào · `wrangler.jsonc` (bản chính) · `demo/wrangler.jsonc` (bản dùng thử, cùng code).

## Tài khoản học viên (không nằm trong repo)
Cloudflare → Workers & Pages → gino-vesinhtoanha → Settings → Variables and Secrets:
- `ACCOUNTS` (Secret): `tendangnhap:matkhau:Tên hiển thị;tendangnhap2:matkhau2:Tên 2`
- `SECRET` (Secret): chuỗi dài bất kỳ để ký cookie

Khoá 1 bạn: xoá phần của bạn đó trong `ACCOUNTS` → Deploy. Bạn đó mất quyền ngay.

## Cập nhật web
Thay `public/app/p1.html` + `p2.html`, chạy `python3 src/build_demo.py` để sinh lại bản dùng thử, rồi commit cả `public/trial/`. Cloudflare tự build lại sau 1–2 phút.
