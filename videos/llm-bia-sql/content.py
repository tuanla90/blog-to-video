# Canonical voiceover per beat — video khái niệm, slug: llm-bia-sql.
# Nguồn blog: landing/src/content/blog/llm-bia-sql.md ("Ảo giác AI: vì sao LLM bịa ra SQL gọi cột không tồn tại").
# Tông: "đàn anh sư phạm giảng cho đàn em ở quán cà phê" — mộc, thẳng, hơi tự trào (xem STYLE.md §TÔNG GIỌNG).
#   Thesis: ảo giác không phải lỗi model dở, mà là bản chất LLM đoán token. Cách chặn không phải tìm AI
#   thông minh hơn, mà THU HẸP không gian để AI hết chỗ bịa. Bối cảnh ví dụ dùng Hà Nội, KHÔNG nêu tên
#   công ty thật (dùng "một ngân hàng"). Brand-light: chỉ 1 beat chạm Semantix, định vị bằng phủ định.
# "context"/định nghĩa nghiệp vụ là lõi. "Semantix" giữ nguyên chính tả trên màn hình.
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng (gen_audio strip trước caption; xem BLOG-TO-VIDEO.md §B4).
# Short = beat "00" (hook "AI bịa cả cột") + "short-outro".
# TRẠNG THÁI: chưa render, chưa gen audio — chỉ script voiceover để duyệt trong Studio trước.

ORDER = ["00", "01", "02", "03", "04", "05"]

BEATS = {
"00":
"Bạn hỏi AI: giá trị vòng đời trung bình của khách VIP là bao nhiêu?\n"
"Vài giây sau nó trả về một câu SQL gọn gàng, thụt lề chuẩn, đúng cú pháp từng dấu phẩy.\n"
"[surprised] Chỉ có một vấn đề nhỏ: cái cột nó gọi tới, trong database của bạn không hề tồn tại.\n"
"AI vừa bịa ra một cái cột. Rất tự tin. Không một dòng cảnh báo là tôi không chắc.",

"01":
"Phản xạ đầu tiên của bạn thường là: chắc model còn yếu, đổi con xịn hơn là xong.\n"
"[confident] Nhưng đây không phải lỗi vặt của một model dở, mà là bản chất của cách mọi LLM hoạt động.\n"
"LLM không tra database của bạn. Nó đoán chữ tiếp theo nào nghe hợp lý nhất, dựa trên hàng tỷ dòng nó từng đọc.\n"
"Nó thấy trên mạng cả nghìn cái database có cột tên như thế. Nên với nó, viết ra là hợp lý nhất, bất kể kho của bạn có hay không.",

"02":
"[thoughtful] Mình hình dung AI như một nhân viên mới cực kỳ tự tin, ngày đầu đi làm mà không ai đưa sơ đồ kho.\n"
"Bạn bảo: lấy giúp anh số ở kệ B7. Cậu chưa từng thấy kho của bạn, nhưng kho nào cậu từng làm cũng có kệ B7.\n"
"Thế là cậu gật đầu chắc nịch, đi thẳng tới chỗ lẽ ra là B7, bê về một thùng hàng. Trông rất chuyên nghiệp.\n"
"Chỉ là kho của bạn đánh số tới B5 là hết. Cậu lấp khoảng trống bằng thứ nghe hợp lý, không phải thứ có thật.",

"03":
"Mà ảo giác kiểu bịa cột thì còn dễ, chạy lên là văng lỗi ngay.\n"
"[annoyed] Đáng sợ là mấy kiểu chạy ngon mà số vẫn sai. Nối nhầm hai bảng, mỗi đơn bị đếm lặp, doanh thu thổi phồng mà không ai hay.\n"
"Hay đắt nhất: đoán định nghĩa nghiệp vụ. Bạn hỏi doanh thu tháng này. Trừ chiết khấu chưa? Tính đơn hoàn không? AI không biết, nó đoán.\n"
"Lần này lấy số gộp, lần sau trừ chiết khấu. Hai con số lệch nhau mười lăm phần trăm, cả hai đều đúng cú pháp. Bạn không cách nào biết lần nào theo định nghĩa thật của mình.",

"04":
"[thoughtful] Mình gặp đúng cái bẫy này mỗi ngày ở một ngân hàng mình đang làm.\n"
"Nghiệp vụ phức tạp tới mức chữ doanh thu không có một nghĩa. Nó tách theo sản phẩm, theo thời điểm ghi nhận, theo đơn đã tất toán hay chưa.\n"
"Gắn thẳng LLM vào kho dữ liệu mà không có lớp neo định nghĩa, nó sẽ đoán bừa một nhánh rồi trả về con số trông rất dứt khoát.\n"
"Nên cách chặn không phải đi tìm một AI thông minh hơn. Model to hơn vẫn đoán, nó chỉ bịa mượt hơn thôi, khó phát hiện hơn.",

"05":
"[confident] Cách làm ngược lại: đừng làm AI giỏi hơn, mà thu hẹp không gian nó được phép xoay xở, tới khi gần như hết chỗ bịa.\n"
"Đưa cho nó đúng danh sách bảng cột có thật. Khai báo sẵn quan hệ giữa các bảng. Định nghĩa doanh thu một lần, chuẩn, buộc nó phải dùng. Không chắc thì dừng lại hỏi, đừng đoán.\n"
"Cái nhân viên mới ở đầu không đáng tin hơn vì được tuyển người thông minh hơn. Cậu đáng tin vì cuối cùng có ai đưa cho cậu sơ đồ kho thật.\n"
"Nên lần tới ai hứa gắn AI thẳng vào database là hỏi gì cũng trả lời được, bạn hỏi lại một câu thôi: thế khi nó không chắc, nó đoán hay nó dừng lại?",

"short-outro":
"[confident] AI viết SQL đẹp long lanh, nhưng gọi tới một cột chẳng hề tồn tại. Ảo giác không phải lỗi model dở, nó là bản chất của máy đoán chữ.\n"
"Cách chặn không phải AI thông minh hơn, mà thu hẹp chỗ cho nó bịa. Xem đầy đủ trên YouTube, theo dõi để không bỏ lỡ nhé.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng), caption giữ CHÍNH TẢ GỐC.
# Các mục dưới là PHỎNG ĐOÁN — đọc to bản TTS, nghe chỗ nào lạ thì sửa lại (xem BLOG-TO-VIDEO.md §B3.6).
PRON = {
    "Semantix": "Sơ-men-tích",   # tránh đọc kiểu Anh-Việt lai; chỉnh khi nghe thử
    "SQL": "ét-quèo",            # tránh TTS đánh vần S-Q-L rời rạc; tắt nếu nghe đã ổn
    "LLM": "eo-eo-em",           # tránh đánh vần rời; chỉnh nếu nghe lạ
    "VIP": "víp",                # đọc liền, tránh đánh vần V-I-P
    "database": "đây-ta-bây",    # tắt nếu TTS đọc kiểu Anh đã ổn
    "B7": "bê bảy",              # đọc rõ mã kệ
    "B5": "bê năm",
}
