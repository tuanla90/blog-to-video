import sys; sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
import av
from PIL import Image, ImageDraw
src, out, a, b, step = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
c = av.open(src); v = c.streams.video[0]
print('codec', v.codec_context.name, v.width, v.height, 'rate', v.average_rate)
picks, nxt, ts = [], a, []
for fr in c.decode(v):
    t = float(fr.time); ts.append(t)
    if t > b: break
    if t + 1e-6 >= nxt:
        im = fr.to_image().resize((960, 426)); d = ImageDraw.Draw(im); d.rectangle([0, 0, 90, 24], fill='black'); d.text((4, 5), f'{t:.2f}s', fill='yellow')
        picks.append(im); nxt += step
w = [x for x in ts if a <= x <= b]
g = [w[i+1]-w[i] for i in range(len(w)-1)]
print('fps %.1f maxgap %.3f' % (len(w)/(b-a), max(g) if g else 0))
cols = 2; rows = (len(picks) + 1) // 2
M = Image.new('RGB', (960 * cols, 426 * rows), 'white')
for i, im in enumerate(picks): M.paste(im, ((i % cols) * 960, (i // cols) * 426))
M.save(out)
