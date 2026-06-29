# Canonical voiceover per beat — E6: video LĂNG KÍNH / bắt trend.
# Slug: ai-viet-sql-nghe-data. Tông: "tâm sự lão làng ở quán cafe" (xem STYLE.md §TÔNG GIỌNG).
#   Vai trò trong slate cầu nối: bài lăng kính bắt trend "AI thay thế Data Analyst?" — kéo người mới +
#   đào sâu nỗi sợ đã nhá ở E1 (tu-cong-cu-den-tu-duy beat 03-04). KHÔNG mâu thuẫn E1: cùng thesis
#   "AI viết được query, nhưng không tự biết NGỮ CẢNH nghiệp vụ" → mở rộng, cụ thể hơn (AI còn bịa cột).
#   Lời giải = NGỮ CẢNH (context) → đây chính là thứ series "mỗi tuần một khái niệm" sẽ dạy → hiệu triệu.
#   Nguồn: blog chuyen-nghe-data-analyst, llm-bia-sql, semantic-layer.
# Giọng ĐIỀM ĐẠM, mở ra cơ hội — KHÔNG hù doạ kiểu "AI cướp việc".
# "context" dịch = "ngữ cảnh"; "Semantix" giữ nguyên. Slogan kết: "ngữ cảnh là vua".
# "\n" = nhịp ngắt nghỉ dramatic. Short = beat "02" (đoạn "AI thay thế DA?") + "short-outro".

ORDER = ["00", "01", "02", "03", "04", "05", "07"]

