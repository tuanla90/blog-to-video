# blog2video

Biến một bài viết thành **video kinetic typography** (16:9 + Short 9:16) và thumbnail YouTube — bằng cách viết dữ liệu, không viết JSX.

Một tập video = 3 file trong `videos/<slug>/`:

| File | Bạn viết gì |
|---|---|
| `content.py` | lời thoại từng beat |
| `scenes.json` | màn hình từng beat |
| `thumb.json` | thumbnail |

Engine lo phần còn lại: gọi TTS, căn caption tới từng từ, dựng composition Remotion, render mp4, chụp thumbnail 1280×720.

---

## Cần có

| | |
|---|---|
| Node | 20+ |
| Python | 3.10+ (`numpy`, `av` cho căn caption — bỏ qua được nếu chỉ xem trước) |
| Chrome | bản cài sẵn cũng được, xem `CHROME` bên dưới |
| ElevenLabs API key | chỉ cần khi sinh giọng thật; xem trước thì không |

---

## Bắt đầu

Engine chưa lên npm — cài thẳng từ GitHub:

```bash
git clone https://github.com/tuanla90/blog-to-video ~/blog2video && cd ~/blog2video && npm install
```

Rồi dựng dự án video:

```bash
mkdir kenh-cua-toi && cd kenh-cua-toi
node ~/blog2video/bin/blog2video.mjs init
npm install
npm run sync-assets
npm run studio
```

`init` tự dò remote của engine và ghi dep là `github:tuanla90/blog-to-video#v0.1.0` (chưa push thì ghi `file:` trỏ thẳng thư mục engine).

Không muốn clone thì khai thẳng trong `package.json` của bạn:

```json
"dependencies": { "blog2video": "github:tuanla90/blog-to-video#v0.1.0" }
```

Tên gói (`blog2video`) khác tên repo (`blog-to-video`) — npm không sao. Cài kiểu này mất ~2 phút vì npm kéo devDeps rồi chạy `prepare` để build `dist/`.

`init` dựng sẵn `package.json`, `video.config.json`, `tsconfig.json`, `remotion.config.ts`, `src/index.ts`, `.gitignore` và **một slug mẫu** `videos/vi-du/`. Sau `sync-assets` là mở Studio thấy video mẫu chạy ngay — đó là cách xác nhận engine ok trước khi viết gì.

Rồi:

```bash
npm run scaffold -- vi-du
```

`scaffold` dựng audio câm + timing ước lượng từ số ký tự, để **xem bố cục trước khi tốn credit TTS**. Khi lời thoại đã chốt mới chạy giọng thật.

Bước tiếp theo là sửa `video.config.json` (tên kênh, màu, category) rồi viết slug đầu tiên của bạn. Xoá `videos/vi-du/` khi không cần nữa.

---

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `npm run sync-assets` | copy lottie + sfx của engine vào `public/` |
| `npm run scaffold -- <slug>` | audio câm + timing ước lượng (chưa cần TTS) |
| `npm run studio` | mở Remotion Studio |
| `npm run registry` | sinh lại `src/videos.gen.ts` sau khi thêm/sửa slug |
| `npm run thumb -- <slug>` | sinh thumbnail 1280×720 |
| `npm run build -- <slug>` | trọn dây chuyền: TTS → timing → registry → render |
| `npm run edit -- <slug>` | server sửa `scenes.json` cạnh Studio, tự lưu |

`build` nhận thêm `--skip-audio`, `--no-render`, `--tts-conc N`, `--render-conc N`.

> **Dùng `npm run`, đừng dùng `npx blog2video`** khi engine cài từ `file:`/GitHub. `npx` sẽ hỏi registry npm trước và có thể treo sau proxy công ty. `npm run` lấy thẳng từ `node_modules/.bin`.

---

## Ba file bạn viết

### `content.py` — lời thoại

```python
ORDER = ["00", "01", "02"]

BEATS = {
"00":
"Câu hook, ném thẳng vào nỗi đau.\n"
"[surprised] Mỗi \\n là một nhịp ngắt nghỉ khi đọc.",

"01": "...",

"short-outro":
"Đáp án gói gọn cho bản Short.",
}

PRON = {"SQL": "ét-quèo"}   # đổi cách ĐỌC; caption vẫn giữ chính tả gốc
```

- Beat `"00"` là hook, đồng thời là beat được cắt ra làm Short. `"short-outro"` là vế chốt của Short — thiếu nó thì engine chỉ dựng bản Long.
- `[tag]` đặt ngay trước câu cần đổi giọng: `[thoughtful] [surprised] [excited] [annoyed] [frustrated] [sarcastic] [confident] [hesitant]`. Đây là delivery cue của ElevenLabs v3; model v2/v2.5 sẽ bị strip tự động thay vì đọc to cái tag.
- Muốn sửa lời qua CMS thì đặt `script.json` cùng thư mục — engine ưu tiên file đó hơn `content.py`.

