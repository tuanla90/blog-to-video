"""Như assemble.py nhưng tốc độ theo từng đoạn (tua nhanh phần chờ, có nhãn trên hình ở Remotion).

Usage: python assemble_varspeed.py <recDir> <out.mp4> <segments> [width]
  segments: "s1:e1:speed1,s2:e2:speed2,..." — giây kể từ lúc bắt đầu quay, liên tiếp nhau.
Ghi thêm <out>.cursor.json: [[t,x,y,click]] theo thời gian của clip đầu ra (đã co giãn).
"""
import json
import sys
sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
import av
from PIL import Image

rec, out, segs = sys.argv[1], sys.argv[2], sys.argv[3]
width = int(sys.argv[4]) if len(sys.argv) > 4 else 3840
height = width * 9 // 16
fps = 30
segments = [tuple(float(v) for v in s.split(':')) for s in segs.split(',')]

frames = json.load(open(f"{rec}/frames.json", encoding="utf-8"))
events = json.load(open(f"{rec}/events.json", encoding="utf-8"))
t0 = events[0]["t"]


def out_to_src(tout):
    acc = 0.0
    for s, e, sp in segments:
        dur = (e - s) / sp
        if tout <= acc + dur:
            return s + (tout - acc) * sp
        acc += dur
    return segments[-1][1]


def src_to_out(tsrc):
    acc = 0.0
    for s, e, sp in segments:
        if tsrc <= e:
            return acc + max(0.0, tsrc - s) / sp
        acc += (e - s) / sp
    return None


total = sum((e - s) / sp for s, e, sp in segments)
container = av.open(out, mode="w")
stream = container.add_stream("libx264", rate=fps)
stream.width, stream.height, stream.pix_fmt = width, height, "yuv420p"
stream.options = {"crf": "18", "preset": "medium"}
idx, last = 0, None
cache = None
for k in range(int(round(total * fps))):
    t = t0 + out_to_src(k / fps)
    while idx < len(frames) and frames[idx]["t"] <= t:
        idx += 1
    if idx == 0:
        continue
    f = frames[idx - 1]["file"]
    if last != f:
        img = Image.open(f"{rec}/frames/{f}").convert("RGB")
        if img.size != (width, height):
            img = img.resize((width, height), Image.LANCZOS)
        cache, last = img, f
    for p in stream.encode(av.VideoFrame.from_image(cache)):
        container.mux(p)
for p in stream.encode():
    container.mux(p)
container.close()

start, end = segments[0][0], segments[-1][1]
pts, prev = [], None
for e in events:
    t = e["t"] - t0
    if e["type"] not in ("move", "click"):
        continue
    if t < start:
        prev = (e["x"], e["y"])
        continue
    if t > end:
        break
    if not pts and prev:
        pts.append([0, round(prev[0], 1), round(prev[1], 1), 0])
    pts.append([round(src_to_out(t), 3), round(e["x"], 1), round(e["y"], 1), 1 if e["type"] == "click" else 0])
json.dump(pts, open(out + ".cursor.json", "w", encoding="utf-8"))
print(out, round(total, 2), "s", len(pts), "cursor pts", [p for p in pts if p[3]])
