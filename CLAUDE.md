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
session.js           phiên 1 thiết bị + chặn đoán mật khẩu (Durable Object)
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

- **Bút giảng bài nổi (12/11/2026)** — `public/app/teach-ink.js`, auth.js chèn `INK_TAG` vào bản chính (không có ở bản dùng thử). Nút bút hồng tròn (kéo đi đâu cũng được) → thanh công cụ kéo bằng tay nắm ⋮⋮: Con trỏ · Bút · Highlight · Chữ · Tẩy · 5 màu · 3 cỡ · Hoàn tác · Xoá hết · Ẩn nét · Sổ memo · Xoay dọc/ngang · Thu gọn. Nét giữ riêng theo từng màn hình (tab `.page.on`, hoặc lớp phủ cố định chiếm ≥60% màn hình, hoặc phần tử toàn màn hình — các lớp được chuyển vào phần tử toàn màn hình), mất khi tải lại. Sổ memo: kéo/đổi cỡ, nhiều trang, gõ chữ + viết tay (khi đang chọn Bút/Highlight/Tẩy), lưu localStorage `gti_nb`. Vị trí lưu `gti_pos`/`gti_fab`/`gti_nbp`. Phím: Esc về con trỏ, Ctrl+Z hoàn tác (không dùng P/H/T/E để khỏi đụng bút trong chương/slide). Lớp z-index 2147483200–2147483400 (trên video 2147483100, dưới in chìm). Sửa file thì tăng `?v=` trong `INK_TAG`.

## 3. Đăng nhập
- Biến Cloudflare (không nằm trong repo): `ACCOUNTS` = `user:matkhau:Tên hiển thị;…` (mật khẩu không phân biệt hoa thường), `SECRET`.
- Thêm tài khoản không cần nhập lại ACCOUNTS: Add variable → Secret, Name `TK_tendangnhap` (chữ/số/_), Value `matkhau` hoặc `matkhau:Tên hiển thị` → Deploy. ACCOUNTS và các biến TK_ dùng song song.
- Khoá học viên: xoá khỏi ACCOUNTS (hoặc xoá biến TK_ của bạn đó) → Deploy.

## 3a. Bảo mật đăng nhập (10/11/2026)
- **Mỗi tài khoản 1 thiết bị**: đăng nhập máy mới → máy cũ mất phiên. Máy cũ đang mở app tự kiểm tra `/api/ping` mỗi 30 giây / khi quay lại tab → xoá trang, hiện "Tài khoản đã đăng nhập trên thiết bị khác" (tên máy mới + giờ) + nút Đăng nhập lại; tải trang/ảnh/chat bằng phiên cũ → 401 hoặc về `/login?k=1`.
- Code: `session.js` (Durable Object `Sessions`, SQLite, binding `SESS` + migration `v1` trong wrangler.jsonc — gói miễn phí dùng được, Cloudflare tự tạo khi build). Cookie `gino_s` = `user|hạn|sid|chữ ký` (chữ ký gồm cả mật khẩu → đổi mật khẩu là mọi máy mất phiên). Mỗi worker nhớ phiên 20 giây cho đỡ gọi DO.
- **Dùng cùng lúc 2 thiết bị → đá cả hai, khoá 5 phút** (`ACTIVE`=150 giây, `LOCK`=5 phút trong session.js): mỗi trình duyệt có mã thiết bị `gino_dev` (cookie 1 năm, không xoá khi đăng xuất). Đăng nhập khi tài khoản đang mở app trên máy KHÁC (máy đó ping trong 2,5 phút gần nhất) → xoá phiên máy cũ + khoá tài khoản 5 phút; máy mới bị từ chối, máy cũ hiện "Tài khoản đang dùng trên 2 thiết bị · đợi N phút" (ping 401 `{kicked,lock}`, trang → `/login?k=2&l=…`). Máy cũ đã tắt app quá 2,5 phút hoặc cùng máy đăng nhập lại → máy mới thay máy cũ như bình thường. `/api/ping` + mở trang app ghi "còn hoạt động" (tối đa 1 lần/45 giây).
- Tài khoản được dùng nhiều máy (vd. tài khoản giáo viên): biến tuỳ chọn `MULTI_DEVICE` = `ten1,ten2` → Deploy.
- Chặn đoán mật khẩu: 1 tài khoản sai 8 lần hoặc 1 IP sai 20 lần trong 15 phút → khoá tạm 15 phút.
- Header bảo mật mọi trang bản chính: X-Frame-Options SAMEORIGIN, nosniff, HSTS, Referrer-Policy, Permissions-Policy.
- Bản dùng thử không khai báo DO (demo/wrangler.jsonc) → code tự bỏ qua.

