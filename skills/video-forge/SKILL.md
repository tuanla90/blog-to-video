---
name: video-forge
description: Dựng một video kinetic-typography từ bài viết bằng engine blog2video — viết content.py (lời thoại theo beat), scenes.json (hình), thumb.json (thumbnail), rồi chạy pipeline. Dùng khi cần biến một bài viết/ý tưởng thành video, hoặc sửa bundle video đã có.
---

# video-forge — dựng bundle video

Engine `blog2video` render video từ **dữ liệu**, không từ JSX. Làm một video = viết 3 file trong `videos/<slug>/`, không đụng code kit.

Đọc trước khi viết: `blog2video/docs/SCRIPT-PROTOCOL.md` (chẻ bài thành beat), `blog2video/docs/PIPELINE.md` (gotcha), `blog2video/docs/CONFIG.md` (config dự án). Tông giọng thì theo tài liệu của chính dự án, không theo file này.

## 1. `content.py` — lời thoại

```python
ORDER = ["00", "01", "02", "03"]
BEATS = {
"00": "Câu hook.\n"
      "Câu tiếp, mỗi \\n là một nhịp ngắt nghỉ.",
"01": "...",
"short-outro": "Đoạn chốt cho bản Short.",
}
PRON = {"SQL": "ét-quèo"}   # thay từ TRONG TEXT GỬI TTS; caption giữ chính tả gốc
```

- Beat `"00"` = hook, cũng là beat cắt Short. `"short-outro"` = đáp án của Short.
- `\n` = nhịp ngắt. `[tag]` inline (vd `[thoughtful]`) = audio-tag ElevenLabs v3, đặt ngay trước câu cần đổi giọng; model v2/v2.5 sẽ bị strip tự động.
- Nguồn lời thoại có thể là `script.json` thay cho `content.py` nếu dự án sửa qua CMS — engine ưu tiên `script.json`.

## 2. `scenes.json` — hình theo beat

```json
{ "00": { "bg": "NHÃN GÓC TRÊN", "holdSec": 2,
          "moments": [ { "w": 20, "gap": 3, "stack": [ {"el": "label", "text": "..."} ] } ] } }
```

- `w` = trọng số thời lượng của moment trong beat; `stack` = cột element xếp dọc, `at` = frame xuất hiện.
- Element có sẵn: `text · label · caption · chip · chips · cards · date-cards · bars · line · scatter · waterfall · list · dots · gauge · recap · cta · icons · flow · lottie · sfx · custom`.
- Rich-text trong `text`: `[accent:..] [good:..] [warn:..] [bad:..] [muted:..] [purple:..]` và `[br]` (xuống dòng, chạy được cả bên trong span màu).
- **Số nói = số item hiện trên hình.** Lời "năm thứ" thì list phải đủ 5 dòng.
- Element rộng (cards/bars/recap) phải fit CẢ 16:9 lẫn 9:16 — bản Short hẹp hơn nhiều.
- Hình một-lần-dùng: `videos/<slug>/customs.tsx` export map `CUSTOMS`, gọi bằng `{"el": "custom", "name": "..."}`.

## 3. `thumb.json` — thumbnail 1280×720

Bắt buộc: `layout`, `category` (tên phải khớp một mục trong `categories` của `video.config.json`), `catLabel`, `kicker`. Màu tự suy theo category — **không set màu tay**.

| layout | field riêng |
|---|---|
| `question` | `{pre, em}` — em = vế lật, tô đỏ |
| `highlight` | `{pre, hl}` — hl được bôi màu |
| `cards` | `{cards:[{label,value,color}], hook:{pre,em}}` |
| `bignum` | `{value, label, contrast}` |
| `vs` | `{left, right, tail}` |
| `mockup` | `{hook:{pre,em}, query}` — giả lập màn chat → chart |
| `split` | `{left:{title,sub}, right:{title,sub}, kicker}` |
| `code` | `{hook (dùng [em]..[/em]), code:[dòng...]}` |
| `chart` | `{hook:{pre,em}, chart}` — chỉ khi thật cần |

Hook ngắn, punchy, khớp beat mở của `content.py`.

## 4. Chạy

```bash
npx blog2video scaffold <slug>     # chưa có voice: audio câm + timing ước lượng
```

```bash
npx blog2video studio              # duyệt trong Remotion Studio
```

```bash
npx blog2video build <slug>        # TTS -> timing -> registry -> render
```

**Duyệt trong Studio trước, chỉ render khi được yêu cầu rõ ràng** — render tốn vài phút CPU mỗi video. QA nhanh bằng `remotion still --frame=N` thay vì render full.
