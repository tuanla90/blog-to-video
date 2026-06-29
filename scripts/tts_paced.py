# Clone with a CONSISTENT voice + SPEED + PAUSE control.
#   1) ONE inference for the whole text (max_chars huge -> single chunk -> no voice drift)
#   2) WSOLA time-stretch faster (pitch-preserving)
#   3) post: detect natural pauses (energy VAD) and lengthen them -> "ngắt thêm" without
#      re-generating (so the voice stays identical throughout).
# Usage: tts_paced.py <ref.wav> <out.wav> [speed=1.12] [pause_s=0.4]
import truststore; truststore.inject_into_ssl()
import sys, wave
import numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from vieneu import Vieneu
from audiotsm import wsola
from audiotsm.io.array import ArrayReader, ArrayWriter

TEXT = (
    "Sáng thứ Hai. Phòng họp. Sếp hỏi một câu: Doanh thu tháng này bao nhiêu? "
    "Anh Sales đáp: bốn phẩy hai tỷ. Chị Kế toán: ba phẩy tám tỷ. Cùng một công ty, cùng một tháng. Hai con số. "
    "Sếp gõ bàn: ai sai? Không ai sai cả."
)

ref, out = sys.argv[1], sys.argv[2]
speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.12
pause_s = float(sys.argv[4]) if len(sys.argv) > 4 else 0.4

def stretch(x, sp):
    if abs(sp - 1.0) < 1e-3: return x
    r, w = ArrayReader(x[None, :].astype(np.float32)), ArrayWriter(channels=1)
    wsola(channels=1, speed=sp).run(r, w)
    return w.data[0]

def extend_pauses(x, sr, target, min_sil=0.16):
    """Lengthen each natural pause (silent run >= min_sil) to `target` seconds."""
    fl, hop = int(0.025 * sr), int(0.01 * sr)
    nh = 1 + (len(x) - fl) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:i * hop + fl] ** 2) + 1e-9) for i in range(nh)])
    thr = max(float(rms.max()) * 0.06, 0.004)
    voiced = rms > thr
    tgt = int(target * sr)
    out_parts, i = [], 0
    while i < nh:
        j = i
        same = voiced[i]
        while j < nh and voiced[j] == same:
            j += 1
        seg = x[i * hop:j * hop]
        if not same and (j - i) * hop >= int(min_sil * sr):
            out_parts.append(np.zeros(max(tgt, len(seg)), np.float32))  # lengthen pause
        else:
            out_parts.append(seg)
        i = j
    out_parts.append(x[nh * hop:])
    return np.concatenate(out_parts)

tts = Vieneu()
tts.save(tts.infer(TEXT, ref_audio=ref, temperature=0.8, max_chars=500), out)  # 1 chunk
with wave.open(out, "rb") as wf:
    sr, n = wf.getframerate(), wf.getnframes(); raw = wf.readframes(n)
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
print(f"raw {len(x) / sr:.1f}s")
x = stretch(x, speed)
x = extend_pauses(x, sr, pause_s)
x = x / (float(np.max(np.abs(x))) or 1.0) * 0.97
with wave.open(out, "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr)
    wf.writeframes(np.clip(x * 32767, -32768, 32767).astype(np.int16).tobytes())
print(f"wrote {out} (speed={speed}, pause={pause_s}s, {len(x) / sr:.1f}s)")
