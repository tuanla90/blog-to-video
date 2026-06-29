# Synthesize a subtle music bed + SFX (no downloads needed) -> public/audio/sfx/*.wav
# Placeholder/preview quality; swap with real royalty-free files (Pixabay) later.
import os, wave
import numpy as np

SR = 44100
OUT = os.path.join("public", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)

def save(name, sig):
    sig = np.clip(sig, -1, 1)
    x = (sig * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(x.tobytes())
    print("wrote", name, f"{len(sig)/SR:.1f}s")

def env(n, a, d):  # linear attack / exp decay envelope
    e = np.ones(n)
    ai = int(a * SR); di = int(d * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[-di:] = np.linspace(1, 0, di) ** 1.6
    return e

def lp_sweep(x, c0, c1):  # one-pole lowpass with cutoff sweeping c0->c1 (0..1)
    a = np.linspace(c0, c1, len(x))
    y = np.zeros_like(x); prev = 0.0
    for i in range(len(x)):
        prev += a[i] * (x[i] - prev); y[i] = prev
    return y

# ---- ambient music bed: soft Am pad, ~8s, loopable, VERY low ----
T = 8.0; n = int(T * SR); t = np.arange(n) / SR
bed = np.zeros(n)
for f in (110.0, 164.81, 220.0, 329.63):           # A2 E3 A3 E4
    bed += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
bed /= np.max(np.abs(bed))
bed *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.08 * t)     # slow breathing tremolo
bed *= 0.22
xf = int(0.4 * SR)                                  # seam-friendly crossfade ends
bed[:xf] *= np.linspace(0, 1, xf); bed[-xf:] *= np.linspace(1, 0, xf)
save("bed.wav", bed)

# ---- whoosh: filtered noise sweep up (section transition) ----
n = int(0.55 * SR)
wh = np.random.default_rng(1).standard_normal(n)
wh = lp_sweep(wh, 0.01, 0.35) * env(n, 0.12, 0.42)
wh *= 0.5 / (np.max(np.abs(wh)) or 1)
save("whoosh.wav", wh)

# ---- pop: short pitch-drop blip (moment accent) ----
n = int(0.12 * SR); t = np.arange(n) / SR
freq = np.linspace(900, 380, n)
pop = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.004, 0.11)
pop *= 0.4
save("pop.wav", pop)

# ---- impact: low thud (big reveal) ----
n = int(0.45 * SR); t = np.arange(n) / SR
freq = np.linspace(120, 55, n)
imp = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.003, 0.44)
imp += 0.25 * np.random.default_rng(2).standard_normal(n) * env(n, 0.001, 0.08)
imp *= 0.55 / (np.max(np.abs(imp)) or 1)
save("impact.wav", imp)

print("done -> public/audio/sfx/")
