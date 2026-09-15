# Kịch bản video dự thi — bản KHÔNG GIỌNG (chữ + nhạc + animation)

Phong cách: video giới thiệu SaaS kiểu Holistics ("Dashboards As Code", "Custom Charts As Code").
Nguyên tắc (chốt 2026-09-11):
- **Chữ vào trước, animation chạy theo ngay** — chữ và chuyển động được chạy đồng thời.
- **Nhịp nhanh, chữ to** (tiêu đề 96–140px, tối đa ~7 chữ/khung, đọc kịp ở tốc độ 3 chữ/giây).
- Kết quả/thông tin chính giữ ≥1s trước khi cắt (R1); nhóm phần tử vào kiểu nhanh dần (R2).
- Mọi con số là kết quả thật của bộ dữ liệu demo (quý 3/2026 so với quý 3/2025, sau khi nộp T9).
- 3–5 giây quay thật ở các điểm nhấn, có zoom vào/ra bám con trỏ; gắn nhãn "Quay màn hình thật".
- Nhạc `may-nhat` (Gemini) + SFX Pixabay; cắt cảnh theo nhịp nhạc.
- Tổng ~2:15 (giới hạn 3:00).

| # | Thời lượng | Chữ trên màn hình (vào trước) | Animation (chạy theo) |
|---|---|---|---|
| 1 | 0:00–0:10 | "Cuối kỳ báo cáo." · "Hàng chục file Excel." · "Mỗi đơn vị một mẫu." · "Và một đêm đối chiếu." | File chip đổ xuống; 3 tên cột lệch nhau (so_thu_trieu_dong / Số thu (triệu đồng) / so_tien); đồng hồ 22:47 |
| 2 | 0:10–0:15 | "Semanio" · "Hỏi dữ liệu bằng tiếng Việt." | Logo vẽ nét, wordmark trượt ra |
| 3 | 0:15–0:30 | "Nộp file theo mẫu." · "Lệch mẫu? Chặn ngay." | 12 file bay vào ô tải lên, trạng thái lần lượt xanh; Sông Trà đỏ "so_tien ≠ so_thu_trieu_dong"; bản sửa xanh |
| 4 | 0:30–0:52 | "Hỏi như hỏi đồng nghiệp." · "Kế hoạch hiện trước khi chạy." · "3 đơn vị giảm thu." | Gõ câu hỏi → thẻ kế hoạch → biểu đồ 12 đơn vị → rọi sáng Đông Hải −23,0% · Tân Lập −17,4% · Hòa Bình −13,5% · **quay thật 3–4s** (zoom vào kết quả) |
| 5 | 0:52–1:05 | "Hỏi tiếp — không cần nhắc lại." · "Thu tiền sử dụng đất −81%" | Câu hỏi đào sâu Đông Hải → 4 khoản mục → số lớn −81,0% (9.549 → 1.819) |
| 6 | 1:05–1:25 | "AI không tự bịa số." · "Một chỉ số — một công thức." · "AI chỉ thấy định nghĩa." · "Truy vấn do hệ thống sinh." · "Dữ liệu ở lại đơn vị." | Sơ đồ rút gọn: câu hỏi → Semanio → AI (chỉ metadata) → SQL → CSDL; nhánh dữ liệu thô bị chặn; nhật ký ghi vết |
| 7 | 1:25–1:45 | "Ghim thành dashboard." · "Đổi bộ lọc — cập nhật tức thì." · "Insight: AI tóm tắt điều đáng chú ý." | Biểu đồ bay vào lưới dashboard → KPI chạy số (288K · 86,4% · 64,07K · 11,65%) → bảng Insight hiện chữ thật · **quay thật 3s** (zoom vào Insight) |
| 8 | 1:45–1:55 | "Hỏi ngay trên Zalo." | Khung điện thoại: tin nhắn → biểu đồ trả về (ảnh thật) |
| 9 | 1:55–2:07 | "12 hệ CSDL + Google Sheets" · "Triển khai riêng từng đơn vị" · "Không giới hạn người dùng" | 3 thẻ số lớn nối nhau |
| 10 | 2:07–2:15 | "Semanio" · "Dùng thử: semanio.vn" · "NCB Team · Data for Life 2026 · VLTN-05" | Logo khóa lại, URL nảy vào |