### `scenes.json` — hình

```json
{
  "00": {
    "bg": "NHÃN GÓC TRÊN-TRÁI",
    "holdSec": 1,
    "moments": [
      { "w": 10, "gap": 3, "stack": [
        { "el": "lottie", "name": "question", "at": 2, "size": 13 },
        { "el": "text", "value": "Số [accent:không] biết nói dối", "size": 6 }
      ]}
    ]
  }
}
```

- `moments` = các nhịp trong beat, `w` là trọng số thời lượng. `stack` = cột element xếp dọc, `at` = frame nó xuất hiện.
- Element: `text · label · caption · chip · chips · cards · date-cards · bars · line · scatter · waterfall · list · dots · gauge · recap · cta · icons · flow · lottie · sfx · custom`.
- Rich-text trong `value`: `[accent:…] [good:…] [warn:…] [bad:…] [muted:…] [purple:…]`, và `[br]` để xuống dòng (chạy được cả bên trong span màu).
- Hình một-lần-dùng: thêm `videos/<slug>/customs.tsx` export map `CUSTOMS`, gọi bằng `{"el":"custom","name":"..."}`.

Hai luật hay bị vi phạm:

1. **Số nói = số item hiện.** Lời đọc "năm thứ" thì list phải đủ 5 dòng.
2. **Element rộng phải fit cả 16:9 lẫn 9:16.** Bản Short hẹp hơn nhiều — `cards`/`bars`/`recap` dễ tràn.

### `thumb.json` — thumbnail

Bắt buộc: `layout`, `category` (khớp một mục trong `categories` của config), `catLabel`, `kicker`. Màu suy theo category — không set tay.

| layout | field riêng |
|---|---|
| `question` | `{pre, em}` — `em` là vế lật, tô đỏ |
| `highlight` | `{pre, hl}` — `hl` được bôi màu |
| `cards` | `{cards:[{label,value,color}], hook:{pre,em}}` |
| `bignum` | `{value, label, contrast}` |
| `vs` | `{left, right, tail}` |
| `mockup` | `{hook:{pre,em}, query}` |
| `split` | `{left:{title,sub}, right:{title,sub}, kicker}` |
| `code` | `{hook (dùng [em]…[/em]), code:[dòng…]}` |
| `chart` | `{hook:{pre,em}, chart}` |

Thêm `"person": false` nếu không muốn chèn ảnh người dẫn.

---

## Cấu hình

Tất cả thứ riêng của kênh nằm trong `video.config.json`: `brand` (tên, màu accent, wordmark, chữ ký), `audio` (nhạc nền, sfx), `pacing` (nhịp thở, tính bằng giây), `thumb` (ảnh người dẫn, logo), `categories` (bảng màu thumbnail), `paths`.

Field đầy đủ kèm mô tả: [`video.config.schema.json`](video.config.schema.json) — trỏ `$schema` vào đó để editor gợi ý. Giải thích từng nhóm: [`docs/CONFIG.md`](docs/CONFIG.md).

Key và thứ phụ thuộc máy đi qua `.env` chứ không vào config:

| Biến | Dùng cho |
|---|---|
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | bắt buộc để sinh giọng |
| `ELEVENLABS_MODEL`, `_STABILITY`, `_STYLE`, `_SIMILARITY`, `_SPEED` | tinh chỉnh giọng |
| `CHROME` | đường dẫn Chrome khi CDN Chromium bị chặn |
| `B2V_PYTHON` | python có `numpy`+`av` (mặc định dò `.venv-whisper`) |

---

## Asset: cái nào dùng chung

| | Ở đâu | Chung? |
|---|---|---|
| Lottie — 14 icon đã recolor theo accent + bản gốc | `assets/lottie` | ✅ `sync-assets` copy sang |
| SFX — 13 file (whoosh, riser, pop, type…) | `assets/sfx` | ✅ `sync-assets` copy sang |
| Nhạc nền | dự án của bạn | ❌ bed là lựa chọn thẩm mỹ từng kênh, khai ở `audio.bed`; để `null` là tắt |
| Logo, ảnh người dẫn | `public/thumb/` của bạn | ❌ brand riêng |

Lottie recolor theo accent brand: sau khi đổi `brand.accent`, chạy `python scripts/recolor_tier1.py` bên engine để sinh lại từ `assets/lottie/_src/`.

---

## Nâng cấp engine, mọi dự án hưởng

Sửa engine một chỗ thì kit element, layout thumbnail, TTS/align, CLI, bản vá gotcha lan sang mọi dự án. Nội dung (`videos/`, `video.config.json`, brand asset) thì không — đó là của riêng từng kênh.

