# Canonical voiceover per beat — video vkt-014 (blog kt-014 "Data modeling: Fact & Dimension").
# Nguồn: landing/src/content/blog/data-modeling-fact-dimension.md
# Tông: dàn anh sư phạm gỡ rối cho đàn em ở quán cà phê — mộc, đời thường, thẳng (xem STYLE.md).
# CHỈ script voiceover — CHƯA render, CHƯA gen audio.
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng (gen_audio strip trước caption; xem BLOG-TO-VIDEO.md §B4).

ORDER = ["00", "01", "02", "03", "04", "05"]

BEATS = {
"00":
"Sếp hỏi: doanh thu áo khoác, bán qua TikTok Shop, cho khách Hà Nội, tháng Ba, được bao nhiêu?\n"
"Bạn có đủ dữ liệu. Từng đơn, từng đồng, nằm gọn trong file.\n"
"Vậy mà ngồi lọc tay cả buổi, con số ra vẫn không chắc đúng.\n"
"[thoughtful] Đủ số, đủ công cụ rồi, cái quyết định bạn hỏi được câu nào lại nằm ở cách bạn sắp mấy cái bảng.",

"01":
"Người mới hay nhồi tất cả vào một bảng duy nhất. Mỗi dòng một đơn, kèm luôn tên khách, tỉnh, tên kênh.\n"
"Trông thì gọn. [annoyed] Nhưng nó là bảng phẳng, và giấu sẵn bom.\n"
"Khách Lan đổi địa chỉ, bạn phải sửa hàng trăm dòng, sót một dòng là số sai. Gõ nhầm Tik Tok chỗ này, TikTok Shop chỗ kia, máy tính coi là hai kênh, doanh thu bị chia đôi mà không ai hay.\n"
"Bảng phẳng không sai khi dữ liệu còn bé. Nó bế tắc đúng lúc câu hỏi bắt đầu khó.",

"02":
"Lối ra là tách bảng làm hai loại.\n"
"Loại thứ nhất là bảng fact, ghi lại chuyện đã xảy ra. Mỗi dòng một sự kiện: một đơn hàng, một giao dịch. Cột của nó là mấy con số cộng được, doanh thu với số lượng.\n"
"[confident] Nghĩ đơn giản thế này cho dễ nhớ: bảng fact là động từ. Đã bán cái gì, bao nhiêu.\n"
"Nó gầy mà dài. Ít cột, cực nhiều dòng, và gần như không chứa chữ mô tả.",

"03":
"Loại thứ hai là bảng dimension, phần mô tả để cắt lát.\n"
"Sản phẩm, khách hàng, thời gian, kênh bán, mỗi thứ một bảng riêng. [confident] Nếu fact là động từ, thì dimension là tính từ. Của ai, loại nào, ở đâu, khi nào.\n"
"Bảng này béo mà ngắn: nhiều cột mô tả, nhưng ít dòng. Mỗi khách, mỗi kênh chỉ tồn tại đúng một dòng gốc.\n"
"Mẹo phân biệt cho nhanh: thứ bạn muốn cộng, đếm, tính trung bình thì cho vào fact. Thứ bạn muốn lọc theo, nhóm theo thì cho vào dimension.",

"04":
"Đặt bảng fact vào giữa, nối ra các bảng dimension bằng khoá chung, bạn được một hình ngôi sao. Người ta gọi là star schema.\n"
"Giờ quay lại câu hỏi của sếp. Áo khoác, TikTok Shop, khách Hà Nội, tháng Ba.\n"
"Chỉ là lấy bảng đơn hàng, lọc qua bốn dimension đó, rồi cộng cột doanh thu. [excited] Bốn lát cắt, một con số, chuyện vài giây.\n"
"Đổi sang câu hỏi khác cũng vẫn bộ bảng đó, chỉ xoay sang chiều khác. Sắp bảng đúng một lần, hỏi được vô số câu.",

"05":
"[thoughtful] Đừng vội biến mình thành công ty dữ liệu. Cửa hàng vài nghìn đơn không cần data warehouse mười tầng.\n"
"Cái cần chỉ là phân biệt được số đo với mô tả, để dữ liệu lớn lên bạn không tự nhốt mình trong một sheet khổng lồ.\n"
"Và fact với dimension không bắt đầu từ sơ đồ, mà từ nghiệp vụ. Cứ ngồi hỏi: việc gì ở đây đáng đếm nhất? Trả lời được câu đó, đó chính là bảng fact, phần còn lại tự rơi vào dimension.\n"
"Thấy hữu ích thì theo dõi kênh. Mỗi tuần một khái niệm data, mình gỡ trong vài phút.",
}

# Phát âm cho TTS: gen_audio THAY các từ này trong text gửi TTS (đọc đúng),
# caption/màn hình vẫn giữ CHÍNH TẢ GỐC. Chỉ khai tên riêng/thuật ngữ ngoại AI hay đọc sai.
PRON = {
"dimension": "đai-men-sần",
"star schema": "sờ-ta xkê-ma",
"data warehouse": "đây-ta que-hao",
"TikTok Shop": "Tíc Tóc Sóp",
"data": "đây-ta",
}