## Quay thật cần có (Playwright + Edge, phiên người dùng tự đăng nhập)
- Q-A: câu hỏi so cùng kỳ chạy thật → biểu đồ hiện ra (3–4s dùng).
- Q-B: câu hỏi đào sâu Đông Hải theo khoản mục (dự phòng).
- Q-C: dashboard đổi bộ lọc "Quý này" → bấm Insight → tóm tắt hiện ra (3s dùng).
- Chỉ đọc/hỏi. Không nộp file, không ghim khi chưa hỏi người dùng.

## Bản mở rộng 2:30 — "năng lượng" (2026-09-11 tối)

Thay đổi so với bản 1:36:
- **Nhạc** `sfx/Blueprint_for_Tomorrow.mp3` (136 BPM, user chọn, thay `may-nhat`): bỏ 42 khung đầu để nhịp ngắt ở giây 151,4 của bài rơi đúng khung cuối video → kết cùng nhạc, không fade dài. 7 giây đầu bài dồn lên = đoạn "cuối kỳ báo cáo".
- **Chuyển cảnh whip** 10 khung (vào từ phải, mờ chuyển động), lóe trắng ở đầu chương (brand, định vị, Agent, xuất trình chiếu, outro); chữ đập vào có nảy; nền lưới trôi + vệt sáng; rung khung + tia bung ở nhịp nhấn (`kit.tsx`: Stage/Headline/Shake/Burst/Whip).
- **Hai phiên bản cùng mã**: `Promo` (chung — YouTube, hội nghị; outro "Trợ lý phân tích dữ liệu AI · hỏi bằng tiếng Việt", "số người dùng") và `PromoDFL` (outro "NCB Team · Data for Life 2026 · Đề bài VLTN-05", "số cán bộ").
- Mốc từng cảnh: `PROMO_STARTS` trong `Promo.tsx`; trong Studio các Sequence mang tên cảnh.

| Cảnh mới | Chữ | Animation / tư liệu thật |
|---|---|---|
| position (sau brand, 11s) | "Semanio là — Trợ lý phân tích dữ liệu AI — cho người không viết SQL." · "Không chờ số / Không chờ dashboard / Không mở nhiều công cụ." · "Một nền tảng, đủ việc với số liệu." | 4 thẻ năng lực (Hỏi đáp tức thì · Sửa biểu đồ bằng lời · Dashboard & Insight · AI Agent) + 3 nhãn tin cậy (hạ tầng riêng · phân quyền dòng/cột · truy vấn chỉ đọc) — rút từ deck BGĐ, bỏ số liệu/tuyên bố riêng của ngân hàng |
| edit + realEdit (13s) | "Muốn đổi biểu đồ? Nói là xong." | Thanh ngang → cột dọc (số thật Q3/2025–Q3/2026); **quay thật** `rec/chart-edit.mp4` từ giây 11,3: "Đang xử lý…" → biểu đồ đổi (giây 13,1; yêu cầu gửi lúc 3,8 → ~9s thật) |
| agent + 2 ảnh thật (20s, nền tối) | "Câu hỏi nhiều bước? Bật AI Agent." · "Có câu trả lời, kèm lý do." | Công tắc bật; 6/8 bước thật có SQL; "8 bước · 48 giây · thời gian thật"; Đông Hải −22,97% · Thu tiền SDĐ −80,95% (94,8% mức giảm); ảnh thật `rec/stills/agent-steps.png`, `agent-answer.png` (chat 44d11cbf) |
| deckIntro + realDeck + deck (14s) | "Cần báo cáo trình chiếu?" · "AI viết sẵn cả nhận định." | **Quay thật** chọn "HTML deck (.html)" (`rec/deck-export.mp4`); coverflow 6 slide thật từ file xuất (bỏ slide KPI vì số chưa định dạng); "Xuất xong trong 43 giây" (đo thật) |

Quay bằng `D:/Users/tuanla2/game/recorder` — kịch bản `scenarios/qa-edit.mjs`, `agent.mjs` (luôn trả công tắc Agent về TẮT), `ppt.mjs` (chờ "Bộ lọc chung" rồi mới mở menu — trang dựng lại làm đóng hộp thoại mở sớm); `deckshots.mjs` chụp từng `section.slide` 2x.