## 3a2. In chìm tên + chặn sao chép (10/11/2026)
- `public/pub/protect.js`, auth.js chèn qua `protectTag()` (`PROTECT_V` — sửa file thì tăng). Bản chính: `window.__GWM={n:tên hiển thị,u:tên đăng nhập}` → lớp in chìm mờ (tên + tài khoản + ngày) phủ mọi màn hình, kể cả video và khi bật toàn màn hình (lớp được chuyển vào phần tử toàn màn hình); xoá/sửa lớp thì tự dựng lại.
- Cả bản chính và bản dùng thử: chặn chuột phải, bôi đen, sao chép/cắt, kéo ảnh, Ctrl/Cmd+S/P/U, F12, in (trang trắng khi in). Ô nhập chữ (chat, ghi chú bút dạ) vẫn gõ/dán được.
- Khung chương / slide (blob) cũng được bảo vệ: protect.js bọc `URL.createObjectURL` để gắn chính nó vào mọi trang HTML blob (cả khi mở tab riêng).

## 3b. Trợ lý chat (hỏi từ vựng, giải thích đáp án) — chỉ bản chính, cần đăng nhập
- Nút chat tròn góc dưới phải (trên thanh tab ở điện thoại; trong màn thi CBT nằm trên thanh đáy). Code giao diện: `public/app/chat-ui.js`; auth.js tự chèn thẻ `<script src="/app/chat-ui.js?v=5">` vào cuối trang app (không cần build lại p1/p2). Sửa chat-ui.js thì tăng `?v=` trong `CHAT_TAG` (auth.js).
- Máy chủ: `chat.js` → `POST /api/chat` (gọi AI), `GET /api/chat/status` (xem đã nhận key chưa, trả tên biến + nhà cung cấp, không lộ key; thêm `?test=1` để gọi thử 1 câu và xem mã lỗi). Trả lời dạng stream (chữ hiện dần). Gemini: tắt/giảm "suy nghĩ" (thinkingBudget 0 → thinkingLevel low) cho nhanh; model bị khai tử/quá tải (404, 503 UNAVAILABLE, timeout 20s) thì tự chuyển model khác (gợi ý trong lỗi → danh sách model của key, flash trước, flash-lite dự phòng); model chạy được được nhớ 1 ngày (Cache API). Chưa có key → nút không hiện.
- API key đặt trên Cloudflare (Secret), KHÔNG để trong repo. Tự nhận: `ANTHROPIC_API_KEY`/`CLAUDE_API_KEY` (sk-ant-…), `OPENAI_API_KEY` (sk-…), `GEMINI_API_KEY`/`GOOGLE_API_KEY` (AIza…), hoặc biến tên có chữ KEY/API mà giá trị có các tiền tố đó. Tuỳ chọn: `CHAT_MODEL` (đổi model), `CHAT_LIMIT` (câu hỏi/người/giờ, mặc định 40).
- Ngữ cảnh gửi kèm: câu đề đang mở trong màn CBT (khi đang làm bài thi thử chưa nộp thì KHÔNG gửi đáp án, trợ lý chỉ gợi ý; xem đáp án/luyện tập đã chấm thì gửi đáp án + giải thích của lớp), từ vựng V/EQ khớp với câu hỏi, chữ đang bôi đen. Lời dặn hệ thống (tiếng Việt, furigana 漢字[かな], Hán Việt, bám giáo trình) ở đầu chat.js.
- Popup "Chức năng mới: Hỏi đáp cùng AI" hiện 1 lần mỗi lần vào app (sessionStorage), có ô "Không hiện lại" (localStorage `gc_promo_off`); ảnh `public/app/ai-promo.webp` (mock Đề 2 câu 5 + trợ lý giải thích). Chỉ hiện khi đã có API key.
- Điện thoại (≤640px): khung chat là ngăn kéo từ dưới lên cao ~64% màn hình (nút ⤢ phóng to), nền mờ phía trên, bấm ra ngoài để đóng, không tự bật bàn phím.
- Bản dùng thử không có chat (tránh tốn phí API).

