"""Quy tắc 4 bước DÙNG CHUNG cho giáo án (src/ga/build_ga.py) và slide giảng (public/app/slides/*).
Mỗi bài = Tổng quan + Mở bài + 4 bước, đúng thứ tự slide anh dạy:
  ① Học lý thuyết   — trang a1, a2, … : toàn bộ câu sách của bài, đúng thứ tự sách
  ② Đề thi sẽ hỏi gì — trang de        : xu hướng ra đề (学科 / 実技), lỗi hay sai, kiểu đáp án nhiễu
  ③ Trắc nghiệm      — trang q1, q2    : câu trong bộ đề của app (giáo trình không có bài tập) + câu kiểm tra của app
  ④ Tổng kết         — trang tk, ket   : câu chính của sách + lời chốt, rồi Kết bài (bài về nhà)
Slide làm theo đúng thứ tự này: mỗi bước mở bằng 1 slide nhãn “Bước N · …”."""
PHN = ['Học lý thuyết', 'Đề thi sẽ hỏi gì', 'Trắc nghiệm', 'Tổng kết']

def step_of(k):
    if k.startswith('a'): return 1
    if k == 'de': return 2
    if k in ('q1', 'q2'): return 3
    if k in ('tk', 'ket'): return 4
    return 0

# Bài = 1 hoặc vài phần bài học liền nhau trong app (tab Tài liệu); phần ngắn gộp lại cho đủ 1 buổi dạy.
# (mã bài, [phần], tên tiếng Việt khi gộp nhiều phần)
BAI = {
    1: [('b01', ['s1', 's2'], 'Vào làm, nghỉ giải lao, tan ca'), ('b02', ['s3']), ('b03', ['s4']), ('b04', ['s5']), ('b05', ['s6']), ('b06', ['s7'])],
    2: [('b07', ['s0', 's1'], 'Bắt đầu ca, an toàn & vật tư vệ sinh sàn'), ('b08', ['s2']), ('b09', ['s3']), ('b10', ['s4']), ('b11', ['s5']),
        ('b12', ['s6']), ('b13', ['s7']), ('b14', ['s8', 's9'], 'Rác thải, vệ sinh & an toàn lao động')],
    3: [('b15', ['s0', 's1', 's2'], '5 nguyên tắc: vật liệu sàn, vết bẩn, chất tẩy, cách làm'),
        ('b16', ['s3', 's4'], 'Máy chà sàn: chuẩn bị & điều khiển'), ('b17', ['s5']),
        ('b18', ['s6', 's7'], 'Vệ sinh kính'), ('b19', ['s8', 's9'], 'Danh mục dụng cụ, phân loại & trải giường')],
}
