"""Cắt nhiều đoạn từ một file video quay sẵn (vd OpenVid, khung không đều) thành clip 30fps đều, hoà tan giữa đoạn.

Usage: python assemble_video_cuts.py <in.mp4> <out.mp4> <segments> [dissolve_s=0.3]
  segments: "s1:e1,s2:e2,..." — giây trong file nguồn. Giữ nguyên độ phân giải nguồn.
Khung hụt (> 1,5 khung) được pha trộn theo thời gian giữa 2 khung kề → bớt giật.
"""
import bisect
import sys
sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
import av
from PIL import Image

src, out, segs = sys.argv[1], sys.argv[2], sys.argv[3]
dissolve = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3
fps = 30
segments = [tuple(float(v) for v in s.split(':')) for s in segs.split(',')]
lo, hi = min(s for s, _ in segments) - 0.5, max(e for _, e in segments) + 0.5

inp = av.open(src)
frames = []
for fr in inp.decode(video=0):
    t = float(fr.time)
    if t < lo:
        continue
    if t > hi:
        break
    frames.append((t, fr.to_image().convert("RGB")))
inp.close()
frames.sort(key=lambda x: x[0])
ft = [t for t, _ in frames]
W, H = frames[0][1].size


def frame_at(t):
    i = bisect.bisect_right(ft, t) - 1
    if i < 0:
        return frames[0][1]
    if i + 1 >= len(frames):
        return frames[i][1]
    a, b = ft[i], ft[i + 1]
    if b - a <= 1.5 / fps:
        return frames[i][1]
    w = (t - a) / (b - a)
    if w < 0.08:
        return frames[i][1]
    if w > 0.92:
        return frames[i + 1][1]
    return Image.blend(frames[i][1], frames[i + 1][1], w)


container = av.open(out, mode="w")
stream = container.add_stream("libx264", rate=fps)
stream.width, stream.height, stream.pix_fmt = W - W % 2, H - H % 2, "yuv420p"
stream.options = {"crf": "16", "preset": "medium"}
nd = int(round(dissolve * fps))
starts, n = [], 0
for s, e in segments:
    starts.append(n)
    n += int(round((e - s) * fps))
j = 0
for si, (s, e) in enumerate(segments):
    for k in range(int(round((e - s) * fps))):
        img = frame_at(s + k / fps)
        if si + 1 < len(segments) and nd > 0 and starts[si + 1] - nd <= j < starts[si + 1]:
            kk = j - (starts[si + 1] - nd)
            img = Image.blend(img, frame_at(segments[si + 1][0] + kk / fps), (kk + 1) / (nd + 1))
        if img.size != (stream.width, stream.height):
            img = img.crop((0, 0, stream.width, stream.height))
        for p in stream.encode(av.VideoFrame.from_image(img)):
            container.mux(p)
        j += 1
for p in stream.encode():
    container.mux(p)
container.close()
print(out, f"{W}x{H}", round(j / fps, 2), "s")
