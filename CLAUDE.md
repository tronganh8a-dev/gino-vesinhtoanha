# Bàn giao: Web học Gino Vệ sinh toà nhà — Anh Trọng Dạy Gino

> Cập nhật: 22/10/2026. Cách làm việc với anh Trọng Anh: tiếng Việt, ngắn gọn, xưng "em" gọi "anh"; báo đã làm gì / còn thiếu gì.
> Không tự nhập mật khẩu/token thay anh. Không sửa biến ACCOUNTS/SECRET.

## 1. Tổng quan
- Repo `tronganh8a-dev/gino-vesinhtoanha`, nhánh `main`. Cloudflare Workers Builds tự build khi có commit.
- Bản chính: worker `gino-vesinhtoanha` → https://gino-vesinhtoanha.tronganh8a.workers.dev (có đăng nhập).
- Bản dùng thử: worker `gino-vesinhtoanha-trial` → https://gino-vesinhtoanha-trial.tronganh8a.workers.dev, hoặc `[link bản chính]/trial/`.
- Nội dung: video 9 buổi, tài liệu song ngữ 3 chương, flashcard, 16 đề CBT (Đề 15–16: 学科 20 + 実技 30), hướng dẫn thi.

## 2. Cấu trúc
```
auth.js              đăng nhập (cookie gino_s ký HMAC, 30 ngày; tick "Lưu đăng nhập" = cookie gino_keep giữ đăng nhập 30 ngày, không tick thì tải lại / phải đăng nhập lại) + định tuyến bản dùng thử
worker.js            lối vào, import auth.js — DÙNG CHUNG cho cả 2 worker
wrangler.jsonc       worker bản chính (main: worker.js, assets: ./public)
demo/wrangler.jsonc  worker bản dùng thử (main: ../worker.js, assets: ../public) — cùng code, cùng public
public/app/p1+p2     bản chính (chia đôi < 10MB để upload được qua trình duyệt; auth.js ghép lại)
public/trial/        bản dùng thử (p1+p2 hoặc index.html) — SINH TỰ ĐỘNG, đừng sửa tay
public/pub/          ảnh trang đăng nhập (công khai)
src/build_demo.py    sinh bản dùng thử từ bản chính
```
Nguồn dựng bản chính (file gốc đã giải mã, script build.py / build_exams.py / build_cf.py) nằm ở máy làm việc, không trong repo. build.py chạy xong tự gọi build_cf.py → build_repo.py → src/build_demo.py, nên hai bản luôn cùng nội dung.

## 3. Đăng nhập
- Biến Cloudflare (không nằm trong repo): `ACCOUNTS` = `user:matkhau:Tên hiển thị;…` (mật khẩu không phân biệt hoa thường), `SECRET`.
- Khoá học viên: xoá khỏi ACCOUNTS → Deploy.

## 4. Bản dùng thử
- Không đăng nhập, không có ô mật khẩu. Đủ tính năng như bản chính, chỉ khoá:
  - Video: chỉ mở buổi 1 (`OPEN_VIDEOS`), các buổi khác bị XOÁ ID video.
  - Đề thi: chỉ mở Đề 1–2 (`OPEN_EXAMS`), các đề khác bị XOÁ toàn bộ câu hỏi; ảnh chỉ đề khoá dùng bị xoá khỏi EXIMG.
  - Flashcard: chỉ giữ từ vựng Chương 1 (`OPEN_VOCAB_CH`), XOÁ từ vựng Chương 2–3 khỏi V/TOPIC; chip Chương 2–3 hiện 🔒.
  - Thiết bị: mở 10/20 mỗi nhóm (`EQ_OPEN_PER_GROUP`), 20 thiết bị còn lại giữ tên nhưng XOÁ ảnh + cách dùng; trắc nghiệm ảnh chỉ dùng thiết bị mở.
  - Thẻ khoá vẫn hiện tên + 🔒 "Thuộc khoá học đầy đủ" + nút nhắn Facebook.
- Dải "Bản trải nghiệm" cố định trên cùng + nút nổi Facebook/TikTok góc dưới, hiện ở mọi màn (cả màn thi CBT, điện thoại).
- Trang chủ có bảng giá (nhãn "✓ Cam kết học tới khi đậu"): Zoom lớp 5–7 người 10.000 yên · Tự học app + video 7.000 yên; nút "Đăng ký khoá học" (`REGISTER_URL`, hiện trỏ Facebook).
- Tiêu đề "Bản trải nghiệm · Vệ sinh toà nhà · Anh Trọng Dạy Gino", thẻ noindex; phản hồi có `Cache-Control: no-cache`, `X-Robots-Tag: noindex`.
- Sửa danh sách mở/khoá, giá, link: biến ở đầu `src/build_demo.py` → chạy `python3 src/build_demo.py` → commit `public/trial/`.
- build_demo.py tự kiểm tra và DỪNG nếu còn ID video khoá, câu hỏi/giải thích của đề khoá hoặc ảnh của đề khoá trong file xuất ra.
- Định tuyến (đầu hàm `handle` trong auth.js, TRƯỚC mọi bước đăng nhập):
  - `/trial`, `/trial/...` → bản dùng thử (mọi tên miền).
  - Tên miền có chữ "trial": `/`, `/index.html`, `/login` → bản dùng thử; `/logout` → về `/`. Đường dẫn khác vẫn đi luồng đăng nhập (worker dùng thử không có ACCOUNTS nên không vào được bản chính).
  - Tên miền khác: luồng đăng nhập bản chính, không đổi.
- Worker dùng thử nên đặt **Root directory = `demo`** (tên trong demo/wrangler.jsonc khớp tên worker). Để trống cũng chạy cùng code, nhưng Cloudflare sẽ mở PR đổi `name` trong wrangler.jsonc gốc cho khớp — KHÔNG merge PR đó (sẽ đổi tên worker bản chính).

## 5. Kiểm tra local
`npx wrangler dev` (ở gốc) và `cd demo && npx wrangler dev --inspector-port 9339` (chạy bằng `timeout`, không dùng `pkill -f wrangler`), gọi curl với header `Host` khác nhau:
bản chính `/` → 302 /login; host có "trial" `/`, `/login` → 200 bản dùng thử; host chính `/trial/` → 200 bản dùng thử.
