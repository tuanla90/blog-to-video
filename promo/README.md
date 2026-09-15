# promo-forge

Video **giới thiệu sản phẩm không giọng** bằng Remotion: chữ to đập vào theo nhịp nhạc, cảnh giao diện dựng lại, clip quay màn hình thật có zoom + gợn sóng bấm, nhiều phiên bản (chung / dự thi / nội bộ) trên cùng một timeline.

Khác `blog2video` (bài viết → kinetic typography có giọng đọc): đây là video sản phẩm 2–3 phút, không lời thoại, dựng bằng JSX cho từng cảnh. Dùng chung SFX ở `../assets/sfx`.

```bash
npm install && npm run sync-assets && npm run studio
```

Mở http://localhost:3123/Promo — ví dụ đầy đủ là video Semanio 2:37 (dự thi Data for Life 2026). Không có nhạc cho tới khi bạn đặt `MUSIC_SRC` trong `src/promo/Promo.tsx`.

| Đọc | Để làm gì |
|---|---|
| [`PLAYBOOK.md`](PLAYBOOK.md) | Toàn bộ quy trình, luật chữ, khớp nhạc, quay clip, prompt nhạc, bẫy |
| [`STORYBOARD-EXAMPLE.md`](STORYBOARD-EXAMPLE.md) | Kịch bản mẫu + nhật ký từng vòng góp ý |
| `src/editions/internal.tsx` | Mẫu thay cảnh bằng clip tự quay (srcH, cropTop, clicks) |
| `recorder/` | Quay bằng Playwright; `openvid-export.js` lấy bản quay gốc từ OpenVid |

Agent: skill `skills/promo-forge/SKILL.md`.

Clip quay màn hình và ảnh chụp (`public/rec/`, `public/footage/`) không nằm trong repo — tự quay bằng `recorder/` hoặc chép vào đúng đường dẫn trước khi render.
