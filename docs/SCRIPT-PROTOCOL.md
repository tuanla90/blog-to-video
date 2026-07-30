# Blog → Video: Quy trình viết kịch bản (Blog-to-Video Protocol)

> Nguồn: cẩm nang "script-writing-guide" (Antigravity brain) + góp ý chuyên gia MKT (2026-06).
> File này = **QUY TRÌNH**. Tông giọng chi tiết → `../STYLE.md` §TÔNG GIỌNG. Cơ chế kit/scenes → `../video-remotion/NOTES.md`.

Bê nguyên blog (văn viết) lên video (văn nói) = người xem lướt sau 3 giây. Video cần **nhịp nhanh · trực quan · cảm xúc**.

## 5 bước chuyển ngữ

**B1 — Hook = nỗi đau công sở (3 giây đầu).** Không chào hỏi. Ném thẳng khán giả vào bối cảnh họ thấy mình trong đó.
- Blog: "Metric và Dimension là hai khái niệm cơ bản…"
- Video: "Sáng thứ Hai, sếp đập bàn hỏi doanh thu. Sales báo 4 tỷ, Kế toán cãi 3,8. Ai sai?"

**B2 — Hình tượng hoá khái niệm (visual metaphor).** Biến trừu tượng → đồ vật/người đời thường.
- Metric/Dimension → **khối Rubik** (số trên mặt / cách xoay khối).
- Data Engineer vs Analyst → **thợ xây bếp, lắp ống nước** / **đầu bếp nấu ăn**.

**B3 — Văn viết → văn nói (5 kỹ thuật Human-Touch):**
1. **Băm nhỏ câu** — mỗi câu 1 ý. Đọc to thấy hụt hơi = còn dài, chặt tiếp.
2. **Nhịp thở bằng dấu câu** — `...` ép VO ngừng 1 nhịp suy ngẫm ("…Không ai sai cả."). → pipeline: dùng `\n` trong content.py.
3. **Từ cảm xúc + cảm thán** — *trần trụi, khô khốc, sứt đầu mẻ trán, tẩu hoả nhập ma, rác, chắp vá*; từ nối lấy nhịp *Đấy! · Á à! · Ơ · Dạ · đúng không? · Này nhé*.
4. **Câu hỏi tu từ** — hỏi ngược thay vì đáp ngay ("…Bạn thấy quen không?").
5. **Đại từ gần gũi** — *bạn, sếp, anh Sales, chị Kế toán, anh em* (tránh "chúng ta / doanh nghiệp"). Viết như ngồi cafe gỡ rối cho đàn em.
6. **Phát âm tên riêng/ngoại cho TTS** — AI hay đọc sai tên nước ngoài/thương hiệu (vd "KiotViet" → "ki ốt vi ét" sai, đúng là "ki ốt việt"). Khai báo `PRON` dict trong `content.py`: gen_audio **thay từ trong text gửi TTS**, còn **caption/màn hình giữ chính tả gốc**. Test bằng cách đọc to bản TTS, nghe chỗ nào lạ thì thêm vào PRON.

**B4 — Format BEAT** (mỗi beat 3 phần):
- 🎙️ **Voiceover + ▸ ghi chú đạo diễn** (giọng) ở đầu beat — vd `▸ Giọng bức xúc, nhanh` / `▸ Giọng trầm, tâm sự`.
- 🅰️ **On-screen** — rút VO 20 chữ → 2–3 từ khoá đập màn hình (**AI SAI?**).
- 🎬 **Visual / B-roll** — chỉ đạo hình (dashboard, biểu đồ nứt vỡ, meme).

**B5 — Câu thần chú (Aha!).** Kết = 1 câu ngắn, có nhịp, mang về dùng ngay (không kết luận dài như blog).
- "Mình đang nói **Metric** nào, cắt theo **Dimension** nào, so với **KPI** nào?"

