# Canonical voiceover text per beat — shared by gen_audio.py (Vbee) and align.py.
# "\n" = a deliberate ~1.25s dramatic pause (Vbee honors newline). Periods = ~0.75s.
# Keep this the SINGLE source of truth so audio and caption timing never drift apart.

ORDER = ["00", "01", "02", "03", "04", "05", "07"]

BEATS = {
"00":
"Sáng thứ Hai. Phòng họp. Sếp hỏi một câu: Doanh thu tháng này bao nhiêu?\n"
"Anh Sales đáp: bốn phẩy hai tỷ. Chị Kế toán: ba phẩy tám tỷ. Cùng một công ty, cùng một tháng. Hai con số.\n"
"Sếp gõ bàn: ai sai?\n"
"Không ai sai cả.",

"01":
"Lý do hai báo cáo lệch nhau, gần như không bao giờ là cộng sai. Mà là ba người đang gọi ba thứ khác nhau, bằng đúng một từ.\n"
"Gỡ được nó chỉ cần ba từ vựng: Metric, Dimension, và KPI.\n"
"Hình dung dữ liệu như một khối Rubik. Metric là con số trên mặt khối. Dimension là cách bạn xoay khối để nhìn từ góc khác. Còn KPI thì không nằm trên khối. Nó là cái đích con số phải chạm tới.",

"02":
"Metric là một đại lượng đo được, gói trong một con số. Doanh thu. Số đơn. Số khách mới.\n"
"Nghe đơn giản. Nhưng cái bẫy nằm ngay đây. Một metric chỉ rõ ràng khi định nghĩa của nó rõ ràng. Doanh thu, thử hỏi năm người: Tính theo đơn đã chốt, hay đã thu tiền? Có trừ đơn hoàn không? Có gồm phí ship không?\n"
"Anh Sales: đã chốt, gồm ship, chưa trừ hoàn, bốn phẩy hai tỷ. Chị Kế toán: đã thu, trừ hoàn, không ship, ba phẩy tám tỷ. Không phải sai số. Hai định nghĩa khác nhau, chung một cái tên.\n"
"Muốn hết cãi? Chốt một định nghĩa. Cả công ty đồng ý: doanh thu là đã thu, đã trừ hoàn. Ba phẩy tám tỷ.",

"03":
"Tưởng chốt định nghĩa là xong? Chưa.\n"
"Cùng ba phẩy tám đó, nhưng tháng Sáu tính theo ngày nào? Phòng kinh doanh lấy ngày tạo đơn. Kế toán lấy ngày thanh toán. Vận hành lấy ngày giao xong. Cùng một đơn, rơi vào ba tháng khác nhau. Con số tháng Sáu lại lệch, dù định nghĩa y hệt.\n"
"Cái cột ngày bạn chọn, đó cũng là một dimension. Và nó đổi cả con số.\n"
"Chốt luôn cột ngày. Giờ ba phẩy tám mới đứng yên. Lúc này dimension thành công cụ: cắt theo kênh. Shopee một phẩy chín. TikTok Shop một phẩy tư. KiotViet năm trăm triệu. Một con số tổng thì vô dụng. Cắt ra mới thành câu chuyện.",

"04":
"Giờ cả công ty cùng một con số: ba phẩy tám tỷ. Hết cãi.\n"
"Nhưng đo đúng rồi, để làm gì? Câu doanh thu bao nhiêu chỉ là bề nổi. Điều sếp thật sự muốn biết: ba phẩy tám, là tốt hay chưa?\n"
"Một con số đứng một mình thì không có tốt hay xấu. Nó chỉ có nghĩa khi đặt cạnh một mục tiêu. Đó là lúc metric trở thành KPI.\n"
"KPI không phải con số bạn đo, mà con số bạn phải đạt. Mục tiêu tháng: bốn tỷ. Hiện ba phẩy tám. Đạt chín lăm phần trăm. Giờ con số mới biết nói: gần tới rồi.\n"
"Một công ty đo hàng trăm metric, nhưng chỉ nên chọn năm tới mười KPI. Khi mọi thứ đều then chốt, thì không gì là then chốt cả.",

"05":
"Quay lại phòng họp sáng thứ Hai, đọc lại bằng đúng ba từ.\n"
"Một: metric doanh thu chưa có một định nghĩa chung. Gồm ship hay không, mỗi người một kiểu.\n"
"Hai: cùng định nghĩa, nhưng mỗi phòng neo vào một cột ngày khác, nên tháng vẫn lệch.\n"
"Ba: chẳng ai chốt mục tiêu, nên không biết con số là tốt hay chưa.\n"
"Ba thứ lẫn lộn, gộp thành mười lăm phút cãi nhau. Đáng ra chỉ cần một câu: Mình đang nói metric nào, cắt theo dimension nào, so với KPI nào?",

"07":
"Lần tới khi hai báo cáo lệch nhau, đừng vội tìm lỗi cộng trừ.\n"
"Hỏi trước: metric nào, dimension nào, KPI nào? Chín trên mười lần, sai số tan biến ngay khi ba từ này được gọi đúng tên.\n"
"Nếu thấy hữu ích, theo dõi kênh. Mỗi tuần một khái niệm data, gỡ trong vài phút.",

"short-outro":
"Câu trả lời nằm gọn trong ba từ: Metric, Dimension, và KPI.\n"
"Xem đầy đủ trên YouTube, và theo dõi để không bỏ lỡ.",
}
