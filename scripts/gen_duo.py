# Short đối đáp: sinh giọng TỪNG CÂU theo giọng của từng nhân vật + xếp câu nối câu -> duo.timing.json
# Usage: python gen_duo.py <slug> [--force]
#   đọc  videos/<slug>/duo.json            (lines: [{who, say, ...} | {countdown: 3}])
#        video.config.json -> duo.cast.<id>.voice = {provider, voice, rate, pitch}
#   ghi  public/audio/<slug>/duo-<hash>.mp3 (cache theo nội dung: sửa một câu chỉ sinh lại câu đó)
#        videos/<slug>/duo.timing.json      (mốc từng câu + từng tiếng, tính trên toàn video)
#
# Provider:
#   edge   — Microsoft Edge TTS (miễn phí, không key). Trả WordBoundary từng tiếng. Dịch vụ không chính thức:
#            hợp làm giọng nháp / giọng chính khi chấp nhận rủi ro. vi-VN-NamMinhNeural, vi-VN-HoaiMyNeural.
#   google — Google Cloud TTS (Chirp3-HD), key GOOGLE_TTS_API_KEY trong .env. Không trả timestamp ->
#            mốc từng tiếng ước lượng theo độ dài chữ trong đoạn có tiếng (đủ cho bong bóng thoại 2-4 từ).
import asyncio, base64, hashlib, json, os, re, sys, urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
try:
    import truststore; truststore.inject_into_ssl()   # proxy MITM máy công ty
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _project import VIDEOS, PUBLIC, CONFIG   # noqa: E402  (chdir vào gốc dự án khi import)

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args:
    raise SystemExit("usage: python gen_duo.py <slug> [--force]")
SLUG = args[0]
FORCE = "--force" in sys.argv

DUO = {"gap": 0.06, "introPad": 0.1, "outroPad": 1.2, **CONFIG.get("duo", {})}
CAST = DUO.get("cast", {})
SCRIPT = json.load(open(os.path.join(VIDEOS, SLUG, "duo.json"), encoding="utf-8"))
# đổi cách ĐỌC, bong bóng vẫn giữ chữ gốc. Của tập (cụ thể hơn, vd "COUNT(Diem)") đứng trước từ điển chung
# `duo.pron` trong config (thuật ngữ dùng mọi tập: range, print, SQL...). Giọng TTS tiếng Việt đọc từ tiếng Anh
# rất sai, nên phiên âm theo cách học sinh vẫn đọc.
PRON = {**SCRIPT.get("pron", {}), **{k: v for k, v in DUO.get("pron", {}).items() if k not in SCRIPT.get("pron", {})}}
AUDIO_DIR = os.path.join(PUBLIC, "audio", SLUG)
os.makedirs(AUDIO_DIR, exist_ok=True)


def spoken(text, keep=None, tags=False):
    """keep: chỉ áp các khoá phát âm có chứa một trong các chuỗi này (giọng đọc tiếng Anh tốt thì bỏ phần còn lại).
    tags: giữ thẻ cảm xúc [excited] [laughs]... (ElevenLabs v3 diễn theo thẻ); giọng khác thì bỏ, không nó đọc to lên."""
    t = text if tags else re.sub(r"\[[^\]]*\]", "", text)
    # khoá dài trước (COUNT(Diem) trước COUNT); khoá là chữ thì chỉ thay nguyên từ (for không ăn vào format)
    for k in sorted(PRON, key=len, reverse=True):
        if keep is not None and not any(x in k for x in keep):
            continue
        v = PRON[k]
        if re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", k):
            t = re.sub(rf"(?<![A-Za-z0-9_]){re.escape(k)}(?![A-Za-z0-9_])", v, t)
        else:
            t = t.replace(k, v)
    return t.strip()


