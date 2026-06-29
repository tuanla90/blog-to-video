# NOTES.md — Bài học & gotcha khi dựng video (Remotion pipeline)

Ghi lại để không vấp lại. Bổ sung mỗi khi gặp lỗi mới. (DNA giọng/nội dung → `../STYLE.md`; brand → `../BRAND.md`.)

## Môi trường (máy công ty này hay vỡ lib native + proxy MITM)
- **Chrome render**: CDN Chromium bị chặn → render bằng Chrome cài sẵn:
  `--browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"`.
- **onnxruntime 1.27** → "DLL initialization routine failed" (KHÔNG phải thiếu VC++ hay AVX — CPU i7-1355U thừa AVX2). Fix: pin `onnxruntime==1.20.1`.
- **HuggingFace tải bị chặn SSL** ("self-signed certificate in chain" = proxy MITM): `pip install truststore` rồi `import truststore; truststore.inject_into_ssl()` ở ĐẦU script (xài kho cert Windows). Pip tải được nhưng httpx của hf thì không.
- **Console Windows cp1252 vỡ khi in tiếng Việt** → chạy với `PYTHONUTF8=1` hoặc `sys.stdout.reconfigure(encoding="utf-8")`.
- **faster-whisper / ctranslate2 segfault** (Python 3.13) → dùng `align.py` (năng lượng) hoặc wav2vec2, TRÁNH ctranslate2.
- venv: `.venv-whisper` (PyAV/numpy cho align/scaffold/extract_ref), `.venv-tts` (VieNeu fallback — open-source).

## Render
- Lệnh: `npx remotion render src/index.ts <slug>-Long out/<slug>/long.mp4 --browser-executable="$CHROME"`.
- `--muted` = render KHÔNG tiếng (xem trước khi chưa có voice). Nhưng `<Audio>` vẫn cần file tồn tại → `scaffold.py` tạo silent placeholder.
- Output quy ước `out/<slug>/{long,short}.mp4` (driver `build.py` đã theo).
- Full Long mất vài phút CPU (vài nghìn frame). **Dùng `remotion still --frame=N` để QA trước** — nhanh hơn nhiều render full.
- Composition id = `<slug>-Long` (1920×1080) và `<slug>-Short` (1080×1920 = beat "00" + "short-outro").

## Authoring scenes.json (kit)
- beat = `{bg, moments:[{w, gap?, stack:[element…]}]}`. Element: text/label/caption/chip/chips/cards/date-cards/bars/line/scatter/waterfall/list/dots/gauge/recap/cta/custom.
- **Rich-text**: `[accent:..] [good:..] [warn:..] [bad:..] [muted:..] [purple:..]` + `[br]` (xuống dòng). `[br]` **chạy được BÊN TRONG span màu** (vd `[bad:abc[br]xyz]`) — đã fix parser.
- **Số nói = số item hiện trên hình**: lời "năm X" thì list phải đủ 5 dòng (đã từng nói 5 kể 4).
- **9:16 Short HẸP hơn 16:9 nhiều** (vmin bằng nhau nhưng bề rộng portrait ~100v vs landscape ~177v). Element rộng (cards/bars/recap/date-cards) phải fit cả 2 tỉ lệ:
  - `cards` ĐÃ tự co theo hướng-màn + số thẻ (value `nowrap`). 3 thẻ là giới hạn dễ chịu cho beat 00.
  - Các element rộng khác: kiểm bằng still 9:16 trước khi chốt.
- Custom visual one-off (vd khối Rubik) → `videos/<slug>/customs.tsx` (export `CUSTOMS` map), gọi `{el:"custom", name:"..."}`. Đa số video KHÔNG cần file này.
- Chart (line/scatter/waterfall) đọc đúng data shape blog ECharts → port từ blog gần như cơ học.

