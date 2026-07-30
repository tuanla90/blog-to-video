#!/usr/bin/env node
// CLI của engine. Chạy TRONG thư mục dự án tiêu dùng (nơi có video.config.json).
//
// Mọi lệnh đều tự tìm gốc dự án bằng cách leo lên tìm video.config.json, nên gọi từ
// thư mục con cũng được.
import {spawnSync} from "node:child_process";
import {existsSync, mkdirSync, readdirSync, copyFileSync, statSync, writeFileSync} from "node:fs";
import {dirname, join, relative} from "node:path";
import {fileURLToPath} from "node:url";
import {findProjectRoot, loadConfig, p as ppath} from "../scripts/lib/project.mjs";

const ENGINE = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPTS = join(ENGINE, "scripts");

const USAGE = `blog2video — dây chuyền bài viết -> video

  init                 dựng video.config.json + src/index.ts + thư mục videos/
  sync-assets          copy lottie của engine vào public/ (chạy trước lần render đầu)
  scaffold <slug>      chưa có voice: audio câm + timing ước lượng -> xem trước được ngay
  audio <slug>         TTS ElevenLabs -> mp3 + beats.json + timings.json
  align <slug>         căn caption theo năng lượng (chỉ cần khi audio không có timestamp)
  registry [slug...]   sinh src/videos.gen.ts từ các bundle hoàn chỉnh
  thumb [slug...]      sinh thumbnail 1280x720 từ thumb.json
  build [slug...]      chạy cả dây chuyền (audio -> registry -> render); nhận cờ của build.py
  studio               mở Remotion Studio
  edit [slug]          server sửa scenes.json cạnh Studio

Biến môi trường: CHROME (đường dẫn Chrome khi CDN Chromium bị chặn),
B2V_PYTHON (python có numpy+av cho align/scaffold).`;

const [cmd, ...rest] = process.argv.slice(2);

const python = () => {
  const root = findProjectRoot();
  const venv = process.env.B2V_PYTHON || join(root, ".venv-whisper", "Scripts", "python.exe");
  return existsSync(venv) ? venv : (process.platform === "win32" ? "python" : "python3");
};

const run = (file, args, opts = {}) => {
  const r = spawnSync(file, args, {stdio: "inherit", shell: process.platform === "win32", ...opts});
  process.exit(r.status ?? 1);
};

// PYTHONUTF8=1: console Windows mặc định cp1252, in tiếng Việt là UnicodeEncodeError
const runPy = (script, args) =>
  run(python(), [join(SCRIPTS, script), ...args], {env: {...process.env, PYTHONUTF8: "1"}});
const runNode = (script, args) => run(process.execPath, [join(SCRIPTS, script), ...args]);

// copy đệ quy, bỏ qua file đã tồn tại và mới hơn nguồn
const copyTree = (from, to) => {
  mkdirSync(to, {recursive: true});
  let n = 0;
  for (const name of readdirSync(from)) {
    const src = join(from, name), dst = join(to, name);
    if (statSync(src).isDirectory()) { n += copyTree(src, dst); continue; }
    if (existsSync(dst) && statSync(dst).mtimeMs >= statSync(src).mtimeMs) continue;
    copyFileSync(src, dst); n++;
  }
  return n;
};

switch (cmd) {
  case "sync-assets": {
    const cfg = loadConfig(findProjectRoot());
    const dest = join(ppath(cfg, "public"), "lottie");
    const n = copyTree(join(ENGINE, "assets", "lottie"), dest);
    console.log(`sync-assets: ${n} file -> ${relative(cfg.root, dest) || dest}`);
    break;
  }
  case "scaffold": runPy("scaffold.py", rest); break;
  case "audio":    runPy("gen_audio.py", rest); break;
  case "align":    runPy("align.py", rest); break;
  case "build":    runPy("build.py", rest); break;
  case "registry": runNode("gen-registry.mjs", rest); break;
  case "thumb":    runNode("gen-thumb.mjs", rest); break;
  case "edit":     runNode("edit-server.mjs", rest); break;
  case "studio": {
    const cfg = loadConfig(findProjectRoot());
    const entry = join(cfg.paths.src, "index.ts");
    run("npx", ["remotion", "studio", entry, ...rest], {cwd: cfg.root});
    break;
  }
  case "init": {
    const root = process.cwd();
    const cfgPath = join(root, "video.config.json");
    if (existsSync(cfgPath)) { console.error("Đã có video.config.json ở đây — không ghi đè."); process.exit(1); }
    copyFileSync(join(ENGINE, "templates", "video.config.json"), cfgPath);
    mkdirSync(join(root, "src"), {recursive: true});
    mkdirSync(join(root, "videos"), {recursive: true});
    const entry = join(root, "src", "index.ts");
    if (!existsSync(entry)) copyFileSync(join(ENGINE, "templates", "index.ts"), entry);
    const rc = join(root, "remotion.config.ts");
    if (!existsSync(rc)) copyFileSync(join(ENGINE, "templates", "remotion.config.ts"), rc);
    if (!existsSync(join(root, ".env"))) copyFileSync(join(ENGINE, ".env.example"), join(root, ".env.example"));
    writeFileSync(join(root, "videos", ".gitkeep"), "");
    console.log("init: đã tạo video.config.json, src/index.ts, remotion.config.ts, videos/\n" +
                "Sửa video.config.json (brand + categories) rồi chạy: npx blog2video sync-assets");
    break;
  }
  case undefined:
  case "-h":
  case "--help":
    console.log(USAGE);
    break;
  default:
    console.error(`Lệnh lạ: ${cmd}\n\n${USAGE}`);
    process.exit(1);
}
