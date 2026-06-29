# Canonical voiceover per beat.
# === v2 (2026-06-27): viết lại theo góp ý MKT — tông "quán cafe / tâm sự lão làng" (xem STYLE.md). ===
# CHỜ RE-VOICE: audio/timings/beats hiện tại VẪN là bản giọng Vbee CŨ (token Vbee đã disable).
#   Khi có TTS chạy được (ElevenLabs/VieNeu/bật lại Vbee): gen_audio(+align) từ file này -> audio mới
#   + beats/timings mới + đồng bộ scenes.json (vd "cửa hàng offline" thay "KiotViet" ở beat 03).
# "\n" = nhịp ngắt nghỉ dramatic.

ORDER = ["00", "01", "02", "03", "04", "05", "07"]

BEATS = {
"00":
"Sáng thứ Hai, phòng họp căng như dây đàn. Sếp gõ tay xuống bàn, hỏi đúng một câu: Chốt lại, doanh thu tháng này bao nhiêu?\n"
"Anh trưởng phòng Sales tự tin đáp: Dạ, bốn phẩy hai tỷ. Chị Kế toán trưởng nhíu mày, vội nhìn lại file: Đâu sếp, có ba phẩy tám tỷ thôi.\n"
"Cùng một công ty. Cùng một tháng. Mà lòi ra hai con số lệch nhau gần nửa tỷ. Sếp cáu: [annoyed] Thế tóm lại đứa nào tính sai?\n"
"Câu trả lời sẽ làm bạn bất ngờ.\n[thoughtful] Sự thật là...\nChẳng ai sai cả.",

"01":
"Lý do hai báo cáo lệch nhau, gần như không bao giờ là cộng sai. Mà là ba người đang gọi ba thứ khác nhau, bằng đúng một từ.\n"
"Gỡ được nó chỉ cần nắm ba từ vựng: Metric, Dimension, và KPI. Ba từ này người ta hay dùng lẫn lộn, nhưng vai trò khác hẳn nhau.\n"
"Metric, đơn giản, là con số bạn đo được. Dimension là cách bạn cắt con số đó ra để nhìn cho rõ. Còn KPI là chính con số đó, nhưng gắn thêm một cái đích phải chạm tới.",

"02":
"Metric, hiểu đơn giản, là cái thứ bạn đong đếm được thành số. Doanh thu, số đơn hàng, lượng khách mới. Hỏi bao nhiêu là phải ốp ngay được một con số.\n"
"Nghe thì dễ, đúng không? Nhưng cái bẫy chết người nằm ngay chỗ này. Thử ra vỗ vai năm người trong công ty, hỏi doanh thu tính thế nào mà xem. [annoyed] Mỗi người một phách.\n"
"Người bảo đơn chốt xong là tính. Người cãi phải thu được tiền về tài khoản mới tính chứ. Rồi có trừ đơn hoàn không? Có cộng tiền ship không?\n"
"Doanh thu của anh Sales là tiền chốt đơn, cộng cả ship, chưa trừ hoàn, nên nó to, ra bốn phẩy hai tỷ. Còn của chị Kế toán là tiền thực tế ting ting về tài khoản, ba phẩy tám tỷ.\n"
"Chẳng có file nào sai cả. Chỉ là hai người đang đo hai thứ khác nhau, mà gọi chung một cái tên.",

"03":
"Giờ giả sử hai người cãi xong, chốt được con số ba phẩy tám tỷ. Tưởng yên chuyện rồi chứ gì? Chưa đâu.\n"
"Đây mới là cái bẫy tinh vi. Cùng một đơn hàng y hệt, định nghĩa giống hệt nhau, nhưng bạn ghi nó vào tháng nào?\n"
"Phòng kinh doanh tính theo ngày chốt đơn, nó rơi vào tháng Năm. Kế toán tính theo ngày khách trả tiền, nó nhảy sang tháng Sáu. Còn vận hành tính theo ngày giao xong, lại lùi tận tháng Bảy.\n"
"[surprised] Á à. Cùng một đơn, mà ba phòng đẩy nó vào ba tháng khác nhau. Cái cột ngày bạn chọn — đấy chính là Dimension. Và nó âm thầm đổi luôn con số doanh thu của cả tháng.",

"04":
"Cuối cùng là KPI. [sarcastic] Chỗ này nhiều công ty hay tự lừa mình lắm nhé. Cứ nghĩ số nào đo được cũng là KPI. Không phải.\n"
"Doanh thu ba phẩy tám tỷ chỉ là một metric trần trụi, khô khốc. Nó chỉ thành KPI khi bạn gắn cho nó một cái đích để vươn tới.\n"
"Kiểu như mục tiêu tháng này bốn tỷ, giờ được ba phẩy tám, tức là đạt chín lăm phần trăm rồi, cố lên anh em. Đó mới là KPI. Con số giờ có thước để biết mình đang tốt hay tệ.\n"
"Thấy các sếp cứ nhồi ba bốn chục số xanh đỏ lên màn hình rồi gọi tất cả là KPI. Khổ thân nhân viên nhìn vào tẩu hỏa nhập ma.\n"
"Nhớ nhé: khi cái gì cũng then chốt, thì rốt cuộc chẳng có gì là then chốt cả.",

"05":
"Quay lại phòng họp sáng thứ Hai, đọc lại bằng đúng ba từ.\n"
"Một: metric doanh thu chưa có một định nghĩa chung. Gồm ship hay không, mỗi người một kiểu.\n"
"Hai: cùng định nghĩa, nhưng mỗi phòng neo vào một cột ngày khác, nên tháng vẫn lệch.\n"
"Ba: chẳng ai chốt mục tiêu, nên không biết con số là tốt hay chưa.\n"
"Ba thứ lẫn lộn, gộp thành mười lăm phút cãi nhau. Đáng ra chỉ cần một câu: Mình đang nói metric nào, cắt theo dimension nào, so với KPI nào?",

"07":
"Lần tới khi hai báo cáo lệch nhau, đừng vội tìm lỗi cộng trừ.\n"
"Hỏi trước: metric nào, dimension nào, KPI nào? Chín trên mười lần, sai số tan biến ngay khi ba từ này được gọi đúng tên.\n"
"Mà tiện đây, hỏi thật: ở công ty bạn, phòng Sales với Kế toán có hay cãi nhau vì con số doanh thu không? Kể mình nghe ở phần bình luận nhé.\n"
"Còn nếu thấy video hữu ích, đừng quên theo dõi kênh. Mỗi tuần một khái niệm data, gỡ gọn trong vài phút.",

"short-outro":
"Câu trả lời nằm gọn trong ba từ: Metric, Dimension, và KPI.\n"
"Xem đầy đủ trên YouTube, và theo dõi để không bỏ lỡ.",
}

