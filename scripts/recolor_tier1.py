# One-off: backup gốc -> _src/, recolor về brand palette, rename sang key sạch cho kit.
# Palette kit: good#00BC7D bad#FF6467 warn#FE9A00 accent#783ABF white#FAFAFA muted#9CA3AF
import os, shutil, json
from recolor_lottie import recolor, parse_map

HERE = os.path.dirname(os.path.abspath(__file__))
LOT = os.path.join(HERE, "..", "public", "lottie")
SRC = os.path.join(LOT, "_src")
os.makedirs(SRC, exist_ok=True)

# (file gốc, key sạch, "map màu")  — chỉ remap màu bão hoà, để yên đen/trắng trừ icon mono.
JOBS = [
    ("check.json", "check", "00D478=#00BC7D,21D27B=#00BC7D,1269FB=#783ABF,9361E5=#783ABF"),
    ("wrong answer animation.json", "cross", "FF4433=#FF6467"),
    ("Confirmation.json", "question", "EE3039=#783ABF"),
    ("Bulb Transparent.json", "idea", "F1CA21=#FE9A00,DD1010=#FE9A00,E40000=#FE9A00"),
    ("Warning.json", "alert", "FFA400=#FE9A00"),
    ("Target Animation.json", "target", "D54722=#783ABF,AA3719=#783ABF,5B5D6E=#9CA3AF,451421=#783ABF"),
    ("search imm.json", "search", "4659A4=#783ABF,F7B733=#FE9A00"),
    ("Loader animation.json", "loading", "FC644A=#783ABF"),
    ("Basic Loading Progress Bar.json", "progress", "000000=#783ABF,E6E6E6=#2A2D36"),
    ("Keyboard Arrow Up (Google Material Icon).json", "arrow-up", "000000=#00BC7D"),
    ("Keyboard Arrow Down Icon (Google Material Icon).json", "arrow-down", "000000=#FF6467"),
    ("Swipe Left.json", "swipe", "000000=#FAFAFA,231F20=#FAFAFA"),
    ("Youtube Subscribe Button Animation.json", "subscribe", ""),   # giữ nguyên (CTA quen mắt)
    ("error.json", "error", "EF4444=#FF6467"),                       # alt cho cross
]

for orig, key, mp in JOBS:
    p = os.path.join(LOT, orig)
    if not os.path.exists(p):
        print(f"  ⚠ thiếu: {orig}"); continue
    shutil.copy2(p, os.path.join(SRC, orig))            # backup gốc
    d = json.load(open(p, encoding="utf-8"))
    n = recolor(d, parse_map(mp)) if mp else 0
    out = os.path.join(LOT, key + ".json")
    json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    if orig != key + ".json":
        os.remove(p)                                     # bỏ tên cũ
    print(f"  {key:11} <- {orig[:34]:36} ({n} màu đổi)")

print("\nXong. Gốc lưu ở public/lottie/_src/. Recolor sai chỉ cần copy lại từ _src.")
