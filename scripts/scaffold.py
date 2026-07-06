# Scaffold a video bundle from content.py WITHOUT audio yet — so the visual pipeline can
# be previewed before ElevenLabs voice exists. Estimates per-beat duration from char count,
# writes synthetic caption timings + silent placeholder audio. Later, real ElevenLabs audio
# + word timestamps REPLACE these (gen_audio.py) and the timing becomes exact.
# Usage: python scripts/scaffold.py <slug>
import json, os, re, sys, importlib.util, wave

MAXPERLINE, FPS, SR = 5, 30, 16000

def load_content(slug):
    js = os.path.join("videos", slug, "script.json")   # ưu tiên script.json (Decap sửa được)
    if os.path.exists(js):
        d = json.load(open(js, encoding="utf-8"))
        BEATS = {b["id"]: b["text"] for b in d.get("beats", [])}
        ORDER = [b["id"] for b in d.get("beats", [])]
        if d.get("shortOutro"): BEATS["short-outro"] = d["shortOutro"]
        return BEATS, ORDER
    path = os.path.join("videos", slug, "content.py")
    spec = importlib.util.spec_from_file_location("c_" + slug.replace("-", "_"), path)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod.BEATS, mod.ORDER

def strip_tags(t):
    return re.sub(r"\[[^\]]*\]", "", t)

def est_dur(text):
    raw = strip_tags(text)
    return len(raw.replace("\n", " ")) / 17.0 + raw.count("\n") * 0.7 + 0.5

def build_lines(text, dur):
    words = strip_tags(text).replace("\n", " ").split()
    sents, cur = [], []
    for w in words:
        cur.append(w)
        if w and w[-1] in ".?!:;":
            sents.append(cur); cur = []
    if cur:
        sents.append(cur)
    lw = []
    for s in sents:
        n = len(s); nlines = max(1, -(-n // MAXPERLINE)); size = -(-n // nlines)
        for i in range(0, n, size):
            lw.append(s[i:i + size])
    total = sum(len(x) for x in lw) or 1
    out, t = [], 0.0
    for x in lw:
        seg = len(x) / total * dur
        per = seg / max(len(x), 1)
        ws, wt = [], t
        for w in x:
            ws.append({"w": w, "s": round(wt, 3), "e": round(wt + per, 3)}); wt += per
        out.append({"text": " ".join(x), "start": round(t, 3), "end": round(t + seg, 3), "words": ws})
        t += seg
    return out

slug = sys.argv[1]
BEATS, ORDER = load_content(slug)
ids = ORDER + (["short-outro"] if "short-outro" in BEATS else [])
adir = os.path.join("public", "audio", slug); os.makedirs(adir, exist_ok=True)
beats, timings, outro = [], {}, None
for bid in ids:
    dur = est_dur(BEATS[bid]); frames = round(dur * FPS)
    fn = ("short-outro" if bid == "short-outro" else "beat-" + bid) + ".wav"
    with wave.open(os.path.join(adir, fn), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(b"\x00\x00" * int(dur * SR))  # silence
    timings[bid] = build_lines(BEATS[bid], dur)
    rel = f"audio/{slug}/{fn}"
    if bid == "short-outro":
        outro = {"audio": rel, "durationInFrames": frames}
    else:
        beats.append({"id": bid, "audio": rel, "durationSec": round(dur, 2), "durationInFrames": frames})

# bài KHÔNG có short-outro: tạo outro placeholder câm 1s để Short không vỡ + registry hợp lệ
if outro is None:
    dur = 1.0; frames = round(dur * FPS); fn = "short-outro.wav"
    with wave.open(os.path.join(adir, fn), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(b"\x00\x00" * int(dur * SR))
    outro = {"audio": f"audio/{slug}/{fn}", "durationInFrames": frames}

d = os.path.join("videos", slug)
json.dump(beats, open(os.path.join(d, "beats.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(timings, open(os.path.join(d, "timings.json"), "w", encoding="utf-8"), ensure_ascii=False)
json.dump(outro, open(os.path.join(d, "outro.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"scaffolded {slug}: {len(beats)} beats + outro (ESTIMATED, no voice). total "
      f"{sum(b['durationInFrames'] for b in beats) + outro['durationInFrames']} frames")
