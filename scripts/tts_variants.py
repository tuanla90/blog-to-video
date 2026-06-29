# Generate clone variants at different temperatures (more = more dynamic/expressive),
# each peak-normalized for consistent loudness. Usage: ... tts_variants.py <ref.wav>
import truststore; truststore.inject_into_ssl()
import sys, wave
import numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from vieneu import Vieneu

TEXT = ("Sáng thứ Hai. Phòng họp. Sếp hỏi một câu: "
        "Doanh thu tháng này bao nhiêu? Anh Sales đáp: bốn phẩy hai tỷ. "
        "Chị Kế toán: ba phẩy tám tỷ. Cùng một công ty, cùng một tháng. Hai con số.")

ref = sys.argv[1]
tts = Vieneu()

def norm_save(audio, path, peak=0.97):
    tts.save(audio, path)
    with wave.open(path, "rb") as wf:
        sr, n = wf.getframerate(), wf.getnframes()
        raw = wf.readframes(n)
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
    m = float(np.max(np.abs(x))) or 1.0
    x = np.clip(x * (peak * 32767.0 / m), -32768, 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr)
        wf.writeframes(x.tobytes())

for t in (0.9, 1.05):
    out = f"out/vieneu-clone-t{int(t * 100)}.wav"
    audio = tts.infer(TEXT, ref_audio=ref, temperature=t)
    norm_save(audio, out)
    print(f"wrote {out} (temperature={t}, normalized)")
