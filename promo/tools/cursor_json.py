"""Viết <clip>.cursor.json: [[t,x,y,click0/1]...] tính từ đầu clip, có điểm t=0 = vị trí chuột cuối cùng trước clip."""
import json, sys
rec, out, start, end = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
ev = json.load(open(rec + '/events.json', encoding='utf-8'))
t0 = ev[0]['t']
pts, last = [], None
for e in ev:
    t = e['t'] - t0
    if e['type'] not in ('move', 'click'):
        continue
    if t < start:
        last = (e['x'], e['y'])
        continue
    if t > end:
        break
    if not pts and last:
        pts.append([0, round(last[0], 1), round(last[1], 1), 0])
    pts.append([round(t - start, 3), round(e['x'], 1), round(e['y'], 1), 1 if e['type'] == 'click' else 0])
json.dump(pts, open(out, 'w', encoding='utf-8'))
print(out, len(pts), pts[0], [p for p in pts if p[3]])
