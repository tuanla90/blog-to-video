// Cảnh ảnh tràn khung — chụp bằng "máy quay" ảo trên ảnh tĩnh, không phải layout chữ.
//
//   world    : ảnh nhiều lớp + camera pan/zoom (Ken Burns) + parallax theo độ sâu + lắc lư (sway)
//   specimen : một ảnh mẫu vật, camera lần lượt đẩy vào từng điểm, đường chỉ + thẻ nhãn
//   clip     : một đoạn VIDEO — cắt đoạn theo giây, chỉnh tốc độ, vẫn lia/phóng được như world
//
// Toạ độ luôn là toạ độ TRÊN ẢNH (0..1, gốc trên-trái), không phải toạ độ màn hình — nên một
// scenes.json dùng được cho cả 16:9 lẫn 9:16: engine tự tính khung cắt (cover) cho từng tỉ lệ.
// Hai element này chiếm cả khung: moment chứa chúng chỉ crossfade, không trượt/blur như moment chữ.
import React from "react";
import {AbsoluteFill, Img, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, Easing, random} from "remotion";
import {C, INTER, MONO} from "./ui";
import {CONFIG} from "./config";

type Win = [number, number];
type Cam = {x: number; y: number; zoom: number};

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const src = (s: string) => (/^(https?:|data:)/.test(s) ? s : staticFile(s));
const cam = (c: Partial<Cam> | undefined, d: Cam): Cam => ({x: c?.x ?? d.x, y: c?.y ?? d.y, zoom: c?.zoom ?? d.zoom});
const EASE: Record<string, (t: number) => number> = {
  linear: (t) => t, in: Easing.in(Easing.cubic), out: Easing.out(Easing.cubic), inOut: Easing.inOut(Easing.sin),
};
// zoom nội suy theo log -> tốc độ phóng đều mắt (1→2 và 2→4 cảm giác như nhau)
const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t,
  zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t),
});

export const FULL_BLEED = new Set(["world", "specimen", "clip"]);

// Đặt ảnh (tỉ lệ `aspect` = rộng/cao) phủ kín khung W×H ở mức zoom cho trước, sao cho điểm ảnh
// (cam.x, cam.y) rơi vào điểm màn hình `target` (0..1). keep=true: không để lộ mép ảnh.
// fit "contain": zoom 1 = thấy trọn ảnh (dùng cho mẫu vật trên khung dọc), keep bị bỏ qua.
const place = (W: number, H: number, aspect: number, c: Cam, target: [number, number] = [0.5, 0.5], keep = true,
  fit: "cover" | "contain" = "cover") => {
  const wide = W / H > aspect;
  const baseW = fit === "contain" ? (wide ? H * aspect : W) : wide ? W : H * aspect;
  if (fit === "contain") keep = false;
  const w = baseW * c.zoom, h = (baseW / aspect) * c.zoom;
  let left = target[0] * W - c.x * w, top = target[1] * H - c.y * h;
  if (keep) {
    left = Math.min(0, Math.max(W - w, left));
    top = Math.min(0, Math.max(H - h, top));
  }
  return {left, top, w, h};
};

// ---- neo theo lời đọc: tìm từ khoá tuần tự trong timings (giống useAnchoredSteps của kit) ----
const wordFrames = (keys: (string | undefined)[], lines: any[] | undefined, fps: number) => {
  const words = (lines || []).flatMap((L: any) => L.words || []);
  const lead = Math.round(CONFIG.pacing.leadIn * fps);
  let cur = 0;
  return keys.map((k) => {
    if (!k || !words.length) return null;
    const key = k.toLowerCase();
    for (let i = cur; i < words.length; i++) {
      if (String(words[i].w).toLowerCase().includes(key)) { cur = i + 1; return lead + Math.round(words[i].s * fps); }
    }
    return null;
  });
};

