// One-off bespoke visuals for this video only, referenced from scenes.json via
// { el: "custom", name: "<key>" }. Most videos won't need this file at all.
import React from "react";
import {useCurrentFrame, interpolate} from "remotion";
import {C, useVmin} from "../../src/ui";

// Beat 01 — three translucent slices rotating in 3D (the "Rubik data cube" metaphor).
const SlicesCube: React.FC = () => {
  const v = useVmin();
  const f = useCurrentFrame();
  const ry = interpolate(f, [0, 200], [-22, 22]);
  const cols = [C.accent, C.good, C.warn];
  return (
    <div style={{perspective: 800, height: 34 * v, display: "flex", alignItems: "center"}}>
      <div style={{transformStyle: "preserve-3d", transform: `rotateX(-18deg) rotateY(${ry}deg)`}}>
        {cols.map((c, i) => (
          <div key={i} style={{position: "absolute", width: 22 * v, height: 22 * v, left: -11 * v, top: -11 * v,
            background: `${c}22`, border: `2px solid ${c}`, borderRadius: 2 * v,
            transform: `translateZ(${(i - 1) * 6 * v}px)`, boxShadow: `0 0 ${4 * v}px ${c}55`}} />
        ))}
      </div>
    </div>
  );
};

export const CUSTOMS: Record<string, React.FC> = {"slices-cube": SlicesCube};
