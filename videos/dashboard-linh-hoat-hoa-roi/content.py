# Canonical voiceover per beat — E4 (cầu nối · war story).
# Slug: dashboard-linh-hoat-hoa-roi. Tông: "tâm sự lão làng ở quán cafe" (xem STYLE.md §TÔNG GIỌNG).
# WAR STORY THẬT của Lê Anh Tuấn (author bible #6): template dashboard Looker Studio cho user tự chọn
#   Dim1/Dim2/metric1/metric2/rate — chạy được, nhưng đa số user thấy KHÓ HIỂU; drill-down phải setup lại.
#   Bài học: "linh hoạt quá hoá rối" → tư duy/NGỮ CẢNH quan trọng hơn tính năng → động lực làm tính năng AI.
# Vai trò: CHỐT Chặng 1 (gặp lại trên sân nhà → lộ trần). Nguồn nền: blog self-service-analytics.
# RÀNG: không bịa traction/khách/team. NDA: không nêu tên công ty. "context"→"ngữ cảnh". "Semantix" giữ nguyên.
# "\n" = nhịp ngắt nghỉ dramatic. Short = beat "00" + "short-outro".

ORDER = ["00", "01", "02", "03", "04", "05", "07"]

BEATS = {
"00":
"Mình từng làm một cái dashboard mà mình tự hào kinh khủng. Chọn gì cũng được.\n"
"Bạn muốn xem theo kênh? Bấm. Theo sản phẩm? Bấm. Đổi chỉ số, đổi tỉ lệ? Bấm hết.\n"
"Mình bàn giao, ngực ưỡn ra, kiểu: đây, mọi câu hỏi của anh chị nằm trong này hết rồi.\n"
"[thoughtful] Rồi mình ngồi xem họ dùng thật. Và mặt ai cũng... ngơ ngác.",

"01":
"Đây là cái mình làm trên Looker Studio, hồi đi tư vấn cho mấy doanh nghiệp.\n"
"Một template duy nhất, nhưng linh hoạt tối đa. Cho người dùng tự chọn chiều thứ nhất, chiều thứ hai, chỉ số một, chỉ số hai, rồi cả tỉ lệ.\n"
"Trên giấy thì quá đẹp. Một cái dashboard trả lời được cả nghìn câu hỏi.\n"
"Mình nghĩ mình vừa trao cho họ chiếc chìa khoá vạn năng.",

"02":
"Vấn đề là... chiếc chìa khoá vạn năng đó, đa số người dùng không biết cắm vào ổ nào.\n"
"Họ mở lên, thấy năm sáu cái ô để chọn, mỗi ô một danh sách dài dằng dặc.\n"
"[thoughtful] Chọn chiều nào? Ghép với chỉ số nào thì ra câu trả lời có nghĩa? Họ không biết. Mà thật ra, đó đâu phải việc của họ.\n"
"Cái dashboard chạy ngon. Không lỗi gì cả. Nhưng người ta mở lên một lần, rồi thôi.",

"03":
"Tệ nhất là cái khoản đào sâu. Muốn xem kỹ một chỗ bất thường á?\n"
"Họ lại phải tự đi chọn lại từ đầu: chiều này, lọc kia, đổi chỉ số nọ. Mỗi lần hỏi sâu thêm một câu là một lần dựng lại từ con số không.\n"
"Mình thiết kế ra để LINH HOẠT. Nhưng với người dùng, linh hoạt nghĩa là: không có lối đi sẵn, tự bơi đi.\n"
"[thoughtful] Linh hoạt quá... hoá rối.",

"04":
"Mãi sau mình mới thấm: mình đã đưa cho họ cái công cụ, mà quên mất phải đưa cái tư duy.\n"
"Mấy ô chọn đó chỉ có nghĩa khi bạn đã biết mình đang đo cái gì, cắt theo chiều nào, trong bối cảnh nào.\n"
"Mà cái biết đó, người làm kinh doanh không có nghĩa vụ phải biết. Đó là phần của người làm data.\n"
"Mình đếm thiếu một thứ: không phải họ thiếu nút bấm. Họ thiếu NGỮ CẢNH.",

"05":
"Looker Studio không có lỗi gì hết. Dashboard cũng vậy, vẫn tuyệt cho thứ mình theo dõi đều đặn.\n"
"Cái trần nó đụng phải nằm ở chỗ khác: thêm bao nhiêu nút bấm, thêm bao nhiêu tính năng... cũng không thay được cái tư duy nằm phía sau câu hỏi.\n"
"Và đó đúng là thứ mình đang nung nấu khi xây Semantix: để người ta hỏi thẳng bằng tiếng Việt, còn ngữ cảnh thì cài sẵn bên dưới, một lần.\n"
"[excited] Tính năng thì ai cũng cộng thêm được. Thứ khó cộng, là tư duy.",

"07":
"Nên nếu bạn đang định nhồi thêm nút bấm vào cái dashboard cho nó xịn... khoan đã.\n"
"Hỏi trước: người mở nó lên có biết mình đang tìm câu trả lời cho câu hỏi gì không?\n"
"Linh hoạt không phải là cho chọn mọi thứ. Linh hoạt là dẫn đúng người tới đúng câu trả lời.\n"
"Tuần sau mình kể chuyện một con số doanh thu mà ba phòng cãi nhau. Theo dõi để không bỏ lỡ nhé.",

"short-outro":
"Mình từng tự hào vì cái dashboard cho chọn mọi thứ. Rồi user mở lên, ngơ ngác, dùng một lần rồi bỏ.\n"
"Bài học: linh hoạt quá hoá rối. Cái họ thiếu không phải nút bấm, mà là ngữ cảnh. Bản đầy đủ trên YouTube nhé.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng), caption giữ CHÍNH TẢ GỐC.
# Các mục dưới là PHỎNG ĐOÁN — đọc to bản TTS, nghe chỗ nào lạ thì sửa lại (xem BLOG-TO-VIDEO.md §B3.6).
PRON = {
    "Semantix": "Sơ-men-tích",       # tránh đọc kiểu Anh-Việt lai; chỉnh khi nghe thử
    "Looker Studio": "Lúc-cơ x-tu-đi-ô",  # tránh TTS đọc "Looker" thành "lóoc-cơ"/đánh vần
    # "dashboard": "đát-bo",         # bật nếu TTS đọc "dashboard" sượng; nhiều giọng VN đọc OK
}

# ▸ Ghi chú đạo diễn / beat (BLOG-TO-VIDEO.md §B4). gen_audio map sang audio-tag ElevenLabs khi re-voice.
TONE = {
"00": "Mở bằng tự hào hồn nhiên, hơi khoe; 'Chọn gì cũng được' nhấn nhá đắc ý; câu cuối '...ngơ ngác' khựng lại, hụt hơi.",
"01": "Kể chuyện, ấm; liệt kê 'chiều một, chiều hai, chỉ số...' đọc nhanh dần như khoe đồ; 'chìa khoá vạn năng' đầy tự tin (để lát bẻ).",
"02": "Chùng xuống, vỡ lẽ; 'không biết cắm vào ổ nào' hơi tự trào; 'đó đâu phải việc của họ' đọc chậm, thành thật; 'rồi thôi' buông lửng.",
"03": "Hơi bức xúc thay người dùng; liệt kê 'chọn lại, lọc kia, đổi nọ' đọc mệt mỏi; 'Linh hoạt quá... hoá rối' = câu thần chú, ngắt rõ trước 'hoá rối', đóng đinh.",
"04": "Trầm, thấm thía, tự nhận lỗi; 'quên mất phải đưa cái tư duy' đọc chậm; 'Họ thiếu NGỮ CẢNH' nhấn mạnh chữ cuối, dứt khoát.",
"05": "Bắc cầu, công bằng (đừng phủ định Looker); 'Semantix' nhắc nhẹ một nhịp; 'Thứ khó cộng, là tư duy' chốt chắc, phấn chấn.",
"07": "Thân mật, như khuyên đàn em ở quán cafe; 'khoan đã' đọc thân tình; câu nhá tập sau gợi tò mò, mời gọi.",
"short-outro": "Gọn, dứt khoát, hơi tâm sự; 'linh hoạt quá hoá rối' và 'ngữ cảnh' nhấn.",
}
