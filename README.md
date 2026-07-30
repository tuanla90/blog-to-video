# blog2video

Dây chuyền **bài viết → video kinetic typography**: Remotion kit + TTS + căn timing theo từng từ + thumbnail YouTube.

Tách ra từ `semantix-docs` (2026-07) để dùng lại cho dự án khác. Repo này chỉ chứa **máy móc** — nội dung (kịch bản, brand, giọng) nằm ở repo tiêu dùng.

## Repo này có gì

| Thư mục | Nội dung |
|---|---|
| `src/` | Remotion kit: `kit.tsx` (element scene), `Caption.tsx` (caption word-level), `ui.tsx` (theme/font/animation), `root.tsx` (factory dựng composition), `thumbnail.tsx`, `lotties.ts`, `og.tsx` |
| `scripts/` | `gen_audio.py` (TTS), `align.py` (forced-align theo năng lượng), `scaffold.py` (dựng khung khi chưa có voice), `build.py` (driver batch), `gen-registry.mjs`, `gen-thumb.mjs` (9 layout), `edit-server.mjs`, bộ `tts_*.py`, tool lottie |
| `assets/lottie/` | 27 icon lottie đã recolor theo accent (bản gốc ở `_src/`) |
| `docs/` | `PIPELINE.md` (gotcha khi dựng — đọc trước khi debug), `SCRIPT-PROTOCOL.md` (chẻ bài viết thành beat), `LOTTIE-LIST.md`, `CONFIG.md` |
| `examples/_example/` | 1 slug tối giản để smoke-test engine độc lập |

## Mô hình

Repo tiêu dùng giữ **nội dung + brand**, engine giữ **cách dựng**:

```
du-an-cua-ban/
  video.config.json      brand, palette, voice, đường dẫn      <- bạn viết
  videos/<slug>/
    content.py           lời thoại theo beat (BEATS/ORDER/PRON) <- bạn viết
    scenes.json          hình theo beat                          <- bạn viết
    thumb.json           thumbnail                               <- bạn viết
    beats/timings/outro.json                                     <- engine sinh
  src/index.ts           4 dòng, gọi makeRoot()                 <- bạn viết 1 lần
  src/videos.gen.ts                                             <- engine sinh
  public/                                                       <- engine sync vào
  out/<slug>/            long.mp4, short.mp4, thumb.png         <- engine sinh
```

## Dùng

```bash
npm i blog2video
npx blog2video init          # dựng video.config.json + src/index.ts + slug mẫu
npx blog2video sync-assets   # copy lottie + asset brand vào public/
npx blog2video scaffold <slug>   # chưa có voice: audio câm + timing ước lượng -> xem trước được ngay
npx blog2video build <slug>      # TTS -> align -> registry -> render
npx blog2video studio            # mở Remotion Studio
```

`sync-assets` **bắt buộc chạy trước lần render đầu**: Remotion `staticFile()` chỉ đọc `public/` của project đang chạy, không với tới `node_modules`.

Cấu hình đầy đủ: [docs/CONFIG.md](docs/CONFIG.md). Gotcha môi trường (Chrome CDN bị chặn, onnxruntime, proxy MITM, cp1252): [docs/PIPELINE.md](docs/PIPELINE.md).

## Trạng thái

v0.1 — vừa tách khỏi `semantix-docs`, giữ nguyên history của phần máy móc. Bản dùng thật đầu tiên là kênh "Tuấn LA Lab" (14 video).
