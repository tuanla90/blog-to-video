// Thumbnail template (1280x720) — data-driven. One thumb.json per video.
// Standard (see ../BRAND.md): category badge top-LEFT · brand pill (logo+name on purple)
// top-RIGHT · curiosity hook LEFT-aligned (paradox + open question) · presenter flipped,
// LARGE (face is the #1 click driver), bottom-RIGHT with purple rim-light. ≤7 words; one
// giant focal number.
import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";
import {C, INTER, Bg} from "./ui";
import {BRAND} from "./brand";

const PURPLE = BRAND.accent; // tím chuẩn = màu logo LA (single source: brand.ts)

export type ThumbData = {
  category: string;                       // topic badge
  kicker: string;                         // small setup line
  bigNum: string;                         // the one giant focal number (red)
  label: string;                          // text beside the number ("\n" = line break)
  question: {pre: string; em: string};    // open question; `em` rendered red
  person: string;                         // staticFile path to the cut-out presenter
};

export const Thumbnail: React.FC<{d: ThumbData; width: number; height: number}> = ({d, width, height}) => {
  const v = Math.min(width, height) / 100;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: INTER, color: C.text}}>
      {/* Aurora kép (option B) — glow violet góc trên-trái + tím-magenta góc phải làm nổi chủ đề */}
      <Bg base="radial-gradient(52% 52% at 14% 18%, rgba(124,58,237,.42), transparent 60%), radial-gradient(56% 56% at 86% 86%, rgba(173,70,255,.48), transparent 60%), linear-gradient(135deg, #0E0A1A, #08070D)" />
      {/* spotlight behind the (large) presenter */}
      <div style={{position: "absolute", right: -8 * v, bottom: -10 * v, width: 62 * v, height: 80 * v,
        background: `radial-gradient(circle at 50% 42%, ${C.accent}45, transparent 62%)`}} />
      {/* presenter: LARGE, bottom-right, flipped to face in, purple rim-light (elbows may crop) */}
      <Img src={staticFile(d.person)} style={{position: "absolute", right: 1 * v, bottom: 0, height: 54 * v,
        width: "auto", transform: "scaleX(-1)",
        filter: `contrast(1.06) saturate(1.06) brightness(1.02) drop-shadow(0 0 ${1 * v}px ${C.accent}) drop-shadow(0 0 ${3 * v}px ${C.accent}cc)`}} />

      {/* category badge, top-left (bigger for mobile legibility) */}
      <div style={{position: "absolute", left: 5 * v, top: 4.5 * v, border: `2px solid ${C.accent}`,
        color: C.accent, borderRadius: 100, padding: `${1 * v}px ${2.4 * v}px`, fontSize: 2.3 * v,
        fontWeight: 800, letterSpacing: 1, background: `linear-gradient(${C.accent}26, ${C.accent}0c)`}}>{d.category}</div>

      {/* brand pill, top-right — bigger + nudged off the edge (avoid YouTube overlay icons) */}
      <div style={{position: "absolute", right: 4.5 * v, top: 4.5 * v, display: "flex", alignItems: "center",
        gap: 1.6 * v, background: PURPLE, borderRadius: 2 * v, padding: `${1.3 * v}px ${2.6 * v}px`}}>
        <Img src={staticFile("thumb/logo-white.png")} style={{height: 4.4 * v, width: "auto"}} />
        <span style={{fontWeight: 800, fontSize: 2.9 * v, color: "#fff"}}>{BRAND.name}</span>
      </div>

      {/* hook — LEFT-aligned, shifted left to balance the large presenter on the right */}
      <div style={{position: "absolute", left: 5 * v, right: 40 * v, top: 0, bottom: 0, display: "flex",
        flexDirection: "column", justifyContent: "center", alignItems: "flex-start", textAlign: "left", gap: 2 * v}}>
        <div style={{fontSize: 5 * v, fontWeight: 700, color: C.muted}}>{d.kicker}</div>
        <div style={{display: "flex", alignItems: "flex-end", gap: 1.8 * v}}>
          <span style={{fontSize: 20 * v, fontWeight: 900, color: C.bad, lineHeight: 0.8, letterSpacing: "-0.04em"}}>{d.bigNum}</span>
          <span style={{fontSize: 10 * v, fontWeight: 900, lineHeight: 1, paddingBottom: 1 * v}}>
            {d.label.split("\n").flatMap((p, i) => (i === 0 ? [p] : [<br key={i} />, p]))}
          </span>
        </div>
        <div style={{fontSize: 8.5 * v, fontWeight: 900, letterSpacing: "-0.02em"}}>{d.question.pre}<span style={{color: C.bad}}>{d.question.em}</span></div>
      </div>
    </AbsoluteFill>
  );
};
