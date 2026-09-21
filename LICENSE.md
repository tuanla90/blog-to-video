# Giấy phép

## Mã nguồn — MIT

Áp dụng cho `src/`, `scripts/`, `bin/`, `templates/`, `docs/`, `skills/`, `workflows/`.

```
MIT License

Copyright (c) 2026 Lê Anh Tuấn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Asset — KHÔNG nằm trong MIT ở trên

`assets/lottie/` và `assets/sfx/` là tác phẩm của bên thứ ba, mỗi file theo giấy phép riêng của tác giả gốc.

**SFX:** tải từ [pixabay.com](https://pixabay.com), theo Pixabay Content License — dùng thương mại được, không bắt ghi công, nhưng CẤM phát tán lại chính các tệp đó ở dạng độc lập. Lồng vào video thì hợp lệ; đẩy `assets/sfx/` lên repo public thì không.

**Lottie: xuất xứ chưa ghi lại đầy đủ.** Tải từ lottiefiles.com (lọc Free) — điều khoản khác nhau theo tác giả, có cái đòi ghi công.

Chi tiết từng tệp ở `assets/CREDITS.md`. Trước khi mở repo ra public hoặc phát hành lại asset, cần rà nốt phần lottie. Cho tới lúc đó nên để repo **private**.

Nếu bạn fork và không chắc: xoá `assets/`, tự tải bộ của bạn, khai lại trong `src/lotties.ts`. Engine chạy bình thường (`audio.whoosh: null` để tắt sfx).
