# Canonical voiceover per beat — video vkt-020 (blog kt-020 "Tín hiệu vs nhiễu").
# Nguồn: landing/src/content/blog/tin-hieu-vs-nhieu.md — tông "quán cafe / dàn anh gỡ rối cho đàn em" (xem STYLE.md).
# CHỈ script voiceover — chưa render, chưa gen audio.
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng (gen_audio strip trước caption; xem BLOG-TO-VIDEO.md §B4).

ORDER = ["00", "01", "02", "03", "04", "05"]

BEATS = {
"00":
"[thoughtful] Sáng thứ Hai, bạn mở dashboard. Doanh thu tuần rồi giảm tám phần trăm.\n"
"Tim thắt một cái. Có nên họp khẩn đội sales? Có nên cắt luôn kênh quảng cáo kia?\n"
"[surprised] Khoan. Tuần trước đó nó tăng sáu. Trước nữa giảm năm. Trước nữa tăng chín.\n"
"Nhìn cả chuỗi, cái tám phần trăm đó chỉ là một nhịp thở bình thường. Đừng phản ứng với mọi dao động của con số.",

"01":
"Không có con số kinh doanh nào đứng yên. Doanh thu, số đơn, tỷ lệ chuyển đổi, cứ nhấp nhô quanh một mức trung bình, kể cả khi bạn chẳng đổi gì.\n"
"Vì kết quả mỗi tuần là tổng của cả trăm chuyện vặt: hôm đó trời mưa, một khách lớn tình cờ đặt nhiều, đối thủ chạy sale.\n"
"Cái phần nhấp nhô không mang tin đó, gọi là nhiễu. Còn thay đổi thật, có nguyên nhân, mới là tín hiệu.",

"02":
"[confident] Mẹo quan trọng nhất, mà cũng dễ nhất: đừng bao giờ kết luận từ một con số.\n"
"Cái tám phần trăm đứng một mình thì vô nghĩa. Nó chỉ có nghĩa khi đặt cạnh một dải bình thường.\n"
"Bạn không cần học thống kê. Nhìn lại tám tới mười hai tuần gần nhất, tuần tệ nhất giảm bao nhiêu, tuần đỉnh tăng bao nhiêu, lấy đó làm dải.\n"
"Con số nào còn nằm trong cái dải đã từng xảy ra, gần như chắc chắn là nhiễu. Giảm tám thì kệ nó. Nhưng giảm mười tám, vượt hẳn ra ngoài, lúc đó mới ngẩng đầu lên.",

"03":
"Cách thứ hai để bắt tín hiệu: để ý một chuỗi nhiều điểm cùng chiều.\n"
"Một tuần giảm là nhiễu. Nhưng bốn tuần liền đều giảm, mỗi tuần một ít, thì khó mà ngẫu nhiên. Giống tung đồng xu ra sấp bốn lần liên tiếp.\n"
"Đó là dấu hiệu của thay đổi có hệ thống: sản phẩm mất sức hút, một kênh chết dần.\n"
"[thoughtful] Trớ trêu là người ta hay làm ngược. Hoảng vì một cú sốc lẻ, thứ thường tự hồi sau một tuần. Rồi lại quen dần với một đà giảm chậm, cho tới khi quá muộn. Con ếch trong nồi nước nóng dần lên.",

"04":
"Và có một cái bẫy làm nhiễu thêm rối, nhất là ở mình: mùa vụ.\n"
"Cuối tuần luôn cao hơn giữa tuần. Ngày đôi trên sàn thì vọt lên. Còn Tết thì bóp méo hết: trước Tết mua sắm cao điểm, trong Tết tụt sâu, sau Tết hồi chậm.\n"
"So doanh thu tuần cận Tết với tuần trong Tết rồi kêu công ty đang sụp, là bạn vừa nhầm mùa vụ thành tín hiệu.\n"
"Muốn biết thay đổi có thật không, đừng so tuần này với tuần trước. So với cùng kỳ năm ngoái, để mùa vụ tự triệt tiêu nhau.",

"05":
"[thoughtful] Nên nhớ thế này. Mỗi chỉ số là một cây kim đồng hồ, lúc nào cũng rung nhẹ.\n"
"Đừng chỉnh đồng hồ mỗi lần kim rung. Chỉ chỉnh khi nó lệch hẳn khỏi vùng rung quen, hoặc trôi đều một chiều qua nhiều nhịp.\n"
"Phần lớn dao động là hơi thở, không phải triệu chứng.\n"
"Thấy hữu ích thì theo dõi kênh. Mỗi tuần một khái niệm data, gỡ trong vài phút.",
}

PRON = {
"Semantix": "Xê-man-tít",
"dashboard": "đát-bo",
"sale": "xây",
}
