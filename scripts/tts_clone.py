# Clone one voice from a reference clip. Usage: tts_clone.py <ref.wav> <out.wav> [temp]
import truststore; truststore.inject_into_ssl()
import sys, wave
import numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from vieneu import Vieneu

TEXT = ("Sáng thứ Hai. Phòng họp. Sếp hỏi một câu: "
        "Doanh thu tháng này bao nhiêu? Anh Sales đáp: bốn phẩy hai tỷ. "
        "Chị Kế toán: ba phẩy tám tỷ. Cùng một công ty, cùng một tháng. Hai con số.")

ref, out = sys.argv[1], sys.argv[2]
temp = float(sys.argv[3]) if len(sys.argv) > 3 else 0.8
tts = Vieneu()
audio = tts.infer(TEXT, ref_audio=ref, temperature=temp)
tts.save(audio, out)
# peak-normalize loudness
with wave.open(out, "rb") as wf:
    sr, n = wf.getframerate(), wf.getnframes(); raw = wf.readframes(n)
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
x = np.clip(x * (0.97 * 32767.0 / (float(np.max(np.abs(x))) or 1.0)), -32768, 32767).astype(np.int16)
with wave.open(out, "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr); wf.writeframes(x.tobytes())
print(f"wrote {out} (ref={ref}, temp={temp})")