## 3c. Xem video bài giảng (06/11/2026, giống app Khách sạn)
- Bấm thẻ video ở tab Video → màn hình lớn tối `#jvOv`: YouTube API `controls=0` + thanh điều khiển riêng (phát, ±10s, tua, tiếng, tốc độ 1/1.25/1.5/0.75, toàn màn hình; phím Space/←/→, Esc đóng). Khung iframe kéo cao 90px mỗi đầu để ẩn tiêu đề; ảnh bìa (xanh thương hiệu + bìa chương `COVER[ch]`) ghim khi chưa phát/đang tải/tạm dừng; lớp chặn chuột lúc đang phát → không lộ logo, gợi ý của YouTube. Vị trí xem lưu `gvVidPos_<id>`.
- Khung "📖 Lý thuyết" bên cạnh (máy tính mở sẵn; điện thoại: nút dưới video): chọn Chương 1–3, nạp `chapterURL(ch)` (có bút dạ); chương mặc định theo `SES[].ch` của buổi. ⇔ đổi độ rộng 34/42/52vw, ↗ mở tab riêng. Bản dùng thử: chương bị xoá nội dung hiện 🔒 + nút Facebook.
- Code: `public/pub/video-room.js` (công khai, KHÔNG chứa ID video — ID lấy từ trang), auth.js chèn `VR_TAG` vào cả bản chính lẫn bản dùng thử, không cần build lại p1/p2. Sửa file thì tăng `?v=` trong `VR_TAG`.

## 4. Bản dùng thử
- Không đăng nhập, không có ô mật khẩu. Đủ tính năng như bản chính, chỉ khoá:
  - Video: chỉ mở buổi 1 (`OPEN_VIDEOS`), các buổi khác bị XOÁ ID video.
  - Đề thi: chỉ mở Đề 1–2 (`OPEN_EXAMS`), các đề khác bị XOÁ toàn bộ câu hỏi; ảnh chỉ đề khoá dùng bị xoá khỏi EXIMG.
  - Flashcard: chỉ giữ từ vựng Chương 1 (`OPEN_VOCAB_CH`), XOÁ từ vựng Chương 2–3 khỏi V/TOPIC; chip Chương 2–3 hiện 🔒.
  - Thiết bị: mở 10/20 mỗi nhóm (`EQ_OPEN_PER_GROUP`), 20 thiết bị còn lại giữ tên nhưng XOÁ ảnh + cách dùng; trắc nghiệm ảnh chỉ dùng thiết bị mở.
  - Tài liệu: chỉ mở Chương 1 (`OPEN_DOCS`), XOÁ hẳn nội dung Chương 2–3 (`<script id="src-ch2/ch3">`); thẻ chương + lá sơ đồ tư duy hiện 🔒, bấm vào hiện hộp "Thuộc khoá học đầy đủ". Bản dùng thử luôn ghi p1+p2.
  - Link "Tải Slide bài giảng" (Google Drive; trong p1/p2 nằm ở tab Tài liệu, auth.js `SLIDE_HOME` chuyển ra Trang chủ — ô xanh dài dưới khung "Đăng ký & lịch thi"): bản chính mở được; bản dùng thử XOÁ link, thay bằng nút 🔒 trỏ Facebook (đánh dấu `<!--SLIDE-START/END-->` trong bản chính).
  - Slide tổng ôn (tab Tài liệu, khối `<!--TONGON-START/END-->`: trình xem ảnh + đáp án 46 câu): bản dùng thử XOÁ cả khối, thay bằng nút 🔒 trỏ Facebook.
  - Thẻ khoá vẫn hiện tên + 🔒 "Thuộc khoá học đầy đủ" + nút nhắn Facebook.
- (23/11/2026) Bản dùng thử: mở link là vào thẳng tab **Đề thi** (`go('exam')`, mục 3h trong build_demo.py); ĐÃ BỎ popup Logistics ở bản dùng thử (auth.js `trialPage` không chèn `LOGI_TAG`) — bản chính vẫn có.
- (23/11/2026) Tab **Đề thi** bản dùng thử có thẻ **"▶ Video học thử"** ngay trên lưới đề (mục 3i trong build_demo.py): lấy buổi mở đầu tiên trong `SES` (hiện Buổi 1), bấm là mở màn xem video lớn (`ginoVideoRoom.open` của video-room.js).
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

