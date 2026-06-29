import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {C, INTER} from "./ui";

type Word = {w: string; s: number; e: number};
type Line = {text: string; start: number; end: number; words: Word[]};

export const Caption: React.FC<{id: string; timings: Record<string, Line[]>}> = ({id, timings}) => {
  const {fps, width, height} = useVideoConfig();
  const f = useCurrentFrame();
  const t = f / fps;
  const vmin = Math.min(width, height) / 100;
  const lines = timings[id] || [];
  if (!lines.length) return null;

  // active line = last line that has started; it holds until the next begins.
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (t >= lines[i].start - 0.12) idx = i; else break;
  }
  if (idx < 0) return null;
  const line = lines[idx];
  if (t > line.end + 0.8) return null; // last line: fade out shortly after speech ends

  const portrait = height > width;
  // YouTube safe-zone: né thanh tiến trình/controls (landscape) & title/nút Shorts (portrait).
  const bottom = portrait ? 0.26 * height : 0.15 * height;
  const fontSize = (portrait ? 3.2 : 2.5) * vmin;

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div style={{position: "absolute", bottom, left: "50%", transform: "translateX(-50%)",
        maxWidth: "84%", textAlign: "center", lineHeight: 1.4,
        background: "rgba(10,10,10,0.55)", borderRadius: 1.6 * vmin,
        padding: `${1.2 * vmin}px ${2.2 * vmin}px`, border: `1px solid ${C.border}`}}>
        {line.words.map((wd, i) => {
          const on = t >= wd.s - 0.04 && t <= wd.e + 0.04;
          return (
            // fontWeight CỐ ĐỊNH để từ active không đổi độ rộng -> không reflow/nhảy dòng.
            // Nhấn bằng màu + glow (không ảnh hưởng layout).
            <span key={i} style={{fontFamily: INTER, fontWeight: 700,
              fontSize, color: on ? C.accent : C.text,
              textShadow: on ? `0 0 ${1.4 * vmin}px ${C.accent}aa` : "none",
              margin: "0 0.25em", display: "inline-block"}}>{wd.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