## Pipeline / workflow
- Bundle 1 video = `videos/<slug>/` {content.py, scenes.json, beats.json, timings.json, outro.json} (+ customs.tsx tuỳ chọn). File DÙNG CHUNG duy nhất = `src/videos.gen.ts`, sinh bởi `scripts/gen-registry.mjs` → chạy **1 lần** sau khi mọi bundle xong (đã gitignore).
- **Chưa có voice**: `python scripts/scaffold.py <slug>` → ước lượng thời lượng (chars/17 + nl*0.7) + caption tổng hợp + silent placeholder → render xem trước được.
- **Có voice (ElevenLabs)**: `python gen_audio.py <slug>` → gọi `/with-timestamps` (`eleven_multilingual_v2`) → ghi `public/audio/<slug>/*.mp3` + `beats.json` + `outro.json` + **`timings.json` (word timestamp THẬT)**. Key ở `.env`. `durationInFrames=ceil((LEAD_IN 0.4 + dur + TAIL 0.3)*30)` — LEAD_IN PHẢI khớp Root.tsx. **KHÔNG cần align.py** (build.py mặc định bỏ; `--align` để ép energy-based cho audio không-timestamp).
- **v2.5/multilingual_v2 KHÔNG có audio-tag**: gen_audio STRIP `[excited]/[thoughtful]...` trước khi gửi (kẻo bị đọc to). Cảm xúc = `voice_settings` (stability ~0.35, style ~0.4) + dấu câu. `PRON` dict (content.py) thay phát âm tên riêng → caption hiện bản phiên âm.
- **brand.ts** = nguồn màu/tên brand (primary tím #783ABF). Đổi 1 file → cả video đổi theo.
- **Neo moment theo timestamp giọng (ĐÃ LÀM — hết sync tay):** moment trong scenes.json gắn `"atWord": "<từ khoá>"` (hoặc `"atSec": N`) → kit `useAnchoredSteps` tìm từ đó trong timings.json (tuần tự theo thứ tự moment) và đặt cảnh đúng lúc voice nói (+LEAD_IN). Moment KHÔNG neo thì flow theo weight giữa 2 neo. **v3 đọc mỗi lần một nhịp khác (lệch tới 3-4s) → BẮT BUỘC dùng atWord cho các cảnh cần khớp lời**, đừng tin weight tay (gen lại là lệch).

## Caption / timing
- `timings.json`: đơn vị **giây, relative beat start** (Caption.tsx `t = f/fps`). Format: `[{text,start,end,words:[{w,s,e}]}]`.
- Tag ElevenLabs `[thoughtful]/[surprised]…` trong content.py → **strip trước khi làm caption** (caption chỉ hiện chữ, không hiện tag).

## Thumbnail asset recipe
- **Logo → mark trắng trong suốt**: key tím nền (`#783ABF`) bằng luma threshold (PIL): `alpha=clip((luma-120)/90)*255`, fill trắng, crop bbox → `public/thumb/logo-white.png`. Đặt lên pill nền `#783ABF` → chi tiết trong (database/flask) hiện lại bằng màu pill, liền khối với chữ.
- **Presenter**: greenscreen/removebg (đã trong suốt) → `im.crop(im.getbbox())` bỏ lề → `tuan-crop.png`. Trong thumbnail: `transform: scaleX(-1)` (lật mặt hướng vào trong) + `drop-shadow` tím (rim-light) + để TO (height ~54v, đầu gần chữ).
- PIL có sẵn trong `.venv-tts`.

## Âm lượng / mix (BỘ QUY ĐỊNH)
Voice = 1.0 (gốc). Các lớp khác phải ngồi DƯỚI voice, không át tiếng:
- **Nhạc nền (bed):** `0.15` (ducked) — `BED_VOL` trong `src/Root.tsx`.
- **Whoosh** (chuyển cảnh): `0.45` — `src/Root.tsx`.
- **SFX (ding/wrong/...):** **~0.1** là CHUẨN. Mặc định kit = `0.1` (`kit.tsx` `e.volume ?? 0.1`); chỉnh từng chỗ bằng `"volume"` trong scenes.json. SFX chói (vd "wrong"/tè) hạ thấp hơn (~0.02).
- Chỉnh nhanh: sửa số trong scenes.json (`"volume"`) hoặc Root.tsx → Studio/`localhost:3001` tự cập nhật.
- **Tăng tốc giọng:** v3 **BỎ QUA `speed`** trong voice_settings (test 0.8/1.0/1.2 ra như nhau, chỉ là variance ±~25%). → `gen_audio` time-stretch HẬU KỲ bằng ffmpeg `atempo` (giữ cao độ) + scale timings theo. Bật bằng `ELEVENLABS_SPEED=1.2` trong `.env`. LEAD_IN/TAIL không bị stretch nên tổng nhanh < 1.2x một chút (chỉ phần giọng đúng 1.2x).
- **Lock file khi Studio đang chạy:** ghi đè mp3 lúc Studio mở đọc → `os.replace` lỗi `WinError 5` dai dẳng (Studio hot-reload đọc lại audio mỗi khi file đổi). Fix: **GHI ĐÈ nội dung** (`open(path,"wb")`) thay vì xoá-đổi-tên — Node mở file với share-write nên chịu được.