# thẻ PHÁT RA TIẾNG có chủ đích (cười, hít vào, thở dài): tiếng trước chữ đầu là đúng, giữ nguyên
VOCAL_TAGS = {"laughs", "laughing", "chuckles", "giggles", "gasps", "sighs", "exhales", "inhales", "snorts", "whistles"}


def trim_leak(path, text, words):
    """ElevenLabs v3 hay đọc lọt thẻ cách-nói (vd [curious] ra tiếng "cơ sờ") trước chữ đầu. Thẻ đầu câu không
    phải loại phát tiếng mà trước chữ đầu có tiếng > 0.15s -> cắt bỏ đoạn đó, mốc từ lùi theo."""
    m = re.match(r"\s*\[([^\]]+)\]", text)
    if not m or not words or m.group(1).strip().lower() in VOCAL_TAGS:
        return words
    va, _ = voiced_bounds(path)
    cut = words[0]["s"] - 0.05
    if words[0]["s"] - va <= 0.15 or cut <= 0:
        return words
    import subprocess, imageio_ffmpeg
    tmp = path + ".tmp.mp3"
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-ss", f"{cut:.3f}", "-i", path,
                    "-b:a", "128k", tmp], check=True)
    os.replace(tmp, path)
    print(f"   cắt {cut:.2f}s tiếng lọt của thẻ [{m.group(1)}]")
    return [{**w, "s": round(w["s"] - cut, 3), "e": round(w["e"] - cut, 3)} for w in words]


def speedup(path, k, words):
    """Tăng tốc hậu kỳ (ElevenLabs v3 bỏ qua tham số speed): atempo giữ cao độ, mốc từ co theo."""
    import subprocess, imageio_ffmpeg
    tmp = path + ".tmp.mp3"
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", path,
                    "-filter:a", f"atempo={k}", "-b:a", "128k", tmp], check=True)
    os.replace(tmp, path)
    return [{**w, "s": round(w["s"] / k, 3), "e": round(w["e"] / k, 3)} for w in words]


def voiced_bounds(path, thresh=0.015):
    """(đầu, cuối) của đoạn có tiếng trong file, theo năng lượng (bao cả tiếng cười, hơi thở)."""
    import av, numpy as np
    with av.open(path) as c:
        st = c.streams.audio[0]
        sr = st.rate or 44100
        x = np.concatenate([fr.to_ndarray().mean(axis=0) for fr in c.decode(st)]).astype(np.float64)
    hop = int(sr * 0.01)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode="same"))[::hop]
    on = np.where(rms > rms.max() * thresh)[0]
    return (on[0] * 0.01, on[-1] * 0.01) if len(on) else (0.0, len(x) / sr)


def duration(path):
    import av
    with av.open(path) as c:
        return float(c.duration) / 1e6 if c.duration else 0.0


# ---------------------------------------------------------------- provider: edge

async def _edge(text, v, out):
    import edge_tts
    c = edge_tts.Communicate(text, v.get("voice", "vi-VN-HoaiMyNeural"), rate=v.get("rate", "+0%"),
                             pitch=v.get("pitch", "+0Hz"), boundary="WordBoundary")
    audio = bytearray(); words = []
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            s = ch["offset"] / 1e7
            words.append({"w": ch["text"], "s": round(s, 3), "e": round(s + ch["duration"] / 1e7, 3)})
    open(out, "wb").write(audio)
    return words


def synth_edge(text, v, out):
    for attempt in range(4):              # edge hay rớt NoAudioReceived qua proxy -> thử lại
        try:
            return asyncio.run(_edge(text, v, out))
        except Exception as e:
            print(f"   edge lỗi ({type(e).__name__}), thử lại {attempt + 1}/3")
    raise SystemExit("edge-tts không trả âm thanh sau 4 lần")


# ---------------------------------------------------------------- provider: google

