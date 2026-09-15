"""Ghép clip từ bản quay CDP: nhiều đoạn giữ đúng tốc độ, nối bằng hoà tan (dissolve) thay vì tua nhanh.

Usage: python assemble_cuts.py <recDir> <out.mp4> <segments> [dissolve_s=0.35] [width=3840]
  segments: "s1:e1,s2:e2,..." — giây kể từ lúc bắt đầu quay.
Khác assemble.py:
  - SẮP khung theo thời điểm (frames.json của CDP không luôn tăng dần → hình giật lùi).
  - Khung hụt (> 1 khung video) được nội suy bằng pha trộn 2 khung kề theo thời gian → bớt giật.
Ghi thêm <out>.cursor.json: [[t,x,y,click]] theo thời gian clip đầu ra.
"""
import json
import sys
sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
import av
from PIL import Image

rec, out, segs = sys.argv[1], sys.argv[2], sys.argv[3]
dissolve = float(sys.argv[4]) if len(sys.argv) > 4 else 0.35
width = int(sys.argv[5]) if len(sys.argv) > 5 else 3840
height = width * 9 // 16
fps = 30
segments = [tuple(float(v) for v in s.split(':')) for s in segs.split(',')]

frames = sorted(json.load(open(f"{rec}/frames.json", encoding="utf-8")), key=lambda f: f["t"])
events = json.load(open(f"{rec}/events.json", encoding="utf-8"))
t0 = events[0]["t"]
ft = [f["t"] - t0 for f in frames]
cache = {}


def load(i):
    f = frames[i]["file"]
    if f not in cache:
        if len(cache) > 12:
            cache.pop(next(iter(cache)))
        img = Image.open(f"{rec}/frames/{f}").convert("RGB")
        if img.size != (width, height):
            img = img.resize((width, height), Image.LANCZOS)
        cache[f] = img
    return cache[f]


import bisect


def frame_at(t):
    i = bisect.bisect_right(ft, t) - 1
    if i < 0:
        return load(0)
    if i + 1 >= len(frames):
        return load(i)
    a, b = ft[i], ft[i + 1]
    gap = b - a
    if gap <= 1.5 / fps:
        return load(i)
    # khung hụt: pha trộn theo vị trí thời gian giữa 2 khung thật
    w = max(0.0, min(1.0, (t - a) / gap))
    if w < 0.08:
        return load(i)
    if w > 0.92:
        return load(i + 1)
    return Image.blend(load(i), load(i + 1), w)


container = av.open(out, mode="w")
stream = container.add_stream("libx264", rate=fps)
stream.width, stream.height, stream.pix_fmt = width, height, "yuv420p"
stream.options = {"crf": "18", "preset": "medium"}

timeline = []  # (out_t, src_t, seg_index)
acc = 0.0
nd = int(round(dissolve * fps))
out_frames = []
for si, (s, e) in enumerate(segments):
    n = int(round((e - s) * fps))
    for k in range(n):
        out_frames.append((si, s + k / fps))
total_n = len(out_frames)
# mỗi điểm nối: nd khung cuối đoạn trước hoà vào nd khung đầu đoạn sau (không kéo dài tổng thời gian)
seg_starts = []
idx = 0
for s, e in segments:
    seg_starts.append(idx)
    idx += int(round((e - s) * fps))

written = 0
for j, (si, tsrc) in enumerate(out_frames):
    img = frame_at(tsrc)
    if si + 1 < len(segments) and nd > 0:
        nxt = seg_starts[si + 1]
        if nxt - nd <= j < nxt:
            w = (j - (nxt - nd) + 1) / (nd + 1)
            k = j - (nxt - nd)
            img = Image.blend(img, frame_at(segments[si + 1][0] + k / fps), w)
    for p in stream.encode(av.VideoFrame.from_image(img)):
        container.mux(p)
    written += 1
for p in stream.encode():
    container.mux(p)
container.close()

pts, prev = [], None
base = 0.0
for si, (s, e) in enumerate(segments):
    for ev in events:
        t = ev["t"] - t0
        if ev["type"] not in ("move", "click"):
            continue
        if t < s:
            if si == 0:
                prev = (ev["x"], ev["y"])
            continue
        if t > e:
            break
        if not pts and prev:
            pts.append([0, round(prev[0], 1), round(prev[1], 1), 0])
        pts.append([round(base + t - s, 3), round(ev["x"], 1), round(ev["y"], 1), 1 if ev["type"] == "click" else 0])
    base += e - s
json.dump(pts, open(out + ".cursor.json", "w", encoding="utf-8"))
print(out, round(written / fps, 2), "s", len(pts), "cursor pts", [p for p in pts if p[3]])
