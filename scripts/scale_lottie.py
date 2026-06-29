# Scale a Lottie's content about the artboard center by factor k (đầy khung hơn).
# Chỉ scale layer GỐC (parent=None); con kế thừa qua parenting. Giữ nguyên artboard w/h.
# CLI: python scale_lottie.py <in.json> <out.json> <k>
import json, sys

def _sc_pos(v, k, cx, cy):
    out = [cx + (v[0] - cx) * k, cy + (v[1] - cy) * k]
    return out + v[2:] if len(v) > 2 else out

def _sc_vec(v, k):
    return [x * k for x in v[:2]] + (v[2:] if len(v) > 2 else [])

def scale_layer(L, k, cx, cy):
    ks = L.get("ks", {})
    p = ks.get("p", {})
    if isinstance(p, dict) and "k" in p:
        if p.get("a") == 0:
            p["k"] = _sc_pos(p["k"], k, cx, cy)
        else:
            for kf in p["k"]:
                for key in ("s", "e"):
                    if isinstance(kf.get(key), list) and len(kf[key]) >= 2:
                        kf[key] = _sc_pos(kf[key], k, cx, cy)
                for key in ("to", "ti"):           # spatial tangents = vector relative -> scale magnitude
                    if isinstance(kf.get(key), list):
                        kf[key] = _sc_vec(kf[key], k)
    s = ks.get("s", {})
    if isinstance(s, dict) and "k" in s:
        if s.get("a") == 0:
            s["k"] = _sc_vec(s["k"], k)
        else:
            for kf in s["k"]:
                for key in ("s", "e"):
                    if isinstance(kf.get(key), list):
                        kf[key] = _sc_vec(kf[key], k)

if __name__ == "__main__":
    inp, out, k = sys.argv[1], sys.argv[2], float(sys.argv[3])
    d = json.load(open(inp, encoding="utf-8"))
    cx, cy = d["w"] / 2, d["h"] / 2
    n = 0
    for L in d["layers"]:
        if L.get("parent") is None:
            scale_layer(L, k, cx, cy); n += 1
    json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"scaled {n} layer x{k} -> {out}")