# Phát âm cho TTS: gen_audio THAY các từ này trong text gửi TTS (AI đọc đúng),
# nhưng caption/hiển thị giữ CHÍNH TẢ GỐC. Thêm khi AI đọc sai tên riêng/ngoại.
PRON = {
    "KiotViet": "ki ốt việt",   # tránh bị đọc "ki ốt vi ét"
    # Patch thanh điệu/nguyên âm turbo_v2_5 đọc sai (THỬ NGHIỆM — giọng Việt thật sẽ thay).
    # gen_audio khôi phục caption về chữ GỐC, chỉ audio đọc theo respelling.
    # --- patch turbo (ĐÃ TẮT khi dùng giọng Việt thật multilingual_v2) ---
    # "Gỡ": "Gở", "gỡ": "gở", "khối": "khôi",
}

# ▸ Ghi chú đạo diễn / beat (BLOG-TO-VIDEO.md §B4). gen_audio map sang audio-tag ElevenLabs khi re-voice.
TONE = {
"00": "Căng thẳng, dồn dập như đang ở phòng họp; câu cuối '...chẳng ai sai cả' hạ giọng bí ẩn.",
"01": "Bình tĩnh, dẫn dắt — như mở một bí mật nghề.",
"02": "Hơi bức xúc + châm biếm chốn công sở ('mỗi người một phách'); '...gọi chung một cái tên' nhấn chậm.",
"03": "Lên cao trào; '[excited] Á à!' vỡ oà như vừa phát hiện ra.",
"04": "Châm biếm nhẹ ('tự lừa mình', 'tẩu hoả nhập ma'); câu chốt 'then chốt' đọc chậm, dứt khoát.",
"05": "Đúc kết rõ ràng, nhịp dồn ba ý một-hai-ba.",
"07": "Ấm, gần gũi, mời gọi theo dõi.",
"short-outro": "Nhanh gọn, dứt khoát.",
}