### Góp ý vòng 1 (user, 2026-09-11 khuya) — đã sửa nửa đầu
- BỎ các đoạn "Quay màn hình thật" realAsk, realEdit, realAgentSteps, realAgentAnswer: nội dung trùng cảnh dựng (cảnh dựng xem thích hơn) và làm đứt mạch người xem → video còn ~2:12. Giữ realFilter, realInsight, realDeck (nửa sau, chờ góp ý).
- Hook: lưới file 3 cột (4 cột lòi ra lề); "Và một đêm đối chiếu." → "Và cả đêm ngồi khớp số."
- Brand: logo đứng GIỮA trước rồi trượt sang trái nhường chữ.
- Định vị theo hồ sơ v3, KHÔNG viết chữ SQL: "Trợ lý phân tích dữ liệu — và tự động hoá báo cáo, bằng tiếng Việt"; "3 KHÔNG": Không cần biết lập trình · Không thay hệ thống sẵn có · Không phải chờ phòng kỹ thuật; thẻ cao theo nội dung (chữ từng lòi ra khỏi thẻ).
- SFX nhỏ lại (SFX_GAIN 0,55; còi báo sai ×0,35, gõ phím ×0,55, riser ×0,6) và bớt tiếng "ting" (mỗi cảnh ≤1).
- Nhạc tạm fade 1,5s cuối; căn nhịp ngắt của Blueprint vào khung cuối khi chốt độ dài.

### Góp ý vòng 2 (user) — đã sửa
- Tổng ĐÚNG 2:30 (TARGET_FRAMES 4500, cảnh kết tự lấp): bỏ 42 khung đầu Blueprint → khung cuối rơi đúng nhịp nghỉ giây 151,4 của bài, nhỏ dần 1s vào đó.
- position 420f, agent 470f (answer ở khung 312) — đủ thời gian đọc thẻ/bước.
- Thứ tự mới: … agent → DASHBOARD (bỏ cảnh mô phỏng KPI, dùng thẳng quay thật đổi lọc) → Insight (quay thật: "…" → Tạo Insight → đang phân tích; rồi "⏱ 10 giây sau" → bản tóm tắt, đo thật 10,0s) → xuất trình chiếu → Zalo → semantic (vì sao tin được) → stats → kết.
- Quay lại một mạch dashboard với REC_NOCURSOR=1 (`scenarios/dash-all.mjs`): con trỏ do Remotion vẽ ở 30fps từ `src/promo/cursors/*.json` (khung quay CDP rớt tới 0,86s làm con trỏ in sẵn bị giật); chuột di 480ms/lần; tiếng click đặt đúng lúc bấm thật.
- Deck: lật từng slide, dừng 40 khung/slide.
- Zalo 330f: thêm lời nhận xét + link + 3 gợi ý hỏi tiếp (GIẢ LẬP rút gọn theo đúng các phần bot trả về: answer · shareUrl · suggestedQueries; đơn vị đúng — bot thật đang lệch ×1000, nhánh fix/zalo-bot-narrative-unit chưa merge).

### Góp ý vòng 3 (user) — đã sửa
- Chữ trên hình: KHÔNG dùng gạch dài (—), KHÔNG chấm cuối câu (áp cho mọi Headline/dòng phụ/thẻ).
- 1,2s màn hình chờ (chỉ nền) trước cảnh đầu; tổng 4536 khung (2:31,2).
- Nhạc `sfx/blueprint-150.wav`: Blueprint ghép tại 144,07s → 163,18s (bỏ 19,1s đoạn lặp, tinh chỉnh +1,4ms theo nhịp, crossfade 30ms, đỉnh −1 dBFS) → giữ đoạn kết thật có nốt ngân (2:45 bài gốc), hết tiếng đúng khung cuối; điểm ghép = khung vào cảnh kết (impact + lóe che mối nối). Dựng lại: `python music_build.py <mp3> <out.wav> 144.07 163.18 150` (scratchpad; tìm điểm ghép: music_splice.py).
- Zalo: giữ "Không cần mở máy tính" + 3 gạch đầu dòng (Có biểu đồ · Có nhận xét tự động · Có gợi ý hỏi tiếp) hiện khớp bong bóng; rồi "Hỏi đáp và nhận báo cáo cả trên" Telegram → Teams → Slack hiện dần. ⚠ Slack hiện CHỈ gửi báo cáo/cảnh báo — user chốt ghi chung và sẽ làm hỏi đáp Slack trong 2–3 ngày, PHẢI xong trước ngày trình chiếu.
- Stats: dùng lại 2 hàng CSDL chạy ngược chiều (`Marquee`/`ROW_1`/`ROW_2` export từ scenes/StatsOverlay.tsx) + 3 ý chính.

