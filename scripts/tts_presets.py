# Render the beat-00 line with each built-in MALE preset voice (channel host is male),
# peak-normalized. Output: out/preset-<slug>.wav
import truststore; truststore.inject_into_ssl()
import sys, wave
import numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from vieneu import Vieneu

TEXT = ("Sáng thứ Hai. Phòng họp. Sếp hỏi một câu: "
        "Doanh thu tháng này bao nhiêu? Anh Sales đáp: bốn phẩy hai tỷ. "
        "Chị Kế toán: ba phẩy tám tỷ. Cùng một công ty, cùng một tháng. Hai con số.")

MALE = [("Gia Bảo", "giabao"), ("Thái Sơn", "thaison"), ("Đức Trí", "ductri"),
        ("Xuân Vĩnh", "xuanvinh"), ("Trọng Hữu", "tronghuu"), ("Bình An", "binhan")]

tts = Vieneu()

def norm_save(audio, path, peak=0.97):
    tts.save(audio, path)
    with wave.open(path, "rb") as wf:
        sr, n = wf.getframerate(), wf.getnframes(); raw = wf.readframes(n)
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
    x = np.clip(x * (peak * 32767.0 / (float(np.max(np.abs(x))) or 1.0)), -32768, 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr); wf.writeframes(x.tobytes())

for vid, slug in MALE:
    norm_save(tts.infer(TEXT, voice=vid), f"out/preset-{slug}.wav")
    print(f"wrote out/preset-{slug}.wav  ({vid})")
