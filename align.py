# Forced-align known text to Vbee audio using energy VAD (no ML).
# Usage: python align.py <slug>
#   reads videos/<slug>/content.py (BEATS, ORDER) + public/audio/<slug>/*.mp3
#   writes videos/<slug>/timings.json
# v2: maps words onto VOICED time only (skips internal pauses -> tight sync),
#     and groups captions into BALANCED lines (no orphan single-word lines).
import json, re, sys, os, importlib.util
import numpy as np
import av

MAXPERLINE = 5

if len(sys.argv) < 2:
    raise SystemExit("usage: python align.py <slug>")
SLUG = sys.argv[1]

def load_content(slug):
    path = os.path.join("videos", slug, "content.py")
    spec = importlib.util.spec_from_file_location(f"content_{slug.replace('-', '_')}", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.BEATS, mod.ORDER

def decode_mono(path):
    container = av.open(path)
    stream = container.streams.audio[0]
    sr = stream.rate
    chunks = []
    for frame in container.decode(stream):
        arr = frame.to_ndarray()
        if arr.ndim > 1: arr = arr.mean(axis=0)
        chunks.append(arr.astype(np.float32))
    sig = np.concatenate(chunks) if chunks else np.zeros(1, np.float32)
    m = np.max(np.abs(sig)) or 1.0
    return sig / m, sr

def voiced_segments(sig, sr):
    fl = int(0.02 * sr); hop = int(0.01 * sr)
    if len(sig) < fl: return [(0.0, len(sig) / sr)]
    n = 1 + (len(sig) - fl) // hop
    rms = np.array([np.sqrt(np.mean(sig[i*hop:i*hop+fl]**2) + 1e-9) for i in range(n)], np.float32)
    thr = max(rms.max() * 0.06, 0.01)
    voiced = rms > thr
    MIN_GAP = int(0.18 / 0.01)   # merge across silences shorter than 180ms
    MIN_SEG = 0.05
    segs = []; i = 0
    while i < n:
        if voiced[i]:
            j = i
            while j < n:
                if voiced[j]: j += 1
                else:
                    k = j
                    while k < n and not voiced[k]: k += 1
                    if k - j < MIN_GAP and k < n: j = k   # bridge tiny gap
                    else: break
            s = i * hop / sr; e = (j * hop + fl) / sr
            if e - s >= MIN_SEG: segs.append((s, e))
            i = j
        else:
            i += 1
    return segs or [(0.0, len(sig) / sr)]

def map_to_voiced(weights, segs):
    """Place each word into VOICED time only, skipping silences between segments."""
    durs = [e - s for s, e in segs]
    V = sum(durs) or 1.0
    tot = sum(weights) or 1.0
    def voiced_to_real(vt):
        acc = 0.0
        for (s, e), d in zip(segs, durs):
            if vt <= acc + d: return s + (vt - acc)
            acc += d
        return segs[-1][1]
    out = []; cw = 0.0
    for w in weights:
        a = cw / tot; cw += w; b = cw / tot
        out.append((voiced_to_real(a * V), voiced_to_real(b * V)))
    return out

def build(text):
    raw = text.replace("\n", " ").split()
    weights, words = [], []
    for tok in raw:
        core = re.sub(r"[^\wÀ-ỹ]", "", tok)
        weights.append(1.0 + 0.18 * len(core))
        words.append(tok)
    return words, weights

def group_lines(words, times):
    sents = []; cur = []
    for w, t in zip(words, times):
        cur.append((w, t))
        if w[-1] in ".?!:;":
            sents.append(cur); cur = []
    if cur: sents.append(cur)
    lines = []
    for sent in sents:
        n = len(sent)
        nlines = max(1, -(-n // MAXPERLINE))      # ceil
        size = -(-n // nlines)                     # balanced ceil
        for i in range(0, n, size):
            grp = sent[i:i+size]
            lines.append({
                "text": " ".join(w for w, _ in grp),
                "start": round(grp[0][1][0], 3),
                "end": round(grp[-1][1][1], 3),
                "words": [{"w": w, "s": round(t[0], 3), "e": round(t[1], 3)} for w, t in grp],
            })
    return lines

BEATS, ORDER = load_content(SLUG)
audio_dir = os.path.join("public", "audio", SLUG)
ids = ORDER + (["short-outro"] if "short-outro" in BEATS else [])
out = {}
for bid in ids:
    fn = os.path.join(audio_dir, ("short-outro" if bid == "short-outro" else "beat-" + bid) + ".mp3")
    sig, sr = decode_mono(fn)
    segs = voiced_segments(sig, sr)
    words, weights = build(BEATS[bid])
    times = map_to_voiced(weights, segs)
    out[bid] = group_lines(words, times)
    sys.stdout.buffer.write((f"{bid}: {len(segs)} voiced segs, {len(words)} words, {len(out[bid])} lines\n").encode())
dest = os.path.join("videos", SLUG, "timings.json")
json.dump(out, open(dest, "w", encoding="utf-8"), ensure_ascii=False)
print("wrote " + dest)