## Ánh xạ vào pipeline này
| Guide | Cơ chế cụ thể |
|---|---|
| `...` ngừng nhịp | `\n` trong `content.py` BEATS |
| ▸ ghi chú giọng / beat | **`[tag]` inline trong BEATS** (ngay trước câu cần đổi giọng) → audio-tag ElevenLabs lúc `gen_audio`. KHÔNG dùng dict `TONE` riêng nữa. |
| 🅰️ On-screen từ khoá | `scenes.json` moments (kit element) — **số nói = số item hiện** |
| 🎬 Visual | `scenes.json` bg / custom / chart |
| Câu thần chú | beat chốt + `cta` element |

### ▸ Cảm xúc = `[tag]` inline trong BEATS (bộ tag đã duyệt)
Cắm tag **ngay trước câu cần đổi giọng**, ~1 tag/beat (tối đa 2 nếu beat có 2 khúc cảm xúc), beat kể/giảng đều thì để trần. Bài mẫu: `videos/mot-nguon-su-that/content.py`, `videos/trung-binh-noi-doi/content.py`.

| Cảm xúc | Tag |
|---|---|
| bức xúc, nhanh | `[annoyed]` / `[frustrated]` |
| trầm, tâm sự | `[thoughtful]` |
| vỡ oà / phát hiện | `[surprised]` / `[excited]` |
| châm biếm nhẹ | `[sarcastic]` |
| chốt chắc nịch | `[confident]` |
| ngập ngừng | `[hesitant]` |

> KHÔNG tự chế tag ngoài bảng. Ghi chú cấu trúc (KINETIC/SHORT-ABLE) KHÔNG phải tag - để ở `scenes.json`/ghi chú sản xuất, đừng nhét vào BEATS.

> **THỰC TẾ (2026-07): v3 ĐÃ MỞ API — kênh dùng `eleven_v3` + Instant Voice Clone (giọng `WnVHQmxNaS8EDl4dLjTf`).** Tag ĂN THẬT: `gen_audio` GIỮ tag khi `MODEL` kết thúc `v3` (dòng 44) và lọc tag khỏi caption (dòng 128). Đọc biểu cảm theo tag, phát âm tiếng Việt chuẩn hơn turbo.
> Giọng Professional/PVC (`WDaJnnNx5FI1IkQ7eV9e`) CHƯA hỗ trợ v3 (chỉ fine-tune `turbo_v2_5`/`flash_v2_5`) và phát âm sai vài từ (khoan→khoản, nhớ→nhờ) → không dùng. Khi ElevenLabs mở PVC-on-v3 thì cân lại (giống giọng thật hơn).
> Lịch sử: trước 2026-07 v3 chưa mở, tag bị strip, cảm xúc chỉ từ voice_settings + dấu câu.

### 🎨 Icon + chart trong scenes.json — MẶC ĐỊNH mỗi cảnh phải có visual
> **LUẬT CỨNG:** mỗi `moment` (mỗi cảnh) PHẢI có ít nhất 1 visual — icon / chart / lottie / cards / chips / flow / recap. **Cảnh chỉ có chữ trơn (text/label/caption) = THIẾU, phải thêm icon.** Ưu tiên: beat khái niệm → `el:icons` (hàng tile hero) hoặc `el:icon`; đồ vật/vai trò → icon quen (bảng dưới).
> **Chart** (bar/line/gauge/donut...): dùng khi beat có **số liệu so sánh hoặc xu hướng thật** (vd 3 con số doanh thu lệch nhau, % đạt mục tiêu). Beat khái niệm thuần thì icon là đủ, đừng ép chart. Chart cũng tính là "visual" thoả luật trên.

