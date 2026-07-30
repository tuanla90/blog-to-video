# Cấu hình dự án tiêu dùng

Một dự án dùng `blog2video` được nhận diện bằng file **`video.config.json`** ở gốc. Mọi lệnh CLI leo từ thư mục hiện tại lên tìm file này, nên gọi ở thư mục con cũng chạy đúng.

## Bộ khung tối thiểu

```
du-an/
  video.config.json
  package.json          "blog2video": "github:<user>/blog2video#v0.1.0"
  remotion.config.ts
  .env                  key ElevenLabs — KHÔNG commit
  src/index.ts          gọi applyConfig() rồi makeRoot()
  src/videos.gen.ts     sinh tự động, nên gitignore
  videos/<slug>/        content.py, scenes.json, thumb.json (+ file sinh ra)
  public/               engine sync lottie vào đây; brand asset của bạn cũng để đây
  out/                  sản phẩm — gitignore
```

`npx blog2video init` dựng sẵn cái khung này.

## Các nhóm cấu hình

| Nhóm | Ai đọc | Ghi chú |
|---|---|---|
| `brand` | `Root.tsx`, `ui.tsx`, `gen-thumb.mjs` | `accent` là màu chính, chảy vào `C.accent` của cả kit |
| `audio` | `Root.tsx`, `kit.tsx` | `bed: null` = không nhạc nền; `whoosh: null` = tắt hiệu ứng chuyển cảnh |
| `pacing` | `Root.tsx`, `kit.tsx`, `gen_audio.py` | tính bằng **giây**. `leadIn` cả 3 chỗ cùng đọc — sửa 1 chỗ, không lệch sync nữa |
| `thumb` | `gen-thumb.mjs` | đường dẫn tính từ `public/` |
| `categories` | `gen-thumb.mjs` | phần tử **đầu tiên** là màu mặc định khi `thumb.json` khai category lạ |
| `paths` | mọi script | đổi được nếu bạn không thích layout mặc định |

Định nghĩa đầy đủ kèm mô tả từng field: [`video.config.schema.json`](../video.config.schema.json) (trỏ `$schema` vào đó để editor gợi ý).

## Biến môi trường (`.env` ở gốc dự án)

Key và thứ phụ thuộc máy **không** nằm trong `video.config.json`:

| Biến | Dùng cho |
|---|---|
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | bắt buộc cho `blog2video audio` |
| `ELEVENLABS_MODEL`, `_STABILITY`, `_STYLE`, `_SIMILARITY`, `_SPEED` | tinh chỉnh giọng |
| `CHROME` | đường dẫn Chrome khi CDN Chromium bị chặn (render + thumbnail) |
| `B2V_PYTHON` | python có `numpy` + `av` cho `align`/`scaffold` (mặc định dò `.venv-whisper`) |

Xem `.env.example` trong repo engine.

## Vì sao `applyConfig()` phải gọi ở entry

Kit dựng bảng màu `C` ở module scope và ~1400 dòng đọc `C.accent` khắp nơi. Config là **singleton mutate tại chỗ**, `C.accent` là **getter** đọc lười. Điều kiện duy nhất: `applyConfig()` chạy trước lúc render — đúng vậy nếu bạn gọi nó ngay trước `registerRoot()`.

Hệ quả cần nhớ: **đừng import `CONFIG` rồi đọc giá trị ở module scope** trong code của bạn — lúc đó config chưa nạp. Đọc bên trong component hoặc trong hàm.

## `sync-assets` — đừng quên

```bash
npm run sync-assets
```

Remotion `staticFile()` chỉ đọc `public/` của project đang chạy, **không** với tới `node_modules`. Lệnh này copy:

- `assets/lottie` → `public/lottie/`
- `assets/sfx` → `public/<audio.sfxDir>/` (mặc định `public/audio/sfx/`)

Quên chạy = render gãy vì thiếu `whoosh.wav`. Chạy lại sau mỗi lần nâng cấp engine.

**Nhạc nền không đi kèm** — chọn track của bạn, bỏ vào `public/audio/music/`, trỏ `audio.bed`. Để `null` là tắt hẳn nhạc nền.
