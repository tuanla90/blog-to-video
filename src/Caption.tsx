import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {C, INTER} from "./ui";
import timings from "./timings.json";

type Word = {w: string; s: number; e: number};
type Line = {text: string; start: number; end: number; words: Word[]};

export const Caption: React.FC<{id: string}> = ({id}) => {
  const {fps, width, height} = useVideoConfig();
  const f = useCurrentFrame();
  const t = f / fps;
  const vmin = Math.min(width, height) / 100;
  const lines = (timings as Record<string, Line[]>)[id] || [];
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
  const bottom = portrait ? 0.2 * height : 0.11 * height;
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
            <span key={i} style={{fontFamily: INTER, fontWeight: on ? 800 : 600,
              fontSize, color: on ? C.accent : C.text,
              textShadow: on ? `0 0 ${1.4 * vmin}px ${C.accent}aa` : "none",
              margin: "0 0.25em", display: "inline-block"}}>{wd.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
