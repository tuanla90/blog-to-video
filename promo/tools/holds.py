"""Đo các đoạn màn hình đứng yên trong một video Remotion.

Usage: python -I holds.py <video.mp4> <scenes.json> [min_hold_s=1.5] [frac=0.0015]
scenes.json: [[id, dur], ...] theo đúng thứ tự timeline; LEAD=36, XF=10 như PromoTemplate.tsx.
Nền Stage luôn trôi nhẹ (lưới, đốm màu) nên không đo chênh trung bình: một khung "đứng yên"
khi tỷ lệ điểm ảnh đổi mạnh (|chênh xám| > 24) so với khung trước < frac.
"""
import json, sys
import av
import numpy as np

src, scenes_path = sys.argv[1], sys.argv[2]
MIN_HOLD = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5
TH = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0015
PIX = 24
LEAD, XF, FPS = 36, 10, 30

scenes = json.load(open(scenes_path, encoding='utf-8'))
starts = []
for i, (sid, dur) in enumerate(scenes):
    starts.append(LEAD if i == 0 else starts[-1] + scenes[i - 1][1] - XF)

def scene_at(f):
    cur = scenes[0][0], 0
    for (sid, dur), st in zip(scenes, starts):
        if f >= st:
            cur = sid, f - st
    return cur

c = av.open(src)
prev = None
diffs = []
for fr in c.decode(video=0):
    g = fr.to_ndarray(format='gray').astype(np.int16)
    diffs.append(1.0 if prev is None else float((np.abs(g - prev) > PIX).mean()))
    prev = g
d = np.array(diffs)
total = len(d)
print(f'frames {total} = {total / FPS:.1f}s; frac p25 {np.percentile(d, 25):.5f} p50 {np.percentile(d, 50):.5f} p75 {np.percentile(d, 75):.5f}')

static = d < TH
runs, i = [], 1
while i < total:
    if static[i]:
        j = i
        while j < total and static[j]:
            j += 1
        if (j - i) / FPS >= MIN_HOLD:
            runs.append((i, j))
        i = j
    else:
        i += 1

tot_hold = 0.0
per_scene = {}
for a, b in runs:
    sid, off = scene_at(a)
    s = (b - a) / FPS
    tot_hold += s
    per_scene[sid] = per_scene.get(sid, 0) + s
    print(f'  {a / FPS:6.1f}s-{b / FPS:6.1f}s  {s:4.1f}s  {sid} @{off}..{off + b - a}')
print(f'holds >= {MIN_HOLD}s: {len(runs)} doan, tong {tot_hold:.1f}s ({100 * tot_hold * FPS / total:.0f}% video)')
for sid, dur in scenes:
    if sid in per_scene:
        print(f'  {sid:14s} {per_scene[sid]:5.1f}s / {dur / FPS:4.1f}s')
