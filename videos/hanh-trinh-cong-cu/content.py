# Canonical voiceover per beat — video E2 "Hành trình công cụ" (cầu nối · gắn kết).
# Slug: hanh-trinh-cong-cu. Tông: "tâm sự lão làng ở quán cafe" (xem STYLE.md §TÔNG GIỌNG).
# Port & rút từ series blog 4 phần "Từ Excel đến Semantix":
#   hanh-trinh-thoi-excel / hanh-trinh-power-bi-data-studio /
#   hanh-trinh-superset-metabase / hanh-trinh-tu-xay-semantix.
# VAI TRÒ (PLAN-VIDEO-CAU-NOI E2): GẮN KẾT lại sub cũ thời Google Sheets.
#   Tôn vinh TỪNG công cụ — KHÔNG phủ định; mỗi cái có một cái "trần".
#   Cái chung nằm TRÊN mọi công cụ = tư duy / ngữ cảnh. Brand-light: tối đa 1 beat chạm Semantix.
# "context" -> "ngữ cảnh"; "Semantix" giữ nguyên. Mọi con số minh hoạ đều nói rõ là VÍ DỤ.
# "\n" = nhịp ngắt nghỉ dramatic. Short = beat "00" (hook punchy) + "short-outro".

ORDER = ["00", "01", "02", "03", "04", "05", "06", "07"]

BEATS = {
# --- HOOK: 10 năm, một chồng công cụ. Beat punchy, tự đứng được làm Short. ---
"00":
"Mười năm làm dữ liệu, mình đi qua đủ thứ công cụ.\n"
"Excel. Google Sheets. Power BI. Data Studio. Superset. Metabase. Nocobase.\n"
"[thoughtful] Mỗi cái, mình từng tin là điểm dừng. Mỗi cái, mình đều đụng một bức tường.\n"
"Và cái thứ gỡ được mọi bức tường đó... lại chẳng phải một công cụ nào.",

# --- EXCEL: người thầy đầu tiên + cái trần ---
"01":
"Bắt đầu là Excel. Mình mê nó thật lòng. Ai cũng mở được, gõ gì cũng được, hỏi gì là có ngay.\n"
"Excel là nơi mình học tư duy dữ liệu. Tới giờ vẫn biết ơn.\n"
"Nhưng tới ngày cái file phình lên vài chục nghìn dòng... nó treo máy. Gõ một ô, chờ năm giây.\n"
"Rồi ba người đọc ra ba con số doanh thu. Không ai sai. Chỉ là chữ doanh thu... chưa ai định nghĩa một lần.",

# --- POWER BI / DATA STUDIO: dashboard đẹp nhưng cứng ---
"02":
"Thế là mình lên Power BI, lên Data Studio. Lần đầu thấy số của mình thành dashboard tự cập nhật, mình mừng phát khóc.\n"
"Biểu đồ bấm vào lọc được. Sáng ra số đã mới. Gửi một cái link là cả công ty xem.\n"
"Mình tưởng xong. Cho tới khi sếp hỏi một câu... mà dashboard chưa dựng sẵn.\n"
"\"Để em về dựng thêm.\" Và mình nhận ra: nút cổ chai không mất đi. Nó dời từ cái file... sang chính mình.",

# --- SUPERSET / METABASE: tự chủ và cái giá ---
"03":
"Mình tìm tới mã nguồn mở. Superset, Metabase. Cài mười lăm phút, license không mất đồng nào, dữ liệu nằm trên máy của mình.\n"
"Cảm giác tự chủ đó có thật, và mình quý tới giờ.\n"
"Rồi tháng thứ ba, một đêm trước ngày họp, con server hết dung lượng. Mình ngồi dọn log tới một giờ sáng.\n"
"Công cụ thì miễn phí. Đêm đó của mình thì không. Chi phí không biến mất đâu... nó chỉ dời chỗ.",

# --- NOCOBASE / job tư vấn: vẫn một cái trần ---
"04":
"Song song, mình đi tư vấn chuyển đổi số cho nhiều doanh nghiệp. Từ Google Sheets, qua AppSheet, giờ là Nocobase.\n"
"Tự tay dựng cơ sở dữ liệu cho xưởng may, cho phòng khám, cho công ty xuất nhập khẩu.\n"
"Mỗi nghề một cách tổ chức số liệu khác nhau. Cái đó dạy mình một điều mà không phần mềm nào dạy được.\n"
"[thoughtful] Công cụ nào cũng mạnh. Nhưng cái trần... lúc nào cũng giống nhau lạ kỳ.",

# --- AHA: cái trần chung = thiếu ngữ cảnh, không phải thiếu tính năng ---
"05":
"Đứng lùi lại nhìn cả mười năm, mình mới gọi tên được cái trần đó.\n"
"Không công cụ nào thua vì yếu. Excel, Power BI, Superset... cái nào cũng giỏi.\n"
"Cái chúng thiếu nằm cao hơn mọi công cụ: bạn đang đo cái gì, và đo trong ngữ cảnh nào.\n"
"Doanh thu của bạn là chốt đơn, hay đã thu tiền về? Có gồm phí ship chưa? Cái đó... không nằm trong phần mềm. Nó nằm trong đầu người hiểu nghề.",

# --- BRAND-LIGHT: 1 beat chạm Semantix, soft, định vị bằng hội tụ ---
"06":
"Hiểu ra điều đó, mình ngồi xuống tự xây thứ mình đang làm, Semantix.\n"
"Không phải để chê công cụ cũ. Mà để đứng trên vai chúng: giữ sự tự do hỏi của Excel, kỷ luật mô hình hoá của Power BI, quyền làm chủ dữ liệu của Superset.\n"
"Rồi đặt lên trên một tầng ngữ cảnh, để câu hỏi tiếng Việt không bị trả về một con số sai mà trông rất tròn.\n"
"Nhưng đây không phải video bán hàng. Mình kể chuyện này vì sợi chỉ đỏ ở dưới mới là thứ đáng mang về.",

# --- CHỐT: bắc cầu vào series + mời gọi ---
"07":
"Nếu bạn theo mình từ thời Google Sheets, đừng bỏ mấy mẹo cũ. Chúng vẫn đúng, vẫn dùng tốt.\n"
"Chỉ là sắp tới, mình muốn nói về thứ nằm trước mọi công cụ: cách tư duy về số.\n"
"Mỗi tuần một khái niệm, gọn trong vài phút, toàn chuyện công sở Việt mình gặp thật.\n"
"Sợi chỉ đỏ chỉ có một: ngữ cảnh là vua. Theo dõi để không bỏ lỡ nhé.",

# --- SHORT: hook + chốt, tự đứng độc lập ---
"short-outro":
"Mười năm mình đi qua Excel, Sheets, Power BI, Superset, Nocobase. Cái nào cũng đụng một bức tường.\n"
"Và thứ gỡ được mọi bức tường lại không phải công cụ nào, mà là ngữ cảnh. Bản đầy đủ trên YouTube, theo dõi để không bỏ lỡ.",
}

