# Short đối đáp (duo)

Hai nhân vật thay nhau nói, bảng đố ở giữa, bong bóng thoại chạy theo từng tiếng. Khung 1080x1920, mỗi tập một composition `<slug>-Duo`.

Khác bản Short cắt từ video dài: kịch bản viết riêng cho Short, câu nối câu không có khoảng chết, mỗi câu đổi người nói.

## Dựng một tập

```bash
npm run duo -- <slug>        # TTS từng câu -> videos/<slug>/duo.timing.json
npm run registry             # sinh src/videos.gen.ts (mảng DUOS)
npm run studio               # xem <slug>-Duo
npx remotion render src/index.ts <slug>-Duo out/<slug>.mp4
```

`duo` có cache theo nội dung câu: sửa một câu thì chỉ câu đó sinh lại. `--force` để sinh lại hết.

Entry `src/index.ts` của dự án phải truyền `DUOS`:

```ts
import {VIDEOS, DUOS} from "./videos.gen";
registerRoot(makeRoot(VIDEOS, {duos: DUOS}));
```

## Cấu hình: `video.config.json` -> `duo`

| Field | |
|---|---|
| `series` | chữ trên huy hiệu góc trên, vd `BẪY ĐỀ THI` (số tập lấy từ `ep`) |
| `handle` | tên miền góc trên-phải |
| `gap` | nghỉ giữa hai câu, giây. Mặc định 0.06 |
| `introPad`, `outroPad` | trước câu đầu / giữ khung cuối |
| `cast.<id>` | `{name, color, side: "left"\|"right", dir, faces[], alias{}, idle, voice}` |

`faces` là danh sách ảnh có thật trong `public/<dir>/<face>.png`. Gọi tên không có thì đi qua `alias`, rồi tới `idle`: không bao giờ ra ảnh vỡ.

`voice`:

| provider | field | ghi chú |
|---|---|---|
| `edge` | `voice`, `rate` ("+25%"), `pitch` ("+0Hz") | miễn phí, trả mốc từng tiếng. Dịch vụ không chính thức, hay rớt `NoAudioReceived` (script tự thử lại) |
| `google` | `voice` (vd `vi-VN-Chirp3-HD-Achird`), `rate` (1.1), `lang` | cần `GOOGLE_TTS_API_KEY`. Không trả mốc từ: ước lượng theo độ dài chữ trong đoạn có tiếng |
| `elevenlabs` | `voice` (voice_id, giọng kho chung dùng thẳng được), `model` (`eleven_multilingual_v2` / `eleven_v3`), `settings` | cần `ELEVENLABS_API_KEY`, tính tiền theo ký tự. Trả mốc từng ký tự, đọc từ tiếng Anh lẫn trong câu Việt tốt nhất |

Mọi provider nhận thêm `pron`: danh sách chuỗi, chỉ áp các mục phát âm chứa chúng (giọng đọc tiếng Anh tốt thì để `["diem10code"]`).

Từ điển phát âm chung cho mọi tập: `duo.pron` trong config, vd `{"SQL": "si-quồ", "NULL": "nâu"}`. `pron` trong `duo.json` của tập đứng trước. Khoá là chữ thì chỉ thay nguyên từ.

## Kịch bản: `videos/<slug>/duo.json`

```json
{
  "ep": 1, "topic": "PYTHON · RANGE",
  "hook": {"kicker": "CÂU HỎI BẪY", "big": "0,25đ", "text": "[bad:mất oan] vì một chữ range"},
  "question": {"prompt": "…", "code": ["…"], "options": ["15", "10", "14", "5"], "answer": 1},
  "explain": ["…", "…"],
  "cta": {"line": "…", "pill": "diem10code.com", "sub": "…"},
  "pron": {"range": "rên-giơ"},
  "lines": [
    {"who": "luna", "face": "wink", "say": "…", "do": "hook", "react": "confident"},
    {"countdown": 3, "faces_all": "thinking"},
    {"who": "sola", "face": "confident", "say": "A! Mười lăm!", "do": "pick:A@A!",
     "faces": [{"at": "mười", "face": "great-job"}]}
  ]
}
```

Một câu thoại:

| Field | |
|---|---|
| `who`, `say`, `face` | người nói, lời, biểu cảm lúc bắt đầu nói |
| `react` | biểu cảm của người KIA (chuỗi, hoặc `{face, at}` để neo vào một tiếng) |
| `faces` | đổi biểu cảm giữa câu: `[{at: "tiếng", face, who?}]` |
| `do` | lệnh hình, chuỗi hoặc mảng |
| `voice` | đè giọng riêng câu này (vd `{"rate": "+35%"}`) |
| `pause` | nghỉ sau câu này (giây), thay `gap` |

Lệnh hình (`do`), thêm `@tiếng` để neo vào đúng tiếng đó:

| lệnh | |
|---|---|
| `hook` | cảnh mở: số lớn đếm lên + câu đập vào |
| `question` | đề + khối code gõ ra |
| `options` | bốn đáp án bật ra |
| `pick:A` | người nói chọn A (huy hiệu tên + viền màu nhân vật) |
| `reveal` | lật đáp án: đúng xanh + pháo hoa, chọn sai đỏ + rung, camera đẩy vào |
| `explain` | hiện bước giải thích tiếp theo |
| `cta` | cảnh chốt |
| `jump`, `shake` | nhân vật nhảy / rung. `shake:sola` để chỉ định người |

`[bad:…] [good:…] [yellow:…] [accent:…] [sola:…] [br]` dùng được trong mọi chữ hiển thị.

## Luật viết cho nhịp nhanh

- Mỗi câu thoại tối đa khoảng 12 tiếng. Dài hơn thì tách thành hai câu, cho người kia xen vào.
- Câu nào cũng có `face`, và ít nhất nửa số câu có `react` hoặc `faces`: mascot phải đổi biểu cảm liên tục.
- Cảnh hook xuất hiện ngay frame đầu. Không chào hỏi.
- Đếm ngược 3 giây là khoảng lặng duy nhất; cả hai nhân vật đều `thinking`.
- Một tập 25 đến 35 giây. Dài hơn thì bỏ bớt bước giải thích.
