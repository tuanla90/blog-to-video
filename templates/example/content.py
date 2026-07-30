# Slug mẫu — xoá cả thư mục videos/vi-du/ khi bạn không cần nữa.
#
# ORDER  : thứ tự beat. "00" là hook, cũng là beat được cắt ra làm Short.
# BEATS  : lời thoại từng beat. "\n" = một nhịp ngắt nghỉ khi đọc.
#          "[tag]" đặt trước câu = delivery cue cho ElevenLabs v3 (model cũ sẽ bị strip).
# PRON   : thay cách đọc cho TTS. Caption trên màn hình vẫn giữ chính tả gốc.

ORDER = ["00", "01"]

BEATS = {
"00":
"Đây là video mẫu của blog2video.\n"
"[confident] Nếu bạn đang thấy dòng chữ này chạy trên màn hình, nghĩa là engine đã chạy đúng.",

"01":
"Mỗi beat là một đoạn lời thoại, kèm một màn hình mô tả trong scenes.json.\n"
"Sửa hai file đó là ra video của bạn. Không phải đụng vào code.",

"short-outro":
"Xoá thư mục videos/vi-du đi rồi viết slug đầu tiên của bạn.",
}

PRON = {
    "blog2video": "blốc tu vi-đi-ô",
}
