# video-remotion — dựng video từ blog (Remotion)

Pipeline kinetic-typography cho kênh YouTube Semantix. Xem quy ước tổng ở `../VIDEO_PLAN.md`.

## Cấu trúc
- `src/beats.json` — manifest mỗi beat: `{id, audio, durationSec, durationInFrames}` (sinh tự động cùng audio).
- `public/audio/beat-*.mp3` — voiceover Vbee từng beat (gitignored).
- `src/scenes.tsx` — 7 scene kinetic (1 scene / beat), data-driven theo thời lượng.
- `src/ui.tsx` — theme (palette app), font (Inter + JetBrains Mono, subset `vietnamese`), helpers animation.
- `src/Root.tsx` — 2 composition: `LongForm` (1920×1080) và `Short` (1080×1920, beat 00).

## Lệnh
> Máy này tải Chromium qua Google CDN bị chặn → dùng Chrome cài sẵn qua `--browser-executable`.

```bash
CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
# Xem trước trong studio:
npx remotion studio src/index.ts
# Render:
npx remotion render src/index.ts LongForm out/metric-long.mp4 --browser-executable="$CHROME"
npx remotion render src/index.ts Short    out/metric-short.mp4 --browser-executable="$CHROME"
# Khung tĩnh QA:
npx remotion still src/index.ts LongForm out/qa.png --frame=320 --browser-executable="$CHROME"
```

## Đổi giọng / sinh lại audio
Audio + `beats.json` sinh bằng script Python gọi Vbee API (xem `../VIDEO_PLAN.md` mục D/E).
Đổi `VOICE` sang voice_code khác (vd `hn_male_thanhlong_talk_48k-fhg`), chạy lại → `public/audio/` + `src/beats.json` cập nhật, render lại.

## Làm video cho bài blog khác
1. Viết kịch bản `../video-scripts/<slug>.md` theo schema (VIDEO_PLAN mục G).
2. Sinh audio + manifest cho slug đó.
3. Thêm scene tương ứng vào `scenes.tsx` (tái dùng các primitive: `Card`, `Bar`, `Chip`, `Moment`, `FadeUp`, count-up).
4. Render.

## Hạn chế bản hiện tại
- Caption **word-level** đã có (xem mục dưới). Scene chính vẫn timing phrase-level theo thời lượng beat — đủ mượt.
- `beats.json` tính thời lượng theo CBR 128kbps (đúng với output Vbee hiện tại).

## Word-level caption (sync từng từ)
`faster-whisper`/`ctranslate2` **segfault** trên máy này (Python 3.13 + setup doanh nghiệp) → không dùng. Thay bằng:
- `align.py` — forced-align **text đã biết** theo **năng lượng âm thanh** (PyAV, no ML). Chạy: `.venv-whisper/Scripts/python.exe align.py` → ghi `src/timings.json` (mỗi beat: các dòng + từng từ kèm start/end).
- `src/Caption.tsx` — render dải caption lower-third, từ đang đọc sáng accent. Đã gắn vào cả LongForm & Short trong `Root.tsx`.
- Đổi giọng/sửa lời → chạy lại `align.py` (text nằm trong `BEATS` của file đó, phải khớp text gửi Vbee).
