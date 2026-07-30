// Biên dịch src/ -> dist/ (ESM) cho repo tiêu dùng import qua node_modules.
//
// Vì sao phải build chứ không export thẳng .tsx: bundler của Remotion KHÔNG transpile
// TypeScript/JSX nằm trong node_modules. Ship JS đã biên dịch thì consumer không phải
// vá webpack config.
//
// splitting: true là BẮT BUỘC — nhiều entry cùng import config.ts/ui.ts, không tách chunk
// chung thì mỗi entry giữ một bản CONFIG riêng, applyConfig() ở entry này không thấy ở entry kia.
import {build} from "esbuild";
import {rmSync, existsSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, "dist");

rmSync(DIST, {recursive: true, force: true});

await build({
  entryPoints: [
    join(ROOT, "src/kit.tsx"),
    join(ROOT, "src/Root.tsx"),
    join(ROOT, "src/ui.tsx"),
    join(ROOT, "src/Caption.tsx"),
    join(ROOT, "src/config.ts"),
    join(ROOT, "src/types.ts"),
  ],
  outdir: DIST,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  sourcemap: true,
  logLevel: "info",
  // peer/runtime deps: consumer cài, không nhét vào bundle (nếu nhét sẽ có 2 bản React)
  external: ["react", "react-dom", "react/jsx-runtime", "remotion", "@remotion/*", "lottie-web", "lucide-react"],
});

// .d.ts — lỗi type không chặn build JS (kit.tsx vốn strict:false).
// Gọi thẳng bin JS của typescript, KHÔNG qua .bin/tsc.cmd: execFileSync trên Windows
// không chạy được .cmd nếu không bật shell.
const tsc = join(ROOT, "node_modules", "typescript", "bin", "tsc");
if (existsSync(tsc)) {
  try {
    // rootDir src, không thì tsc suy ra gốc chung rồi đẻ ra dist/src/*.d.ts
    execFileSync(process.execPath, [tsc, "--emitDeclarationOnly", "--declaration", "--rootDir", "src", "--outDir", DIST], {cwd: ROOT, stdio: "inherit"});
  } catch {
    console.warn("build-lib: tsc báo lỗi type — dist/*.js vẫn dùng được, .d.ts có thể thiếu.");
  }
} else {
  console.warn("build-lib: chưa cài typescript — bỏ qua .d.ts");
}
console.log("build-lib: xong -> dist/");
