# Kịch bản — "Tự xây template báo cáo" (2 phiên bản: Bản Nghiệp vụ `PromoTemplateBiz` & Bản Đầy đủ `PromoTemplate`)

Cùng bộ khung với video Semanio DFL (`kit.tsx`: Stage, Headline, Shake, Burst, Whip), cùng luật chữ trong `PLAYBOOK.md` (toàn bộ là animation dựng).

## Vòng 4 (23/10 tối) — Dựng lại mạch theo góp ý user

### Luật của vòng này (user chốt)
- **Chữ nhiều thì nhịp chậm lại**; muốn giữ nhịp 2–4 giây đổi một ý thì phải **làm hình dễ hiểu, bớt chữ**.
- **Nội dung đến đâu hiện đến đó**: phần tử nào chưa được tiêu đề nhắc tới thì chưa hiện.
- Mạch chính: **Dán yêu cầu → AI ra đúng 12 cột mẫu → rẽ 3 ngả**: ① Hỏi tiếp ② Đặt lịch gửi email ③ Tạo mẫu chia sẻ cho người khác, có ô nhập tùy chỉnh.
- **Mẫu Excel**: Semantix nhận cả file Jinja lẫn kéo thả. Bản Biz diễn ý dễ hiểu nhất: file Excel quen thuộc + một dòng ô giữ chỗ → bấm tải thì ô giữ chỗ thành số thật, dòng mẫu nhân ra đủ số dòng (đúng cơ chế `worker/python/services/excel_templater.py`). Bản Full diễn cả hai cách.
- **Không hiện chi tiết code** (user chốt): ô giữ chỗ vẽ thành **chip mang tên cột** ("CIF", "Tên khách hàng"), không viết `{{ … }}`; không SQL, JSON, chuỗi lịch cron trên hình bản Biz.
- Đo nhịp bằng `tools/holds.py` (render bản 1/4 `--scale=0.25 --muted`, danh sách cảnh như `tools/holds-biz.example.json`): bản Biz cũ 22 đoạn đứng yên ≥ 1,5 giây = 72,8 / 199 giây (37%); bản vòng 4 còn ~24 / 129 giây (~19%), dài nhất 2,7 giây.
- Hai bản: **Biz** cho cán bộ nghiệp vụ; **Full** cho BA / Power User (kiến trúc, mô hình, chuẩn hoá chi tiết, tham số, dựng mẫu kéo thả).

### Tính trung thực (đối chiếu code Semantix 23/10)
- Duyệt thay đổi chỉ có **một bước duyệt** (Change Request, người có quyền duyệt model) → không vẽ chuỗi hai nút "BA Sign-off" rồi "Trưởng phòng duyệt"; vẽ: BA rà tình huống biên, **người duyệt** (BA hoặc Trưởng phòng) bấm Duyệt một lần.
- Đặt lịch gửi email từ hội thoại vẫn là **lộ trình** → giữ nhãn "Sắp ra mắt".
- Số liệu mô phỏng phải tự khớp: khách cá nhân EUR có số dư 52.000 EUR (≈ 57.200 USD, vượt ngưỡng 50.000 USD).

### Bảng cảnh — `PromoTemplateBiz` (vòng 4c, ≈ 2:03, thứ tự + dur ở `src/template/timeline.json`)

