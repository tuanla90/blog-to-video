# Generate per-beat ElevenLabs audio + REAL word-timestamps for ONE video slug.
# Usage: python gen_audio.py <slug>
#   reads voiceover from videos/<slug>/content.py  (BEATS, ORDER, optional PRON)
#   writes: public/audio/<slug>/beat-NN.mp3 (+ short-outro.mp3)
#           videos/<slug>/{beats.json, outro.json, timings.json}
#
# ElevenLabs /with-timestamps trả character-level timestamp -> ta gộp thành word/câu
# => KHÔNG cần align.py cho video dùng ElevenLabs (gen_audio ghi thẳng timings.json).
#
# v2.5 / multilingual_v2 KHÔNG hỗ trợ audio-tag ([excited]...) -> ta STRIP trước khi gửi
# (nếu không nó sẽ ĐỌC TO cái tag). Cảm xúc đến từ voice_settings + dấu câu (...,\n) trong script.
import json, os, sys, re, base64, math, subprocess, time, importlib.util, urllib.request, urllib.error

try:
    sys.stdout.reconfigure(encoding="utf-8")   # console cp1252 không in được dấu tiếng Việt
except Exception:
    pass
try:
    import truststore; truststore.inject_into_ssl()   # proxy MITM máy này (xem NOTES.md); bỏ qua nếu chưa cài
except Exception:
    pass

