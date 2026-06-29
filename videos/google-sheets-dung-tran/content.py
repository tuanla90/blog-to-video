# Canonical voiceover per beat — video CẦU NỐI E3 "sân nhà cho khán giả Sheets cũ".
# Slug: google-sheets-dung-tran. Tông: "tâm sự lão làng ở quán cafe" (xem STYLE.md §TÔNG GIỌNG).
# Vai trò (PLAN-VIDEO-CAU-NOI E3): TÔN VINH Google Sheets để khởi đầu → rồi lộ 4 CÁI TRẦN
#   (thủ công tốn công · báo cáo trễ · dễ sai/nhiều phiên bản · một người gánh = bus factor)
#   → đó là lúc cần cấu trúc & tư duy data. BẮC CẦU: Sheets vẫn tuyệt, ĐỪNG phủ định khán giả cũ.
# Nguồn: blog vs-google-sheets + google-sheets-dashboard. NDA: không nêu tên công ty thật.
#   "context" dịch = "ngữ cảnh"; "Semantix" giữ nguyên. Brand-light: tối đa 1 beat chạm sản phẩm.
# "\n" = nhịp ngắt nghỉ dramatic. Short = beat "00" (hook) + beat "03" (4 cái trần) + "short-outro".

ORDER = ["00", "01", "02", "03", "04", "05", "06"]

