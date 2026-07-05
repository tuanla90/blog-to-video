# Canonical voiceover per beat — video "comeback / đổi hướng kênh".
# Slug: tu-cong-cu-den-tu-duy. Tông: "tâm sự lão làng ở quán cafe" (xem STYLE.md §TÔNG GIỌNG).
# Đây là VIDEO CÁ NHÂN (không port từ blog): kể THẬT 3 lý do nghỉ hơn 1 năm + cú pivot công cụ→tư duy.
#   Fact đã chốt với user (2026-06-29): (1) đón em bé, quay video sợ làm bé thức → chuyển sang VIẾT BLOG;
#   (2) AI đổi quá nhanh, vẫn cập nhật đều nhưng cần thời gian thử & tiêu hoá; (3) bí chỗ đứng nghề DA/BI
#   khi AI viết SQL giỏi, đến khi nhận ra lời giải = NGỮ CẢNH (context) → ý tưởng Semantix → đổi hướng kênh.
#   "context" dịch = "ngữ cảnh"; "Semantix" giữ nguyên. Slogan kết: "ngữ cảnh là vua".
# "\n" = nhịp ngắt nghỉ dramatic. Short = beat "00" + "short-outro".

ORDER = ["00", "01", "02", "03", "04", "05", "07"]

BEATS = {
"00":
"Mình vừa mở lại kênh. Video gần nhất... đăng cách đây hơn một năm.\n"
"Hơn một năm. Không một video mới nào.\n"
"Nhiều người nhắn thẳng: Anh ơi, anh bỏ kênh rồi à?\n"
"[thoughtful] Mình nợ các bạn một câu trả lời thật. Mà thật ra... có tới ba lý do.",

"01":
"Lý do đầu, đời thường thôi: nhà mình đón thêm một em bé.\n"
"Mà quay video thì phải nói to, phải thu âm, bé đang ngủ là giật mình dậy ngay. Thế là mình đành gác máy quay.\n"
"Nhưng mình không biến mất. Mình chuyển qua viết, lặng lẽ ra hết bài blog này đến bài khác.\n"
"Bé thì lớn dần. Kho blog cũng lớn theo, và đó chính là cái nền cho mọi thứ mình sắp kể ở đây.",

"02":
"Lý do thứ hai: làn sóng AI ập tới, nhanh đến chóng mặt.\n"
"Mình chưa bao giờ ngừng cập nhật, nhưng thú thật, không tài nào theo kịp tốc độ nó đổi.\n"
"Cái gì mới ra mình cũng muốn thử tận tay. Mà thử cho tới nơi, rồi tiêu hoá thành cái của mình... ngốn thời gian kinh khủng.\n"
"Mình thà chậm lên video, còn hơn vội vàng nói về thứ chính mình chưa thử tới nơi.",

"03":
"Nhưng lý do thứ ba mới là cái khiến mình trăn trở nhất.\n"
"Càng học, mình càng thấy AI viết SQL... nhoay nhoáy. Câu truy vấn mình hì hục cả buổi, giờ nó ra trong vài giây.\n"
"Mình ngồi tự hỏi: vậy dân phân tích dữ liệu, dân BI như mình... còn chỗ đứng không?\n"
"[thoughtful] Thật lòng, mình bí câu đó một thời gian dài. Bí tới mức chẳng biết quay lại nói gì.",

"04":
"Cho tới khi mình chạm vào một thứ mà AI không tự làm được: ngữ cảnh. Cái bối cảnh nghiệp vụ của riêng bạn.\n"
"AI viết được câu query. Nhưng nó không biết doanh thu công ty bạn tính gồm ship hay chưa, là chốt đơn hay đã thu tiền về.\n"
"Cái đó, chỉ người hiểu nghề mới cấp được. Và đó cũng là điều mình nung nấu suốt loạt bài blog vừa rồi, rồi thành ý tưởng cho thứ mình đang xây, Semantix.\n"
"[excited] Hiểu ra điều đó, mình biết: kênh này phải đổi hướng.",

"05":
"Từ chia sẻ công cụ... sang chia sẻ cách tư duy.\n"
"Mấy mẹo Google Sheets ngày xưa á? Vẫn đúng, vẫn dùng tốt, đừng bỏ. Nhưng thứ mình muốn nói tới bây giờ nằm trước mọi công cụ: bạn đang đo cái gì, trong bối cảnh nào.\n"
"Sắp tới, mỗi tuần mình gỡ một khái niệm data, gọn trong vài phút. Toàn chuyện công sở Việt mình gặp thật.\n"
"Sợi chỉ đỏ xuyên suốt chỉ có một: ngữ cảnh là vua.",

"07":
"Nếu bạn theo kênh từ thời Google Sheets, cảm ơn bạn đã chờ. Mình quay lại thật rồi.\n"
"Còn nếu mới biết mình, thì rất vui được gặp.\n"
"Kể mình nghe ở phần bình luận: thời AI này, bạn có đang lo cho nghề data của mình không? Mình đọc hết.\n"
"Theo dõi để không bỏ lỡ. Mỗi tuần, một khái niệm data.",

"short-outro":
"Mình nghỉ quay hơn một năm: vì con nhỏ, vì AI đổi nhanh quá phải thử cho kịp, và vì đi tìm lại chỗ đứng cho nghề data.\n"
"Câu trả lời gói gọn trong một từ: ngữ cảnh. Xem đầy đủ trên YouTube, theo dõi để không bỏ lỡ nhé.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng), caption giữ CHÍNH TẢ GỐC.
# Các mục dưới là PHỎNG ĐOÁN — đọc to bản TTS, nghe chỗ nào lạ thì sửa lại (xem BLOG-TO-VIDEO.md §B3.6).
PRON = {
    "Semantix": "Sơ-men-tích",   # tránh đọc kiểu Anh-Việt lai; chỉnh khi nghe thử
    # "SQL": "ét-quèo",          # bật nếu TTS đánh vần S-Q-L rời rạc
}

# ▸ Ghi chú đạo diễn / beat (BLOG-TO-VIDEO.md §B4). gen_audio map sang audio-tag ElevenLabs khi re-voice.
TONE = {
"00": "Trầm, thật lòng, hơi nặng — mở bằng sự im lặng; 'nợ các bạn câu trả lời thật' đọc chậm; '...ba lý do' gợi mở.",
"01": "Ấm, đời thường, thoáng tự trào (con mọn); câu cuối nối em bé lớn ↔ kho blog lớn, nhẹ và biết ơn.",
"02": "Thành thật, hơi gấp khi tả AI đổi nhanh; 'thà chậm còn hơn vội' đọc chắc, dứt khoát.",
"03": "Trăn trở, chùng xuống; 'còn chỗ đứng không?' buông lửng; '...chẳng biết nói gì' hạ giọng.",
"04": "Vỡ oà, sáng lên ở chữ 'ngữ cảnh'; câu chốt 'kênh phải đổi hướng' chắc nịch, phấn chấn. Nếu chèn số khớp 98% vs 60% (domain knowledge): NÓI CHẬM, hạ giọng như kể bí mật nghề.",
"05": "Quyết đoán, ấm, truyền cảm hứng; bắc cầu nhẹ (đừng phủ định Sheets cũ); 'ngữ cảnh là vua' đọc chậm, đóng đinh.",
"07": "Ấm áp, biết ơn, mời gọi; câu hỏi mở đọc thân mật như hỏi bạn. Câu hook 'bạn có lo cho nghề data không?': nhìn thẳng ống kính, DỪNG 1-2s trước khi hỏi cho nặng.",
"short-outro": "Gọn, dứt khoát, hơi tâm sự; 'ngữ cảnh' nhấn.",
}
