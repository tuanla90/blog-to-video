# PLAYBOOK — video giới thiệu sản phẩm KHÔNG GIỌNG (promo-forge)

Đúc kết từ 2 video đã giao (09/2026): bản dự thi Data for Life 2026 (2:37) và bản hội nghị kinh doanh nội bộ ngân hàng (2:37, cùng nhịp nhạc, đổi nội dung). Đọc hết trước khi làm video mới; mục **Luật** là góp ý thật của người duyệt, đừng tái phạm.

---

## 0. Công thức

Kiểu Holistics / Odoo "in two minutes":

- **Không giọng đọc.** Người xem hội nghị/giám khảo hay tắt tiếng; giọng đọc từng bị chê "đều đều".
- **Chữ to vào TRƯỚC, animation theo sau** (được chạy đồng thời). Mỗi 2–4 giây một ý.
- **Không chiếu nguyên màn hình.** Dựng từng mảnh giao diện (ô chat, biểu đồ, thẻ KPI) trên nền sạch, cho bay vào, phóng to, có con trỏ và chú thích.
- **Chèn clip quay thật** ở điểm nhấn (dashboard, xuất file) — phát ĐÚNG tốc độ, chỉ cắt đoạn chờ.
- **Nhạc có nhịp, cắt cảnh theo nhịp, SFX rõ** nhưng nhỏ hơn nhạc.
- Thứ tự kể: **nỗi đau → thương hiệu → định vị → tính năng → vì sao tin được → mở rộng/triển khai → kết + link**.

---

## 1. Dựng dự án

```bash
cd promo && npm install && npm run sync-assets
```

```bash
npm run studio
```

