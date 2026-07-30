# Tìm gốc dự án tiêu dùng + nạp video.config.json / .env.
#
# Script python của engine nằm trong node_modules của người dùng, nên KHÔNG được suy gốc
# dự án từ __file__. Cách làm: leo từ cwd lên tìm video.config.json, rồi chdir vào đó —
# nhờ vậy mọi đường dẫn tương đối ("videos/...", "public/audio/...") trong các script cũ
# vẫn đúng y như khi chúng còn nằm trong repo.
import json
import os
import sys

CONFIG_FILE = "video.config.json"

DEFAULT_PATHS = {
    "videos": "videos",
    "out": "out",
    "public": "public",
    "src": "src",
    "thumbSrc": "thumb-src",
}


def find_project_root(start=None):
    d = os.path.abspath(start or os.getcwd())
    while True:
        if os.path.exists(os.path.join(d, CONFIG_FILE)):
            return d
        up = os.path.dirname(d)
        if up == d:
            sys.exit(
                f"Khong thay {CONFIG_FILE} tu '{start or os.getcwd()}' tro len.\n"
                f"Chay lenh trong thu muc du an video, hoac tao config: npx blog2video init"
            )
        d = up


def load_dotenv(root):
    """Nạp .env kiểu KEY=VALUE. KHÔNG ghi đè biến môi trường đã có."""
    path = os.path.join(root, ".env")
    if not os.path.exists(path):
        return
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def setup(chdir=True):
    """Gọi ở đầu mỗi script: trả về (root, config) và chdir vào gốc dự án."""
    root = find_project_root()
    cfg = json.load(open(os.path.join(root, CONFIG_FILE), encoding="utf-8"))
    cfg["paths"] = {**DEFAULT_PATHS, **cfg.get("paths", {})}
    cfg["root"] = root
    load_dotenv(root)
    if chdir:
        os.chdir(root)
    return root, cfg


ROOT, CONFIG = setup()
PATHS = CONFIG["paths"]
VIDEOS = PATHS["videos"]
PUBLIC = PATHS["public"]
OUT = PATHS["out"]