BEATS = {
"00":
"Mình gõ một câu hỏi cho AI: doanh thu quý vừa rồi theo kênh.\n"
"Vài giây. Nó trả về một câu SQL gọn gàng, đúng cú pháp từng dấu phẩy.\n"
"Cái câu mà ngày xưa mình ngồi hì hục cả buổi sáng mới ra.\n"
"[thoughtful] Mình ngồi đực ra một lúc. Rồi tự hỏi: vậy... mình còn ngồi đây để làm gì nữa?",

"01":
"Mình tin là bạn cũng đang lo đúng câu đó. Lướt mạng đâu cũng thấy: AI thay thế Data Analyst tới nơi rồi.\n"
"Mình không né. Mình thừa nhận thẳng: cái phần viết query, AI làm nhanh hơn mình thật.\n"
"Cú pháp, hàm, join bảng... nó nhả ra trong vài giây, không kêu mệt, không đòi nghỉ trưa.\n"
"Nếu nghề data chỉ có nhiêu đó, thì ừ, mình lo là phải.",

"02":
"Nhưng khoan. Mình thử một câu khó hơn xem sao.\n"
"Mình hỏi giá trị vòng đời của khách VIP. AI trả lời cái rụp, một câu SQL đẹp long lanh.\n"
"Có điều... cái cột nó gọi tới, trong database của mình không hề tồn tại. Nó tự bịa ra. Tự tin, không một lời cảnh báo.\n"
"[thoughtful] Đấy. AI không tra dữ liệu của bạn. Nó đoán cái gì nghe hợp lý nhất. Mà đoán thì... có lúc trúng, có lúc bịa.",

"03":
"Mới thấy: thứ AI giỏi là cú pháp. Thứ nó mù tịt là ngữ cảnh.\n"
"Bạn hỏi doanh thu tháng này. Nhưng doanh thu công ty bạn là gì? Trừ chiết khấu chưa? Tính đơn hoàn không? Là chốt đơn, hay đã thu tiền về?\n"
"AI không biết. Nó đoán bừa một nhánh, rồi trả về con số trông rất dứt khoát. Bạn không cách nào biết nó theo định nghĩa nào.\n"
"Cái đó, chỉ người hiểu nghề mới cấp được. Đó là phần của bạn.",

"04":
"Thế là mình nhẹ cả người. Nghề data không chết. Nó đang dịch chuyển.\n"
"Từ người viết query nhanh nhất... sang người định nghĩa được ngữ cảnh và đặt đúng câu hỏi.\n"
"Phần bưng số lặp đi lặp lại, phần dọn dữ liệu bẩn, cứ để máy gánh. Mệt mỏi mà.\n"
"Còn bạn? Bạn lo phần ý nghĩa. Đo cái gì, trong bối cảnh nào, để ra quyết định gì.",

"05":
"Mình loay hoay với chuyện này lâu lắm rồi, suốt cả loạt bài blog vừa qua, rồi thành ý tưởng cho thứ mình đang xây, Semantix.\n"
"Nhưng cái lõi không nằm ở công cụ. Nó nằm ở tư duy: dạy AI ngữ cảnh trước, để nó hết chỗ mà bịa.\n"
"Và đó đúng là thứ kênh này sắp làm. Mỗi tuần, mình gỡ một khái niệm data, gọn trong vài phút. Toàn chuyện công sở Việt mình gặp thật.\n"
"Sợi chỉ đỏ chỉ có một: ngữ cảnh là vua.",

"07":
"Nên nếu bạn đang lo AI cướp nghề, mình nói thật lòng: thứ AI không lấy được của bạn, là cái bạn hiểu về công việc của mình.\n"
"Việc của tụi mình từ giờ là mài cho sắc đúng cái đó.\n"
"Kể mình nghe ở phần bình luận: bạn đang lo, hay thấy AI mở ra nhiều cửa hơn cho nghề? Mình đọc hết.\n"
"Theo dõi để không bỏ lỡ. Mỗi tuần, một khái niệm data.",

"short-outro":
"Tóm lại: AI viết SQL nhanh hơn bạn, đúng. Nhưng nó không biết doanh thu công ty bạn tính kiểu gì, còn bịa ra cột không tồn tại.\n"
"Nghề data đang dịch từ viết query sang định nghĩa ngữ cảnh. Xem đầy đủ trên YouTube, theo dõi để không bỏ lỡ nhé.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng), caption giữ CHÍNH TẢ GỐC.
# Các mục dưới là PHỎNG ĐOÁN — đọc to bản TTS, nghe chỗ nào lạ thì sửa lại (xem BLOG-TO-VIDEO.md §B3.6).
PRON = {
    "Semantix": "Sơ-men-tích",   # tránh đọc kiểu Anh-Việt lai; chỉnh khi nghe thử
    "SQL": "ét-quèo",            # tránh TTS đánh vần S-Q-L rời rạc; tắt nếu nghe đã ổn
    "VIP": "víp",                # đọc liền, tránh đánh vần V-I-P
    # "database": "đây-ta-bây",  # bật nếu TTS đọc kiểu Anh nặng
}

# ▸ Ghi chú đạo diễn / beat (BLOG-TO-VIDEO.md §B4). gen_audio map sang audio-tag ElevenLabs khi re-voice.
TONE = {
"00": "Tâm sự, hơi chùng — tả cảnh AI ra SQL trong vài giây; '...mình còn ngồi đây để làm gì nữa?' buông lửng, thật lòng.",
"01": "Đồng cảm, thẳng thắn, KHÔNG hù doạ; thừa nhận AI nhanh hơn ở phần query — đọc bình thản, không cay cú.",
"02": "Bắt đầu lật ngược; 'Nhưng khoan' nhấn; 'cột đó không hề tồn tại. Nó tự bịa ra' đọc chắc, hơi ngỡ ngàng; câu chốt điềm tĩnh. [BEAT SHORT-ABLE — hook 'AI thay thế DA?']",
"03": "Điềm đạm, sáng dần; loạt câu hỏi 'trừ chiết khấu chưa?...' đọc dồn nhịp; 'Đó là phần của bạn' chắc nịch, trao quyền.",
"04": "Nhẹ nhõm, mở ra cơ hội; 'Nghề data không chết. Nó đang dịch chuyển' đọc rõ, lạc quan; ấm.",
"05": "Quyết đoán, ấm, truyền cảm hứng; chạm Semantix nhẹ (brand-light), không brochure; 'ngữ cảnh là vua' đọc chậm, đóng đinh.",
"07": "Ấm áp, hiệu triệu, mời gọi vào series; 'thứ AI không lấy được của bạn' nhấn; câu hỏi mở đọc thân mật.",
"short-outro": "Gọn, dứt khoát; 'bịa ra cột không tồn tại' nhấn nhẹ; 'ngữ cảnh' đóng đinh.",
}