- `remotion.config.ts` trỏ Chrome cài sẵn (mạng công ty chặn tải Chrome Headless Shell). `tools/stills.mjs` dùng API nên KHÔNG đọc config này — đường dẫn Chrome ghi thẳng trong file.
- Duyệt bằng **Studio** (http://localhost:3123/Promo). Chỉ render khi người duyệt nói rõ "render đi" — mỗi lần ~10 phút CPU.
- QA nhanh bằng ảnh: `node tools/stills.mjs Promo out/stills 330,2560,4660 0.5` rồi `python tools/montage.py out/stills out/stills/m.png 2`.

---

## 2. Cấu trúc mã

| File | Vai trò |
|---|---|
| `src/promo/kit.tsx` | `Stage` (nền lưới trôi + vệt sáng, sáng/tối qua `DarkCtx`), `Headline` (từng từ đập vào có nảy, tô gradient từ nhấn), `Shake`, `Burst`, `Whip` (chuyển cảnh trượt + mờ; `softIn/softOut` = hoà tan), `EditionCtx` |
| `src/promo/Promo.tsx` | **Engine**: danh sách cảnh `FEATURES` (id, dur, el, sfx, flash, dark, soft) → tự xếp mốc có chồng `XF` khung; nhạc + SFX; khoá cảnh kết vào `OUTRO_AT` |
| `src/promo/ScreenZoom.tsx` | Clip quay thật trong khung cửa sổ trình duyệt giả, camera theo mốc `keys`, con trỏ vẽ lại (`cursor`) hoặc chỉ gợn sóng bấm (`clicks`), `srcH`/`cropTop` cho bản quay không phải 1920×1080, `badge` (vd "⏱ 30 giây sau") |
| `src/promo/scenesA/B/C/Ask.tsx` | Thư viện cảnh mẫu: Hook lịch bóc, Brand logo, Position (3 KHÔNG + 4 thẻ), Upload, Ask (kế hoạch → biểu đồ), Drill, Edit (thanh ngang → cột), Agent (bước chạy + thẻ kết quả, chương tối), Deck (coverflow slide), Zalo/Teams (điện thoại/cửa sổ chat), Semantic (sơ đồ dựng dần), Stats (marquee), Outro |
| `src/editions/` | Thay nội dung cảnh theo edition (`general` / `dfl` / `internal`), **giữ id + thời lượng** |
| `tools/` | Ghép clip, dò mốc bấm, chụp khung, tăng âm lượng (xem §6) |
| `recorder/` | Quay bằng Playwright + lấy bản quay gốc từ OpenVid |

**Một video mới = sửa `FEATURES` + các cảnh**, không đụng engine. Nhiều phiên bản (YouTube / dự thi / nội bộ) = nhiều edition trên cùng timeline.

---

## 3. Quy trình từng bước

1. **Storyboard** (`STORYBOARD-EXAMPLE.md` là mẫu): bảng cảnh × giây × chữ trên hình × animation × SFX. Chốt câu chữ với người duyệt TRƯỚC khi code.
2. **Số liệu thật**: mọi con số trên hình phải truy được về truy vấn thật (ghi nguồn trong comment). Không bịa kết quả.
3. **Dựng cảnh** trong Studio, chụp still từng cảnh, gửi người duyệt theo từng vòng (ghi mỗi vòng góp ý vào storyboard).
4. **Quay clip thật** (§5), cắt, gắn vào `ScreenZoom`.
5. **Chọn + ghép nhạc**, khoá `OUTRO_AT` (§4).
6. **Duyệt bản web** (Studio) → người duyệt nói "render" → render → **tăng âm lượng** → giao file.

```bash
npx remotion render src/index.ts Promo out/promo.mp4 --concurrency=3
```

```bash
python tools/audio_gain.py out/promo.mp4 out/promo-final.mp4
```

Remotion ra âm RMS ~−23, đỉnh −4,2 dBFS → nghe nhỏ trên loa hội trường. `audio_gain.py` đưa đỉnh về −1 dBFS, copy nguyên luồng hình.

---

## 4. Nhạc và khớp nhịp

- Nhạc 130–140 BPM, có **một khoảng nghỉ/breakdown giữa bài** (đặt vào lúc chuyển sang "chương tối") và **nốt ngân kết thật** (không fade dài).
- Cảnh kết **khoá vào nốt ngân**: `OUTRO_AT = LEAD + round(giây_nhạc_nốt_ngân × 30)`. Cảnh ngay trước (stats) **tự co giãn** để khớp; engine báo lỗi nếu nó còn < 180 khung → phải bớt cảnh khác.
- `LEAD = 36` khung màn hình chờ trước khi vào cảnh đầu; nhạc bắt đầu sau LEAD, fade-in 2 giây.
- Ghép bài cho vừa độ dài: cắt đoạn lặp giữa bài, crossfade 30 ms, điểm ghép rơi đúng khung chuyển cảnh (whip + lóe che mối nối). Người duyệt tự ghép bằng AudioMass cũng được.
- **Đổi thời lượng một cảnh = bù đúng số khung ở cảnh khác**, nếu không mọi mốc sau lệch nhạc.
- SFX: `SFX_GAIN 0.55` chung + `SFX_TRIM` hạ riêng tiếng chói (`wrong 0.35`, `type 0.55`, `riser 0.6`, `ding 0.8`). Không đặt "ting" dày đặc; không "ting" lúc hiện link cuối.
- Không commit file nhạc (bản quyền riêng) — đặt vào `public/music/` rồi đặt `MUSIC_SRC`.

**Prompt tạo nhạc (Suno / Udio / MusicGen):**

```text
Instrumental only, no vocals. Energetic modern tech product promo, 136 BPM, 4/4.
Punchy electronic drums, pulsing synth bass, bright plucks and airy pads, confident and optimistic.
Structure: 0:00 short rising intro (4 bars) → driving main section with clear downbeats every 2 bars →
around 1:15 a 4–8 bar breakdown (drums drop, pads and soft arpeggio only) → big build with riser →
full energy final section → at about 2:30 drums stop on a strong hit, then one sustained chord rings out for 4 seconds.
Clean mix, no long fade-out, suitable for fast cuts and kinetic typography.
```

---

## 5. Clip quay thật

### 5a. Cách tốt nhất: người dùng tự quay (OpenVid / OBS)

Bản quay Playwright (CDP screencast) **bị giật** khi trang nặng — khung hình do trình duyệt chạy ngầm gửi về, hụt tới ~0,5 s. Phần mềm quay màn hình thật luôn đủ khung. Hướng dẫn người quay:

- Quay **tab** trình duyệt (không lộ thanh tab/bookmark), zoom trình duyệt 100%, 60 fps.
- Phóng to con trỏ (Windows › Accessibility › Mouse pointer size ~3), dừng ~1 giây trước mỗi lần bấm, rê chuột chậm.
- Dữ liệu tải xong hết mới thao tác. Quay một mạch dài cũng được, gửi mốc giây cần lấy.
- Lấy **bản gốc** từ OpenVid không cần Xuất: `recorder/openvid-export.js` (dán vào Console tab OpenVid). Bản Xuất của OpenVid có nền hoa + khung, thấp độ phân giải — không dùng.
- Bấm Xuất nhiều lần có thể ra CÙNG một bản quay (chưa chọn đúng bản) → kiểm tra bằng `tools/contact_sheet.py`.

Cắt theo mốc người dùng đưa, nhiều đoạn nối hoà tan, khung đều 30 fps, pha trộn chỗ hụt khung:

```bash
python tools/assemble_video_cuts.py raw.mp4 public/rec/my-insight.mp4 20.8:23.0,24.5:27.5 0.25
```

Dò giây bấm (giao diện đổi đột ngột = dropdown mở, menu hiện) để đặt gợn sóng + tiếng click:

```bash
python tools/find_clicks.py raw.mp4 20 27
```

### 5b. Quay tự động bằng Playwright (khi không có người quay)

```bash
cd recorder && npm install && node login.mjs <profileDir> https://app.example.com
```

```bash
REC_NOCURSOR=1 REC_QUALITY=80 DASH_URL=<url> node rec.mjs <profileDir> out/rec scenarios/dashboard-demo.mjs
```

- Người dùng TỰ đăng nhập trong cửa sổ `login.mjs`; agent không nhập mật khẩu.
- `REC_NOCURSOR=1`: không vẽ con trỏ trong trang → Remotion vẽ lại mượt từ `events.json` (`tools/cursor_json.py`).
- `REC_QUALITY=80`: JPEG 92 làm hụt khung (~23 fps), 80 lên ~46 fps.
- Kịch bản chờ `!document.querySelector('main .animate-spin')` rồi giữ hình 3–4 s; **làm nóng** dropdown tải chậm trước khi quay.
- Ghép: `tools/assemble_cuts.py` (sắp `frames.json` theo t — CDP không luôn tăng dần → hình giật lùi; pha trộn khung hụt; hoà tan giữa đoạn). Kiểm hụt khung: `tools/rec_gaps.py`.

### 5c. Camera + chuyển cảnh (luật người duyệt)

- **Zoom 1 nhịp rồi GIỮ.** Camera nội suy liên tục giữa nhiều mốc → hình trôi, "run run". Muốn lia sang chỗ khác: thêm đúng một mốc chuyển 0,6 s rồi dừng (kiểu bản DFL: zoom vào bảng lọc → dừng → lia sang thẻ số khi tải xong).
- **Hai clip quay thật liền nhau**: cảnh sau `soft: true` (hoà tan), không whip.
- **Cảnh sau cùng nội dung với cảnh trước** (loading → kết quả): vào bằng hoà tan với **cùng độ zoom + cùng tâm** như cuối cảnh trước, giữ 1–1,2 s cho nội dung hiện xong rồi mới zoom vào.
- **Đoạn chờ tải: CẮT** (hoà tan ngắn), không tua nhanh — tua vẫn lộ vòng xoay; sau khi lọc phải thấy biểu đồ đã lọc xong. Thời gian chờ thật ghi bằng `badge` tròn số ("⏱ 30 giây sau", không ghi "36 giây").
- Clip không phải 16:9: `srcH` = chiều cao nguồn; khung cửa sổ tự thấp theo đúng tỉ lệ (không ép vào 16:9 rồi phóng bù → chật). `cropTop` cắt navbar có logo cũ.
- Gợn sóng bấm (`clicks`) + `click.wav` đúng khung bấm; thêm `impact` nhẹ ở nút hành động chính (Xuất).
- Cảnh bấm nút hành động cho dài thêm ~1 s để thấy con trỏ dừng ở nút.

---

## 6. Công cụ `tools/`

| Tệp | Làm gì |
|---|---|
| `stills.mjs` | Bundle 1 lần, chụp nhiều khung của một composition (nhanh hơn `remotion still` từng lần) |
| `montage.py` / `contact_sheet.py` / `rec_frames.py` | Ghép ảnh kiểm tra: các still; khung video theo bước giây; khung bản quay CDP theo giây |
| `find_clicks.py` | In mốc giây giao diện đổi đột ngột trong một đoạn video |
| `rec_gaps.py` | Đo fps thật và chỗ hụt khung của bản quay CDP |
| `assemble.py` | Bản quay CDP → mp4 30 fps (một đoạn) |
| `assemble_cuts.py` | Bản quay CDP → nhiều đoạn, sắp khung, pha trộn khung hụt, hoà tan |
| `assemble_varspeed.py` | Bản quay CDP → tốc độ theo đoạn (chỉ dùng khi bắt buộc tua — người duyệt thích CẮT hơn) |
| `assemble_video_cuts.py` | File video (OpenVid/OBS) → nhiều đoạn, khung đều, hoà tan |
| `cursor_json.py` | `events.json` → đường con trỏ `[t,x,y,click]` cho `ScreenZoom cursor` |
| `audio_gain.py` | Tăng âm lượng video đã render, đỉnh −1 dBFS |
| `sync-assets.mjs` | Chép SFX dùng chung từ `../assets/sfx` |

Python cần `av`, `numpy`, `Pillow` (đặt `PROMO_PY_SITE` nếu các gói nằm ở venv khác).

---

## 7. Luật chữ trên hình (góp ý thật của người duyệt)

- **Không gạch dài "—", không chấm cuối câu.**
- Tiêu đề **một dòng** (tự co cỡ chữ); chip/badge **không được rơi 2 dòng** — rút gọn chữ.
- Không bịa đơn vị: tiền chỉ hiện ký hiệu khi hệ thống cấu hình; đổi ngôn ngữ không đổi ký hiệu.
- Không dùng emoji/ký hiệu (🚀 💬 📊 ✓…) trong giao diện dựng lại — dùng **icon Lucide** (nhúng đường vẽ SVG). Icon tự vẽ trông "lạ".
- Không tô nổi một mục trong danh sách nếu không có lý do kể chuyện.
- Các phần trên/dưới của một cảnh phải **nối ý với nhau** (vd dải nghiệp vụ ở trên → 3 ý "mở rộng thế nào" ở dưới, không phải 3 ý bảo mật rời rạc).
- Tránh từ kỹ thuật với khán giả kinh doanh ("SQL" ở phần định vị).
- Hook: nỗi đau cụ thể của khán giả (bản dự thi: nhiều ngày khớp số cuối kỳ; bản ngân hàng: hàng chục yêu cầu số liệu xếp hàng) + **lịch bóc** vắt qua kỳ chốt số, bắt đầu ngày thường, nhịp lật chậm → nhanh → chậm.

### Tính trung thực

- Cảnh dựng lại có nhãn nhỏ "Minh hoạ dựng từ giao diện và số liệu thật của …".
- Tính năng **chưa có** chỉ được xuất hiện dưới dạng lộ trình: nhãn "Sắp ra mắt" + chú thích "Minh hoạ tính năng trong lộ trình".
- Dữ liệu **mô phỏng/UAT**: nhãn trên clip "Tính năng thật · số liệu UAT mô phỏng", chú thích cảnh dựng, và một dòng ở cảnh kết — ai hỏi cũng tìm thấy, nhưng không gây chú ý.
- Clip Agent/AI: số trên thẻ lấy từ lượt chạy THẬT (ghi số bước, số giây thật).

### Nhiều phiên bản

- `general` (YouTube/giới thiệu chung), `dfl` (dự thi: dòng cuộc thi ở outro), `internal` (nội bộ: tên thương hiệu nội bộ, link môi trường nội bộ, nhãn dữ liệu mô phỏng).
- Đổi tên thương hiệu: `LogoWordmark text`, mọi chữ tên trên hình, thanh địa chỉ giả trong `ScreenZoom`, chân trang slide (sửa chữ trong file HTML deck rồi chụp lại), cắt navbar có logo cũ trong clip.

---

## 8. Bẫy môi trường (Windows)

- Bash: `python - <<EOF` (heredoc qua stdin) **treo** → luôn ghi script ra file rồi chạy.
- File CRLF: `sed` với `$` không khớp → sửa bằng Node/Python đọc–thay–ghi, giữ CRLF.
- Console cp1252 vỡ tiếng Việt → `sys.stdout.reconfigure(encoding='utf-8')`.
- Junction `node_modules` (không `ln -s`); xoá junction bằng `cmd /c rmdir`, không `Remove-Item`.
- Web app sau khi deploy lại: "Server Action not found" → chạy lại kịch bản.
- Playwright: tên nút chính xác (`getByRole(..., { exact: true })`) — regex rộng trúng nhầm nút khác; banner PWA tắt bằng localStorage trước khi quay; công tắc/cài đặt bị kịch bản bật phải trả lại như cũ.
- Đẩy file media lớn lên GitHub (> 50 MB) có cảnh báo LFS; video giao cho người xem nên để ngoài repo mã.
