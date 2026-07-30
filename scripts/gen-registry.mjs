// Quét videos/<slug>/ tìm bundle hoàn chỉnh rồi (tái) sinh src/videos.gen.ts của DỰ ÁN TIÊU DÙNG.
// "Hoàn chỉnh" = có đủ scenes.json + beats.json + timings.json + outro.json.
// Tuỳ chọn: customs.tsx (map CUSTOMS) cho hình một-lần-dùng.
//
// Đây là file DÙNG CHUNG duy nhất của pipeline: mỗi slug tự lo thư mục của nó, chạy 1 lần
// trước khi render là xong — không ai phải sửa file chung.
//
// Chạy: npx blog2video registry [slug ...]   (không slug = mọi bundle hoàn chỉnh)
import {readdirSync, statSync, existsSync, writeFileSync, mkdirSync} from "node:fs";
import {join, relative} from "node:path";
import {pathToFileURL} from "node:url";
import {findProjectRoot, loadConfig, p} from "./lib/project.mjs";

const REQUIRED = ["scenes.json", "beats.json", "timings.json", "outro.json"];

export const genRegistry = (only = []) => {
  const cfg = loadConfig(findProjectRoot());
  const videosDir = p(cfg, "videos");
  const srcDir = p(cfg, "src");

  const slugs = readdirSync(videosDir)
    .filter((name) => {
      if (only.length && !only.includes(name)) return false;
      const dir = join(videosDir, name);
      if (!statSync(dir).isDirectory()) return false;
      const missing = REQUIRED.filter((f) => !existsSync(join(dir, f)));
      if (missing.length) {
        console.warn(`bỏ qua "${name}" — thiếu ${missing.join(", ")}`);
        return false;
      }
      return true;
    })
    .sort();

  const id = (slug) => slug.replace(/[^a-zA-Z0-9]/g, "_");
  const hasCustoms = (slug) => existsSync(join(videosDir, slug, "customs.tsx"));
  // đường dẫn tương đối từ src/ sang videos/ — hai thư mục này người dùng tự đặt chỗ
  const rel = relative(srcDir, videosDir).split("\\").join("/") || ".";

  const imports = slugs
    .map((slug) => {
      const v = id(slug);
      const lines = [
        `import scenes_${v} from "${rel}/${slug}/scenes.json";`,
        `import beats_${v} from "${rel}/${slug}/beats.json";`,
        `import timings_${v} from "${rel}/${slug}/timings.json";`,
        `import outroData_${v} from "${rel}/${slug}/outro.json";`,
      ];
      if (hasCustoms(slug)) lines.push(`import {CUSTOMS as customs_${v}} from "${rel}/${slug}/customs";`);
      return lines.join("\n");
    })
    .join("\n");

  const entries = slugs
    .map((slug) => {
      const v = id(slug);
      return `  {
    slug: "${slug}",
    scenes: scenes_${v} as Record<string, BeatData>,
    customs: ${hasCustoms(slug) ? `customs_${v}` : "{}"},
    beats: beats_${v} as Beat[],
    timings: timings_${v} as Record<string, Line[]>,
    outro: outroData_${v} as {audio: string; durationInFrames: number},
  },`;
    })
    .join("\n");

  const out = `// SINH TỰ ĐỘNG bởi blog2video — đừng sửa tay.
// Chạy lại: npx blog2video registry
import type {BeatData} from "blog2video/kit";
import type {Beat, Line, VideoEntry} from "blog2video/types";
${imports}

export type {Beat, Line, VideoEntry} from "blog2video/types";

export const VIDEOS: VideoEntry[] = [
${entries}
];
`;

  mkdirSync(srcDir, {recursive: true});
  writeFileSync(join(srcDir, "videos.gen.ts"), out, "utf-8");
  console.log(`đã ghi ${cfg.paths.src}/videos.gen.ts — ${slugs.length} video: ${slugs.join(", ") || "(rỗng)"}`);
  return slugs;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  genRegistry(process.argv.slice(2));
}
