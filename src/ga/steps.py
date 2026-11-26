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

# Bài = phần bài học trong app (tab Tài liệu). Chương 1: Phần A (hội thoại tr.8) + Phần B (quy tắc tr.9) gộp thành Bài 1.
BAI = {
    1: [('b01', ['s1', 's2']), ('b02', ['s3']), ('b03', ['s4']), ('b04', ['s5']), ('b05', ['s6']), ('b06', ['s7'])],
    2: [('b%02d' % (7 + i), ['s%d' % i]) for i in range(10)],
    3: [('b%02d' % (17 + i), ['s%d' % i]) for i in range(10)],
}
