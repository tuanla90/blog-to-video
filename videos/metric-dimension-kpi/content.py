# Canonical voiceover per beat — video "Metric / Dimension / KPI".
# Nguồn blog: landing/src/content/blog/metric-dimension-kpi.md. Tông: quán cafe, dàn anh gỡ rối cho đàn em.
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3 (giữ cho audio v3, strip khỏi caption).

ORDER = ["00", "01", "02", "03", "04", "05", "06"]

BEATS = {
"00":
"Sáng thứ Hai, phòng họp căng như dây đàn. Sếp gõ tay xuống bàn, hỏi đúng một câu: chốt lại, doanh thu tháng này bao nhiêu?\n"
"Anh trưởng phòng Sales tự tin đáp: dạ, bốn phẩy hai tỷ. Chị kế toán trưởng nhíu mày, nhìn lại file: đâu sếp, có ba phẩy tám tỷ thôi.\n"
"Cùng một công ty, cùng một tháng, mà lòi ra hai con số lệch nhau gần nửa tỷ. Sếp cáu: [annoyed] thế tóm lại đứa nào tính sai?\n"
"[thoughtful] Mà buồn cười là, chẳng ai tính sai cả.",

"01":
"Lý do hai báo cáo lệch nhau, gần như không bao giờ là cộng sai. Mà là hai người đang gọi hai thứ khác nhau, bằng đúng một cái tên: doanh thu.\n"
"Gỡ được nó chỉ cần hiểu rõ ba từ: Metric, Dimension, và KPI. Mọi sai lầm thường đều đến từ việc không làm rõ được ba từ này.\n"
"Metric là con số bạn đo được. Dimension là cái trục để bạn cắt con số đó ra theo từng nhóm, hoặc lọc lấy đúng phần cần nhìn, ví dụ theo thời gian, theo kênh bán, hay theo vùng miền. Còn KPI là chính con số đó, nhưng gắn thêm một cái đích phải chạm tới.",

"02":
"Metric, hiểu đơn giản, là cái thứ bạn đong đếm được thành số. Doanh thu, số đơn hàng, lượng khách mới. Hỏi bao nhiêu là phải ốp ngay được một con số.\n"
"Nghe thì dễ, đúng không? Nhưng thực tế thì không đơn giản như vậy. Thử ra vỗ vai năm người trong công ty, hỏi doanh thu tính thế nào mà xem. [annoyed] Mỗi người một phách.\n"
"Người bảo đơn chốt xong là tính. Người cãi phải thu được tiền về tài khoản mới tính chứ. Rồi có trừ đơn hoàn không, có cộng tiền ship không?\n"
"Doanh thu của anh Sales là tiền chốt đơn, cộng cả ship, chưa trừ hoàn, nên nó to, ra bốn phẩy hai tỷ.\n"
"Còn của chị kế toán là tiền thực tế ting ting về tài khoản, ba phẩy tám tỷ.\n"
"Chẳng có file nào sai cả. Chỉ là hai người đang đo hai thứ khác nhau, mà gọi chung một cái tên.",

"03":
"Giờ giả sử hai người cãi xong, chốt được con số ba phẩy tám tỷ. Tưởng xong chuyện rồi chứ gì? Chưa đâu.\n"
"Đây mới là cái bẫy tinh vi. Cùng một đơn hàng y hệt, định nghĩa giống hệt nhau, nhưng bạn ghi nó vào tháng nào?\n"
"Phòng kinh doanh tính theo ngày chốt đơn, nó rơi vào tháng Năm. Kế toán tính theo ngày khách trả tiền, nó nhảy sang tháng Sáu. Còn vận hành tính theo ngày giao xong, lại lùi tận tháng Bảy.\n"
"[surprised] Cùng một đơn mà ba phòng đẩy nó sang ba tháng khác nhau. Cái cột ngày bạn chọn để tính, đấy chính là một Dimension, nói cho đủ là Dimension thời gian.\n"
"Ngày chốt đơn, ngày thu tiền, ngày giao hàng, mỗi cái là một trục thời gian riêng. Cùng một đơn hàng, nhưng mỗi phòng đang neo vào một Dimension khác nhau, thế là con số doanh thu cả tháng âm thầm đổi theo.",

"04":
"Cuối cùng là KPI. [sarcastic] Chỗ này nhiều công ty hay tự lừa mình lắm. Cứ số nào đo được cũng gọi là KPI, mà không phải vậy đâu.\n"
"Doanh thu ba phẩy tám tỷ chỉ là một metric trần trụi thôi. Nó chỉ thành KPI khi bạn gắn cho nó một cái đích để vươn tới.\n"
"Kiểu mục tiêu tháng này bốn tỷ, giờ được ba phẩy tám, tức là đạt chín lăm phần trăm rồi, cố lên anh em. Đó mới là KPI, con số lúc này có thước để biết mình đang tốt hay tệ.\n"
"Nhìn cái màn hình dashboard nhồi ba bốn chục số xanh đỏ rồi gọi tất cả là KPI, nhân viên nhìn vào chỉ tẩu hỏa nhập ma.\n"
"Nhớ nhé, khi cái gì cũng then chốt thì rốt cuộc chẳng có gì là then chốt cả.",

"05":
"Giờ quay lại phòng họp sáng thứ Hai, soi bằng đúng ba từ này là ra hết.\n"
"Metric doanh thu thì chưa ai thống nhất, gồm ship hay không mỗi người hiểu một kiểu. Dimension thì mỗi phòng neo vào một cột ngày khác nhau, nên tháng cứ lệch. Còn KPI thì vô định, chẳng ai chốt mục tiêu, nên chả biết con số đấy là tốt hay tệ.\n"
"Ba thứ lẫn lộn với nhau, thế là thành mười lăm phút cãi vã. Trong khi đáng ra chỉ cần hỏi đúng một câu: mình đang nói metric nào, cắt theo dimension nào, so với KPI nào?",

"06":
"Lần tới khi hai báo cáo lệch nhau, đừng vội tìm lỗi cộng trừ.\n"
"Hỏi trước: metric nào, dimension nào, KPI nào? Chín trên mười lần, sai số tan biến ngay khi ba từ này được gọi đúng tên.\n"
"Mà tiện đây hỏi thật, ở công ty bạn, phòng Sales với kế toán có hay cãi nhau vì con số doanh thu không? Kể mình nghe ở phần bình luận nhé.\n"
"Còn nếu thấy video hữu ích, đừng quên theo dõi kênh. Mỗi tuần một khái niệm data, gỡ gọn trong vài phút.",

"short-outro":
"Câu trả lời nằm gọn trong ba từ: Metric, Dimension, và KPI.\n"
"Xem đầy đủ trên YouTube, và theo dõi để không bỏ lỡ.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS, caption giữ CHÍNH TẢ GỐC.
PRON = {}