| Cách nối | Khi engine đổi |
|---|---|
| `"blog2video": "file:/duong/dan/blog2video"` | thấy ngay, sau khi chạy `npm run build:lib` bên engine |
| `"blog2video": "github:owner/blog2video#v0.1.0"` | phải bump tag + `npm update` |

Đang phát triển engine thì dùng `file:`. Khi engine đã chín, **pin tag** — không thì một hôm bạn tinh chỉnh nhịp cho kênh mới, kênh cũ render ra khác đi mà không hay.

Sau mỗi lần nâng cấp: `npm run sync-assets` (lấy lottie/sfx mới).

---

## Gotcha

- **`staticFile()` chỉ đọc `public/` của project đang chạy**, không với tới `node_modules`. Đó là lý do phải có `sync-assets`. Quên chạy = render gãy vì thiếu `whoosh.wav`.
- **Đừng đọc `CONFIG` ở module scope** trong code của bạn. `applyConfig()` chạy sau khi mọi import xong; đọc trong component hoặc trong hàm.
- **Thumbnail không byte-deterministic.** HTML sinh ra thì có, nhưng Chrome rasterize webfont khác nhau giữa các phiên. So sánh thumbnail bằng mắt hoặc bằng `thumb-src/<slug>.html`, đừng bằng hash.
- **QA bằng `remotion still --frame=N`**, đừng render full — render một tập tốn vài phút CPU.
- **Console Windows cp1252** làm python in tiếng Việt là `UnicodeEncodeError`. CLI đã set `PYTHONUTF8=1`; chạy script trực tiếp thì tự set.
- **CDN Chromium bị chặn** (proxy công ty): set `CHROME` trỏ Chrome cài sẵn.
- Thêm gotcha môi trường (onnxruntime, proxy MITM, ctranslate2 segfault): [`docs/PIPELINE.md`](docs/PIPELINE.md).

---

## Plugin Claude Code

```bash
claude plugin marketplace add /duong/dan/blog2video
```

Cho skill `video-forge` (cách viết bundle) + workflow `video-pipeline` (batch: bài viết → `content.py` + `thumb.json` + vòng soát giọng). Workflow nhận `ctx` giọng của dự án qua args — engine không giữ giọng của ai.

Thêm skill `promo-forge` cho video giới thiệu sản phẩm không giọng (xem mục dưới).

---

## Short đối đáp hai nhân vật: `duo`

Kiểu Short 9:16 riêng: hai mascot thay nhau nói, bảng đố ở giữa (đề, code, 4 đáp án, đếm ngược, lật đáp án, giải thích), bong bóng thoại chạy theo từng tiếng, mascot đổi biểu cảm liên tục. Một tập = một file `videos/<slug>/duo.json`; giọng từng nhân vật (ElevenLabs v3 có thẻ cảm xúc / Google / Edge) và nhạc nền tự khớp.

```bash
npx blog2video duo <slug>      # giọng từng câu + mốc giờ (có cache)
npx blog2video registry        # mảng DUOS, composition <slug>-Duo
```

Cách viết kịch bản, lệnh hình, giao diện `theme: "semanio"`: [`docs/DUO.md`](docs/DUO.md). Dự án dùng thật: `diem10code-shorts` (có quy trình giao cho AI khác làm tập mới).

## Video sản phẩm không giọng: `promo/`

Dự án Remotion riêng (Remotion 4.0.351, React 18) cho video promo/demo 2–3 phút: chữ to theo nhịp nhạc, cảnh giao diện dựng lại, clip quay màn hình thật có zoom + gợn sóng bấm, nhiều phiên bản trên cùng timeline. Dùng chung SFX của `assets/sfx`.

```bash
cd promo && npm install && npm run sync-assets && npm run studio
```

Quy trình, luật chữ, khớp nhạc, quay clip (Playwright / OpenVid), prompt nhạc: [`promo/PLAYBOOK.md`](promo/PLAYBOOK.md).

---

## Không có trong này

- **Slide HTML / facecam.** Engine chỉ biết Remotion → mp4.
- **Nhạc nền.** Tự chọn track, trỏ `audio.bed`.
- **Tự viết kịch bản.** Cách chẻ bài thành beat: [`docs/SCRIPT-PROTOCOL.md`](docs/SCRIPT-PROTOCOL.md) — tài liệu này còn lẫn ví dụ của kênh gốc, đọc lấy phương pháp.

---

## Giấy phép

Mã nguồn MIT. **Asset trong `assets/` thì không** — lottie và sfx là của bên thứ ba, xuất xứ chưa rà đủ. Xem [`LICENSE.md`](LICENSE.md) trước khi mở public hoặc phát hành lại.

## Trạng thái

v0.1. Tách khỏi repo `semantix-docs` tháng 7/2026, giữ nguyên history phần máy móc. Bản dùng thật đầu tiên: kênh "Tuấn LA Lab", 14 video — đã đối chứng frame trước/sau khi tách, khớp từng byte.