## JLPT N3 (12/11/2026)
- Tab "JLPT N3" thêm bằng `public/app/n3-tab.js` (auth.js chèn `N3_TAG`, chỉ bản chính): nút trong `#nav` + trang `#p-n3` nhúng `/n3/` (cần đăng nhập). Trang n3: Luyện đề (26 đề N3 có đáp án + giải thích) + Từ vựng Mimikara N3.
- Thư mục `public/n3/` chép nguyên từ repo anhtrong-jft-app (bản gốc + công cụ dựng ở `src/n3/` bên đó). Dùng chung cho 4 app: JFT, Khách sạn, Vệ sinh toà nhà, Chế biến thực phẩm.

## 6. Trang giới thiệu (bio) của anh (12/11/2026)
- File: `public/pub/anhtrong/index.html` (1 file, ảnh + logo nhúng sẵn; nguồn dựng ở máy làm việc). Công khai, không đăng nhập.
- Link: https://tinyurl.com/khoahocmienphi-anhtrong (trỏ đúng `/me`; tên `khoahocmienphi` đã có người dùng), https://tinyurl.com/anhtrongdaygino (trỏ vào `/me&alias=anhtrongdaygino` — auth.js nhận mọi đường dẫn bắt đầu `/me`, `/me/`, `/me&`), `<bản chính>/me` (auth.js trả thẳng file) hoặc `/pub/anhtrong/`.
- Link ngắn: worker riêng `anhtrong` (`bio/wrangler.jsonc`, chỉ file tĩnh) → https://anhtrong.tronganh8a.workers.dev — anh tạo worker trên Cloudflare, nối repo này, Root directory = `bio`.

## 7. Slide giảng theo buổi (16/11/2026)
- `public/app/slides/c2a.html`: slide dạy Chương 2 phần 1 (mở đầu → lau bàn, lau kính), 169 slide, mỗi slide 1 khung tranh manga cắt riêng + phóng to (tự dò khung + OCR khớp lời thoại, `c2a/panels2.py`, `ocr.py`), sinh từ nội dung trang bài học Chương 2 (src-ch2 trong p1/p2) + câu hỏi trong bộ đề (EXD). Nguồn dựng ở máy làm việc (`c2a/gen.py`, `tpl.html`). Có bút giảng bài (teach-ink.js nhúng sẵn, nét lưu theo từng slide qua `window.__gtiKey`), phím →/Space hiện từng ý, ←, ↑↓ nhảy slide, V bật/tắt tiếng Việt, F toàn màn hình, ☰ mục lục.
- `public/app/slides/c2b.html` (23/11/2026): Chương 2 phần 2 (lau bàn, lau kính → nhà vệ sinh → rác → vệ sinh & an toàn lao động, tr.40–60), 140 slide, kiểu bộ slide JFT (đầu trang có logo + nhãn, dải 4 màu ở đáy, nút Hiện hết / phím A). Mỗi trang giáo trình: chiếu cả trang + từ vựng trong trang → từng khung phóng to kèm lời thoại (dò khung theo đường viền + OCR tesseract jpn để gắn lời thoại). ĐÃ BỎ slide "Điểm chính" (khối nền tối + bảng Sai/Đúng + dòng các bước) — anh rất ghét kiểu trình bày này (23/11), đừng làm lại. Slide đầu đổi "Hôm nay mình học gì?" → "Nội dung bài học" (cả c2a). Cuối mỗi phần: sơ đồ tư duy + câu đề lấy nguyên từ bộ đề (EXD). Trang 51 và 55 không có ảnh trong dữ liệu app → lời thoại của 2 trang đó hiện không kèm tranh. tr.60 (trang chữ) chia theo mục. Nguồn dựng ở máy làm việc (`c2b/gen.py`, `deck.css`, `deck.js`).
- **Bút giảng bài trên slide (23/11/2026)**: c2a + c2b có nút hồng "✏️ Bút" trên thanh điều khiển slide (gọi `window.__gtiOpen`). teach-ink.js nâng cấp: công cụ Chữ có 5 cỡ (`TS`), 5 màu, 3 font (`FONTS`: Tròn = M PLUS Rounded 1c, Sách = Quicksand + Klee One, Viết tay = Mali + Klee One — đều đủ dấu tiếng Việt và chữ Nhật, nạp Google Fonts lúc mở, font chọn lưu `gti_tf`); Highlight mặc định vàng đậm `#ffc400`. Nút bút và thanh công cụ kéo đi khắp màn hình. Slide nhúng sẵn bản sao teach-ink.js → sửa teach-ink.js thì nhúng lại vào c2a/c2b (thay khối `<script>` "Bút giảng bài").
- Thẻ mở slide ở đầu tab Tài liệu: `public/app/docs-extra.js` (mảng `DECKS`), auth.js chèn `DOCS_TAG` (chỉ bản chính). Thêm bộ slide mới: chép file vào `public/app/slides/` + thêm 1 dòng vào `DECKS` + tăng `?v=` trong `DOCS_TAG`.

