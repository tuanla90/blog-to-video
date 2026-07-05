# Canonical voiceover per beat — video vpt-026 (blog pt-026 "Leading vs lagging").
# Nguồn: landing/src/content/blog/leading-lagging-indicator.md (Series Tư duy dữ liệu, Phần 6).
# Tông: dân anh sư phạm ngồi quán cà phê Hà Nội gỡ rối cho đàn em. Mộc, thẳng, hơi tự trào.
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng (gen_audio strip trước caption; xem BLOG-TO-VIDEO.md §B4).
# CHƯA render, CHƯA gen audio.

ORDER = ["00", "01", "02", "03", "04", "05"]

BEATS = {
"00":
"[thoughtful] Lái xe bằng gương chiếu hậu. Nghe vô lý đúng không?\n"
"Vậy mà nhiều người đang lái cả công ty y hệt vậy: mở báo cáo doanh thu quý rồi mới quyết.\n"
"Cuối tháng ba, chủ một chuỗi cà phê ở Hà Nội thấy doanh thu quý tụt mười tám phần trăm. Anh họp gấp, cắt khuyến mãi, đổi menu.\n"
"Nhưng con số vừa đập vào mắt anh, là tin của ba tháng trước rồi.",

"01":
"Khách bắt đầu thưa từ giữa tháng một. Ghé ít hơn, ngồi ngắn hơn, đơn nhỏ lại.\n"
"Tín hiệu nằm đó suốt mười tuần. Chỉ là không ai đo nó.\n"
"Tới khi doanh thu quý chốt sổ, cái xe đã trôi qua khúc cua từ lâu.\n"
"Cái bẫy nằm ở chỗ này: doanh thu quý là con số rõ ràng nhất, chắc chắn nhất. Nên ai cũng dán mắt vào. Nhưng lúc nó rõ, thì đã muộn để làm gì.",

"02":
"Mọi chỉ số bạn theo dõi rơi vào một trong hai loại.\n"
"Loại thứ nhất là cái đã rồi. Doanh thu quý, lợi nhuận năm, số khách mất trong tháng. Chính xác, không cãi được, nhưng bạn không lái được nó nữa. Nó là kết quả.\n"
"Loại thứ hai đến trước. Số khách dùng thử tuần này, tỷ lệ khách quay lại trong bảy ngày, số đơn mua lần hai. Ồn hơn, kém chắc hơn, nhưng nó đi trước doanh thu vài tuần đến vài tháng.\n"
"Gương chiếu hậu cho bạn hình sắc nét nhất, tiếc là của đoạn đường đã đi qua. Loại thứ hai là kính chắn gió: mờ hơn, rung hơn, nhưng nó cho bạn thấy khúc cua đang tới.",

"03":
"[sarcastic] Hiểu ra điều này, cám dỗ đầu tiên là dựng ngay một dashboard bốn chục ô, mỗi ô một chỉ số, rồi gọi đó là làm việc theo dữ liệu.\n"
"Đó là cách chắc chắn nhất để không ai nhìn cái nào.\n"
"Một chỉ số báo trước tử tế phải qua ba cửa. Một: nó đổi trước khi doanh thu đổi. Hai: bạn có một việc cụ thể tác động vào nó ngay tuần này. Ba: đo được đều đặn, hằng ngày hoặc hằng tuần, không phải mỗi quý một lần.\n"
"Với quán cà phê, có khi chỉ là số khách quay lại trong mười bốn ngày. Một, nhiều nhất là hai. Phần còn lại là tiếng ồn.",

"04":
"Nhưng một con số, dù báo trước cỡ nào, mà không gắn với hành động thì cũng chỉ là chỉ số đẹp mã.\n"
"Cách buộc nó vào việc: viết ra một quy tắc nếu thì.\n"
"[confident] Nếu tỷ lệ khách quay lại tụt dưới ba mươi phần trăm hai tuần liền, thì tuần sau gọi lại hai mươi khách cũ vừa im lặng.\n"
"Và con số chỉ khiến người ta nhấc máy khi nó thành một câu chuyện. Không phải bảng số khô, mà là: khách đang rơi tuần thứ ba, đây là hai mươi cái tên vừa biến mất.",

"05":
"[thoughtful] Nên lần tới, trước khi mở báo cáo doanh thu quý để quyết một việc gì, hỏi lại mình một câu.\n"
"Con số này cho mình thấy đường phía trước, hay chỉ đang kể lại đoạn mình vừa đi qua?\n"
"Đừng quản lý công ty bằng những con số bạn không còn lái được. Mỗi chỉ số đáng theo dõi phải trả lời được: hôm nay tôi làm gì khác đi?\n"
"Thấy hữu ích thì theo dõi kênh. Mỗi tuần một khái niệm data, gỡ trong vài phút.",
}

# Phát âm cho TTS — caption/màn hình giữ chính tả gốc.
PRON = {
"dashboard": "đát-bo",
"menu": "mê-nu",
}