Kit đã tích hợp lucide (~1700 icon, gọi theo tên: `"database"`, `"bar-chart-3"`, `"Settings2"` đều nhận; sai tên sẽ hiện `?tên` đỏ trên hình — soát trong Studio, comp `demo-kit` là catalog sống).
- `chips`: item 3 phần tử `["KPI", "warn", "target"]` (tên icon đứng cuối).
- `chip` / từng card trong `cards` / từng node trong `flow` / `cta`: thêm `"icon": "<tên>"`.
- Element riêng: `{"el":"icon", name, color, label?, size?, variant?, grad?}` (tile đơn) và `{"el":"icons", items:[{name,color,label,variant?,grad?}]}` (hàng tile kiểu "Model / Dữ liệu / Agent" — bố cục hero mạnh nhất, ưu tiên cho beat khái niệm).
- `variant` nền tile: `glass` (mặc định, kính tối) · `soft` (nền màu nhạt) · `white` (nền trắng trong nhẹ) · `solid` (nền đặc + icon trắng) · `none` (icon trơn). `grad: true` = icon stroke gradient đơn sắc (pha trắng → màu gốc).
  - ⚠️ **Tile đứng riêng (`el:icon`) trên nền video tối: dùng `glass` (hoặc `none`/`solid`), TRÁNH `soft`** — soft là nền màu nhạt + icon cùng màu → tương phản thấp, nhìn như ô trống/mờ. Size tile riêng nên ≥ 14.
  - ⚠️ **Chỉ dùng tên icon CÓ trong lucide đang cài** — validate bằng `node -e "const{icons}=require('lucide-react');const p=n=>n.split(/[-_ ]+/).map(s=>s[0].toUpperCase()+s.slice(1)).join('');console.log([...NAMES].filter(n=>!icons[p(n)]))"` trước khi ghi (sai tên hiện `?tên` đỏ). Tên đã bị RENAME trong v1.23.0 (dùng cột phải): `bar-chart-3`→`chart-column`, `line-chart`→`chart-line`, `filter`→`funnel`, `sliders`→`sliders-horizontal`, `waves`→`audio-waveform`, `circle-help`→`circle-question-mark` (nhưng `help-circle` cũ VẪN có), `message-circle-question`→`message-circle-question-mark`.
  - ✅ **ĐÃ FIX lỗi gốc "icon rỗng ruột"** (dấu `!`, nút calculator, vạch `≠`, tally biến mất): gradient stroke trong `LIcon` đổi từ `objectBoundingBox` → `gradientUnits="userSpaceOnUse"` (bbox nét thẳng đứng/ngang = 0 nên gradient cũ không tô được). Giờ nét thẳng hiện đủ. Vẫn nên ưu tiên icon bóng-đặc dễ nhận + tránh `tally-*` (quá mảnh).
  - ✅ **Tự kiểm icon:** `npx remotion still src/index.ts <slug>-Long out/chk.png --frame=<n>` render 1 frame ra ảnh rồi NHÌN, đừng đoán.
- Quy ước icon quen: Sales=`briefcase` · Kế toán/Finance=`calculator` · Marketing=`megaphone` · Metric=`gauge` · Dimension=`layers` · KPI=`target` · đơn hàng=`package` · kho/lưu=`library` · định nghĩa=`book-open` · Theo dõi (CTA)=`bell-ring` · Xem video (CTA)=`play` (CTA có icon thì bỏ "▶" trong chữ).