### Góp ý vòng 4 (user) — đã sửa
- Ask: "AI tự chọn loại biểu đồ"; Drill: "AI tự nhận xét" + thẻ "AI nhận xét" (rút từ số thật, drill 250f).
- Dashboard: "AI dựng dashboard trong vài phút" + dòng phụ "Đổi bộ lọc, số liệu cập nhật ngay"; tiêu đề chuyển cảnh tự co cỡ để vừa MỘT dòng (không rơi chữ). Insight title 90f.
- Xuất báo cáo: đường chuột cuối được co lại dừng đúng nút "Xuất" (1115, 798) + cú bấm ở giây 5,2 của clip (cursors/d-deck.json đã chỉnh tay).
- Deck: chip chung chung (Xuất PowerPoint hoặc HTML · Khổ 16:9, trình chiếu ngay · AI viết nhận định từng biểu đồ).
- Link đầy đủ https://semanio.vn.
- Bù thời lượng: upload 310, zalo 315, semantic 360, stats 205 → cảnh kết 163f, bắt đầu ở giây nhạc 144,57.
- Nhạc ghép: user tự ghép lại (blueprint-150.wav hiện là bản tạm).

### Góp ý vòng 5 (user) — đã sửa
- Nhạc: user tự ghép `sfx/Blueprint-cut.mp3` (157,75s; trống dừng 151,3s → nốt ngân tới 155,0s). Cảnh kết vào ở giây nhạc 150,9 (OUTRO_AT), dài 153f; cảnh stats tự co giãn để khớp. Tổng 4716 khung (2:37,2).
- Hook dài 300f: đồng hồ tua qua nửa đêm 23:38 → 00:12 rồi đứng; position 390f (bớt 1s).
- Agent 530f: bỏ tia bung đè thẻ; thêm "📌 Nhận xét chính" + 3 "Gợi ý hỏi tiếp" (rút từ câu trả lời thật).
- Dashboard: dòng phụ "Tương tác trực tiếp: lọc, lọc chéo, rê chuột xem chi tiết" (lọc chéo có thật: chuột phải biểu đồ → "Đơn vị: …"; KHÔNG quay thêm theo ý user).
- Bù thời lượng: upload 330, drill 260, edit 220, deck 360, zalo 345, semantic 390.

### Góp ý vòng 6–7 (user) — đã sửa
- Chữ: định vị "Trọn vòng phân tích trong một nền tảng" (tô "một nền tảng"); nộp file "Một mẫu chuẩn cho mọi đơn vị" / "Sai chuẩn, hệ thống tự chặn"; hỏi "Hỏi như hỏi chuyên gia dữ liệu"; dashboard phụ "Tương tác trực tiếp trên mọi biểu đồ".
- Đồng hồ tua 21:00 → 00:12. Bỏ "ting" lúc hiện link cuối. Nhạc vào nhỏ dần 2s.
- Insight: bỏ con trỏ (di vào giữa bản tóm tắt vô nghĩa).
- Thêm realHover (quay thật, `rec/d-hover.mp4` từ dash-xf 9,9–15,6s): rê chuột lên cột → tooltip số thật An Phú / Bình Minh / Đông Hải. Bù: realFilter 168 (from 1,0), upload 315, agent 505, zalo 330, semantic 360 → stats còn 180f.

### Vòng 8 — đã sửa
- Brand: "Một câu hỏi thay hàng giờ tổng hợp"; Ask: "Bạn hỏi, AI trả lời như chuyên gia"; "Semanio là" tô màu.
- Hook: bỏ đồng hồ đêm → "Và nhiều ngày ngồi khớp số" + lịch bóc vắt qua kỳ chốt quý 3: 27/9 (CN) → 5/10 (T2), đổi "THÁNG 9" → "THÁNG 10" khi sang 01; nhịp lật chậm → nhanh → chậm (khoảng cách 11·7·5·4·5·7·11 khung), T7/CN chữ đỏ, mỗi lần lật một tiếng giấy nhỏ.

### Vòng 9 — đã sửa
- Hook: bỏ lớp phủ navy "đêm" (lạc tông) → nền sáng; lịch bóc 25/9 (T6) → 5/10 (T2), 11 tờ, nhịp chậm-nhanh-chậm; bóng đổ chỉ ở tờ dưới cùng.
- "Chương tối" (DarkCtx trong kit): agent → dashTitle → realFilter → realHover → insightTitle → realInsightMenu → realInsight → deckIntro → realDeck → deck. Stage/Headline/nhãn quay thật/chip/viền slide tự đổi màu; lóe sáng chỉ ở vào chương (agent) và ra chương (zalo).
