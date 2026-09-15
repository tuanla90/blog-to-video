"""Ghép khung CDP screencast (thời điểm không đều) thành mp4 30fps + nhật ký thao tác theo giây.

Usage: python assemble.py <recDir> <out.mp4> [start_s] [end_s] [width]
  start/end tính theo giây kể từ lúc bắt đầu quay; width mặc định 3840 (giữ nét để zoom).
Ghi thêm <out>.events.json: các sự kiện (move/click/type/mark) đổi sang giây tính từ start.
"""
import json
import sys
sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
import av
from PIL import Image

rec, out = sys.argv[1], sys.argv[2]
frames = json.load(open(f"{rec}/frames.json", encoding="utf-8"))
events = json.load(open(f"{rec}/events.json", encoding="utf-8"))
t0 = events[0]["t"]
start = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
end = float(sys.argv[4]) if len(sys.argv) > 4 else (events[-1]["t"] - t0)
width = int(sys.argv[5]) if len(sys.argv) > 5 else 3840
height = width * 9 // 16
fps = 30

container = av.open(out, mode="w")
stream = container.add_stream("libx264", rate=fps)
stream.width, stream.height, stream.pix_fmt = width, height, "yuv420p"
stream.options = {"crf": "18", "preset": "medium"}

idx, last_img = 0, None
n_out = int(round((end - start) * fps))
for k in range(n_out):
    t = t0 + start + k / fps
    while idx < len(frames) and frames[idx]["t"] <= t:
        idx += 1
    if idx == 0:
        continue
    f = frames[idx - 1]["file"]
    if last_img is None or last_img[0] != f:
        img = Image.open(f"{rec}/frames/{f}").convert("RGB")
        if img.size != (width, height):
            img = img.resize((width, height), Image.LANCZOS)
        last_img = (f, img)
    vf = av.VideoFrame.from_image(last_img[1])
    for p in stream.encode(vf):
        container.mux(p)
for p in stream.encode():
    container.mux(p)
container.close()

ev = [{**e, "t": round(e["t"] - t0 - start, 3)} for e in events if start <= e["t"] - t0 <= end]
json.dump(ev, open(out + ".events.json", "w", encoding="utf-8"), ensure_ascii=False)
print(f"{out}: {n_out} frames {width}x{height}, {len(ev)} events")