BEATS = {
"00":
"Mười một giờ đêm, cuối tháng. Phòng làm việc tắt gần hết đèn.\n"
"Bạn vẫn ngồi đó, copy số từ Shopee dán sang một sheet, từ TikTok Shop dán sang sheet khác.\n"
"Mai sếp cần báo cáo. Mà số thì rải ở năm cái file, mỗi nơi một kiểu.\n"
"[thoughtful] Cảnh này quen không? Mình kể bạn nghe, vì sao nó cứ lặp lại... tháng nào cũng vậy.",

"01":
"Mà khoan. Trước khi chê, mình nói sòng phẳng một câu: Google Sheets là một trong những phần mềm vĩ đại nhất từng có.\n"
"Mở lên là dùng. Không cần cài, không cần học mô hình dữ liệu, không cần xin ai cấp quyền.\n"
"Mình đi tư vấn chuyển đổi số bao nhiêu năm, khách đủ ngành, lần nào cũng bắt đầu từ Sheets. Và đó là lựa chọn đúng.\n"
"Với shop nhỏ, một nguồn, vài người dùng, hỏi đi hỏi lại mươi câu cố định, thì một dashboard Sheets dựng tốt là đủ. Và miễn phí. Đừng vẽ rắn thêm chân.",

"02":
"Nhưng đây là cái nghịch lý mình muốn bạn thấy.\n"
"Cái khiến Sheets tiện hôm nay, lại chính là cái biến nó thành nợ ngày mai.\n"
"Vì một ô có thể là bất cứ thứ gì, nên không gì ép bạn nhất quán. Vì ai cũng sửa được, nên không gì giữ một định nghĩa đứng yên.\n"
"[thoughtful] Sheets không thua vì nó yếu. Nó thua vì nó quá vạn năng. Nó giống con dao đa năng Thuỵ Sĩ. Tiện cho trăm việc nhỏ. Nhưng đừng dùng nó để xây nhà.",

"03":
"Và khi dữ liệu của bạn lớn thành một ngôi nhà, nó đụng đúng bốn cái trần. Mình đếm cho bạn.\n"
"Trần thứ nhất: thủ công, tốn công. Mỗi tháng lại copy, lại dán, lại VLOOKUP. Cảnh nửa đêm lúc nãy đấy.\n"
"Trần thứ hai: báo cáo luôn trễ. Số xong thì chuyện đã xảy ra rồi. Bạn lái xe bằng cách nhìn gương chiếu hậu.\n"
"Trần thứ ba: dễ sai, nhiều phiên bản. Sales bảo một phẩy hai tỷ, kế toán cãi một phẩy không tám. Cùng một file, ba người ba số. Mà file thì không bao giờ la làng khi nó sai.\n"
"Trần thứ tư: một người gánh tất. Cái file thần thánh đó chỉ một người hiểu công thức bên trong. Người đó nghỉ một hôm... là cả công ty mù.",

"04":
"Bốn cái trần đó, để ý mà xem, không cái nào là lỗi của Sheets.\n"
"Copy tay, báo cáo trễ, ba người ba số, một người gánh... Tất cả đều là cùng một gốc.\n"
"Đó là khi bạn quên hỏi: con số này đo cái gì, trong ngữ cảnh nào, ai được sửa, ai được xem.\n"
"[thoughtful] Cái thiếu không phải một công thức xịn hơn. Cái thiếu là cấu trúc. Là cách tư duy về dữ liệu.",

"05":
"Mình đang xây một thứ tên là Semantix, đi đúng từ chỗ đau này.\n"
"Nó không bắt bạn bỏ Google Sheets. Sheets vẫn là cánh cửa vào, không phải cái trần.\n"
"Ý tưởng gọn thôi: định nghĩa doanh thu đúng một lần, ở một chỗ. Rồi bạn, kế toán, sếp, ai hỏi cũng ra cùng một con số.\n"
"Nhưng đó là chuyện của mấy video sau. Hôm nay mình chỉ muốn bạn nhìn ra bốn cái trần kia trước đã.",

"06":
"Nên nếu bạn theo mình từ thời Google Sheets, nghe này: mấy mẹo cũ vẫn đúng, vẫn dùng tốt, đừng bỏ.\n"
"Sheets là điểm khởi đầu hoàn hảo. Nó chỉ đụng trần khi bạn lớn lên. Và đụng trần là tin vui, nghĩa là bạn đang lớn.\n"
"Lúc đó, thứ bạn cần không phải con dao to hơn. Mà là một cách tư duy mới về dữ liệu.\n"
"Theo dõi kênh nhé. Mỗi tuần mình gỡ một khái niệm data, gọn trong vài phút, toàn chuyện công sở Việt mình gặp thật.",

"short-outro":
"Google Sheets tuyệt để bắt đầu. Nó chỉ đụng bốn cái trần khi bạn lớn lên: copy tay tốn công, báo cáo trễ, ba người ba số, và một người gánh tất.\n"
"Lúc đó cái bạn thiếu không phải công thức xịn hơn, mà là cách tư duy về dữ liệu. Xem đầy đủ trên YouTube, theo dõi để không bỏ lỡ nhé.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng), caption giữ CHÍNH TẢ GỐC.
# Các mục dưới là PHỎNG ĐOÁN — đọc to bản TTS, nghe chỗ nào lạ thì sửa lại (xem BLOG-TO-VIDEO.md §B3.6).
PRON = {
    "Semantix": "Sơ-men-tích",        # tránh đọc kiểu Anh-Việt lai; chỉnh khi nghe thử
    "Google Sheets": "Gu-gồ Sít",     # tránh đánh vần rời S-h-e-e-t-s
    "TikTok Shop": "Tích-tóc Sốp",
    "Shopee": "Sốp-pi",
    "VLOOKUP": "vê-lúc-úp",            # bật/sửa nếu TTS đánh vần V-L-O-O-K-U-P
}

# ▸ Ghi chú đạo diễn / beat (BLOG-TO-VIDEO.md §B4). gen_audio map sang audio-tag ElevenLabs khi re-voice.
TONE = {
"00": "Trầm, mệt, đồng cảm — dựng cảnh nửa đêm cuối tháng; 'quen không?' buông lửng, mời gọi; chậm rãi như tâm sự.",
"01": "Ấm, chân thành, TÔN VINH — 'sòng phẳng một câu' đọc dứt khoát; đoạn khen Sheets nói thật lòng, không mỉa; 'đừng vẽ rắn thêm chân' nhẹ, hóm.",
"02": "Chậm lại, gợi mở nghịch lý; 'quá vạn năng' nhấn; ẩn dụ con dao Thuỵ Sĩ đọc rõ ràng; 'đừng dùng nó để xây nhà' chốt chắc.",
"03": "Nhịp gõ, liệt kê DỨT KHOÁT — bốn cái trần đọc tách bạch, mỗi trần một hơi; số VN đọc trôi; 'cả công ty mù' hạ giọng, hơi rùng mình.",
"04": "Trầm, vỡ lẽ; 'không cái nào là lỗi của Sheets' nhấn để bắc cầu; 'cái thiếu là cấu trúc, là cách tư duy' đọc chậm, đóng đinh.",
"05": "Brand-light, soft, KHÔNG brochure; 'Sheets vẫn là cánh cửa vào' ấm; 'chuyện của mấy video sau' nhẹ, gác lại — không bán hàng.",
"06": "Ấm áp, biết ơn khán giả cũ; 'mấy mẹo cũ vẫn đúng, đừng bỏ' chân thành; 'đụng trần là tin vui' hóm, khích lệ; mời theo dõi thân mật.",
"short-outro": "Gọn, dứt khoát, hơi tâm sự; bốn cái trần đọc nhanh-tách; 'cách tư duy về dữ liệu' nhấn.",
}
