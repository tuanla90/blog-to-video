# Recolor a Lottie JSON: remap solid fill/stroke colors to brand palette.
# Lottie lưu màu dạng mảng [r,g,b] (0..1) trong fill/stroke. Ta remap theo bảng hex->hex,
# match trong dung sai nhỏ; giữ nguyên alpha + mọi thứ khác. (Gradient hiếm -> không đụng.)
#
# CLI: python recolor_lottie.py <in.json> <out.json> "#OLD=#NEW,#OLD2=#NEW2"
import json, sys

def _hex2rgb(h):
    h = h.lstrip("#")
    return [int(h[i:i+2], 16) for i in (0, 2, 4)]

def parse_map(s):
    m = {}
    for pair in (s or "").split(","):
        pair = pair.strip()
        if "=" in pair:
            a, b = pair.split("=")
            m[tuple(_hex2rgb(a.strip()))] = [c / 255 for c in _hex2rgb(b.strip())]
    return m

def recolor(obj, mapping, tol=5):
    """Walk the Lottie tree; remap any color array [r,g,b(,a)] in 0..1 that matches a key."""
    n = 0
    if isinstance(obj, dict):
        k = obj.get("k")
        if (isinstance(k, list) and 3 <= len(k) <= 4
                and all(isinstance(x, (int, float)) for x in k)
                and all(0 <= x <= 1.0001 for x in k)):
            r, g, b = (round(k[i] * 255) for i in range(3))
            for (mr, mg, mb), new in mapping.items():
                if abs(r - mr) <= tol and abs(g - mg) <= tol and abs(b - mb) <= tol:
                    obj["k"] = new + ([k[3]] if len(k) == 4 else [])
                    n += 1
                    break
        for v in obj.values():
            n += recolor(v, mapping, tol)
    elif isinstance(obj, list):
        for v in obj:
            n += recolor(v, mapping, tol)
    return n

if __name__ == "__main__":
    inp, out, mp = sys.argv[1], sys.argv[2], sys.argv[3]
    d = json.load(open(inp, encoding="utf-8"))
    cnt = recolor(d, parse_map(mp))
    json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"recolored {cnt} màu -> {out}")
