# Map the user's sound pack -> public/audio. Decode each (PyAV), analyse loudness +
# peak time (for rhythm/offset), peak-normalize SFX -> wav, copy music mp3.
import os, sys, shutil, wave
import numpy as np
import av

SRC = sys.argv[1] if len(sys.argv) > 1 else "D:/Users/tuanla2/Downloads/sound"
SFXDIR = "public/audio/sfx"; MUSDIR = "public/audio/music"
os.makedirs(SFXDIR, exist_ok=True); os.makedirs(MUSDIR, exist_ok=True)
SR = 44100

SFX = {
  "whoosh": "dragon-studio-whoosh-cinematic-376875.mp3",
  "whoosh-soft": "dragon-studio-simple-whoosh-382724.mp3",
  "pop": "dragon-studio-pop-402324.mp3",
  "impact": "universfield-cinematic-impact-boom-05-352465.mp3",
  "riser": "dragon-studio-cinematic-riser-03-414575.mp3",
  "ding": "dragon-studio-correct-472358.mp3",
  "wrong": "eritnhut1992-buzzer-or-wrong-answer-20582.mp3",
  "glitch": "virtual_vibes-glitch-sound-effect-hd-379466.mp3",
  "click": "universfield-mouse-click-351398.mp3",
  "swipe": "u_nharq4usid-swipe-255512.mp3",
  "swish": "freesound_community-long-medium-swish-44324.mp3",
  "type": "dragon-studio-keyboard-typing-sound-effect-335503.mp3",
}
MUSIC = {"may-nhat": "Mây Nhạt.mp3", "suong-sach": "Màn Sương Sạch.mp3"}

def decode(path):
    c = av.open(path); st = c.streams.audio[0]
    rs = av.AudioResampler(format="flt", layout="mono", rate=SR)
    ch = []
    for fr in c.decode(st):
        for rf in rs.resample(fr): ch.append(rf.to_ndarray().reshape(-1))
    for rf in rs.resample(None): ch.append(rf.to_ndarray().reshape(-1))
    return np.concatenate(ch).astype(np.float32) if ch else np.zeros(1, np.float32)

def stats(sig):
    p = float(np.max(np.abs(sig))) or 1e-9
    return dict(dur=len(sig) / SR, peak=p, peakt=int(np.argmax(np.abs(sig))) / SR,
               rms=float(np.sqrt(np.mean(sig ** 2))))

def save_wav(path, sig):
    x = (np.clip(sig, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(x.tobytes())

print("=== SFX (normalized to 0.9) ===")
for role, fn in SFX.items():
    sig = decode(os.path.join(SRC, fn)); s = stats(sig)
    save_wav(os.path.join(SFXDIR, role + ".wav"), sig / s["peak"] * 0.9)
    print(f"  {role:11s} dur={s['dur']:.2f}s peak@{s['peakt']:.2f}s rms={s['rms']:.3f}")

print("=== MUSIC (copied mp3) ===")
for key, fn in MUSIC.items():
    sig = decode(os.path.join(SRC, fn)); s = stats(sig)
    shutil.copy(os.path.join(SRC, fn), os.path.join(MUSDIR, key + ".mp3"))
    print(f"  {key:11s} dur={s['dur']:.1f}s rms={s['rms']:.3f} peak={s['peak']:.2f}")

# old synth bed no longer needed
for f in ("bed.wav",):
    p = os.path.join(SFXDIR, f)
    if os.path.exists(p): os.remove(p)
print("done -> public/audio/{sfx,music}")