| # | id | Chữ to (mỗi dòng một nhịp) | Hình hiện theo nhịp |
|---|---|---|---|
| 1 | `hook` | Cần gấp báo cáo 12 cột đúng mẫu NHNN · Phải lập phiếu nhờ IT kéo số · Xếp cuối hàng, nhích lên từng ngày · Gần tới lượt, sửa một tiêu chí là về cuối hàng | Phiếu vào cuối hàng chờ có sẵn 5 phiếu → nhích lên #2 → bay về cuối |
| 2 | `turn` | Hết cảnh gửi phiếu chờ IT · SEMANTIX · Hỏi một câu, ra đúng mẫu báo cáo | Logo |
| 3 | `semBiz` | Phòng tự đặt tiêu chí bằng lời · AI dựng thành tiêu chí dùng chung · Thử ngay trên vài khách hàng · Có người duyệt, cả phòng dùng chung | Câu nói → hai cụm chữ bay thành chip → vạch quét đóng dấu Có/Không → con dấu ĐÃ DUYỆT → đường nối ra cả phòng |
| 4 | `chatAsk` | Dán nguyên yêu cầu vào khung chat · AI dùng đúng tiêu chí phòng đã duyệt · Ra đúng 12 cột theo mẫu NHNN · Rồi đi tiếp một trong ba ngả | Khung chat hai bên: bong bóng yêu cầu → chấm đang gõ → các bước AI → tin kết quả 12/12 cột + 3 nút (= 3 ngả) |
| 5 | `chatDrill` | Ngả 1 · Hỏi tiếp ngay trong khung chat · AI vẽ biểu đồ, chỉ ra điểm cần lưu ý | Cùng khung chat: câu hỏi → biểu đồ + nhận xét |
| 6 | `chatSchedule` | Ngả 2 · Dặn lịch gửi email bằng một câu · Đến hẹn, file Excel tự về hộp thư | Cùng khung chat: lệnh → thẻ xác nhận → Đồng ý → hộp thư (Sắp ra mắt) |
| 7 | `share` | Ngả 3 · Tạo mẫu ngay từ kết quả này · Thêm ô nhập để mỗi kỳ tự đổi · Chia sẻ cho cả phòng dùng chung | Chat cuộn ngược lên tin kết quả, bấm nút 3 → thẻ mẫu, ô nhập hiện dần, chia sẻ |
| 8 | `excelJinja` | Dùng luôn file Excel mẫu quen thuộc · Đặt ô giữ chỗ vào dòng dữ liệu · Gắn file vào mẫu, lần tải sau tự điền số | File mẫu → chip tên cột → Gắn vào mẫu |
| 9 | `portalBiz` | Đồng nghiệp mở Cổng Dữ Liệu · Chọn mẫu, điền vài ô nhập · Gõ thêm điều kiện bằng lời, AI hiểu ngay · Bấm tải, ô giữ chỗ thành số thật | Lưới 6 mẫu → bấm FATCA mới ra ô nhập → gõ điều kiện → file mở có chip → chip thành số |
| 10 | `recapBiz` | Nghiệp vụ tự lấy số, đúng mẫu, không chờ IT | Trước (17 ngày, gạch đỏ) → Nay (Ngay khi cần) + 3 giá trị |
| 11 | `outro` | SEMANTIX · Hỏi một câu, ra đúng mẫu báo cáo | Link |

### Góp ý vòng 4b (23/10 tối, user duyệt trên Studio)
- **Bỏ giọng đọc** (bản sao lưu lời + công cụ edge-tts ở scratchpad phiên review).
- **Nhạc khớp nhịp**: thứ tự + thời lượng cảnh bản Biz nằm ở `src/template/timeline.json`; mỗi cảnh (trừ cảnh cuối) dài dur - 10 = bội số 30 khung (2 phách ở 120 BPM), `PromoTemplate.tsx` báo lỗi nếu lệch. `python -I tools/gen_score.py` tổng hợp nhạc (không mẫu bản quyền) theo `mood` từng cảnh, trống + hợp âm bắt đầu lại ở đầu mỗi cảnh, điểm nhấn `accents` làm tròn về phách → `public/music/biz-score.wav`. Đổi thời lượng cảnh = sửa timeline.json rồi chạy lại gen_score.
- **Hàng chờ đoạn mở đầu**: hàng có sẵn 5 phiếu, phiếu FATCA vào cuối hàng, các phiếu trên xong dần nên nhích lên #2 trong khi phiếu mới vẫn đổ vào sau; gần tới lượt thì sửa tiêu chí → bay về cuối hàng.
- **Điền số Excel chỉ một lần**: cảnh mẫu Excel dừng ở "Gắn file vào mẫu, lần tải sau tự điền số"; màn chip thành số diễn ở Cổng Dữ Liệu lúc đồng nghiệp bấm tải.

### Góp ý vòng 4c (23/10 khuya)
- Nhạc tự dựng chưa đủ hay → **user tạo nhạc mới** theo prompt (120 BPM, intro căng 13s, drop, groove, breakdown ~0:50, build ~1:30, kết hợp âm ngân). Khi có file: dò phách bài rồi canh lưới cảnh vào bài; `public/music/biz-score.wav` chỉ là nhạc tạm.
- semBiz dựng lại cho có chuyển động (chip bay, quét, con dấu, cả phòng).
- Khung xám ở dòng yêu cầu bị bỏ; cảnh hỏi + 3 ngả + hỏi tiếp + hẹn lịch + mở đầu tạo mẫu thành **một khung chat hai bên** (`scenesChat.tsx`), bỏ cảnh sơ đồ 3 ngả riêng.
- Cổng Dữ Liệu hiện từng bước (`scenesPortal.tsx`); tổng kết chuyển sang **giá trị** Trước/Nay.

