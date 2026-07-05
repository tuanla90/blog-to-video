# Canonical voiceover per beat - video vkt-031 (blog kt-031 "Phần trăm vs điểm phần trăm").
# Nguồn: landing/src/content/blog/phan-tram-vs-diem-phan-tram.md - Series Thống kê mô tả, Phần 4.
# Tông: dân anh sư phạm gỡ rối cho đàn em ở quán cà phê. Bối cảnh Hà Nội. Brand-light (1 beat chạm Semantix).
# "\n" = nhịp ngắt nghỉ. [tag] = delivery cue ElevenLabs v3, đặt ngay trước câu cần đổi giọng (gen_audio strip trước caption; xem BLOG-TO-VIDEO.md §B4).
# TRẠNG THÁI: chưa render, chưa gen audio.
# (refined) Thêm beat KINETIC "giảm 50% rồi tăng 50%" (bẫy punchy nhất blog) để cắt Short; hook neo cảnh phòng họp.

ORDER = ["00", "01", "02", "03", "04", "05", "06"]

BEATS = {
"00":
"[thoughtful] Sáng thứ Hai, phòng họp. Bạn khoe tỷ lệ chốt đơn nhích từ mười tám phần trăm lên hai mươi hai phần trăm.\n"
"Bạn viết trong báo cáo: tăng bốn phần trăm. Sếp gật gù, thấy thường.\n"
"[surprised] Nhưng cái nhích đó, viết cho đúng, là tăng hơn hai mươi phần trăm.\n"
"Mười tám lên hai mươi hai, không phải tăng mười phần trăm như nhiều người tưởng. Cùng một con số, hai cách nói, hai số phận.",

"01":
"Vấn đề nằm ở hai thứ khác nhau cùng trốn trong một chữ, phần trăm.\n"
"Cách một: lấy tỷ lệ mới trừ tỷ lệ cũ. Hai mươi hai trừ mười tám, ra bốn. Cái này gọi là điểm phần trăm. Là khoảng cách giữa hai tỷ lệ.\n"
"Cách hai: bốn đó so với cái nền mười tám. Bốn chia mười tám, ra hơn hai mươi phần trăm. Cái này là thay đổi tương đối.\n"
"Cả hai đều đúng. Nhưng khi bạn nói tăng bốn phần trăm, tai người nghe hiểu là nhích tí xíu, trong khi tỷ lệ chốt đã to lên gần một phần tư.",

"02":
"[confident] Nhớ một quy tắc thôi: khi bạn trừ hai tỷ lệ cho nhau, kết quả luôn là điểm phần trăm. Không phải phần trăm.\n"
"Nghe nhỏ nhặt, nhưng sai một chữ này là cả phòng họp hiểu lệch mức độ.\n"
"Viết tăng hai mươi điểm là người ta tưởng nhảy từ mười lên ba mươi. Sai gấp mười lần thực tế.\n"
"[thoughtful] Hồi mình còn ngồi ráp báo cáo bằng Excel, một chữ điểm bị bỏ quên là đủ để sếp duyệt sai cả một khoản ngân sách.",

"03":
"Cho bạn một cái bẫy thử ngay tại quán cà phê. Món này giá một trăm nghìn.\n"
"Xả hàng, giảm năm mươi phần trăm, còn năm mươi nghìn. Hết đợt, bạn tăng lại năm mươi phần trăm. Về đúng một trăm nghìn chứ gì?\n"
"[surprised] Không nhé. Năm mươi nghìn mà tăng năm mươi phần trăm thì chỉ lên bảy mươi lăm nghìn thôi.\n"
"Vì lần giảm bám vào nền một trăm, lần tăng bám vào nền năm mươi. Phần trăm tăng với phần trăm giảm không triệt tiêu nhau, vì chúng đứng trên hai cái nền khác cỡ.",

"04":
"Cái bẫy hay gặp nhất: tăng từ nền nhỏ.\n"
"Tháng trước cửa hàng có một đơn từ Zalo. Tháng này hai đơn. Bạn báo cáo, đơn từ Zalo tăng một trăm phần trăm.\n"
"[sarcastic] Đúng về số học. Nhưng nền chỉ là một, nên con số nghe như phép màu lại đang giấu một sự thật bé tí: bạn tăng đúng một đơn.\n"
"Cách tự vệ chỉ gồm một câu hỏi. Tăng một trăm phần trăm, nhưng từ bao nhiêu lên bao nhiêu? Người báo cáo mà né con số gốc, gần như chắc chắn cái nền đang bé.",

"05":
"Còn một bẫy nữa, âm thầm hơn: bình quân các phần trăm.\n"
"Shop bạn bán hai kênh. Tỷ lệ hoàn Shopee bốn phần trăm, TikTok Shop mười phần trăm. Trung bình toàn shop là bảy phần trăm chứ gì? Sai.\n"
"Giả sử Shopee một nghìn đơn, TikTok Shop chỉ một trăm đơn. Tỷ lệ hoàn thật là bốn phẩy năm phần trăm, không phải bảy.\n"
"Vì mỗi tỷ lệ đứng trên một cái nền to nhỏ khác nhau. Chia đều là coi kênh nhỏ nặng ngang kênh lớn. Muốn gộp đúng, phải đánh trọng số theo nền.",

"06":
"Nói cho gọn: một con số phần trăm không bao giờ tự đứng một mình. Nó luôn dính vào một cái nền.\n"
"Khi cái nền bị giấu đi, con số thành công cụ đánh lừa hoàn hảo.\n"
"Nên liều vắc-xin đơn giản nhất là ghi luôn cả hai con số gốc. Từ mười tám lên hai mươi hai, rồi mới nói thêm cộng bốn điểm hay cộng hai mươi phần trăm.\n"
"Lần tới đọc một con số phần trăm trong báo cáo, hỏi luôn: nó đang đứng trên cái nền nào? Trả lời được câu đó, bạn đã đi trước phần lớn người đọc số. Thấy hữu ích thì theo dõi kênh nhé.",
}

PRON = {
"Semantix": "Xê-man-tít",
"Shopee": "Sốp-pi",
"TikTok Shop": "Tíc-tóc Sốp",
"Zalo": "Za-lô",
"Excel": "Ếch-xeo",
}