def synth_google(text, v, out):
    key = os.environ.get("GOOGLE_TTS_API_KEY")
    if not key:
        raise SystemExit("Thiếu GOOGLE_TTS_API_KEY trong .env")
    body = {"input": {"text": text},
            "voice": {"languageCode": v.get("lang", "vi-VN"), "name": v.get("voice", "vi-VN-Chirp3-HD-Achird")},
            "audioConfig": {"audioEncoding": "MP3", "speakingRate": float(v.get("rate", 1.0))}}
    req = urllib.request.Request(f"https://texttospeech.googleapis.com/v1/text:synthesize?key={key}",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    data = json.load(urllib.request.urlopen(req, timeout=60))
    open(out, "wb").write(base64.b64decode(data["audioContent"]))
    return estimate_words(out, text.split())


def estimate_words(path, toks):
    """Không có timestamp: tìm đoạn có tiếng (năng lượng), chia theo độ dài chữ + nghỉ ở dấu câu."""
    import av, numpy as np
    with av.open(path) as c:
        st = c.streams.audio[0]
        sr = st.rate or 24000
        pcm = np.concatenate([fr.to_ndarray().mean(axis=0) for fr in c.decode(st)])
    hop = int(sr * 0.01)
    rms = np.sqrt(np.convolve(pcm.astype(np.float64) ** 2, np.ones(hop) / hop, mode="same"))[::hop]
    on = np.where(rms > rms.max() * 0.06)[0]
    a, b = (on[0] * 0.01, on[-1] * 0.01) if len(on) else (0.0, len(pcm) / sr)
    wt = [len(w) + (3 if re.search(r"[,.!?:;…]$", w) else 0) for w in toks]
    tot = sum(wt) or 1
    out, acc = [], 0.0
    for w, x in zip(toks, wt):
        s = a + (b - a) * acc / tot; acc += x
        out.append({"w": w, "s": round(s, 3), "e": round(a + (b - a) * acc / tot, 3)})
    return out


# ---------------------------------------------------------------- provider: elevenlabs

def synth_elevenlabs(text, v, out):
    """ElevenLabs /with-timestamps: mốc từng ký tự -> gộp thành từ. Đọc từ tiếng Anh lẫn trong câu Việt tốt.
    v: {voice: <voice_id, dùng được cả giọng kho chung>, model: eleven_multilingual_v2 | eleven_v3, settings: {...}}"""
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("Thiếu ELEVENLABS_API_KEY trong .env")
    body = {"text": text, "model_id": v.get("model", "eleven_multilingual_v2")}
    if v.get("settings"):
        body["voice_settings"] = v["settings"]
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice']}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": key})
    data = json.load(urllib.request.urlopen(req, timeout=120))
    open(out, "wb").write(base64.b64decode(data["audio_base64"]))
    al = data.get("alignment") or {}
    words, cur, s0, e0 = [], "", None, None
    for ch, s, e in zip(al.get("characters", []), al.get("character_start_times_seconds", []),
                        al.get("character_end_times_seconds", [])):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "s": round(s0, 3), "e": round(e0, 3)})
            cur, s0 = "", None
            continue
        if s0 is None:
            s0 = s
        cur += ch; e0 = e
    if cur:
        words.append({"w": cur, "s": round(s0, 3), "e": round(e0, 3)})
    return words or estimate_words(out, text.split())


PROVIDERS = {"edge": synth_edge, "google": synth_google, "elevenlabs": synth_elevenlabs}


def fit_display(words, display):
    """Mốc từ TTS là chữ ĐÃ đổi cách đọc -> gán lại về chữ hiển thị (cùng số tiếng thì khớp 1-1)."""
    toks = display.split()
    if not words:
        return []
    if len(words) == len(toks):
        return [{**w, "w": t} for w, t in zip(words, toks)]
    a, b = words[0]["s"], words[-1]["e"]
    tot = sum(len(t) for t in toks) or 1
    out, acc = [], 0
    for t in toks:
        s = a + (b - a) * acc / tot; acc += len(t)
        out.append({"w": t, "s": round(s, 3), "e": round(a + (b - a) * acc / tot, 3)})
    return out