// chia [from,to] cho các đoạn theo trọng số; đoạn có neo (frame tuyệt đối) bắt đầu đúng neo.
const segments = (win: Win, items: {w: number; at: number | null}[]): Win[] => {
  const [from, to] = win;
  const starts = new Array(items.length).fill(from);
  const anchor = items.map((it, i) => (i === 0 ? from : it.at));
  let i = 0;
  while (i < items.length) {
    let j = i + 1;
    while (j < items.length && anchor[j] == null) j++;
    const a = Math.max(anchor[i] as number, i ? starts[i - 1] + 1 : from);
    const b = Math.min(to, Math.max(j < items.length ? (anchor[j] as number) : to, a + (j - i)));
    const tot = items.slice(i, j).reduce((s, it) => s + it.w, 0) || 1;
    let acc = 0;
    for (let k = i; k < j; k++) { starts[k] = a + Math.round(((b - a) * acc) / tot); acc += items[k].w; }
    i = j;
  }
  return starts.map((s, k) => [s, k + 1 < items.length ? starts[k + 1] : to] as Win);
};

// ---- hạt môi trường: tuyết / bụi / tàn lửa — deterministic (random của Remotion) ----
const Particles: React.FC<{kind: string; n?: number; v: number}> = ({kind, n = 70, v}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const P: Record<string, {fall: number; drift: number; size: number; color: string; blur: number; op: number}> = {
    snow: {fall: 1.1, drift: 0.25, size: 0.55, color: "#F2F6FF", blur: 0.12, op: 0.85},
    dust: {fall: -0.12, drift: 0.35, size: 0.28, color: "#FFE9C4", blur: 0.08, op: 0.5},
    embers: {fall: -0.9, drift: 0.5, size: 0.3, color: "#FFB35C", blur: 0.05, op: 0.9},
  };
  const p = P[kind] || P.dust;
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: string) => random(`${kind}${k}${i}`);
        const depth = 0.4 + r("d") * 0.9;                       // xa thì nhỏ, chậm, mờ
        const sz = p.size * v * depth;
        const y0 = r("y") * (H + 40);
        const y = (((y0 + f * p.fall * depth * 3) % (H + 40)) + H + 40) % (H + 40) - 20;
        const x = r("x") * W + Math.sin(f / (50 + r("p") * 40) + i) * p.drift * v * 4;
        const tw = kind === "embers" ? 0.5 + 0.5 * Math.sin(f / 6 + i) : 1;
        return <div key={i} style={{position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%",
          background: p.color, opacity: p.op * depth * tw, filter: `blur(${p.blur * v * (1.4 - depth)}px)`,
          boxShadow: kind === "embers" ? `0 0 ${sz * 2}px ${p.color}` : "none"}} />;
      })}
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{amt: number}> = ({amt}) =>
  amt > 0 ? <AbsoluteFill style={{pointerEvents: "none",
    background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,${amt}) 100%)`}} /> : null;

// =====================================================================================
// world — { el:"world", aspect, layers:[{src, depth, sway, keep}], camera:{from,to,ease},
//           portrait:{camera}, fx:"snow"|"dust"|"embers", vignette }
// =====================================================================================
export const ElWorld: React.FC<{p: any; win: Win; v: number}> = ({p, win, v}) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const portrait = H > W;
  const camCfg = (portrait && p.portrait?.camera) || p.camera || {};
  const a = cam(camCfg.from, {x: 0.5, y: 0.5, zoom: 1});
  const b = cam(camCfg.to, a);
  const t = (EASE[camCfg.ease ?? "inOut"] || EASE.inOut)(interpolate(f, win, [0, 1], clamp));
  const c = lerpCam(a, b, t);
  const aspect = p.aspect ?? 16 / 9;
  const layers: any[] = p.layers || (p.src ? [{src: p.src}] : []);
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#000"}}>
      {layers.map((L, i) => {
        // parallax: lớp sâu (depth<1) trôi & phóng ít hơn camera, lớp gần (depth>1) nhiều hơn.
        // Mỗi lớp được phóng dư (overscan theo depth) để có chỗ trôi mà vẫn không lộ mép ảnh.
        const d = L.depth ?? 1;
        const lc: Cam = {x: 0.5 + (c.x - 0.5) * d, y: 0.5 + (c.y - 0.5) * d,
          zoom: (L.scale ?? 1 + 0.1 * d) * (1 + (c.zoom - 1) * d)};
        const r = place(W, H, L.aspect ?? aspect, lc, [0.5, 0.5], L.keep ?? true);
        const s = L.sway;
        const sw = s ? Math.sin(((f / fps) * 2 * Math.PI) / (s.period ?? 4) + (s.phase ?? i)) : 0;
        const rot = s ? sw * (s.amp ?? 0.8) : 0;
        const bob = s ? Math.cos(((f / fps) * 2 * Math.PI) / (s.period ?? 4) + (s.phase ?? i)) * (s.bob ?? 0) * v : 0;
        return (
          <div key={i} style={{position: "absolute", left: r.left, top: r.top + bob, width: r.w, height: r.h,
            transform: rot ? `rotate(${rot}deg)` : undefined, transformOrigin: s?.origin ?? "50% 100%",
            opacity: L.opacity ?? 1, filter: L.blur ? `blur(${L.blur * v}px)` : undefined}}>
            <Img src={src(L.src)} style={{width: "100%", height: "100%", display: "block"}} />
          </div>
        );
      })}
      {p.fx ? <Particles kind={p.fx} n={p.fxCount} v={v} /> : null}
      <Vignette amt={p.vignette ?? 0.35} />
    </AbsoluteFill>
  );
};

// =====================================================================================
// clip — { el:"clip", src, from, to, speed, loop, aspect, camera:{from,to,ease}, portrait, fx, vignette }
//   from/to : giây TRONG FILE GỐC (cắt đoạn). speed: 1 = nguyên bản, 0.8 = chậm lại (mượt hơn,
//             hợp khi nguồn 24 hình/giây mà timeline 30). Tiếng luôn tắt — nhạc/tiếng trộn riêng.
//   Khung hình canh giống world (toạ độ trên ẢNH 0..1) nên vẫn lia/phóng nhẹ được trên video.
// =====================================================================================
export const ElClip: React.FC<{p: any; win: Win; v: number}> = ({p, win, v}) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const portrait = H > W;
  const camCfg = (portrait && p.portrait?.camera) || p.camera || {};
  const a = cam(camCfg.from, {x: 0.5, y: 0.5, zoom: 1});
  const b = cam(camCfg.to, a);
  const t = (EASE[camCfg.ease ?? "inOut"] || EASE.inOut)(interpolate(f, win, [0, 1], clamp));
  const c = lerpCam(a, b, t);
  const r = place(W, H, p.aspect ?? 16 / 9, c, [0.5, 0.5], p.keep ?? true);
  const speed = p.speed ?? 1;
  // from/to là giây trong file gốc; startFrom/endAt đếm bằng frame ở fps của composition
  // (Remotion 4.0.290 chưa có trimBefore/trimAfter).
  const startFrom = p.from != null ? Math.round(p.from * fps) : undefined;
  const endAt = p.to != null ? Math.round(p.to * fps) : undefined;
  // đoạn ngắn hơn moment thì phát lại từ đầu (OffthreadVideo không có prop loop -> dùng <Loop>)
  const segFrames = p.from != null && p.to != null ? Math.round(((p.to - p.from) * fps) / speed) : null;
  const video = (
    <div style={{position: "absolute", left: r.left, top: r.top, width: r.w, height: r.h}}>
      <OffthreadVideo src={src(p.src)} muted playbackRate={speed}
        startFrom={startFrom} endAt={endAt}
        style={{width: "100%", height: "100%", objectFit: "cover", display: "block"}} />
    </div>
  );
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#000"}}>
      <Sequence from={win[0]} layout="none">
        {segFrames && p.loop !== false ? <Loop durationInFrames={segFrames} layout="none">{video}</Loop> : video}
      </Sequence>
      {p.fx ? <Particles kind={p.fx} n={p.fxCount} v={v} /> : null}
      <Vignette amt={p.vignette ?? 0.3} />
    </AbsoluteFill>
  );
};

// =====================================================================================
// specimen — { el:"specimen", src, aspect, overview:{x,y,zoom}, introW, outroW, outro:"overview"|"hold",
//              callouts:[{x, y, zoom, label, sub, tag, color, w, atWord, atSec, side}] }
// =====================================================================================
const colOf = (k?: string) => ({accent: C.accent, good: C.good, warn: C.warn, bad: C.bad, purple: C.purple,
  muted: C.muted, text: C.text} as Record<string, string>)[k || ""] || k || C.accent;

export const ElSpecimen: React.FC<{p: any; win: Win; v: number; lines?: any[]}> = ({p, win, v, lines}) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const portrait = H > W;
  const aspect = p.aspect ?? 16 / 9;
  const calls: any[] = p.callouts || [];
  const home = cam(p.overview, {x: 0.5, y: 0.5, zoom: 1});
  const withOutro = (p.outro ?? "overview") === "overview";

  // đoạn: [tổng thể] + mỗi callout một đoạn + [tổng thể cuối]
  const anchors = wordFrames(calls.map((c) => c.atWord), lines, fps)
    .map((fr, i) => (typeof calls[i].atSec === "number" ? Math.round(calls[i].atSec * fps) : fr));
  const items = [{w: p.introW ?? 0.8, at: null}, ...calls.map((c, i) => ({w: c.w ?? 1, at: anchors[i]})),
    ...(withOutro ? [{w: p.outroW ?? 0.8, at: null}] : [])];
  const seg = segments(win, items);
  let k = seg.findIndex(([a, b]) => f >= a && f < b);
  if (k < 0) k = f < seg[0][0] ? 0 : seg.length - 1;
  const ci = k - 1;                                          // callout đang mở (-1 = tổng thể)
  const active = ci >= 0 && ci < calls.length ? calls[ci] : null;

  // khung đặt điểm: 16:9 chừa bên phải cho thẻ (side:"left" thì lật); 9:16 chừa phía trên
  const sideOf = (c: any) => c.side ?? (c.x > 0.62 ? "left" : "right");
  const target = (c: any): [number, number] => (portrait ? [0.5, 0.58] : sideOf(c) === "left" ? [0.64, 0.5] : [0.36, 0.5]);
  const camFor = (i: number): {c: Cam; tg: [number, number]} => {
    const cc = i - 1 >= 0 && i - 1 < calls.length ? calls[i - 1] : null;
    return cc ? {c: {x: cc.x, y: cc.y, zoom: cc.zoom ?? 2.2}, tg: target(cc)} : {c: home, tg: [0.5, 0.5]};
  };
  const [sa, sb] = seg[k];
  const T = Math.max(1, Math.min(26, Math.round((sb - sa) * 0.4)));
  const mv = Easing.inOut(Easing.cubic)(interpolate(f, [sa, sa + T], [0, 1], clamp));
  const prev = camFor(Math.max(0, k - 1)), cur = camFor(k);
  const drift = 1 + 0.03 * interpolate(f, [sa, sb], [0, 1], clamp);    // đẩy rất chậm khi giữ — hình không chết
  const c0 = lerpCam(k === 0 ? cur.c : prev.c, cur.c, k === 0 ? 1 : mv);
  const c: Cam = {...c0, zoom: c0.zoom * drift};
  const tg: [number, number] = [prev.tg[0] + (cur.tg[0] - prev.tg[0]) * mv, prev.tg[1] + (cur.tg[1] - prev.tg[1]) * mv];
  // khung dọc mà ảnh ngang: mặc định contain + nền là chính ảnh ấy phủ kín, làm mờ
  const fit: "cover" | "contain" = p.fit ?? (portrait && aspect > 1 ? "contain" : "cover");
  const r = place(W, H, aspect, c, tg, true, fit);
  const scr = (x: number, y: number) => [r.left + x * r.w, r.top + y * r.h];

  // thẻ nhãn + đường chỉ cho callout đang mở, hiện SAU khi camera tới nơi
  const appear = interpolate(f, [sa + T * 0.7, sa + T * 0.7 + 12], [0, 1], clamp);
  const leave = interpolate(f, [sb - 8, sb], [1, 0], clamp);
  const show = appear * leave;
  let overlay: React.ReactNode = null;
  if (active) {
    const color = colOf(active.color);
    const [px, py] = scr(active.x, active.y);
    const left = sideOf(active) === "left";
    const cardW = (portrait ? 70 : 38) * v;
    const cx = portrait ? (W - cardW) / 2 : left ? W * 0.06 : W * 0.6;
    const cy = portrait ? H * 0.1 : H * 0.34;
    const ax = portrait ? W / 2 : left ? cx + cardW : cx;            // điểm neo đường chỉ trên thẻ
    const ay = portrait ? cy + 16 * v : cy + 5 * v;
    const draw = interpolate(f, [sa + T * 0.7, sa + T * 0.7 + 14], [0, 1], clamp);
    const pulse = 1 + 0.18 * Math.sin((f - sa) / 7);
    const ring = (active.r ?? 4) * v;
    // spotlight: làm tối nhẹ ngoài vùng quanh điểm
    overlay = (
      <>
        <AbsoluteFill style={{pointerEvents: "none", opacity: 0.55 * show,
          background: `radial-gradient(circle at ${px}px ${py}px, transparent ${ring * 2.2}px, rgba(0,0,0,0.75) ${ring * 7}px)`}} />
        <svg width={W} height={H} style={{position: "absolute", inset: 0, overflow: "visible"}}>
          <line x1={px} y1={py} x2={px + (ax - px) * draw} y2={py + (ay - py) * draw} stroke={color} strokeWidth={0.28 * v}
            opacity={leave} style={{filter: `drop-shadow(0 0 ${0.6 * v}px ${color})`}} />
          <circle cx={px} cy={py} r={ring * pulse} fill="none" stroke={color} strokeWidth={0.35 * v} opacity={show} />
          <circle cx={px} cy={py} r={0.7 * v} fill={color} opacity={show} />
        </svg>
        <div style={{position: "absolute", left: cx, top: cy, width: cardW, opacity: show,
          transform: `translateY(${(1 - appear) * 2 * v}px)`, textAlign: portrait ? "center" : "left", fontFamily: INTER,
          background: "rgba(10,11,15,0.78)", border: `1px solid ${color}66`, borderRadius: 1.6 * v,
          padding: `${2 * v}px ${2.6 * v}px`, boxShadow: `0 ${1.2 * v}px ${4 * v}px rgba(0,0,0,0.5), 0 0 ${3 * v}px ${color}33`}}>
          {active.tag ? <div style={{display: "inline-block", fontFamily: MONO, fontSize: 1.6 * v, fontWeight: 700, letterSpacing: 2,
            color: active.tagColor ? colOf(active.tagColor) : color,
            border: `1px solid ${active.tagColor ? colOf(active.tagColor) : color}`, borderRadius: 100,
            padding: `${0.3 * v}px ${1.2 * v}px`, marginBottom: 1.2 * v}}>{active.tag}</div> : null}
          <div style={{color: C.text, fontSize: (portrait ? 4 : 3.4) * v, fontWeight: 800, lineHeight: 1.15}}>{active.label}</div>
          {active.sub ? <div style={{color: C.muted, fontSize: (portrait ? 2.6 : 2.1) * v, marginTop: 1 * v, lineHeight: 1.35}}>{active.sub}</div> : null}
        </div>
      </>
    );
  } else if (withOutro && k === seg.length - 1 && calls.length) {
    // tổng thể cuối: đánh số mọi điểm đã xem
    const o = interpolate(f, [sa + T, sa + T + 12], [0, 1], clamp);
    overlay = (
      <svg width={W} height={H} style={{position: "absolute", inset: 0, overflow: "visible", opacity: o}}>
        {calls.map((cc, i) => {
          const [x, y] = scr(cc.x, cc.y);
          const color = colOf(cc.color);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={1.9 * v} fill="rgba(10,11,15,0.8)" stroke={color} strokeWidth={0.3 * v} />
              <text x={x} y={y + 0.7 * v} textAnchor="middle" fill={color} fontSize={2 * v} fontFamily={MONO} fontWeight={800}>{i + 1}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <AbsoluteFill style={{overflow: "hidden", background: p.background ?? "#000"}}>
      {fit === "contain" ? (() => {
        const bg = place(W, H, aspect, {x: 0.5, y: 0.5, zoom: 1.08});
        return <div style={{position: "absolute", left: bg.left, top: bg.top, width: bg.w, height: bg.h,
          filter: `blur(${4 * v}px) brightness(0.45)`}}>
          <Img src={src(p.src)} style={{width: "100%", height: "100%", display: "block"}} />
        </div>;
      })() : null}
      <div style={{position: "absolute", left: r.left, top: r.top, width: r.w, height: r.h}}>
        <Img src={src(p.src)} style={{width: "100%", height: "100%", display: "block"}} />
      </div>
      <Vignette amt={p.vignette ?? 0.3} />
      {overlay}
    </AbsoluteFill>
  );
};