### Góp ý vòng 4d (23/10 khuya)
- Tiêu đề chỉ tô một cụm (Headline riêng ở ui.tsx). Bỏ nhãn vàng Mô phỏng ở hàng chờ, chat, Cổng Dữ Liệu; bỏ nhãn Sắp ra mắt trên nút Hẹn lịch (cảnh hẹn lịch vẫn giữ).
- semBiz dựng giống Column Builder thật: Catalog nguồn | Builder (AI Trợ lý → AI Modeling Assistant → Đề xuất từ AI → Thêm vào Canvas) | Preview (Chạy); gửi duyệt → BA Data duyệt → cột ảo vào Catalog "Dùng chung" (bỏ hàng avatar khó hiểu).
- Nhận xét AI ở ngả 1 nền sáng. Cảnh mẫu Excel có vỏ Excel thật (tab, thanh công thức, ô đang chọn) và thẻ mẫu Semantix nhận file; bỏ chip kéo thả. Cổng Dữ Liệu: Năm/Tỷ giá mỗi ô 50%, tên cột thống nhất "Loại khách hàng". Tổng kết: gạch ngang thẳng, mũi tên cách đều; đoạn kết dài 8 giây (logo hiện, câu hứa, nút Dùng thử).

### Góp ý vòng 4e (24/10 rạng sáng)
- Nhạc: chọn **Calculated_Ascent** (user tải; 119,99 BPM, phách đầu 0,06 s, bài tắt ở 124 s) thay Velocity_One (intro im 8 s, một đoạn lắng dài 16 s khó canh). File `public/music/calculated-ascent.mp3`, khai trong `timeline.json` → `music` (vào sau hook 30 khung, cắt 2 khung đầu bài). Lưới cảnh canh theo đoạn bài: sửa tiêu chí = trống vào (10 s) · logo = build (12 s) · Column Builder hiện = DROP (20 s) · ba ngả = đoạn lắng (44 s) · biểu đồ hỏi tiếp = DROP (52 s) · gắn mẫu Excel = đoạn lắng (84–92 s) · "Nay" ở tổng kết = DROP cuối (108 s) · logo kết 114 s, video hết đúng lúc bài tắt (124 s). Biz 3786 khung ≈ 2:06.
- semBiz dừng ~2 giây cho người xem nhìn màn rồi mới bấm AI Trợ lý. Preview bỏ cột Tên khách hàng, thêm cột **Hiệu lực hồ sơ** (Còn/Hết) thay nhãn "hết hiệu lực"; điều kiện AI = Quốc gia cư trú = US và Hiệu lực hồ sơ = Còn.
- Nút Lưu mẫu: con trỏ bấm trúng (tính thêm thanh tiêu đề cửa sổ 46 px).
- Bớt rung + tiếng "bùm": rung chỉ còn ở lúc sửa tiêu chí (1 nhịp, nhẹ) và lúc điền số ở Cổng Dữ Liệu; "bùm" chỉ còn ở logo mở, lúc điền số, logo kết; bỏ riser cuối hook (bài nhạc tự dồn trống).

### Góp ý vòng 4f (24/10)
- Cổng Dữ Liệu: dữ liệu và mẫu NHNN ghi **Entity / Individual**, nên điều kiện AI hiện "“khách tổ chức” → Loại khách hàng = Entity" (chữ trong điều kiện khớp chữ trong file tải). File tải xong tô cột Loại KH (cả 2 dòng Entity) + chip "Cả 2 dòng đều Loại KH = Entity".
- Font tiêu đề: **Google Sans Flex** 800 (tệp woff2 tự nạp từ `public/fonts`, vì @remotion/google-fonts 4.0.351 chưa có), Inter làm dự phòng; đổi bằng `TITLE_FONT_PICK` trong `template/ui.tsx`. Chữ thân vẫn Be Vietnam Pro.
- Khoảng dọc đầu màn: nhãn vai / ngả cách mép trên 20 px; tiêu đề đầu màn hạ 6 px, nhỏ 10%; cửa sổ Column Builder / khung chat / Cổng Dữ Liệu bắt đầu từ ~176 và kết thúc trước ~1016 để không đè dòng chú thích minh hoạ (dời xuống bottom 16).
- Bỏ nhãn Sắp ra mắt ở thẻ Lịch gửi báo cáo và Hộp thư (chú thích góc + đoạn kết đã ghi "đang trong lộ trình").
- **Đã xuất** `out/PromoTemplateBiz.mp4` (24/10, 3786 khung ≈ 2:06, 1080p30, có nhạc Calculated_Ascent).