## Popup ngành Logistics (18/11/2026)
- `public/pub/logi.js` + `logi.webp` (công khai, chèn bản chính — bản dùng thử đã gỡ 23/11; JFT để ở `public/app/`; dùng chung 4 app: VSTN, Khách sạn, Chế biến, JFT): popup giới thiệu ngành mới Tokutei Gino 物流倉庫, nút nhắn Facebook. Hiện 1 lần mỗi phiên (sessionStorage `logi_seen_v1`), không hiện trong iframe; không chen vào lúc đang thi. Sửa thì chép file sang cả 4 repo + tăng `?v=` trong `LOGI_TAG` (JFT: hàm `logi()` trong auth.js).
- Popup cũ đã tắt: popup "Hỏi đáp cùng AI" (`promo()` trong chat-ui.js trả về ngay), JFT bỏ popup đề mới `newxShow` khi mở app.

## Ảnh nền đầu Trang chủ (18/11/2026)
- `public/pub/skin/skin.css` + `hero.webp` (auth.js chèn `SKIN_TAG`, chỉ bản chính): đầu trang chủ dùng ảnh sảnh toà nhà, phủ xanh đậm bên trái, chữ trắng, "Vệ sinh toà nhà" vàng, nút "Bắt đầu học" hồng; ẩn chồng bìa sách. Anh chỉ duyệt phần đầu trang — các đổi khác (thẻ trắng, thẻ 3 chương có ảnh, ô số liệu) anh chê xấu, đừng làm lại.

## Thuật ngữ tiếng Việt anh chốt (18/11/2026)
- ダストクロス = cây lau khăn khô (khăn rời: khăn lau khô) · モップ = cây lau khăn ướt · 幅木 = len chân tường · 自在ぼうき = chổi cước · パッド = miếng chà sàn (白パッド = miếng chà trắng, パッド台 = đế gắn miếng chà) · 文化ちりとり = hót rác cán dài (có hộp đựng và nắp) · 汚水取り = hót nước bẩn. Không dùng "dust cloth", "mop", "pad", "chổi tự tại", "nẹp/ván chân tường", "ki hốt rác".
- Đã sửa thẳng trong p1/p2 (tài liệu, đề, flashcard), bản dùng thử và slide c2a. Nguồn dựng ở máy làm việc chưa sửa → build lại từ nguồn cũ sẽ mất; khi đó chạy lại script `tr/fix.py` (ở máy làm việc) trên p1+p2.
- **Không dùng tiếng Anh trong phần tiếng Việt** (anh dặn 18/11): đã bỏ/đổi wax→sáp, polisher→máy chà sàn, squeegee→cây gạt kính, hose→ống mềm, nozzle→đầu hút, toilet/WC→nhà vệ sinh (nước tẩy bồn cầu), SNS→mạng xã hội, teamwork→làm việc nhóm, trap→bẫy nước, các chú thích (upright), (pod), (microfiber), (floor sign)… Giữ: tên riêng/giao diện (Video, Flashcard, Slide, CBT, Facebook, TikTok), từ mượn quen (axit, clo, vinyl, virus, lavabo, nilon, inox), cột phiên âm romaji.
- 4 loại máy hút bụi (bảng anh gửi 18/11): ポッド型 = máy hút bụi khô dạng thùng · アップライト型 = máy hút bụi thảm dạng đứng · ウェット型 = máy hút nước bẩn · ハンディ型 = máy hút bụi cầm tay.
