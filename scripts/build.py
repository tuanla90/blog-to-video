# Batch driver: turn many videos/<slug>/ bundles into rendered mp4s, in parallel.
#
# Pipeline (per slug), with a single shared-file barrier:
#   [pool: --tts-conc]  python gen_audio.py <slug>   -> public/audio/<slug>/*.mp3, beats.json, outro.json
#   [pool: --cpu-conc]  python align.py    <slug>    -> timings.json
#   --------------------------- BARRIER ---------------------------
#   [once]              node scripts/gen-registry.mjs -> src/videos.gen.ts   (the ONLY shared file)
#   [pool: --render-conc] npx remotion render <slug>-Long / <slug>-Short -> out/
#
# Why phased pools instead of one per-slug pipeline: TTS (networked, rate-limited) wants low
# concurrency; align (CPU) and render (heavy) want their own caps. Stage boundaries double as
# the barrier so gen-registry sees every finished bundle exactly once.
#
# Usage (chạy trong dự án tiêu dùng — script tự leo lên tìm video.config.json):
#   npx blog2video build                         # mọi slug dựng được trong videos/
#   npx blog2video build slug-a slug-b
#   npx blog2video build --skip-audio            # dùng lại mp3/beats.json, chỉ align + render
#   npx blog2video build --no-render             # dừng ở timings.json (xem trước trong studio)
#   npx blog2video build --tts-conc 2 --render-conc 3
#
# Key ElevenLabs cho gen_audio.py lấy từ .env ở gốc dự án (xem .env.example của engine).
import argparse
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    sys.stdout.reconfigure(encoding="utf-8")        # console cp1252 không in được dấu tiếng Việt
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))   # scripts/ của engine
sys.path.insert(0, HERE)
from _project import ROOT, VIDEOS, OUT, CONFIG      # noqa: E402  (chdir vào gốc dự án, nạp .env)

VIDEOS_DIR = os.path.join(ROOT, VIDEOS)
SRC_ENTRY = os.path.join(CONFIG["paths"]["src"], "index.ts").replace("\\", "/")

# align.py cần numpy + av -> venv của DỰ ÁN. gen_audio.py chỉ dùng stdlib nhưng chạy chung
# một interpreter cho nhất quán. Không có venv thì dùng python đang chạy.
# Đổi bằng biến môi trường B2V_PYTHON nếu venv để chỗ khác.
VENV_PY = os.environ.get("B2V_PYTHON") or os.path.join(ROOT, ".venv-whisper", "Scripts", "python.exe")
PY = VENV_PY if os.path.exists(VENV_PY) else sys.executable

# Máy nào bị chặn CDN Chromium thì set CHROME trỏ Chrome cài sẵn (xem docs/PIPELINE.md).
CHROME = os.environ.get("CHROME", "")
NPX = "npx.cmd" if os.name == "nt" else "npx"
NODE = "node"


def discover_slugs():
    """Every subdir of videos/ that has a content.py (the minimum to build from)."""
    out = []
    for name in sorted(os.listdir(VIDEOS_DIR)):
        d = os.path.join(VIDEOS_DIR, name)
        if os.path.isdir(d) and os.path.exists(os.path.join(d, "content.py")):
            out.append(name)
    return out


def run(cmd, label):
    """Run a subprocess from ROOT, streaming nothing but capturing for tidy logs."""
    print(f"  -> {label}: {' '.join(cmd)}", flush=True)
    p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    if p.returncode != 0:
        tail = (p.stdout or "")[-800:] + (p.stderr or "")[-800:]
        print(f"  !! {label} FAILED (exit {p.returncode})\n{tail}", flush=True)
        raise RuntimeError(f"{label} failed")
    return p.stdout


def pooled(fn, slugs, workers, stage):
    """Run fn(slug) across a bounded pool; raise if any slug fails."""
    print(f"\n=== {stage} ({len(slugs)} slug, {workers} song song) ===", flush=True)
    errors = []
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(fn, s): s for s in slugs}
        for f in as_completed(futs):
            s = futs[f]
            try:
                f.result()
                print(f"  [ok] {s}", flush=True)
            except Exception as e:
                errors.append((s, e))
    if errors:
        names = ", ".join(s for s, _ in errors)
        raise SystemExit(f"{stage} failed for: {names}")


def stage_audio(slug):
    run([PY, os.path.join(HERE, "gen_audio.py"), slug], f"audio:{slug}")


def stage_align(slug):
    run([PY, os.path.join(HERE, "align.py"), slug], f"align:{slug}")


def stage_render(slug):
    # one folder per video: out/<slug>/{long,short}.mp4
    os.makedirs(os.path.join(ROOT, OUT, slug), exist_ok=True)
    common = ["--browser-executable=" + CHROME] if CHROME else []
    run([NPX, "remotion", "render", SRC_ENTRY, f"{slug}-Long",
         f"{OUT}/{slug}/long.mp4", *common], f"render-long:{slug}")
    run([NPX, "remotion", "render", SRC_ENTRY, f"{slug}-Short",
         f"{OUT}/{slug}/short.mp4", *common], f"render-short:{slug}")


def main():
    ap = argparse.ArgumentParser(description="Batch-build videos in parallel.")
    ap.add_argument("slugs", nargs="*", help="slugs to build (default: all in videos/)")
    ap.add_argument("--skip-audio", action="store_true",
                    help="reuse existing mp3/beats.json/timings.json; skip ElevenLabs TTS")
    ap.add_argument("--align", action="store_true",
                    help="ép chạy align.py (chỉ khi audio KHÔNG có timestamp; ElevenLabs đã có sẵn)")
    ap.add_argument("--no-render", action="store_true",
                    help="stop after timings.json (preview in studio instead)")
    ap.add_argument("--tts-conc", type=int, default=2,
                    help="concurrent Vbee TTS jobs (keep low; default 2)")
    ap.add_argument("--cpu-conc", type=int, default=4,
                    help="concurrent align jobs (default 4)")
    ap.add_argument("--render-conc", type=int, default=2,
                    help="concurrent renders; each render is multi-core (default 2)")
    args = ap.parse_args()

    slugs = args.slugs or discover_slugs()   # .env đã nạp lúc import _project
    if not slugs:
        raise SystemExit("no slugs found in videos/ (need a content.py)")
    missing = [s for s in slugs if not os.path.isdir(os.path.join(VIDEOS_DIR, s))]
    if missing:
        raise SystemExit("unknown slug(s): " + ", ".join(missing))
    print(f"slugs: {', '.join(slugs)}\npython: {PY}", flush=True)

    if not args.skip_audio:
        pooled(stage_audio, slugs, args.tts_conc, "AUDIO (Vbee TTS)")
    else:
        print("\n=== AUDIO skipped (--skip-audio) ===", flush=True)

    if args.align:
        pooled(stage_align, slugs, args.cpu_conc, "ALIGN (caption timing, energy-based)")
    else:
        print("\n=== ALIGN bỏ qua (timings.json đã có sẵn từ ElevenLabs gen_audio) ===", flush=True)

    # BARRIER: every bundle is complete -> regenerate the one shared registry, once.
    print("\n=== REGISTRY (gen-registry.mjs, 1 lan) ===", flush=True)
    print(run([NODE, os.path.join(HERE, "gen-registry.mjs")], "registry").strip(), flush=True)

    if args.no_render:
        print("\nDone (no render). Preview: npm run studio", flush=True)
        return

    pooled(stage_render, slugs, args.render_conc, "RENDER (Remotion)")
    print(f"\nAll done -> out/  ({len(slugs)} video x [long, short])", flush=True)


if __name__ == "__main__":
    main()
