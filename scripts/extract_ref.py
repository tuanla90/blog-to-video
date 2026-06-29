# Extract a clean ~Ns reference clip from any audio/video (for voice cloning).
# Decodes via PyAV (handles wmv/mp4/...), resamples to mono 24kHz, then picks the
# loudest contiguous window (proxy for clean continuous speech) and writes a wav.
# Usage: extract_ref.py <input> [out.wav] [seconds] [start_sec]
#   start_sec given -> cut exactly [start, start+seconds]; else auto-pick loudest window.
import os, sys, wave
import numpy as np
import av

inp = sys.argv[1]
out_clip = sys.argv[2] if len(sys.argv) > 2 else "out/ref-clip.wav"
dur = float(sys.argv[3]) if len(sys.argv) > 3 else 6.0
start = float(sys.argv[4]) if len(sys.argv) > 4 else None
SR = 24000

container = av.open(inp)
stream = container.streams.audio[0]
resampler = av.AudioResampler(format="s16", layout="mono", rate=SR)
chunks = []
for frame in container.decode(stream):
    for rf in resampler.resample(frame):
        chunks.append(rf.to_ndarray().reshape(-1))
for rf in resampler.resample(None):  # flush
    chunks.append(rf.to_ndarray().reshape(-1))
sig = np.concatenate(chunks).astype(np.int16)
print(f"decoded {len(sig)/SR:.1f}s @ {SR}Hz mono")

w, step = int(dur * SR), int(0.5 * SR)
if start is not None:
    i0 = int(start * SR)
    best = sig[i0:i0 + w]
    print(f"fixed window {start:.1f}s..{start + dur:.1f}s")
elif len(sig) <= w:
    best = sig
else:
    f = sig.astype(np.float32)
    best_i, best_e = 0, -1.0
    for i in range(0, len(sig) - w + 1, step):
        e = float(np.sqrt(np.mean(f[i:i + w] ** 2)))
        if e > best_e:
            best_e, best_i = e, i
    best = sig[best_i:best_i + w]
    print(f"picked loudest window {best_i / SR:.1f}s..{(best_i + w) / SR:.1f}s")

os.makedirs(os.path.dirname(out_clip) or ".", exist_ok=True)
with wave.open(out_clip, "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes(best.tobytes())
print("wrote", out_clip)
