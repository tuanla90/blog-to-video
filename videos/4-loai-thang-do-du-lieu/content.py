# Canonical voiceover per beat - video vkt-041 (blog kt-041 "4 loại thang đo dữ liệu").
# Nguồn: landing/src/content/blog/4-loai-thang-do-du-lieu.md - tông "quán cafe / dàn anh gỡ rối cho đàn em" (xem STYLE.md).
# CHỈ script voiceover - chưa render, chưa gen audio. "\n" = nhịp ngắt nghỉ.
# [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng (gen_audio strip trước caption; xem BLOG-TO-VIDEO.md §B4).
# Giọng: Lê Anh Tuấn, ngôi "mình/bạn".

ORDER = ["00", "01", "02", "03", "04", "05"]

BEATS = {
"00":
"[thoughtful] Đừng tính trung bình mã sản phẩm. Nghe thì hiển nhiên, đúng không?\n"
"Vậy thử cái này với mình. Bôi đen cột mức hài lòng trong Excel, toàn số một tới năm, gõ AVERAGE. Máy nhả ra ba phẩy bốn sao. Đẹp, khoa học, đưa thẳng vào báo cáo.\n"
"Giờ bôi cột mã đơn hàng, cũng gõ AVERAGE. Máy lại ra một số đẹp không kém: mười nghìn tám trăm bốn bảy. Mã đơn trung bình. Bạn thấy ngay nó vô nghĩa.\n"
"Nhưng với máy, hai phép tính y hệt nhau. Nó không biết cái nào có nghĩa. Nó chỉ thấy số, mà số thì cộng chia được tuốt.",

"01":
"[thoughtful] Đây là cái bẫy ít người để ý: máy luôn tính được, kể cả khi phép tính đó vô nghĩa.\n"
"Chuyện ba phẩy bốn sao có đáng tin không, không nằm ở con số. Nó nằm ở chỗ dữ liệu ấy thuộc loại nào.\n"
"Mọi con số trong bảng của bạn đều rơi vào một trong bốn thang đo. Bốn cái này xếp thành một cái thang, leo lên mỗi nấc bạn được làm thêm một phép tính.",

"02":
"Nấc thấp nhất là định danh. Con số chỉ đóng vai cái tên.\n"
"Mã sản phẩm, kênh bán, mã tỉnh, nhóm máu. Mã đơn tuy trông như số, nhưng nó là cái nhãn tình cờ làm bằng chữ số. Cộng hai mã đơn cũng vô nghĩa như cộng hai số điện thoại.\n"
"Với loại này bạn chỉ được đếm mỗi nhóm bao nhiêu, và tìm cái xuất hiện nhiều nhất. Trung bình thì không bao giờ.",

"03":
"Lên một nấc là thứ bậc. [surprised] Và đây đúng chỗ ba phẩy bốn sao bị lật tẩy.\n"
"Sao hài lòng một tới năm, hạng thành viên đồng bạc vàng kim cương, đều có thứ tự rõ ràng. Năm sao thì hơn bốn sao, cái đó ai cũng biết.\n"
"Nhưng khoảng cách giữa các bậc không đều nhau. Từ rất ghét lên ghét, trong đầu ông khách, không bằng từ hài lòng lên rất hài lòng đâu.\n"
"Vậy mà cộng hết lại rồi chia, là bạn đang coi mấy bước dài ngắn khác nhau như thể bằng nhau. [confident] Sai từ gốc. Loại này đo bằng trung vị, tức giá trị đứng giữa, chứ không phải trung bình.",

"04":
"Nấc ba là khoảng. Khoảng cách đã đều thật, nhưng số không chỉ là quy ước.\n"
"Nhiệt độ chẳng hạn. Từ hai mươi lên hai mốt độ đúng bằng từ ba mươi lên ba mốt. Nhưng bốn mươi độ không nóng gấp đôi hai mươi độ, vì không có gốc không thật để mà so gấp mấy lần.\n"
"Nấc trên cùng mới là tỉ lệ: có gốc không thật. Doanh thu không đồng nghĩa là không bán được gì. Nên bốn tỷ đúng là gấp đôi hai tỷ. Loại này làm gì cũng được. [confident] Và may thay, đa số số bạn cần ra quyết định nằm ở đây.",

"05":
"Con số trong bảng không tự khai nó thuộc thang nào. Còn máy thì sẵn sàng cộng chia bất cứ thứ gì trông như số.\n"
"Nên lần tới, trước khi bấm AVERAGE, đừng vội hỏi máy tính ra bao nhiêu. Hỏi trước đã: cột này là thang đo gì, và phép tính mình sắp làm có thật sự được phép không.\n"
"[confident] Chỉ cần trả lời được câu đó thôi, bạn đã đứng trên phần lớn người bôi một cột rồi bấm trung bình mà không chớp mắt.",
}

# Phát âm cho TTS: gen_audio THAY các từ này trong text gửi TTS (AI đọc đúng),
# nhưng caption/hiển thị giữ CHÍNH TẢ GỐC. Thêm khi AI đọc sai tên riêng/ngoại.
PRON = {
    "AVERAGE": "ơ vơ rịt",   # tránh đọc rời từng chữ cái
    "Excel": "ếch xeo",
}
