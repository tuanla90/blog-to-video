import type React from "react";
import type {BeatData} from "./kit";

/** 1 beat đã có audio: sinh bởi gen_audio.py (hoặc scaffold.py khi chưa có voice) */
export type Beat = {id: string; audio: string; durationInFrames: number; durationSec?: number};

/** 1 từ trong caption, mốc thời gian tính bằng giây kể từ đầu beat */
export type Word = {w: string; s: number; e: number};

/** 1 dòng caption + các từ của nó — sinh bởi align.py */
export type Line = {text: string; start: number; end: number; words: Word[]};

/** 1 Short đối đáp trong registry: kịch bản duo.json + mốc giờ duo.timing.json (gen_duo.py sinh) */
export type DuoEntry = {slug: string; script: any; timing: any};

/** 1 video hoàn chỉnh trong registry (src/videos.gen.ts sinh ra mảng này) */
export type VideoEntry = {
  slug: string;
  scenes: Record<string, BeatData>;
  customs: Record<string, React.FC>;
  beats: Beat[];
  timings: Record<string, Line[]>;
  outro: {audio: string; durationInFrames: number};
};
