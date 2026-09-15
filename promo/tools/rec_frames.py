import json, sys, os
from PIL import Image
# grabt.py <recDir> <out.png> t1,t2,... (seconds since first event) — montage 2 cols at 960x540
d, out, ts = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3].split(',')]
ev = json.load(open(os.path.join(d, 'events.json'), encoding='utf-8')); t0 = ev[0]['t']
fr = json.load(open(os.path.join(d, 'frames.json'), encoding='utf-8'))
ims = []
for t in ts:
    f = min(fr, key=lambda x: abs(x['t'] - (t0 + t)))
    ims.append(Image.open(os.path.join(d, 'frames', f['file'])).convert('RGB').resize((960, 540)))
cols = 2; rows = (len(ims) + 1) // 2
M = Image.new('RGB', (960 * cols, 540 * rows), 'white')
for i, im in enumerate(ims): M.paste(im, ((i % cols) * 960, (i // cols) * 540))
M.save(out); print('ok', len(ims))
