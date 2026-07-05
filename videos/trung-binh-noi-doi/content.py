# Canonical voiceover per beat — video "Trung bình nói dối".
# Nguồn blog: landing/src/content/blog/trung-binh-noi-doi.md (pt-024, series Tư duy dữ liệu · phần 5).
# Tông: dàn anh sư phạm gỡ rối cho đàn em ở quán cafe Hà Nội — mộc, thẳng, hơi tự trào.
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng.
#   (gen_audio STRIP tag trước khi gửi + trước khi lên caption; xem BLOG-TO-VIDEO.md §B4.)
# CHỈ là kịch bản voiceover: CHƯA render, CHƯA gen audio, chưa có scenes.json.

ORDER = ["00", "01", "02", "03", "04", "05"]

BEATS = {
"00":
"Khách chi trung bình năm trăm nghìn một đơn. Một chị chủ shop mỹ phẩm ở Hà Nội đọc dòng đó trong báo cáo cuối tháng, mừng rơn.\n"
"Chị nghĩ ngay: khách mình sộp thật. Thế là gom hết tiền hàng, nhập một lô combo cao cấp gần sáu trăm nghìn.\n"
"Một tháng sau, lô combo nằm đắp chiếu. Bóc từng đơn ra xem, phần lớn khách chỉ chi quanh một trăm rưỡi nghìn.\n"
"[thoughtful] Con số năm trăm nghìn ấy không sai một ly về số học. Đúng, mà vẫn đánh lừa chị.",

"01":
"Cái năm trăm nghìn đó ở đâu ra? Từ vài đơn sỉ. Mấy chị bán lại, ôm năm mười triệu một lần, kéo lệch cả mặt bằng.\n"
"Đây là chỗ mình hay nhầm. Nói trung bình, ai cũng nghĩ tới mean, tức cộng hết lại rồi chia đều.\n"
"[annoyed] Mà mean thì dễ bị bắt nạt lắm. Chỉ một đơn sỉ mười triệu lọt vào giữa chín đơn một trăm rưỡi, nó phình lên cả triệu ngay.\n"
"Chín trên mười khách chẳng dính gì tới con số đó. Vậy mà nó lại đứng ra đại diện cho cả tệp.",

"02":
"Có một cái la bàn tỉnh hơn, tên là median, hay gọi trung vị.\n"
"Median không quan tâm ông sỉ chi mười triệu hay trăm triệu. Nó chỉ hỏi một câu: xếp tất cả từ thấp lên cao, người đứng chính giữa hàng chi bao nhiêu?\n"
"Nên nó miễn nhiễm với mấy ông ngoại lai. Ở shop trên, median chỉ khoảng một trăm rưỡi nghìn.\n"
"Mean cho bạn biết tổng chia đều. [confident] Median cho bạn biết người ở giữa thật sự thế nào. Dữ liệu mà lệch, median mới là đứa nói thật.",

"03":
"Mẹo dùng được ngay: đừng bao giờ nhìn mean một mình. Xem mean với median cạnh nhau.\n"
"Hai số sát nhau thì dữ liệu cân, mean dùng thoải mái. Lệch xa nhau, kiểu một trăm rưỡi với một triệu, đấy là còi báo động: có đuôi dài, có ông ngoại lai đang kéo.\n"
"Mà trung bình chưa phải kẻ nói dối duy nhất đâu. Còn người anh em của nó: phần trăm trên nền nhỏ.\n"
"[sarcastic] Tháng trước bán một đơn, tháng này bán bốn đơn, báo cáo hét lên: tăng ba trăm phần trăm. Nghe như tên lửa, hoá ra thêm đúng ba cái đơn.",

"04":
"Nên hễ nghe một phần trăm gây sốc, hỏi ngay con số tuyệt đối đứng sau. Tăng bao nhiêu đơn, trên bao nhiêu khách?\n"
"Còn cái bẫy cuối, tinh vi tới mức có hẳn tên riêng: nghịch lý Simpson.\n"
"Bạn chạy hai kênh quảng cáo. Kênh A chốt tốt hơn ở khách mới, lại tốt hơn cả ở khách cũ. Thắng cả hai nhóm.\n"
"[surprised] Vậy mà gộp chung lại, kênh A có thể trông thua. Con số gộp giấu mất tỷ trọng từng nhóm, như trộn hai xô sơn xong bạn chẳng còn biết xô nào màu gì.",

"05":
"[thoughtful] Điểm chung của cả ba cái bẫy: chúng co một câu chuyện nhiều lớp thành một con số phẳng.\n"
"Trung bình không nói dối vì nó sai. Nó nói dối vì nó bỏ bớt.\n"
"Mỗi con số tóm tắt là một bức ảnh chụp đám đông từ trên cao. Bạn thấy hình dạng chung, nhưng không thấy ai đang đứng ở đâu.\n"
"Nên lần tới cầm một con số trung bình, đừng vứt bức ảnh đi. Hỏi thêm một câu thôi: cho tôi xem cả phân phối, cho tôi xem từng người.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng),
# caption/hiển thị giữ CHÍNH TẢ GỐC. Thêm khi AI đọc sai tên riêng/ngoại.
PRON = {
    "median": "mê đi ừn",     # tránh đọc "mê đi an" kiểu tiếng Việt sai nhịp
    "mean": "min",            # đọc như tiếng Anh, không thành "mê an"
    "Simpson": "xim sần",     # nghịch lý Simpson
}
