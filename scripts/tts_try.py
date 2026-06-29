# Quick A/B: generate a real beat line with VieNeu-TTS to judge Vietnamese quality.
# Usage: .venv-tts/Scripts/python.exe scripts/tts_try.py [ref_audio.wav]
#   no arg  -> use a preset voice (lists what's available, picks a male-ish one)
#   ref arg -> instant voice-clone from that 3-5s reference clip
import truststore; truststore.inject_into_ssl()  # trust the corporate root CA (Windows store)
import os, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows console is cp1252; VN text breaks print
from vieneu import Vieneu

TEXT = ("Sáng thứ Hai. Phòng họp. Sếp hỏi một câu: "
        "Doanh thu tháng này bao nhiêu? Anh Sales đáp: bốn phẩy hai tỷ. "
        "Chị Kế toán: ba phẩy tám tỷ. Cùng một công ty, cùng một tháng. Hai con số.")

os.makedirs("out", exist_ok=True)
tts = Vieneu()

print("=== preset voices ===")
voices = []
try:
    for label, vid in tts.list_preset_voices():
        voices.append((label, vid))
        print(f"  - {label} ({vid})")
except Exception as e:
    print("  (list_preset_voices failed:", e, ")")

ref = sys.argv[1] if len(sys.argv) > 1 else None
if ref:
    print(f"\ncloning from {ref} ...")
    audio = tts.infer(TEXT, ref_audio=ref)
    out = "out/vieneu-clone.wav"
else:
    # prefer a male-labelled preset, else first; pass the voice_id (not the label)
    pick = next((vid for lbl, vid in voices if "nam" in lbl.lower()), None)
    pick = pick or (voices[0][1] if voices else None)
    print(f"\ngenerating with preset voice: {pick} ...")
    audio = tts.infer(TEXT, voice=pick) if pick else tts.infer(TEXT)
    out = "out/vieneu-preset.wav"

tts.save(audio, out)
print(f"\nwrote {out}")
