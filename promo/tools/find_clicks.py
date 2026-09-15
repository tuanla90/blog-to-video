import sys; sys.path.append(__import__('os').environ.get('PROMO_PY_SITE', ''))  # tuỳ chọn: site-packages có av/numpy/PIL
import av, numpy as np
src, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
c = av.open(src); prev = None
for fr in c.decode(video=0):
    t = float(fr.time)
    if t < a: continue
    if t > b: break
    x = np.asarray(fr.to_image().resize((192, 85)).convert('L'), dtype=np.int16)
    if prev is not None:
        d = float(np.abs(x - prev).mean())
        if d > 0.7: print('%.2f diff %.1f' % (t, d))
    prev = x
