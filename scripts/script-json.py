# Converter: videos/<slug>/content.py  ->  videos/<slug>/script.json
# script.json = NGUỒN lời thoại cho Decap CMS + gen_audio. Giữ nguyên [tag] + "\n" (ngắt nhịp).
# Chạy: python scripts/script-json.py            (tất cả)
#       python scripts/script-json.py <slug>...  (chỉ vài bài)
import importlib.util, json, os, sys, glob
try: sys.stdout.reconfigure(encoding="utf-8")
except Exception: pass

VID = "videos"
targets = sys.argv[1:]
paths = ([os.path.join(VID, s, "content.py") for s in targets] if targets
         else glob.glob(os.path.join(VID, "*", "content.py")))

for cp in paths:
    if not os.path.exists(cp): print("  bỏ (thiếu content.py):", cp); continue
    slug = os.path.basename(os.path.dirname(cp))
    spec = importlib.util.spec_from_file_location("c_" + slug.replace("-", "_"), cp)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    beats = [{"id": bid, "text": m.BEATS[bid]} for bid in m.ORDER]
    data = {"slug": slug, "beats": beats}
    if "short-outro" in getattr(m, "BEATS", {}):
        data["shortOutro"] = m.BEATS["short-outro"]
    pron = getattr(m, "PRON", {})
    if pron:
        data["pron"] = [{"word": k, "say": v} for k, v in pron.items()]
    out = os.path.join(VID, slug, "script.json")
    json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"  wrote {slug}: {len(beats)} beat" + (" + short-outro" if "shortOutro" in data else ""))
print("xong.")