# --- .env loader (chạy gen_audio.py trực tiếp vẫn đọc được key) ---
ROOT = os.path.dirname(os.path.abspath(__file__))
def load_env():
    p = os.path.join(ROOT, ".env")
    if not os.path.exists(p): return
    for line in open(p, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
load_env()

if len(sys.argv) < 2:
    raise SystemExit("usage: python gen_audio.py <slug>")
SLUG = sys.argv[1]

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID")
if not API_KEY or not VOICE_ID:
    raise SystemExit("Thiếu ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID — điền vào .env (xem .env.example)")
MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")        # chất lượng tốt nhất cho tiếng Việt
KEEP_TAGS = MODEL.endswith("v3")   # v3 ĐỌC audio-tag [excited]/[thoughtful]... -> giữ trong text gửi đi
OUTPUT_FORMAT = os.environ.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")  # hạ xuống mp3_44100_96 nếu account free
# Cảm xúc trên v2/v2.5: stability thấp = biểu cảm hơn; style cao = nhấn nhá hơn.
VOICE_SETTINGS = {
    "stability": float(os.environ.get("ELEVENLABS_STABILITY", "0.35")),
    "similarity_boost": float(os.environ.get("ELEVENLABS_SIMILARITY", "0.75")),
    "style": float(os.environ.get("ELEVENLABS_STYLE", "0.40")),
    "use_speaker_boost": True,
}

FPS = 30
LEAD_IN = 0.4   # PHẢI khớp LEAD_IN trong Root.tsx (nghỉ sau chuyển cảnh, voice lùi vào)
TAIL = 0.3      # đệm đuôi cho hết câu trước khi cắt
SPEED = float(os.environ.get("ELEVENLABS_SPEED", "1.0"))  # đọc nhanh hơn HẬU KỲ (v3 ko hỗ trợ speed API) — atempo giữ cao độ
NPX = "npx.cmd" if os.name == "nt" else "npx"

TAG = re.compile(r"\[[^\]]*\]")          # audio-tag [excited]/[thoughtful]... -> bỏ trước khi gửi v2.5
SENT_END = re.compile(r"[.!?:…]$")

def load_content(slug):
    # NGUỒN lời thoại: ưu tiên script.json (sửa được qua Decap CMS), fallback content.py.
    js = os.path.join("videos", slug, "script.json")
    if os.path.exists(js):
        d = json.load(open(js, encoding="utf-8"))
        BEATS = {b["id"]: b["text"] for b in d.get("beats", [])}
        ORDER = [b["id"] for b in d.get("beats", [])]
        if d.get("shortOutro"): BEATS["short-outro"] = d["shortOutro"]
        PRON = {p["word"]: p["say"] for p in (d.get("pron") or [])}
        return BEATS, ORDER, PRON
    path = os.path.join("videos", slug, "content.py")
    spec = importlib.util.spec_from_file_location(f"content_{slug.replace('-', '_')}", path)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod.BEATS, mod.ORDER, getattr(mod, "PRON", {})

def prep(text, pron):
    # 1) bỏ audio-tag (v2.5 không hiểu)  2) thay phát âm tên riêng (PRON)
    # LƯU Ý: caption sinh từ text ĐÃ thay -> nếu PRON một từ, caption hiện bản phiên âm.
    t = text if KEEP_TAGS else TAG.sub("", text)   # v3: giữ audio-tag; model khác: bỏ
    for k, v in pron.items():
        t = t.replace(k, v)
    return t

LANG = os.environ.get("ELEVENLABS_LANGUAGE", "")  # vd "vi" — ÉP ngôn ngữ (chỉ model turbo/flash v2.5 nhận)

def synth(text):
    url = (f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"
           f"?output_format={OUTPUT_FORMAT}")
    body = {"text": text, "model_id": MODEL}
    if not MODEL.endswith("v3"):       # v3 dùng voice_settings khác — bỏ cho an toàn (mặc định Natural)
        body["voice_settings"] = VOICE_SETTINGS
    if LANG and ("turbo" in MODEL or "flash" in MODEL):
        body["language_code"] = LANG   # buộc đọc đúng tiếng Việt thay vì auto-detect ra tiếng Anh
    data = json.dumps(body).encode()
    last = None
    for attempt in range(4):                        # retry lỗi mạng/5xx (proxy MITM máy này hay chập giữa batch dài)
        r = urllib.request.Request(url, data=data,
            headers={"xi-api-key": API_KEY, "Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(r, timeout=180) as x:
                return json.loads(x.read().decode())
        except urllib.error.HTTPError as e:
            body_txt = e.read().decode()[:400]
            if e.code < 500:                        # 4xx = lỗi thật (key sai / text lỗi / hết quota) — fail ngay, đừng phí lần thử
                raise SystemExit(f"ElevenLabs HTTP {e.code}: {body_txt}")
            last = f"HTTP {e.code}: {body_txt}"      # 5xx server — thử lại
        except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
            last = repr(e)                           # ConnectionReset / timeout / proxy rớt — thử lại
        if attempt < 3:
            time.sleep(2 * (attempt + 1))           # backoff 2s, 4s, 6s
    raise SystemExit(f"ElevenLabs lỗi mạng sau 4 lần thử: {last}")

def to_timings(alignment):
    """character-level -> [{text,start,end,words:[{w,s,e}]}] (giây, relative beat start)."""
    chars = alignment["characters"]
    cs_t = alignment["character_start_times_seconds"]
    ce_t = alignment["character_end_times_seconds"]
    words = []
    cur, ws, we = "", None, None
    def flush():
        nonlocal cur, ws, we
        if cur.strip():
            words.append({"w": cur.strip(), "s": round(ws, 3), "e": round(we, 3)})
        cur, ws = "", None
    for i, ch in enumerate(chars):
        if ch.isspace():
            flush(); continue
        if ws is None: ws = cs_t[i]
        we = ce_t[i]; cur += ch
    flush()
    sents, bag = [], []
    for w in words:
        bag.append(w)
        if SENT_END.search(w["w"]):
            sents.append(bag); bag = []
    if bag: sents.append(bag)
    out = [{"text": " ".join(x["w"] for x in s), "start": s[0]["s"], "end": s[-1]["e"], "words": s}
           for s in sents]
    dur = ce_t[-1] if ce_t else 0.0
    return out, dur

def restore_caption(tl):
    # Caption hiển thị chữ GỐC dù audio đọc theo respelling (chỉ PRON 1-token, vd gở->gỡ).
    for line in tl:
        for wd in line["words"]:
            wd["w"] = TAG.sub("", wd["w"])             # xoá audio-tag lọt vào caption (v3)
            for tts, disp in BACK.items():
                if tts in wd["w"]:
                    wd["w"] = wd["w"].replace(tts, disp)
        line["words"] = [w for w in line["words"] if w["w"].strip()]  # bỏ word rỗng do xoá tag
        line["text"] = " ".join(w["w"] for w in line["words"])
    return tl

def apply_atempo(path, s):
    tmp = path + ".sp.mp3"
    subprocess.run([NPX, "remotion", "ffmpeg", "-y", "-i", path, "-af", f"atempo={s}", "-b:a", "192k", tmp],
                   check=True, capture_output=True)
    data = open(tmp, "rb").read()
    for _ in range(15):                     # GHI ĐÈ nội dung (không xoá-đổi-tên) -> chịu được Studio mở đọc
        try:
            with open(path, "wb") as f:
                f.write(data)
            break
        except PermissionError:
            time.sleep(0.4)
    try:
        os.remove(tmp)
    except OSError:
        pass

def scale_alignment(al, f):
    return {"characters": al["characters"],
            "character_start_times_seconds": [t * f for t in al["character_start_times_seconds"]],
            "character_end_times_seconds": [t * f for t in al["character_end_times_seconds"]]}

def gen(bid, text):
    res = synth(text)
    # short-outro ghi thẳng short-outro.mp3 (khớp outro.json); beat thường ghi beat-NN.mp3
    fname = "short-outro" if bid == "short-outro" else f"beat-{bid}"
    mp3 = os.path.join(audio_dir, f"{fname}.mp3")
    with open(mp3, "wb") as fh:                # đóng handle trước khi atempo (Windows hay khoá file)
        fh.write(base64.b64decode(res["audio_base64"]))
    al = res.get("alignment") or res.get("normalized_alignment")
    if abs(SPEED - 1.0) > 0.01:
        apply_atempo(mp3, SPEED)               # đọc nhanh hơn, giữ cao độ
        al = scale_alignment(al, 1.0 / SPEED)  # timestamp co lại theo audio mới
    tl, dur = to_timings(al)
    tl = restore_caption(tl)
    frames = math.ceil((LEAD_IN + dur + TAIL) * FPS)
    print(f"[{SLUG}] {bid}: {dur:.2f}s -> {frames}f  ({len(tl)} câu)")
    return tl, dur, frames

BEATS, ORDER, PRON = load_content(SLUG)
BACK = {v: k for k, v in PRON.items() if " " not in v.strip() and v != k}  # respelling -> chữ gốc cho caption
audio_dir = os.path.join("public", "audio", SLUG); os.makedirs(audio_dir, exist_ok=True)
out_dir = os.path.join("videos", SLUG)

# Re-voice TỪNG BEAT: python gen_audio.py <slug> <beat> [beat...]  -> chỉ gen beat đó,
# giữ nguyên audio/timings các beat còn lại (đỡ credit + không đổi phần đã duyệt).
ONLY = [b for b in sys.argv[2:] if not b.startswith("-")]
beats_path = os.path.join(out_dir, "beats.json")
timings_path = os.path.join(out_dir, "timings.json")

if ONLY:
    manifest = json.load(open(beats_path, encoding="utf-8"))
    timings = json.load(open(timings_path, encoding="utf-8"))
    by_id = {m["id"]: m for m in manifest}
    for bid in ONLY:
        if bid == "short-outro":
            tl, dur, frames = gen("short-outro", prep(BEATS["short-outro"], PRON))
            timings["short-outro"] = tl
            json.dump({"audio": f"audio/{SLUG}/short-outro.mp3", "durationInFrames": frames},
                      open(os.path.join(out_dir, "outro.json"), "w", encoding="utf-8"), ensure_ascii=False)
        else:
            tl, dur, frames = gen(bid, prep(BEATS[bid], PRON))
            timings[bid] = tl
            m = by_id.get(bid) or {"id": bid, "audio": f"audio/{SLUG}/beat-{bid}.mp3"}
            m["durationSec"] = round(dur, 2); m["durationInFrames"] = frames
            if bid not in by_id: manifest.append(m)
    json.dump(manifest, open(beats_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.dump(timings, open(timings_path, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"\n[{SLUG}] re-voiced beat: {', '.join(ONLY)} (giữ nguyên phần còn lại)")
    raise SystemExit(0)

manifest, timings = [], {}
for bid in ORDER:
    tl, dur, frames = gen(bid, prep(BEATS[bid], PRON))
    timings[bid] = tl
    manifest.append({"id": bid, "audio": f"audio/{SLUG}/beat-{bid}.mp3",
                     "durationSec": round(dur, 2), "durationInFrames": frames})
json.dump(manifest, open(beats_path, "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)

if "short-outro" in BEATS:
    tl, dur, frames = gen("short-outro", prep(BEATS["short-outro"], PRON))
    timings["short-outro"] = tl
    json.dump({"audio": f"audio/{SLUG}/short-outro.mp3", "durationInFrames": frames},
              open(os.path.join(out_dir, "outro.json"), "w", encoding="utf-8"), ensure_ascii=False)

json.dump(timings, open(timings_path, "w", encoding="utf-8"),
          ensure_ascii=False)

tot = sum(m["durationInFrames"] for m in manifest)
print(f"\n[{SLUG}] TOTAL {tot}f = {tot/FPS:.1f}s ({tot/FPS/60:.2f} phút). "
      f"Đã ghi beats.json + outro.json + timings.json. (KHÔNG cần align.py)")
