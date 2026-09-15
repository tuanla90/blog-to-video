---
name: promo-forge
description: Dựng video giới thiệu sản phẩm KHÔNG GIỌNG (2–3 phút) bằng Remotion trong thư mục promo/ của blog2video — chữ to theo nhịp nhạc, cảnh giao diện dựng lại, clip quay màn hình thật có zoom, nhiều phiên bản (YouTube / dự thi / nội bộ) cùng timeline. Dùng khi cần video promo/demo sản phẩm, video hội nghị, hoặc sửa video promo đã có.
---

# promo-forge — video sản phẩm không giọng

Làm việc trong `blog2video/promo/`. **Đọc `promo/PLAYBOOK.md` trước khi viết dòng nào** — trong đó là luật chữ và luật camera do người duyệt thật đặt ra.

## Vòng làm việc

1. **Storyboard trước, code sau.** Bảng cảnh × giây × chữ × animation × SFX (mẫu `promo/STORYBOARD-EXAMPLE.md`). Chốt câu chữ với người dùng.
2. **Số liệu thật.** Mọi con số truy được về truy vấn thật; ghi nguồn trong comment. Dữ liệu mô phỏng → nhãn "số liệu UAT mô phỏng". Tính năng chưa có → nhãn "Sắp ra mắt" + "Minh hoạ tính năng trong lộ trình".
3. **Dựng cảnh** trong `src/promo/` (engine `Promo.tsx`, bộ khung `kit.tsx`, clip `ScreenZoom.tsx`). Phiên bản khác = `src/editions/`, giữ id + thời lượng cảnh.
4. **QA bằng ảnh**, không render: `node tools/stills.mjs Promo out/stills f1,f2,f3 0.5` + `python tools/montage.py`. Tự xem ảnh trước khi báo người dùng.
5. **Cho người dùng xem bản web** (Remotion Studio, cổng 3123). Ghi từng vòng góp ý vào storyboard.
6. **Render chỉ khi được bảo**, rồi luôn chạy `tools/audio_gain.py` trước khi giao.

## Luật hay bị vi phạm

- Không "—", không chấm cuối câu; tiêu đề một dòng; chip không rơi 2 dòng.
- Không emoji/ký hiệu trong giao diện dựng lại → icon Lucide nhúng SVG.
- Camera: zoom 1 nhịp rồi GIỮ; lia thì 1 mốc rồi dừng. Không nội suy liên tục.
- Đoạn chờ tải: CẮT (hoà tan), không tua. Badge thời gian chờ ghi số tròn.
- Hai clip quay liền nhau → `soft: true`. Loading → kết quả: cùng khung zoom, hiện xong mới zoom.
- Đổi `dur` một cảnh phải bù khung ở cảnh khác; cảnh kết khoá vào nốt ngân của nhạc (`OUTRO_AT`).
- Clip quay tốt nhất là người dùng tự quay (OpenVid/OBS); lấy bản gốc bằng `recorder/openvid-export.js`, cắt bằng `tools/assemble_video_cuts.py`, dò giây bấm bằng `tools/find_clicks.py`.

## Không làm

- Không nhập mật khẩu, không tạo tài khoản khi quay — người dùng tự đăng nhập (`recorder/login.mjs`).
- Không commit nhạc, bản quay thô có dữ liệu thật, hồ sơ trình duyệt.
- Không đẩy video/dữ liệu nội bộ của khách hàng vào repo này.