### Bản Full (BA / Power User) — vòng 5 (24/10): mang luật bản Biz sang
- Mạch mới (17 cảnh, 5946 khung ≈ 3:18): hook → turnFull (logo + 3 thẻ) → compareBefore (kiến trúc dữ liệu) → compareAfter (quy trình) → model → relations → semBiz (Column Builder) → chatAsk → chatDrill → chatSchedule → share → params → excel → jinja → portalBiz → recap (6 bước theo vai) → outro.
- Hai sơ đồ so sánh **được thêm lại** theo yêu cầu user (sếp thích, đưa duyệt thử): giữ nguyên nội dung, chỉ tô một cụm mỗi tiêu đề và đổi tiếng "bùm" thành pop. Nền cột / làn đổi từ trắng mờ sang tô đặc nhạt (cột kiến trúc tím #E5E0F7, làn quy trình cũ vàng #FBEFC6, làn người dùng tím #E7E1FD, làn IT xanh #E0ECFD) để thẻ trắng nổi lên (user: "nền trắng quá, khó nhìn").
- Bỏ: ba cảnh chuẩn hoá dạng thẻ (semanticDef/Test/Gov), các cảnh nền tối (ask, hub, askDrill, schedule), cảnh 3 thẻ kiểm soát (control), Cổng Dữ Liệu kiểu cũ. Code của các cảnh này vẫn còn trong repo nếu cần lại.
- Dùng chung giao diện giả lập với Biz: Column Builder, khung chat hai bên, ngả 3 từ khung chat, Cổng Dữ Liệu từng bước (Entity khớp file tải).
- Ô nhập của mẫu (params) không còn câu SQL / `@tham_so`: AI liệt kê "2025 / 26.000 đang gõ cứng → Ô nhập Năm báo cáo / Tỷ giá", thẻ ô nhập không hiện mã.
- Tô màu một cụm mỗi câu (sửa accent ở model, relations, params, recap); bỏ nhãn Mô phỏng + chữ "Tự động JOIN" + dòng phụ đề ở nối bảng; dải thông điệp nối bảng nền gradient sáng thay nền đen; bỏ dải bước chữ nhỏ ở đáy màn; bỏ hàng chip tuỳ chọn chữ nhỏ ở dựng mẫu Excel; rung chỉ còn ở hook và lúc điền số; "bùm" chỉ còn ở logo mở/điền số/logo kết.
- Bản Full chưa có nhạc (bài Calculated_Ascent 2:04 ngắn hơn bản Full 2:50).

### Bản Full — vòng 6 (24/10)
- Một cửa sổ Mô hình cho ba cảnh, mỗi cảnh một tab đúng nhãn thật (`messages/vi/admin-models.json` form.tabs): **Bảng** (model: biên tập tên nghiệp vụ cho từng cột nguồn, danh sách bảng bên trái) → **Mối quan hệ** (relations) → **Thiết kế Cột** (semBiz). Tab sáng đổi như vừa bấm sang (`ModelWindowBar` trong `template/ui.tsx`); bản Biz semBiz đứng yên ở tab Thiết kế Cột.
- Cảnh nối bảng bỏ câu "Nghiệp vụ hỏi một câu, hệ thống tự nối bảng" (tối nghĩa với nghiệp vụ) → "Nối một lần, báo cáo nào cũng lấy đủ dữ liệu" + dải "Báo cáo FATCA tự lấy hồ sơ, tài khoản, tiền gửi theo cùng một CIF".
- Dựng mẫu Excel làm lại thành **một trang tính** (`scenesExcelBuild.tsx`): ô "Trường dữ liệu" bên phải như PivotTable Fields; kéo khối Tiêu đề / Đoạn chữ vào dòng 1–2 (chip ô nhập); kéo từng cột vào khu bảng — kéo đến đâu hiện cột + dữ liệu đến đó; Số dư để thô (182450) tới khi chọn "Số thập phân · 1.234,56" trên ribbon; bấm đúp tiêu đề cột sửa "Tên khách hàng" → "Tên chủ tài khoản" thấy đổi ngay; Lưu mẫu.
- **Vòng 7 (24/10):** tab xếp theo thứ tự video: Bảng → Mối quan hệ → Thiết kế Cột. Nhạc bản Full = **Velocity_of_Ascent** (user tải; 120,01 BPM, phách đầu 0,06 s, 176 s; Clarity_of_Vision 123 BPM lệch lưới nên không chọn), dựng lại theo ô nhịp (`FULL_MUSIC.segments` trong PromoTemplate.tsx: [4–56] [16–24] [56–136] [112–128] [132–160] [172–177] giây bài, đan tiếng 3 khung). Bỏ cảnh gắn file Excel có sẵn (user cho cắt); nối bảng 11 s, ô nhập 12 s, kết 290 khung → 5756 khung ≈ 3:12. Mốc giây nhạc: logo 12 = vào verse · Thiết kế Cột 68 = drop 1 · hẹn lịch trong đoạn lắng 100–116 · Cổng Dữ Liệu 156 dồn lên · điền số 168 = drop cuối · logo kết 180 · bài tắt ~188 (đã đo lại trên file tiếng render).
- Thời lượng cảnh bản Full về lưới 2 phách như Biz (PromoTemplate.tsx throw nếu lệch): 6096 khung ≈ 3:22 (trước vòng 7). Mốc (giây kể từ cảnh đầu): hook 0 · logo 13 · sơ đồ kiến trúc 23 · quy trình 37 · mô hình 51 · nối bảng 58 · Thiết kế Cột 68 · hỏi 84 · hỏi tiếp 98 · hẹn lịch 107 · tạo mẫu 119 · ô nhập 129 · dựng Excel 143 · gắn file 158 · Cổng Dữ Liệu 168 · tổng kết 184 · kết 192 → 202.

### Bảng cảnh — `PromoTemplate` (bản Full cho BA / Power User)
`hook` → `turn` → `compareBefore` (kiến trúc) → `compareAfter` (quy trình) → `model` → `relations` → `semanticDef` → `semanticTest` → `semanticGov` (một bước duyệt) → `ask` → `hub` → `askDrill` → `schedule` → `share` → `params` (AI biến năm, tỷ giá thành tham số) → `excel` (kéo thả) → `excelJinja` (file Jinja) → `portal` → `control` → `recap` → `outro`.

## Vòng 3 (23/10) — Cập nhật theo Feedback Nghiệp vụ & Rút gọn chữ to dễ đọc

### 4 thay đổi cốt lõi theo feedback:
1. **Tách thành 2 phiên bản video (2 Compositions trong Remotion):**
   - **`PromoTemplateBiz` (~1:38, 2961 khung) — Dành cho 90% Cán bộ Nghiệp vụ (End User):**
     - Lược bỏ các bước kỹ thuật dễ gây ngợp (thiết lập bảng gốc `model`, nối khoá ngoại 5 bảng `relations`, viết lại SQL tham số `params`, dựng bố cục khối Excel `excel`).
     - Tập trung trọn vẹn vào phần việc của Nghiệp vụ: **Tự định nghĩa tiêu chí chuẩn bằng lời & test từng khách hàng (`semanticDef`) → BA Data rà tình huống biên Sign-off & Trưởng phòng Approve dùng chung (`semanticGov`) → Dán yêu cầu ra đúng 12 cột (`ask`) → Bấm 1 nút tạo template (`button`) → Tự gõ điều kiện bằng chữ & tải Excel (`portal`) → Hẹn lịch gửi email (`schedule`)**.
   - **`PromoTemplate` (~2:17, 4121 khung) — Bản Đầy đủ End-to-End:**
     - Giữ trọn vẹn toàn bộ các bước từ Data Model đến Hẹn lịch nhưng gắn **`RoleBanner` nổi bật ở góc trên mọi cảnh** để phân định rõ bước nào do **BA Data / Kỹ sư dữ liệu** làm nền, bước nào do **Nghiệp vụ + BA + Trưởng phòng** cùng chuẩn hoá, bước nào do **Power User** cấu hình 1 lần, và bước nào do **90% Cán bộ Nghiệp vụ** thao tác hằng ngày.
2. **Mở rộng phần "Chuẩn hoá ngữ nghĩa & Phê duyệt 3 bên" thành 2 cảnh nối tiếp (`semanticDef` + `semanticGov` ≈ 17 giây):**
   - **Cảnh A (`semanticDef`, 255 khung):**
     1. **Cán bộ Nghiệp vụ** chủ động tạo chiều chuẩn hoá `"Flag thuộc FATCA"` bằng ngôn ngữ tự nhiên: *"Khi bản ghi còn hiệu lực và quốc gia là Mỹ (US) thì để là Có"*.
     2. **Semantix AI** tinh chỉnh định nghĩa và sinh biểu thức SQL mapping trên bảng `fatca_info`.
     3. **Cán bộ Nghiệp vụ** kiểm thử ngay bằng hội thoại (*"Liệt kê các KH có Flag thuộc FATCA đúng để rà từng dòng"*), xem từng khách hàng (view case by case) rồi bấm **Xác nhận · Gửi BA**.
   - **Cảnh B (`semanticGov`, 255 khung):**
     1. **BA Data** không còn phải đi map từ đầu mà giúp rà soát và bọc thêm 2 tình huống biên (Edge Cases) mà nghiệp vụ khó thấy: *Loại bản ghi đảo bút toán (`record_status <> 'REVE'`)* và *Chỉ lấy 1 bản ghi hiệu lực mới nhất mỗi CIF (`ROW_NUMBER = 1`)* → bấm **BA Data Sign-off**.
     2. **Trưởng phòng Nghiệp vụ** kiểm tra đã có bảo chứng kỹ thuật của BA Data → bấm **Phê duyệt (Approve)** để áp dụng chuẩn hoá cho toàn bộ Workspace của phòng.
     3. Nhấn mạnh thông điệp: **Trách nhiệm chia sẻ (Shared Responsibility)** — Nghiệp vụ chủ động nhưng có BA Data sign-off trước khi dùng chung cho cả phòng.
3. **Gắn thanh Huy hiệu Vai trò (`RoleBanner`) xuyên suốt mọi cảnh:**
   - Xanh dương (`BA DATA · KỸ SƯ DỮ LIỆU`): Thiết lập nền tảng một lần, người nghiệp vụ không cần làm.
   - Tím (`CÁN BỘ NGHIỆP VỤ + SEMANTIX AI` / `BA DATA SIGN-OFF · TRƯỞNG PHÒNG DUYỆT`): Chuẩn hoá tiêu chí dùng chung toàn phòng.
   - Xanh lá (`90% CÁN BỘ NGHIỆP VỤ (END USER)`): Không cần biết code hay nối bảng, ai cũng tự làm được.
   - Vàng cam (`POWER USER PHÒNG NGHIỆP VỤ · BA`): Gắn tham số & khung mẫu một lần để cả đội dùng lại.
4. **Đơn giản hoá ví dụ FATCA & tăng cỡ chữ lớn (20–28px) đọc lướt trong 2 giây:**
   - Yêu cầu dán vào Agent rút từ 28 dòng chữ nhỏ (`15.5px`) xuống còn **6 dòng cốt lõi cỡ chữ 23–25px** (trong đó bước 1 dùng ngay tiêu chí chuẩn `"Flag thuộc FATCA = Có"` vừa tạo).
   - Bảng kết quả hiển thị **5 dòng đại diện tiêu biểu** ở chiều cao dòng `58px`, cỡ chữ `22px` (thay vì 11 dòng chữ nhỏ).
   - Khối SQL trong `button` và `params` rút gọn còn **4–6 dòng ngắn cỡ chữ 20–21px**, nhìn thấy ngay sự thay đổi `2025` → `@nam_bao_cao` và `26000` → `@ty_gia`.

---

## Bảng cảnh 1 — `PromoTemplateBiz` (Bản Nghiệp vụ · 2961 khung ≈ 1:38)

| # | id | Khung | Vai trò hiển thị | Chữ trên hình | Diễn biến chính |
|---|---|---|---|---|---|
| 1 | `hook` | 285 | — | Cần một bảng số theo mẫu Excel · Gửi yêu cầu sang IT · Rồi xếp hàng chờ · Đổi một cột, chờ thêm vòng nữa | Phiếu xuất báo cáo FATCA vào Hàng chờ IT, lịch bóc, bị trả về khi đổi cột |
| 2 | `turn` | 175 | 3 nhóm vai trò | Đổi cách lấy dữ liệu · SEMANTIX · Tự hỏi, tự dựng mẫu, tự tải | Logo Semantix + 3 thẻ phân vai: BA/Data dựng nền · NV+BA+TP chuẩn hoá · 90% NV tự hỏi & tải |
| 3 | `semanticDef` | 255 | Cán bộ Nghiệp vụ + Semantix AI | Nghiệp vụ tự tạo tiêu chí chuẩn bằng lời · AI dựng công thức, kiểm thử từng khách hàng | Tạo chiều `"Flag thuộc FATCA"` → AI sinh `CASE WHEN` → Nghiệp vụ hỏi liệt kê KH để rà từng dòng (case by case) → bấm Xác nhận & Gửi BA |
| 4 | `semanticGov` | 255 | BA Data Sign-off · Trưởng phòng duyệt | BA Data rà tình huống biên, không phải map từ đầu · Có BA xác nhận, Trưởng phòng duyệt làm chuẩn chung | 3 thẻ tiến trình: Nghiệp vụ đã confirm mẫu → BA Data thêm 2 edge case (`record_status <> 'REVE'`, `ROW_NUMBER = 1`) & Sign-off → Trưởng phòng Approve cho cả phòng |
| 5 | `ask` | 440 | 90% Cán bộ Nghiệp vụ | Dán nguyên yêu cầu nghiệp vụ · AI dùng tiêu chí chuẩn, tự chia bước · Ra đúng 12 cột theo mẫu | Dán 6 dòng yêu cầu FATCA to rõ → Agent chạy 4 bước → ra bảng kết quả 12 cột |
| 6 | `button` | 250 | 90% Cán bộ Nghiệp vụ | Một nút, thành template tải dữ liệu | Bấm "Tạo template tải dữ liệu" dưới kết quả Agent → tự điền tên, kết nối, câu lệnh (ghi chú Power User / BA gắn tham số 1 lần) |
| 7 | `portal` | 400 | 90% Cán bộ Nghiệp vụ | Gõ điều kiện bằng chữ · AI hiểu, chỉ dùng cột được phép · Đúng mẫu, mọi lần | Mở Cổng Dữ Liệu → gõ "khách cá nhân, số dư từ 20.000 USD" → bấm Tải Xuống Excel → mở file đúng mẫu |
| 8 | `schedule` | 390 | 90% Cán bộ Nghiệp vụ | Hoặc hẹn lịch ngay trong câu trả lời · Đúng giờ, tự gửi vào email | Hẹn lịch gửi email định kỳ kèm xác nhận (**Sắp ra mắt**) |
| 9 | `control` | 210 | Toàn phòng | Chủ động mà vẫn chia sẻ trách nhiệm | 3 thẻ: Trách nhiệm chia sẻ (BA Sign-off + TP duyệt) · AI chỉ đề xuất · Lọc bằng chữ có rào |
| 10 | `recap` | 200 | Từng vai trò | Từ yêu cầu nghiệp vụ tới file đúng mẫu · Đúng vai trò, không còn xếp hàng chờ | 6 bước kèm huy hiệu vai trò phụ trách trên từng thẻ |
| 11 | `outro` | 165 | — | SEMANTIX · Dùng thử: https://semantix-uat-gcp.ncb-bank.vn | Màn hình kết |

---

## Bảng cảnh 2 — `PromoTemplate` (Bản Đầy đủ · 4121 khung ≈ 2:17)

Bao gồm toàn bộ 11 cảnh của `PromoTemplateBiz` và bổ sung 4 cảnh kỹ thuật/cấu hình có gắn nhãn vai trò rõ ràng:
- Cảnh 3 (`model`, 190f) — **Vai trò: BA Data · Kỹ sư dữ liệu**: Thiết lập mô hình dữ liệu nền, đặt sẵn tên cột tiếng Việt.
- Cảnh 4 (`relations`, 280f) — **Vai trò: BA Data · Kỹ sư dữ liệu**: Nối sẵn 5 bảng theo `cif` để người nghiệp vụ hỏi một câu là tự nối bảng.
- Cảnh 9 (`params`, 400f) — **Vai trò: Power User phòng Nghiệp vụ · BA**: Nhờ AI biến năm báo cáo và tỷ giá thành tham số `@nam_bao_cao`, `@ty_gia` + thêm ô lọc bằng chữ `AI-Input`.
- Cảnh 10 (`excel`, 330f) — **Vai trò: Power User phòng Nghiệp vụ · BA**: Dựng bố cục mẫu Excel một lần ngay trên giao diện.
