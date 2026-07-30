// Tìm gốc dự án tiêu dùng + đọc video.config.json.
// Mọi script node của engine đi qua đây, KHÔNG suy gốc từ vị trí file script
// (script nằm trong node_modules của người ta, không phải trong dự án của người ta).
import {existsSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";

export const CONFIG_FILE = "video.config.json";

/** Leo từ `start` lên tới ổ đĩa, tìm thư mục có video.config.json. */
export const findProjectRoot = (start = process.cwd()) => {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, CONFIG_FILE))) return dir;
    const up = dirname(dir);
    if (up === dir) {
      throw new Error(
        `Không thấy ${CONFIG_FILE} từ "${start}" trở lên.\n` +
        `Chạy lệnh trong thư mục dự án video, hoặc tạo config bằng: npx blog2video init`
      );
    }
    dir = up;
  }
};

const DEFAULTS = {
  paths: {videos: "videos", out: "out", public: "public", src: "src", thumbSrc: "thumb-src"},
  categories: [],
};

export const loadConfig = (root = findProjectRoot()) => {
  const raw = JSON.parse(readFileSync(join(root, CONFIG_FILE), "utf-8"));
  return {
    ...DEFAULTS,
    ...raw,
    paths: {...DEFAULTS.paths, ...(raw.paths ?? {})},
    root,
  };
};

/** đường dẫn tuyệt đối tới một thư mục đã khai trong paths */
export const p = (cfg, key, ...rest) => join(cfg.root, cfg.paths[key], ...rest);
