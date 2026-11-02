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
public/pub/brand/    logo Anh Trọng Dạy Gino (công khai): logo-h(-rev), mark(-rev), favicon, apple-touch-icon, og.png 1200×630
public/app/slides/tongon/  84 ảnh WebP slide tổng ôn (cần đăng nhập mới tải được)
src/build_demo.py    sinh bản dùng thử từ bản chính
```
Nguồn dựng bản chính (file gốc đã giải mã, script build.py / build_exams.py / build_cf.py) nằm ở máy làm việc, không trong repo. build.py chạy xong tự gọi build_cf.py → build_repo.py → src/build_demo.py, nên hai bản luôn cùng nội dung.

- Bút dạ cho giáo viên (nút "Bút" trên thanh đầu chương lý thuyết và trên thanh trình xem slide tổng ôn): bút viết, highlight, gõ chữ ghi chú (font Quicksand/Klee One như app, bấm vào chữ đã gõ để sửa; Enter xong, Shift+Enter xuống dòng), tẩy, 5 màu, 3 độ dày, hoàn tác, xoá hết, ẩn nét. Phím tắt P/H/T/E, Esc tắt, Ctrl+Z hoàn tác. Nét chỉ lưu tạm trong lúc mở, mỗi phần/slide riêng. Mã ở `ink.py` (nguồn dựng), script `<script id="ink-src">` được tiêm vào iframe chương qua `chapterURL`.

## 3. Đăng nhập
- Biến Cloudflare (không nằm trong repo): `ACCOUNTS` = `user:matkhau:Tên hiển thị;…` (mật khẩu không phân biệt hoa thường), `SECRET`.
- Thêm tài khoản không cần nhập lại ACCOUNTS: Add variable → Secret, Name `TK_tendangnhap` (chữ/số/_), Value `matkhau` hoặc `matkhau:Tên hiển thị` → Deploy. ACCOUNTS và các biến TK_ dùng song song.
- Khoá học viên: xoá khỏi ACCOUNTS (hoặc xoá biến TK_ của bạn đó) → Deploy.

## 3b. Trợ lý chat (hỏi từ vựng, giải thích đáp án) — chỉ bản chính, cần đăng nhập
- Nút chat tròn góc dưới phải (trên thanh tab ở điện thoại; trong màn thi CBT nằm trên thanh đáy). Code giao diện: `public/app/chat-ui.js`; auth.js tự chèn thẻ `<script src="/app/chat-ui.js?v=3">` vào cuối trang app (không cần build lại p1/p2). Sửa chat-ui.js thì tăng `?v=` trong `CHAT_TAG` (auth.js).
- Máy chủ: `chat.js` → `POST /api/chat` (gọi AI), `GET /api/chat/status` (xem đã nhận key chưa, trả tên biến + nhà cung cấp, không lộ key; thêm `?test=1` để gọi thử 1 câu và xem mã lỗi). Model mặc định không dùng được thì tự dò danh sách model của key. Chưa có key → nút không hiện.
- API key đặt trên Cloudflare (Secret), KHÔNG để trong repo. Tự nhận: `ANTHROPIC_API_KEY`/`CLAUDE_API_KEY` (sk-ant-…), `OPENAI_API_KEY` (sk-…), `GEMINI_API_KEY`/`GOOGLE_API_KEY` (AIza…), hoặc biến tên có chữ KEY/API mà giá trị có các tiền tố đó. Tuỳ chọn: `CHAT_MODEL` (đổi model), `CHAT_LIMIT` (câu hỏi/người/giờ, mặc định 40).
- Ngữ cảnh gửi kèm: câu đề đang mở trong màn CBT (khi đang làm bài thi thử chưa nộp thì KHÔNG gửi đáp án, trợ lý chỉ gợi ý; xem đáp án/luyện tập đã chấm thì gửi đáp án + giải thích của lớp), từ vựng V/EQ khớp với câu hỏi, chữ đang bôi đen. Lời dặn hệ thống (tiếng Việt, furigana 漢字[かな], Hán Việt, bám giáo trình) ở đầu chat.js.
- Popup "Chức năng mới: Hỏi đáp cùng AI" hiện 1 lần mỗi lần vào app (sessionStorage), có ô "Không hiện lại" (localStorage `gc_promo_off`); ảnh `public/app/ai-promo.webp` (mock Đề 2 câu 5 + trợ lý giải thích). Chỉ hiện khi đã có API key.
- Bản dùng thử không có chat (tránh tốn phí API).

## 4. Bản dùng thử
- Không đăng nhập, không có ô mật khẩu. Đủ tính năng như bản chính, chỉ khoá:
  - Video: chỉ mở buổi 1 (`OPEN_VIDEOS`), các buổi khác bị XOÁ ID video.
  - Đề thi: chỉ mở Đề 1–2 (`OPEN_EXAMS`), các đề khác bị XOÁ toàn bộ câu hỏi; ảnh chỉ đề khoá dùng bị xoá khỏi EXIMG.
  - Flashcard: chỉ giữ từ vựng Chương 1 (`OPEN_VOCAB_CH`), XOÁ từ vựng Chương 2–3 khỏi V/TOPIC; chip Chương 2–3 hiện 🔒.
  - Thiết bị: mở 10/20 mỗi nhóm (`EQ_OPEN_PER_GROUP`), 20 thiết bị còn lại giữ tên nhưng XOÁ ảnh + cách dùng; trắc nghiệm ảnh chỉ dùng thiết bị mở.
  - Tài liệu: chỉ mở Chương 1 (`OPEN_DOCS`), XOÁ hẳn nội dung Chương 2–3 (`<script id="src-ch2/ch3">`); thẻ chương + lá sơ đồ tư duy hiện 🔒, bấm vào hiện hộp "Thuộc khoá học đầy đủ". Bản dùng thử luôn ghi p1+p2.
  - Link "Tải Slide bài giảng" (Google Drive) ở tab Tài liệu: bản chính mở được; bản dùng thử XOÁ link, thay bằng nút 🔒 trỏ Facebook (đánh dấu `<!--SLIDE-START/END-->` trong bản chính).
  - Slide tổng ôn (tab Tài liệu, khối `<!--TONGON-START/END-->`: trình xem ảnh + đáp án 46 câu): bản dùng thử XOÁ cả khối, thay bằng nút 🔒 trỏ Facebook.
  - Thẻ khoá vẫn hiện tên + 🔒 "Thuộc khoá học đầy đủ" + nút nhắn Facebook.
- Trang chủ bản dùng thử mở đầu bằng khối **"Làm thử ngay · 10 câu"** (`<script id="trial-quiz">`, mục 3g trong build_demo.py): mỗi lượt lấy ngẫu nhiên 4 câu Đề 1 + 3 câu Đề 2 + 3 câu ảnh thiết bị (chỉ thiết bị mở), bấm là chấm ngay + giải thích, cuối có điểm và nút sang Video / Học từ / Đề thi. Có nút bật/tắt tiếng Việt.
- Thanh điều hướng bản dùng thử xếp lại: Trang chủ → Video → Học từ (Flashcard) → Đề thi → Tài liệu → Hướng dẫn thi (mục 3f).
- Dải "Bản trải nghiệm" cố định trên cùng + nút nổi Facebook/TikTok góc dưới, hiện ở mọi màn (cả màn thi CBT, điện thoại).
- Trang chủ có bảng giá (nhãn "🔥 Cam kết học tới khi đậu"): Zoom lớp 5–7 người 10.000 yên · Tự học app + video 7.000 yên · Combo tự học VSTN + Khách sạn 9.000 yên · Học theo nhóm từ 2 người 7.000 yên/người; nút "Đăng ký khoá học" (`REGISTER_URL`, hiện trỏ Facebook).
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
