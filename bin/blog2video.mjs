#!/usr/bin/env node
// CLI của engine. Chạy TRONG thư mục dự án tiêu dùng (nơi có video.config.json).
//
// Mọi lệnh đều tự tìm gốc dự án bằng cách leo lên tìm video.config.json, nên gọi từ
// thư mục con cũng được.
import {spawnSync} from "node:child_process";
import {existsSync, mkdirSync, readdirSync, copyFileSync, statSync, writeFileSync, readFileSync} from "node:fs";
import {basename, dirname, join, relative} from "node:path";
import {fileURLToPath} from "node:url";
import {findProjectRoot, loadConfig, p as ppath} from "../scripts/lib/project.mjs";

const ENGINE = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPTS = join(ENGINE, "scripts");

const USAGE = `blog2video — dây chuyền bài viết -> video

  init                 dựng package.json + video.config.json + src/index.ts + videos/
  sync-assets          copy lottie của engine vào public/ (chạy trước lần render đầu)
  scaffold <slug>      chưa có voice: audio câm + timing ước lượng -> xem trước được ngay
  audio <slug>         TTS ElevenLabs -> mp3 + beats.json + timings.json
  duo <slug> [--force] Short đối đáp: TTS từng câu theo giọng từng nhân vật -> duo.timing.json
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

const GITIGNORE = `node_modules/
out/
public/lottie/
public/audio/
src/videos.gen.ts
.env
.venv*/
__pycache__/
*.pyc
`;

// Dep cho dự án mới. blog2video trỏ vào đâu thì tuỳ engine này đang nằm ở đâu:
// có remote GitHub -> pin theo tag version; chưa push -> file: link tới thư mục engine.
const projectDeps = () => {
  const own = JSON.parse(readFileSync(join(ENGINE, "package.json"), "utf-8"));
  // chuỗi lệnh nguyên khối (không phải mảng args) để shell:true khỏi cảnh báo DEP0190
  const git = spawnSync("git config --get remote.origin.url", {cwd: ENGINE, encoding: "utf-8", shell: true});
  const url = (git.stdout || "").trim();
  const gh = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
  // chưa push GitHub -> file: đường dẫn TUYỆT ĐỐI (relative dễ vỡ khi khác ổ đĩa)
  const spec = gh ? `github:${gh[1]}#v${own.version}` : `file:${ENGINE.split("\\").join("/")}`;
  const pin = (name, fallback) => own.devDependencies?.[name] ?? fallback;
  return {
    dependencies: {
      "@remotion/cli": pin("@remotion/cli", "4.0.290"),
      blog2video: spec,
      react: pin("react", "19.0.0"),
      "react-dom": pin("react-dom", "19.0.0"),
      remotion: pin("remotion", "4.0.290"),
    },
    devDependencies: {
      "@types/react": pin("@types/react", "19.0.0"),
      typescript: pin("typescript", "5.6.3"),
    },
  };
};

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
    const pub = ppath(cfg, "public");
    // sfx đi cùng engine (scenes.json tham chiếu theo tên: {"el":"sfx","name":"whoosh"}),
    // nhạc nền thì KHÔNG — bed là lựa chọn của từng kênh, khai trong audio.bed.
    const jobs = [
      ["lottie", join(ENGINE, "assets", "lottie"), join(pub, "lottie")],
      ["sfx", join(ENGINE, "assets", "sfx"), join(pub, cfg.audio?.sfxDir ?? "audio/sfx")],
    ];
    for (const [name, from, to] of jobs) {
      if (!existsSync(from)) continue;
      console.log(`sync-assets: ${name} ${copyTree(from, to)} file -> ${relative(cfg.root, to) || to}`);
    }
    break;
  }
  case "scaffold": runPy("scaffold.py", rest); break;
  case "audio":    runPy("gen_audio.py", rest); break;
  case "align":    runPy("align.py", rest); break;
  case "duo":      runPy("gen_duo.py", rest); break;
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
    for (const f of ["remotion.config.ts", "tsconfig.json"]) {
      if (!existsSync(join(root, f))) copyFileSync(join(ENGINE, "templates", f), join(root, f));
    }
    if (!existsSync(join(root, ".env"))) copyFileSync(join(ENGINE, ".env.example"), join(root, ".env.example"));
    writeFileSync(join(root, ".gitignore"), GITIGNORE);
    // slug mẫu: có cái để scaffold + mở Studio ngay, chứng minh engine chạy đúng
    copyTree(join(ENGINE, "templates", "example"), join(root, "videos", "vi-du"));

    const pkgPath = join(root, "package.json");
    const deps = projectDeps();
    if (existsSync(pkgPath)) {
      console.log("init: đã có package.json — tự thêm giúp mấy dòng này vào dependencies:");
      console.log(JSON.stringify(deps.dependencies, null, 2));
    } else {
      writeFileSync(pkgPath, JSON.stringify({
        name: basename(root).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        version: "1.0.0",
        private: true,
        type: "module",
        scripts: {
          studio: "blog2video studio",
          scaffold: "blog2video scaffold",
          registry: "blog2video registry",
          audio: "blog2video audio",
          align: "blog2video align",
          thumb: "blog2video thumb",
          build: "blog2video build",
          edit: "blog2video edit",
          "sync-assets": "blog2video sync-assets",
        },
        ...deps,
      }, null, 2) + "\n");
    }

    console.log(`init: đã tạo package.json, video.config.json, src/index.ts, remotion.config.ts,
     .gitignore và slug mẫu videos/vi-du/

Tiếp theo:
  1. npm install
  2. npx blog2video sync-assets              # lottie + sfx vào public/
  3. npx blog2video scaffold vi-du           # audio câm + timing ước lượng
  4. npx blog2video studio                   # thấy video mẫu chạy -> engine ok
  5. sửa video.config.json (brand + categories), rồi viết slug của bạn`);
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
