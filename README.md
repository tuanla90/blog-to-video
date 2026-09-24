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
- Element: `text · label · caption · chip · chips · cards · date-cards · bars · line · scatter · waterfall · list · dots · gauge · recap · cta · icons · flow · lottie · sfx · custom`, và hai cảnh ảnh tràn khung `world · specimen` (xem dưới).
- Rich-text trong `value`: `[accent:…] [good:…] [warn:…] [bad:…] [muted:…] [purple:…]`, và `[br]` để xuống dòng (chạy được cả bên trong span màu).
- Hình một-lần-dùng: thêm `videos/<slug>/customs.tsx` export map `CUSTOMS`, gọi bằng `{"el":"custom","name":"..."}`.

Hai luật hay bị vi phạm:

1. **Số nói = số item hiện.** Lời đọc "năm thứ" thì list phải đủ 5 dòng.
2. **Element rộng phải fit cả 16:9 lẫn 9:16.** Bản Short hẹp hơn nhiều — `cards`/`bars`/`recap` dễ tràn.

#### Cảnh ảnh: `world` và `specimen`

Hai element này phủ cả khung, nằm dưới các element chữ cùng moment. Moment chứa chúng chỉ crossfade (không trượt/blur), vì camera đã tự chuyển động. Ảnh đặt trong `public/`. **Mọi toạ độ là toạ độ trên ảnh** (0..1, gốc trên-trái), nên cùng một `scenes.json` chạy được cho cả 16:9 lẫn 9:16.

```json
{ "el": "world", "aspect": 1.7778, "fx": "snow", "vignette": 0.35,
  "layers": [
    { "src": "img/bg.png",  "depth": 0.3 },
    { "src": "img/mid.png", "depth": 1 },
    { "src": "img/fg.png",  "depth": 1.6, "sway": { "amp": 1, "period": 4 } } ],
  "camera":   { "from": { "x": 0.4, "y": 0.5, "zoom": 1 }, "to": { "x": 0.6, "y": 0.5, "zoom": 1.25 }, "ease": "inOut" },
  "portrait": { "camera": { "from": { "x": 0.3 }, "to": { "x": 0.5, "zoom": 1.15 } } } }
```

- `camera` chạy từ `from` tới `to` suốt moment. `x,y` = điểm trên ảnh đặt vào giữa khung. `ease`: `inOut · in · out · linear`.
- `depth`: lớp xa `< 1` trôi ít, lớp gần `> 1` trôi nhiều → parallax. Lớp tự phóng dư để không lộ mép (`keep: false` để tắt).
- `sway`: lắc lư quanh `origin` (mặc định đáy giữa) — `amp` độ, `period` giây, `bob` nhún dọc. Hợp với cây cỏ, nhân vật tách nền.
- `fx`: hạt môi trường `snow · dust · embers`. Ảnh một lớp thì viết tắt `"src": "img/x.png"`.

```json
{ "el": "specimen", "src": "img/pikachu-ref.png", "aspect": 1.7778,
  "callouts": [
    { "x": 0.43, "y": 0.64, "zoom": 2.4, "label": "Túi má", "sub": "…", "tag": "📖 POKÉDEX", "color": "warn", "atWord": "má" },
    { "x": 0.83, "y": 0.35, "label": "Chóp đuôi", "tag": "♀ / ♂", "color": "bad" } ] }
```

- Camera mở tổng thể → lần lượt đẩy vào từng callout (đường chỉ + thẻ + khoanh sáng) → lùi ra tổng thể, đánh số mọi điểm (`"outro": "hold"` để bỏ bước cuối).
- Timing từng callout: `atWord`/`atSec` neo theo lời đọc, không neo thì chia theo `w`. `introW`/`outroW` là trọng số hai đoạn tổng thể.
- `zoom` mặc định 2.2. `side: "left" | "right"` ép phía đặt thẻ (mặc định tự chọn). `tagColor` nếu tag khác màu với callout.
- Khung dọc mà ảnh ngang: tự `fit: "contain"` + nền mờ chính ảnh ấy; ép bằng `"fit": "cover"`.
- **Dừng hình để phân tích** — thay `src` bằng `"video": {"src": "video/x.mp4", "from": 0.5, "to": 4, "speed": 1}`. Video chạy suốt đoạn tổng thể đầu; đúng lúc callout đầu tiên mở (neo nó bằng `atWord` vào chữ đang nói) thì đứng hình ở chính khung ấy, loé nhẹ, bớt màu, tối nền (`dim`, mặc định 0.35), rồi soi như ảnh tĩnh. Khung đứng lấy từ chính video nên không có vết nối. `to` chặn trên: hết nguồn trước khi dừng thì đứng ở `to`.
- **Ảnh kẹp trong thẻ** — `callout.media: {"src", "aspect", "from", "to", "speed", "caption", "rotate", "age"}`. Một ảnh hoặc một đoạn video lặp, trình bày như tấm ảnh in dán vào thẻ: viền giấy, băng dính, màu ngả (`age` 0..1, mặc định 0.3), hạt phim; `caption` viết tay trên mép giấy. Dùng để đặt một vật mẫu từ nơi khác cạnh điểm đang soi. Thẻ có ảnh tự rộng và đặt cao hơn.
- **Cả hai cảnh đều cần một ảnh gốc độ phân giải cao** — zoom 2.4× ảnh 1920px là đã vỡ trên bản 1080p. Nên sinh ảnh 3000px trở lên.

#### Chuyển cảnh: cắt thẳng và thẻ chương

- `pacing.between` trong `video.config.json`: `"gap"` (mặc định — khoảng nền `sectionGap` + whoosh giữa mọi beat) hoặc `"cut"` (cắt thẳng, không nền, không whoosh).
- Beat có `"chapter": {"kicker": "V", "title": "..."}` trong `scenes.json` mở một chương: trước beat ấy engine chèn thẻ chương dài `pacing.chapterGap` giây (mặc định 2.2) — hình beat trước tối dần, kicker + title hiện giữa nền tối, rồi beat sau cắt vào. Dùng cho chỗ đổi phần lớn; trong một phần thì để `"cut"`.

#### Cảnh video: `clip`

Giống `world` nhưng nguồn là một file video trong `public/`. Cắt đoạn theo **giây trong file gốc**, chỉnh tốc độ, và vẫn lia/phóng được.

```json
{ "el": "clip", "src": "video/tap-1/rung.mp4",
  "from": 2.7, "to": 5.0, "speed": 0.85, "aspect": 1.75,
  "camera": { "from": { "x": 0.45, "zoom": 1.06 }, "to": { "x": 0.55, "zoom": 1.14 } } }
```

- `from`/`to`: giây trong file gốc. Bỏ trống thì phát từ đầu tới hết.
- `speed`: 1 là nguyên bản, `0.85` chậm lại (nguồn 24 hình/giây chiếu trên timeline 30 thì chậm nhẹ sẽ mượt hơn).
- Đoạn ngắn hơn moment thì **tự phát lại**; tắt bằng `"loop": false`.
- **Tiếng luôn tắt** — nhạc và tiếng động trộn riêng ở `video.config.json`.
- `aspect` là tỉ lệ thật của video (vd 1344×768 → `1.75`), dùng để tính khung cắt cho 16:9 và 9:16.

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