# ---------------------------------------------------------------- xếp câu nối câu

cache_path = os.path.join(VIDEOS, SLUG, ".duo-cache.json")
cache = {} if FORCE or not os.path.exists(cache_path) else json.load(open(cache_path, encoding="utf-8"))

t = DUO["introPad"]
lines = []
for i, L in enumerate(SCRIPT["lines"]):
    if "countdown" in L:
        sec = float(L["countdown"])
        lines.append({"kind": "countdown", "start": round(t, 3), "end": round(t + sec, 3)})
        t += sec + DUO["gap"]
        continue
    who = L["who"]
    member = CAST.get(who) or {}
    v = {**(member.get("voice") or {}), **(L.get("voice") or {})}
    prov = v.get("provider", "edge")
    # "pron": ["diem10code"] trong voice = chỉ phiên âm các từ này (vd ElevenLabs đọc SQL/NULL đúng sẵn)
    tags = prov == "elevenlabs" and "v3" in v.get("model", "")
    text = spoken(L["say"], v.get("pron"), tags)
    h = hashlib.sha1(json.dumps([prov, v, text], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:10]
    fn = f"duo-{h}.mp3"
    path = os.path.join(AUDIO_DIR, fn)
    if h in cache and os.path.exists(path):
        words, dur = cache[h]["words"], cache[h]["dur"]
    else:
        print(f"[{i:02d}] {who:<5} {prov}: {text}")
        words = PROVIDERS[prov](text, v, path)
        words = [w for w in words if not re.fullmatch(r"\[[^\]]*\][,.!?]*", w["w"])]   # thẻ cảm xúc không phải tiếng
        if tags:
            words = trim_leak(path, text, words)
        if float(v.get("tempo", 1)) != 1:
            words = speedup(path, float(v["tempo"]), words)
        dur = duration(path)
        cache[h] = {"words": words, "dur": dur}
    words = fit_display(words, re.sub(r"\[[^\]]*\]", "", L["say"]).strip())
    # mép câu = vùng CÓ TIẾNG thật trong file, không chỉ chữ đầu/chữ cuối: thẻ cảm xúc (cười, hít vào, thở dài)
    # kêu trước chữ đầu / sau chữ cuối, lấy theo chữ thì câu sau chồng lên tiếng cười câu trước
    va, vb = voiced_bounds(path)
    lead = min(words[0]["s"], va) if words else va          # im lặng đầu file: cho file vào sớm hơn
    speech_end = max(words[-1]["e"], vb) if words else vb
    audio_start = t - lead
    lines.append({
        "kind": "say", "who": who,
        "audio": f"audio/{SLUG}/{fn}",
        "audioStart": round(audio_start, 3),
        "start": round(t, 3),
        "end": round(audio_start + speech_end, 3),
        "words": [{"w": w["w"], "s": round(audio_start + w["s"], 3), "e": round(audio_start + w["e"], 3)} for w in words],
    })
    t = audio_start + speech_end + float(L.get("pause", DUO["gap"]))

total = round(t + DUO["outroPad"], 3)
json.dump(cache, open(cache_path, "w", encoding="utf-8"), ensure_ascii=False)
json.dump({"total": total, "lines": lines}, open(os.path.join(VIDEOS, SLUG, "duo.timing.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
n_say = sum(1 for x in lines if x["kind"] == "say")
syl = sum(len(x["words"]) for x in lines if x["kind"] == "say")
talk = sum(x["end"] - x["start"] for x in lines if x["kind"] == "say")
print(f"duo {SLUG}: {n_say} câu, {total:.1f}s, trung bình {total / max(1, len(lines)):.1f}s/lượt, "
      f"{syl / max(0.1, talk):.2f} tiếng/giây -> videos/{SLUG}/duo.timing.json")