# Phát âm cho TTS: gen_audio THAY từ trong text gửi TTS (AI đọc đúng), caption giữ CHÍNH TẢ GỐC.
# Các mục dưới là PHỎNG ĐOÁN — đọc to bản TTS, nghe chỗ nào lạ thì sửa lại (xem BLOG-TO-VIDEO.md §B3.6).
PRON = {
    "Semantix": "Sơ-men-tích",     # tránh đọc kiểu Anh-Việt lai; chỉnh khi nghe thử
    "Excel": "Ếch-xeo",            # tránh đọc "ếch-xồ" / đánh vần
    "Google Sheets": "Gu-gồ Síts",
    "Power BI": "Pao-ơ Bi-Ai",
    "Data Studio": "Đây-ta Sờ-tu-đi-ô",
    "Superset": "Su-pơ-sét",
    "Metabase": "Mê-ta-bây",
    "Nocobase": "Nô-cô-bây",
    "AppSheet": "Ép-sít",
    "dashboard": "đát-bo",         # nói trôi như khẩu ngữ dân văn phòng
    "license": "lai-xừn",
    "server": "sơ-vơ",
    "log": "lốc",
    # "SQL": "ét-quèo",            # bật nếu TTS đánh vần S-Q-L rời rạc
}

# ▸ Ghi chú đạo diễn / beat (BLOG-TO-VIDEO.md §B4). gen_audio map sang audio-tag ElevenLabs khi re-voice.
TONE = {
"00": "Mở chắc, lão làng; liệt kê tên công cụ đọc dồn, có nhịp; '...lại chẳng phải một công cụ nào' buông lửng, gợi mở (đây là hook Short).",
"01": "Ấm, biết ơn khi nói về Excel; chùng nhẹ ở 'treo máy, chờ năm giây'; 'chưa ai định nghĩa một lần' hạ giọng, đóng đinh.",
"02": "Phấn khích lúc đầu (mừng phát khóc, nghịch dashboard); xìu dần ở câu sếp hỏi; 'dời... sang chính mình' đọc chậm, hơi lạnh người.",
"03": "Hào hứng ở 'tự chủ'; kể chuyện một giờ sáng giọng mệt, thật; 'đêm đó của mình thì không' chốt khô khốc; 'chỉ dời chỗ' nhấn.",
"04": "Tâm sự, kể chuyện nghề tư vấn; ấm khi nhắc xưởng may/phòng khám; 'giống nhau lạ kỳ' buông, gợi suy ngẫm (dẫn vào aha).",
"05": "Vỡ oà, sáng lên ở 'ngữ cảnh'; câu hỏi 'chốt đơn hay đã thu tiền?' đọc như đang hỏi thẳng người xem; 'nằm trong đầu người hiểu nghề' chắc nịch.",
"06": "Điềm đạm, không brochure; nhấn 'đứng trên vai chúng'; câu 'không phải video bán hàng' đọc thật thà, hơi tự trào.",
"07": "Ấm, bắc cầu (đừng phủ định Sheets cũ); mời gọi; 'ngữ cảnh là vua' đọc chậm, đóng đinh như slogan kênh.",
"short-outro": "Gọn, dứt khoát; liệt kê công cụ đọc dồn; 'ngữ cảnh' nhấn mạnh.",
}
