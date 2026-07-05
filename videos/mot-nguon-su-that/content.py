# Canonical voiceover per beat — video vkt-009 (blog kt-009 "Một nguồn sự thật").
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3 (giữ cho audio v3, strip khỏi caption).
# Single source of truth: audio + caption timing không lệch nhau.

ORDER = ["00", "01", "02", "03", "04", "05", "06"]

BEATS = {
"00":
"[thoughtful] Sáng thứ Hai, trong phòng họp, sếp hỏi đúng một câu: doanh thu tháng vừa rồi bao nhiêu?\n"
"Sales mở file ra, bốn phẩy hai tỷ.\n"
"Finance bảo ba phẩy tám.\n"
"Marketing chiếu dashboard, bốn phẩy năm.\n"
"[surprised] Ba con số cho cùng một công ty. Mười lăm phút sau, cuộc họp thành phiên tòa xử xem đứa nào sai.\n"
"Mà thật ra chẳng ai sai cả. Cái phản xạ gom hết mọi thứ về một chỗ mới là hiểu lầm đắt nhất.",

"01":
"Hiểu lầm đó nằm ngay ở cái tên. Nói tới một nguồn sự thật, ai cũng tưởng nó là một cái kho: một database, một file Excel master.\n"
"Thật ra không phải. Nó không nằm ở chỗ dữ liệu được lưu, mà ở chỗ dữ liệu được định nghĩa.\n"
"Giống thư viện với cuốn từ điển vậy. Nhồi cả triệu cuốn sách vào một thư viện, nhưng mỗi người hiểu chữ doanh thu một kiểu, thì bạn vẫn có năm sự thật trong cùng một tòa nhà.\n"
"Sự thật nằm ở cuốn từ điển treo ngoài cửa kìa. Đó là tầng định nghĩa, chứ không phải cái kho lưu trữ.",

"02":
"Công ty bỏ vài trăm triệu dựng kho dữ liệu, kéo Sales, Finance, Marketing về một chỗ. Thế là yên tâm, một nguồn rồi.\n"
"Sáu tháng sau, giao ban vẫn ba con số.\n"
"Vì mỗi phòng vẫn hỏi theo định nghĩa riêng. Cùng một kho, cùng một bảng đơn hàng, mà Sales đếm đơn đã chốt, còn Finance đếm đơn đã thu rồi trừ hoàn.\n"
"[hesitant] Hai câu trả lời khác nhau, cả hai đều chạy đúng, không một dòng lỗi. Cái kho chỉ làm dữ liệu nằm gần nhau, chứ không ép ai hiểu giống nhau. Database không sửa được cái đầu.",

"03":
"Đáng sợ nhất là chẳng ai ngồi quyết định tạo ra năm nguồn cả. Chúng tự xuất hiện theo nhu cầu của phòng ban.\n"
"Sales cần báo cáo gấp thì dựng file theo cách hợp lý với mình. Finance làm thuế thì lấy số đã thu thật. Marketing đo quảng cáo thì gán theo đơn cuối khách bấm. Kho tính theo hàng đã xuất. Kế hoạch thì gộp cả đơn đặt trước.\n"
"Năm phòng, năm file, năm định nghĩa doanh thu. Chẳng có lỗi cú pháp, chẳng có cảnh báo nào, chúng cứ lệch nhau lặng lẽ cho tới đúng sáng thứ Hai.\n"
"[thoughtful] Tôi từng ở đúng cái cảnh đó. Hồi còn ngồi ráp báo cáo bằng Excel, tôi kẹt giữa đúng ba người ba số. Mất gần cả buổi mới hiểu ra: chữ doanh thu chưa từng được định nghĩa lấy một lần. Không ai ẩu, cũng không ai gian.",

"04":
"Đã vậy thì gốc vấn đề nằm ở định nghĩa, nên lời giải cũng phải nằm ở tầng định nghĩa.\n"
"Một nguồn sự thật thực ra là một thỏa thuận: viết ra một lần, ở một chỗ, và mọi công cụ làm báo cáo đều phải vào đó lấy công thức đem đi tính.\n"
"Nó chốt dứt khoát mấy câu mà giờ mỗi phòng đang tự trả lời một kiểu: doanh thu có gồm đơn chưa giao không, có trừ đơn hoàn không, có trừ chiết khấu không.\n"
"Đã chốt một câu trả lời chung, thì Sales hay Finance hay Marketing mở báo cáo lên, con số bắt buộc phải ra giống nhau. [confident] Định nghĩa một lần, rồi dùng mãi.",

"05":
"Tầng định nghĩa đó có tên: Semantic Layer, cuốn từ điển nghiệp vụ sống của tổ chức.\n"
"Bạn định nghĩa doanh thu, lợi nhuận sau phí, khách quay lại, mỗi thứ một lần, kèm đúng quy tắc gồm gì trừ gì. Từ đó, báo cáo nào nối vào nó, chạy trên Looker Studio hay Power BI, đều hỏi qua cùng một định nghĩa gốc rồi mới chạm vào dữ liệu.\n"
"Cần đổi định nghĩa thì sửa đúng một chỗ, các báo cáo nối vào đều cập nhật theo. Không còn cảnh mỗi phòng tự sửa một kiểu.",

"06":
"Lần tới khi hai báo cáo lệch nhau, đừng vội đi tìm lỗi cộng trừ.\n"
"Hỏi một câu thôi: chữ doanh thu trong công ty mình có đúng một định nghĩa, hay năm?\n"
"Trả lời được câu đó, bạn biết mình đang có một nguồn sự thật, hay năm nguồn đang âm thầm chờ va vào nhau.\n"
"Thấy hữu ích thì theo dõi kênh nhé, mỗi tuần mình gỡ một khái niệm data trong vài phút.",

"short-outro":
"Một nguồn sự thật không phải cái kho, mà là một định nghĩa chung.\n"
"Xem đầy đủ trên YouTube, và theo dõi để không bỏ lỡ.",
}
