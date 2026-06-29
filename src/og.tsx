// Ảnh Open Graph + logo cho website Semantix (render bằng Remotion still — tái dùng brand).
//   npx remotion still src/thumb.ts og-default ../public/og/default.png --browser-executable=<CHROME> --image-format=png
//   npx remotion still src/thumb.ts og-logo    ../public/og/logo.png    --browser-executable=<CHROME> --image-format=png
import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";
import {C, INTER} from "./ui";
import {BRAND} from "./brand";

// Nền aurora (option B) — khớp tông tím thumbnail mới.
const AURORA =
  "radial-gradient(52% 52% at 14% 18%, rgba(124,58,237,.42), transparent 60%)," +
  "radial-gradient(56% 56% at 86% 86%, rgba(173,70,255,.48), transparent 60%)," +
  "linear-gradient(135deg, #0E0A1A, #08070D)";

// Ảnh chia sẻ mạng xã hội 1200×630.
export const OgCard: React.FC = () => (
  <AbsoluteFill
    style={{
      background: AURORA, fontFamily: INTER, color: C.text,
      alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 96px",
    }}
  >
    <div style={{width: 168, height: 168, borderRadius: 36, overflow: "hidden",
      boxShadow: `0 0 64px ${BRAND.accent}aa`, marginBottom: 40}}>
      <Img src={staticFile("thumb/logo-LA.svg")} style={{width: "100%", height: "100%"}} />
    </div>
    <div style={{fontSize: 92, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1}}>Semantix</div>
    <div style={{fontSize: 38, fontWeight: 600, color: BRAND.bubble, marginTop: 22, maxWidth: 920, lineHeight: 1.3}}>
      Hỏi dữ liệu bằng tiếng Việt — nhận biểu đồ &amp; insight ngay
    </div>
    <div style={{position: "absolute", bottom: 48, fontSize: 27, fontWeight: 700, color: C.muted, letterSpacing: 1}}>
      semantix.vn
    </div>
  </AbsoluteFill>
);

// Logo vuông cho JSON-LD (Organization). logo-LA.svg đã có nền tím → hiện rõ trên mọi nền.
export const OgLogo: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile("thumb/logo-LA.svg")} style={{width: "100%", height: "100%"}} />
  </AbsoluteFill>
);