## ⚙️ Gotchas kỹ thuật render (Remotion) — đã vấp & fix
- **Nhạc nền KHÔNG fade cuối video:** `<Audio loop volume={hàm}>` — Remotion trả frame theo TỪNG VÒNG LẶP nhạc, nên điều kiện fade cuối (`f > total - outF`) không bao giờ đúng. **Fix: tính volume bằng `useCurrentFrame()` (frame toàn video) ra một SỐ**, rồi `volume={số}` (xem `LongForm`/`ShortForm` trong `Root.tsx`).
- **Fade tiếng nói ăn mất từ cuối:** `voiceVol` fade-out dài (0.5s) fade luôn từ cuối câu → "nuốt chữ". Fade ngắn (~0.2s, `/6`) để giữ từ; độ mượt lấy từ **im lặng đệm sau voice** (holdSec + SECTION_GAP), không phải từ fade dài.
- **Chuyển cảnh gấp/nuốt chữ:** nới `holdSec` (per-beat trong scenes.json, ~1.0s) + `SECTION_GAP` (Root, ~0.8s) + cross-fade moment (`XFADE` trong `Beat`) + gap giữ nhãn beat trước (`<Pad label={beat.bg}/>`, không chớp wordmark).
- **Đuôi video cho logo kênh:** `OUTRO_PAD` (~4.5s) + fade nhạc `outF` (~4s) để có khoảng ambient cuối overlay logo.
- **short-outro audio lệch tên:** `gen_audio` từng ghi `beat-short-outro.mp3` nhưng `outro.json` trỏ `short-outro.mp3` → render short 404. Đã fix trong `gen()`.
- **Re-voice 1 beat:** `python gen_audio.py <slug> <beat>` — chỉ gen beat đó, giữ audio/timings phần còn lại (sửa 1 câu không voice lại cả bài).
- **NGUỒN lời thoại = `videos/<slug>/script.json`** (không phải content.py nữa). `gen_audio`/`scaffold` ưu tiên đọc `script.json` (fallback `content.py`). Đây là file **Decap CMS sửa được bằng form** (mỗi beat 1 ô text, giữ `[tag]` + `\n`). Sửa `content.py` local xong → chạy `python scripts/script-json.py <slug>` để đồng bộ sang `script.json` (không thì render vẫn dùng script.json cũ). Converter re-run được cho bài mới.
- **`atWord` neo theo giọng:** đổi lời script → kiểm `atWord` trong scenes còn khớp từ trong timings.json không (không thì moment lệch nhịp). Bài CHƯA có voice: đừng dùng `atWord` (không có timings để neo) — chỉ dùng `w` weight, moment tự fallback về weight.
- **Preview scenes TRƯỚC khi voice:** `python scripts/scaffold.py <slug>` sinh audio CÂM + timings ước lượng (theo số ký tự) + `beats.json`/`outro.json` → `node scripts/gen-registry.mjs` → Studio hiện được HÌNH để duyệt scenes mà chưa tốn credit. (Nhịp/độ dài chỉ là ước lượng; nhịp thật có sau `gen_audio` v3.) scaffold.py đã fix để bài KHÔNG có short-outro không crash (tự tạo outro câm 1s).
- **Dựng scenes hàng loạt:** fan-out mỗi bài 1 agent (đọc 1 exemplar scenes.json + §Icon/§Gotchas + content.py của bài) → soạn scenes.json → xong VALIDATE TẬP TRUNG: JSON hợp lệ + mọi tên icon resolve trong lucide + mọi moment có visual + beat khớp ORDER. Agent hay đoán sai tên icon nên bước validate tập trung là bắt buộc.
- **Admin quản trị nội dung (ĐỘNG):** mở `http://localhost:8124/admin` (cần `npm run edit`). Quét filesystem LIVE mỗi lần mở (không còn regen tay `gen-admin.mjs`); trạng thái pipeline `script→scenes→voice→render→publish` tính từ file thật. Ghi chú/cờ "cần sửa"/"đã review" lưu ở `landing/admin-state.json` (không phải localStorage). Logic scan ở `scripts/scan-content.mjs`.

## Check-list (trước khi chốt script)
- [ ] Vứt hết định nghĩa hàn lâm rườm rà?
- [ ] 5 giây đầu khiến người xem thấy nhột / đồng cảm?
- [ ] Thuật ngữ đã ví von bằng đồ vật / con người đời thường?
- [ ] Đọc to có tự nhiên như nói chuyện ở quán cafe?
- [ ] On-screen / Visual khớp 100% lời Voiceover?
