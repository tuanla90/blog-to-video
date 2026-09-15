import sys, glob, os
from PIL import Image
# Usage: mont.py <dir> <out.png> <cols> [pattern]
d, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3])
pat = sys.argv[4] if len(sys.argv) > 4 else '*.png'
files = sorted(glob.glob(os.path.join(d, pat)))
ims = [Image.open(f) for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
M = Image.new('RGB', (w * cols, h * rows), 'white')
for i, im in enumerate(ims):
    M.paste(im, ((i % cols) * w, (i // cols) * h))
M.save(out)
print(len(ims), M.size)
