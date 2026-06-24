# Generate per-beat Vbee audio from content.py, compute durations -> src/beats.json + src/outro.json
import json, time, os, urllib.request, urllib.error
from content import BEATS, ORDER

APP_ID = "bcce0da6-c858-4deb-a119-3bcec49fd947"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODIyOTI0NDF9.jn9DHtck7O4XVwq7IQ_MMbbZtTa-VvG7UTHEMiyYYjc"
BASE = "https://vbee.vn/api/v1/tts"
CB = "https://webhook.site/00000000-0000-0000-0000-000000000000"
VOICE = "n_hanoi_male_tuanla2_education_vc"   # personal cloned voice
SPEED = "1.0"
FPS = 30
PAD = 0.25

def req(url, data, method):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"}, method=method)
    try:
        with urllib.request.urlopen(r, timeout=120) as x: return x.status, x.read().decode()
    except urllib.error.HTTPError as e: return e.code, e.read().decode()
    except Exception as e: return -1, str(e)

def synth(text, out_path):
    body = {"app_id": APP_ID, "input_text": text, "voice_code": VOICE,
            "audio_type": "mp3", "bitrate": 128, "speed_rate": SPEED, "callback_url": CB}
    c, resp = req(BASE, body, "POST")
    if c != 200: print("  POST FAIL", c, resp[:160]); return None
    rid = (json.loads(resp).get("result") or {}).get("request_id")
    for _ in range(40):
        time.sleep(2.5)
        r2 = (json.loads(req(BASE + "/" + rid, None, "GET")[1]).get("result") or {})
        if r2.get("audio_link"):
            urllib.request.urlretrieve(r2["audio_link"], out_path)
            return out_path
        if r2.get("status") in ("FAILURE", "ERROR"): print("  synth FAIL"); return None
    return None

def duration(path):
    raw = open(path, "rb").read(); n = len(raw)
    off = 10 + ((raw[6] << 21) | (raw[7] << 14) | (raw[8] << 7) | raw[9]) if raw[:3] == b"ID3" else 0
    return (n - off) * 8 / 128000.0

os.makedirs("public/audio", exist_ok=True)
manifest = []
for bid in ORDER:
    fn = f"public/audio/beat-{bid}.mp3"
    print(f"beat {bid} ...")
    if not synth(BEATS[bid], fn): raise SystemExit("gen failed " + bid)
    d = duration(fn); frames = round((d + PAD) * FPS)
    manifest.append({"id": bid, "audio": f"audio/beat-{bid}.mp3", "durationSec": round(d, 2), "durationInFrames": frames})
    print(f"   {d:.2f}s -> {frames}f")
json.dump(manifest, open("src/beats.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print("short-outro ...")
synth(BEATS["short-outro"], "public/audio/short-outro.mp3")
d = duration("public/audio/short-outro.mp3"); fr = round((d + PAD) * FPS)
json.dump({"audio": "audio/short-outro.mp3", "durationInFrames": fr}, open("src/outro.json", "w"))
print(f"   outro {d:.2f}s -> {fr}f")

tot = sum(m["durationInFrames"] for m in manifest)
print(f"\nTOTAL {tot}f = {tot/FPS:.1f}s ({tot/FPS/60:.2f} min)")
