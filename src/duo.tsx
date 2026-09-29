// Short đối đáp (duo): hai nhân vật thay nhau nói, bảng đố ở giữa, bong bóng thoại chạy theo từng tiếng.
//
// Dữ liệu một tập = videos/<slug>/duo.json (kịch bản, người viết) + duo.timing.json (gen_duo.py sinh).
//
// duo.json:
//   {ep, topic, hook: {kicker, big, text}, question: {prompt, code?, options[], answer}, explain[], cta: {line, pill, sub},
//    lines: [
//      {who: "luna", face: "wink", say: "…", do: "hook", react: "confident",
//       faces: [{at: "sai", face: "shocked", who?: "sola"}]},
//      {countdown: 3, do: "countdown"},
//      …
//    ]}
//
// Lệnh hình (`do`, chuỗi hoặc mảng): hook · question · options · pick:B · reveal · explain · cta · jump · shake.
// Thêm "@từ" để neo lệnh vào đúng tiếng đó trong câu: "reveal@đáp".
//
// Nhịp: mỗi câu thoại là một lần đổi người nói (camera + mascot đổi trạng thái), mỗi câu đổi biểu cảm,
// mỗi tiếng làm mascot nhún một nhịp. Không có khoảng chết: gen_duo.py xếp câu nối câu, cách nhau `duo.gap`.
import React, {useMemo} from "react";
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from "remotion";
import {icons as LUCIDE} from "lucide-react";
import {C, INTER, MONO, Bg, Sparks} from "./ui";
import {CONFIG} from "./config";
import type {CastMember} from "./config";
import type {DuoEntry} from "./types";

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const YELLOW = "#FDE047";

type TWord = {w: string; s: number; e: number};
type TLine = {kind: "say" | "countdown"; who?: string; audio?: string; audioStart?: number;
  start: number; end: number; words?: TWord[]};
type Ev = {t: number; type: string; arg?: string; who?: string};

// ---------------------------------------------------------------- tiện ích

const norm = (s: string) => s.toLowerCase().normalize("NFC").replace(/[.,!?:;…"“”()]/g, "");

/** thời điểm của từ chứa `key` trong câu, không thấy thì đầu câu */
const wordTime = (L: TLine, key?: string) => {
  if (!key || !L.words) return L.start;
  const k = norm(key);
  const w = L.words.find((x) => norm(x.w).includes(k));
  return w ? w.s : L.start;
};

const faceOf = (m: CastMember, name?: string) => {
  if (name && m.faces.includes(name)) return name;
  const a = name ? m.alias?.[name] : undefined;
  if (a && m.faces.includes(a)) return a;
  return m.idle && m.faces.includes(m.idle) ? m.idle : m.faces[0];
};

const colOf = (k: string) => {
  const cast = CONFIG.duo.cast;
  const map: Record<string, string> = {accent: C.accent, good: C.good, bad: C.bad, warn: C.warn, muted: C.muted,
    yellow: YELLOW, ...Object.fromEntries(Object.entries(cast).map(([id, m]) => [id, m.color]))};
  return map[k] || k;
};

/** "[bad:SAI] câu này[br]nhé" -> span màu + xuống dòng */
const rich = (s: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  const re = /\[br\]|\[([a-z]+|#[0-9a-fA-F]{3,8}):([^\]]*)\]/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[0] === "[br]") out.push(<br key={k++} />);
    else out.push(<span key={k++} style={{color: colOf(m[1]), fontWeight: 900}}>{m[2]}</span>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
};

// tô màu code nhẹ: từ khoá tím, số cam, chuỗi xanh, chú thích xám
const KW = /\b(for|in|if|elif|else|while|def|return|print|range|and|or|not|True|False|None|import|from|len|int|str|input|break|continue|SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|COUNT|SUM|AVG|AS|JOIN|ON|AND|OR|NOT|INSERT|UPDATE|DELETE|INTO|VALUES|SET)\b/;
const TOK = /(#.*$|--.*$)|("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]+\b)/g;
const code = (line: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null, k = 0;
  TOK.lastIndex = 0;
  while ((m = TOK.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [txt, cm, str, num, word] = m;
    const c = cm ? C.muted : str ? "#86EFAC" : num ? "#FDBA74" : word && KW.test(word) ? "#C4B5FD" : undefined;
    out.push(c ? <span key={k++} style={{color: c}}>{txt}</span> : txt);
    last = TOK.lastIndex;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
};

/** 0 -> 1 có nảy, bắt đầu ở frame `at` */
const useSpring = (at: number, cfg = {damping: 12, stiffness: 220, mass: 0.6}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: cfg});
};

const Icon: React.FC<{name: string; size: number; color: string; stroke?: number}> = ({name, size, color, stroke = 2.6}) => {
  const pas = name.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
  const Cmp = (LUCIDE as Record<string, React.FC<any>>)[pas];
  return Cmp ? <Cmp size={size} color={color} strokeWidth={stroke} /> : null;
};

// ---------------------------------------------------------------- dựng dòng thời gian

const buildEvents = (script: any, lines: TLine[]) => {
  const ev: Ev[] = [];
  script.lines.forEach((S: any, i: number) => {
    const L = lines[i];
    if (!L) return;
    const acts: string[] = S.do ? (Array.isArray(S.do) ? S.do : [S.do]) : [];
    for (const a of acts) {
      const [head, at] = a.split("@");
      const [type, arg] = head.split(":");
      // jump/shake nhận tên nhân vật: "shake:sola"; không ghi thì là người đang nói
      const who = (type === "jump" || type === "shake") && arg ? arg : S.who;
      ev.push({t: wordTime(L, at), type, arg, who});
    }
  });
  return ev.sort((a, b) => a.t - b.t);
};

/** mỗi nhân vật: danh sách (thời điểm, biểu cảm). Câu mình nói -> face; câu người kia nói -> react */
const buildFaces = (script: any, lines: TLine[], ids: string[]) => {
  const out: Record<string, {t: number; face: string}[]> = Object.fromEntries(ids.map((id) => [id, []]));
  script.lines.forEach((S: any, i: number) => {
    const L = lines[i];
    if (!L) return;
    if (S.who && S.face) out[S.who]?.push({t: L.start - 0.06, face: S.face});
    if (S.react) {
      const rs = typeof S.react === "string" ? {face: S.react} : S.react;
      const other = rs.who || ids.find((x) => x !== S.who);
      if (other) out[other]?.push({t: rs.at ? wordTime(L, rs.at) : L.start + 0.2, face: rs.face});
    }
    for (const fx of S.faces || []) {
      const who = fx.who || S.who;
      if (who) out[who]?.push({t: wordTime(L, fx.at), face: fx.face});
    }
    if (L.kind === "countdown" && S.faces_all) {
      for (const id of ids) out[id].push({t: L.start, face: S.faces_all});
    }
  });
  for (const id of ids) out[id].sort((a, b) => a.t - b.t);
  return out;
};

const lastBefore = <T extends {t: number}>(arr: T[], t: number): T | undefined => {
  let r: T | undefined;
  for (const x of arr) { if (x.t <= t) r = x; else break; }
  return r;
};

// ---------------------------------------------------------------- mascot

// biểu cảm -> dấu cảm xúc bật trên đầu (kiểu anime). Không emoji: chữ đậm hoặc icon nét.
const EMOTE: Record<string, {text?: string; icon?: string; color: string}> = {
  shocked: {text: "!!", color: "#F87171"}, surprised: {text: "!", color: YELLOW},
  confused: {text: "?", color: "#93C5FD"}, thinking: {text: "?", color: "#93C5FD"}, magnifier: {text: "?", color: "#93C5FD"},
  happy: {icon: "sparkles", color: YELLOW}, cheer: {icon: "sparkles", color: YELLOW}, celebrate: {icon: "sparkles", color: YELLOW},
  "celebrate-jump": {icon: "sparkles", color: YELLOW}, "great-job": {icon: "star", color: YELLOW},
  "thumbs-up": {icon: "star", color: YELLOW}, confident: {icon: "zap", color: YELLOW}, wink: {icon: "sparkles", color: "#F9A8D4"},
  love: {icon: "heart", color: "#F472B6"}, "love-heart": {icon: "heart", color: "#F472B6"}, adore: {icon: "heart", color: "#F472B6"},
  worried: {icon: "droplet", color: "#7DD3FC"}, sad: {icon: "droplet", color: "#7DD3FC"}, crying: {icon: "droplet", color: "#7DD3FC"},
  facepalm: {icon: "droplet", color: "#7DD3FC"}, tired: {icon: "droplet", color: "#7DD3FC"}, upset: {icon: "flame", color: "#FB923C"},
  angry: {icon: "flame", color: "#F87171"}, explaining: {icon: "lightbulb", color: YELLOW},
};

const Emote: React.FC<{face: string; at: number; side: "left" | "right"; size: number}> = ({face, at, side, size}) => {
  const f = useCurrentFrame();
  const e = EMOTE[face];
  const sp = useSpring(at, {damping: 8, stiffness: 300, mass: 0.5});
  const dt = f - at;
  if (!e || dt < 0 || dt > 30) return null;
  const o = interpolate(dt, [0, 3, 20, 30], [0, 1, 1, 0], clamp);
  // bên ngoài đầu, thấp hơn bong bóng thoại để không bị che
  const pos = side === "left" ? {left: "-14%"} : {right: "-14%"};
  return (
    <div style={{position: "absolute", top: "8%", ...pos, opacity: o,
      transform: `translateY(${-dt * 1.2}px) scale(${0.4 + 0.6 * sp}) rotate(${side === "left" ? -12 : 12}deg)`,
      filter: `drop-shadow(0 0 12px ${e.color}aa)`}}>
      {e.text ? (
        <div style={{fontFamily: INTER, fontWeight: 900, fontSize: size, color: e.color, lineHeight: 1,
          WebkitTextStroke: "4px #0B0A14", paintOrder: "stroke"}}>{e.text}</div>
      ) : <Icon name={e.icon!} size={size * 0.9} color={e.color} stroke={3} />}
    </div>
  );
};

const Mascot: React.FC<{id: string; m: CastMember; faces: {t: number; face: string}[]; lines: TLine[];
  speakers: {t: number; who?: string}[]; bumps: Ev[]}> = ({id, m, faces, lines, speakers, bumps}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  const left = m.side === "left";

  // ai đang giữ lượt: trượt mượt giữa "đang nói" (1) và "đang nghe" (0)
  const cur = lastBefore(speakers, t);
  const idx = cur ? speakers.indexOf(cur) : -1;
  const prev = idx > 0 ? speakers[idx - 1] : undefined;
  const target = cur ? (cur.who === id ? 1 : cur.who ? 0 : 0.5) : 0.5;
  const from = prev ? (prev.who === id ? 1 : prev.who ? 0 : 0.5) : 0.5;
  const sp = cur ? spring({frame: f - Math.round(cur.t * fps), fps, config: {damping: 14, stiffness: 180, mass: 0.7}}) : 1;
  const focus = from + (target - from) * sp;

  // biểu cảm hiện tại + nảy khi đổi
  const fc = lastBefore(faces, t);
  const face = faceOf(m, fc?.face);
  const faceAt = fc ? Math.round(fc.t * fps) : -99;
  const pop = spring({frame: f - faceAt, fps, config: {damping: 9, stiffness: 280, mass: 0.5}});
  const popS = fc ? 0.88 + 0.12 * pop : 1;

  // nhún theo từng tiếng khi đang nói
  let bob = 0;
  const L = cur && cur.who === id ? lines.find((x) => x.kind === "say" && x.who === id && x.start <= t + 0.05 && t <= x.end + 0.05) : undefined;
  if (L?.words) {
    const w = lastBefore(L.words.map((x) => ({t: x.s})), t);
    if (w) {
      const d = (t - w.t) * fps;
      if (d < 7) bob = Math.sin((Math.PI * d) / 7);
    }
  }

  // nhảy / rung theo lệnh
  let jump = 0, shake = 0;
  for (const b of bumps) {
    if (b.who !== id) continue;
    const d = f - Math.round(b.t * fps);
    if (d < 0 || d > 24) continue;
    if (b.type === "jump") jump = Math.max(jump, Math.sin((Math.PI * d) / 24) * 90);
    if (b.type === "shake") shake = Math.sin(d * 2.2) * 18 * (1 - d / 24);
  }

  const enter = spring({frame: f - 2, fps, config: {damping: 13, stiffness: 160, mass: 0.8}});
  const breathe = Math.sin(f / 17 + (left ? 0 : 2)) * 5;
  const H = height * 0.275;
  const cx = (left ? 0.29 : 0.71) * width + (left ? 1 : -1) * 26 * focus + (1 - enter) * (left ? -600 : 600);
  const scale = (0.86 + 0.2 * focus) * popS;
  const lit = 0.62 + 0.38 * focus;

  return (
    <div style={{position: "absolute", left: cx, bottom: height * 0.095, height: H,
      transform: `translateX(-50%) translateX(${shake}px) translateY(${-jump + breathe - bob * 10}px)`}}>
      <div style={{height: "100%", transform: `scale(${scale * (1 - 0.03 * bob)}, ${scale * (1 + 0.035 * bob)})`,
        transformOrigin: "50% 100%", filter: `brightness(${lit}) saturate(${0.75 + 0.25 * focus})
          drop-shadow(0 0 ${22 * focus}px ${m.color}88)`}}>
        <Img src={staticFile(`${m.dir}/${face}.png`)} style={{height: "100%", width: "auto", transform: left ? "none" : "scaleX(-1)"}} />
      </div>
      {fc && <Emote face={fc.face} at={faceAt} side={m.side} size={H * 0.26} />}
    </div>
  );
};

// ---------------------------------------------------------------- bong bóng thoại

const chunksOf = (words: TWord[]) => {
  const out: TWord[][] = [];
  let cur: TWord[] = [];
  let chars = 0;
  for (const w of words) {
    cur.push(w); chars += w.w.length + 1;
    if (cur.length >= 4 || chars >= 17 || /[,.!?:;…]$/.test(w.w)) { out.push(cur); cur = []; chars = 0; }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Bubble: React.FC<{lines: TLine[]}> = ({lines}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  const L = lastBefore(lines.filter((x) => x.kind === "say").map((x) => ({...x, t: x.start - 0.08})), t);
  const chunks = useMemo(() => (L?.words ? chunksOf(L.words) : []), [L]);
  if (!L || !L.who || t > L.end + 0.35) return null;
  const m = CONFIG.duo.cast[L.who];
  if (!m) return null;
  const ch = lastBefore(chunks.map((c) => ({c, t: c[0].s - 0.05})), t);
  if (!ch) return null;
  const at = Math.round(ch.t * fps);
  const sp = spring({frame: f - at, fps, config: {damping: 11, stiffness: 320, mass: 0.45}});
  const left = m.side === "left";
  const fs = width * 0.066;
  return (
    <div style={{position: "absolute", left: "50%", top: height * 0.56, width: width * 0.86,
      transform: `translateX(-50%) translateX(${(left ? -1 : 1) * width * 0.02}px) scale(${0.93 + 0.07 * sp})`,
      transformOrigin: left ? "20% 100%" : "80% 100%"}}>
      <div style={{position: "relative", background: "rgba(11,10,20,0.9)", border: `5px solid ${m.color}`,
        borderRadius: 34, padding: `${fs * 0.34}px ${fs * 0.5}px`, textAlign: "center",
        boxShadow: `0 10px 40px rgba(0,0,0,0.55), 0 0 36px ${m.color}55`}}>
        <div style={{position: "absolute", top: -fs * 0.42, [left ? "left" : "right"]: 40, background: m.color,
          color: "#0B0A14", fontFamily: INTER, fontWeight: 900, fontSize: fs * 0.42, letterSpacing: 3,
          padding: `${fs * 0.06}px ${fs * 0.3}px`, borderRadius: 999}}>{m.name}</div>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: fs, lineHeight: 1.18, color: "#fff"}}>
          {ch.c.map((w, i) => {
            const on = t >= w.s - 0.03 && t <= w.e + 0.05;
            return <span key={i} style={{color: on ? YELLOW : "#fff", margin: "0 0.14em", display: "inline-block",
              transform: `scale(${on ? 1.06 : 1})`}}>{w.w}</span>;
          })}
        </div>
        {/* đuôi bong bóng chỉ về người nói */}
        <div style={{position: "absolute", bottom: -34, [left ? "left" : "right"]: width * 0.17, width: 0, height: 0,
          borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `34px solid ${m.color}`}} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- bảng đố

const Card: React.FC<{children: React.ReactNode; style?: any}> = ({children, style}) => (
  <div style={{background: "linear-gradient(165deg, rgba(30,27,60,0.92), rgba(14,12,28,0.94))",
    border: `2px solid ${C.accent}55`, borderRadius: 36, boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
    ...style}}>{children}</div>
);

/** vào cảnh: bật từ nhỏ + trượt ngang + hết nhoè */
const Enter: React.FC<{at: number; children: React.ReactNode; dx?: number; style?: any}> = ({at, children, dx = 120, style}) => {
  const f = useCurrentFrame();
  const sp = useSpring(at, {damping: 13, stiffness: 240, mass: 0.6});
  const bl = interpolate(f - at, [0, 6], [10, 0], clamp);
  return (
    <div style={{opacity: interpolate(f - at, [0, 4], [0, 1], clamp),
      transform: `translateX(${(1 - sp) * dx}px) scale(${0.82 + 0.18 * sp})`, filter: `blur(${bl}px)`, ...style}}>
      {children}
    </div>
  );
};

const HookView: React.FC<{hook: any; at: number}> = ({hook, at}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  // đếm lên tới số trong `big` (giữ số chữ số thập phân, dấu phẩy kiểu Việt), phần chữ đi sau giữ nguyên
  const m = String(hook.big).match(/^([\d]+(?:[.,]\d+)?)(.*)$/);
  const dec = m && /[.,]/.test(m[1]) ? m[1].split(/[.,]/)[1].length : 0;
  const n = m ? parseFloat(m[1].replace(",", ".")) : NaN;
  const cur = interpolate(f - at, [0, 14], [0, n], {...clamp, easing: Easing.out(Easing.cubic)});
  const cnt = isNaN(n) ? hook.big : cur.toFixed(dec).replace(".", ",") + m![2];
  const slam = useSpring(at + 10, {damping: 9, stiffness: 260, mass: 0.7});
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20}}>
      <Enter at={at} dx={0}>
        <div style={{fontFamily: MONO, color: YELLOW, fontSize: width * 0.036, letterSpacing: 8, fontWeight: 800}}>{hook.kicker}</div>
      </Enter>
      <Enter at={at} dx={0}>
        <div style={{fontFamily: INTER, fontWeight: 900, fontSize: width * 0.3, lineHeight: 0.95, letterSpacing: "-0.04em",
          backgroundImage: `linear-gradient(180deg, #FFFFFF 10%, ${C.bad} 95%)`, WebkitBackgroundClip: "text",
          color: "transparent", filter: `drop-shadow(0 0 40px ${C.bad}66)`}}>{cnt}</div>
      </Enter>
      <div style={{fontFamily: INTER, fontWeight: 900, fontSize: width * 0.078, lineHeight: 1.12, color: "#fff",
        opacity: interpolate(f - at - 10, [0, 3], [0, 1], clamp), transform: `scale(${2.2 - 1.2 * slam})`}}>
        {rich(hook.text)}
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{lines: string[]; at: number; fs: number}> = ({lines, at, fs}) => {
  const f = useCurrentFrame();
  return (
    <Card style={{padding: `${fs * 0.55}px ${fs * 0.7}px`, textAlign: "left", background: "rgba(8,8,16,0.92)",
      border: "2px solid #2A2D46"}}>
      <div style={{display: "flex", gap: 10, marginBottom: fs * 0.4}}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
      </div>
      {lines.map((ln, i) => {
        const a = at + 3 + i * 2;
        return (
          <div key={i} style={{fontFamily: MONO, fontSize: fs, lineHeight: 1.42, color: "#E5E7EB", whiteSpace: "pre",
            opacity: interpolate(f - a, [0, 3], [0, 1], clamp), transform: `translateX(${interpolate(f - a, [0, 4], [-24, 0], clamp)}px)`}}>
            {code(ln)}
          </div>
        );
      })}
    </Card>
  );
};

const LETTERS = ["A", "B", "C", "D"];

const Option: React.FC<{i: number; text: string; at: number; picks: Ev[]; reveal?: number; answer: number; fs: number}> =
({i, text, at, picks, reveal, answer, fs}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = at + i * 3;
  const sp = useSpring(a, {damping: 10, stiffness: 300, mass: 0.5});
  const mine = picks.filter((p) => p.arg === LETTERS[i]);
  const picked = mine.length ? CONFIG.duo.cast[mine[mine.length - 1].who!] : undefined;
  const rv = reveal != null ? f - Math.round(reveal * fps) : -1;
  const right = i === answer;
  const on = rv >= 0;
  const wrongPicked = on && !right && picked;
  const bg = on && right ? `linear-gradient(160deg, ${C.good}, #047857)` : "rgba(22,20,42,0.95)";
  const border = on ? (right ? C.good : wrongPicked ? C.bad : "#2A2D46") : picked ? picked.color : "#3B3F66";
  const dim = on && !right && !wrongPicked ? 0.35 : 1;
  const pulse = on && right ? 1 + 0.08 * Math.sin(Math.min(rv, 12) / 12 * Math.PI) : 1;
  const shake = wrongPicked && rv < 16 ? Math.sin(rv * 2.4) * 12 * (1 - rv / 16) : 0;
  return (
    <div style={{position: "relative", opacity: interpolate(f - a, [0, 3], [0, 1], clamp) * dim,
      transform: `scale(${(0.6 + 0.4 * sp) * pulse}) translateX(${shake}px)`}}>
      <div style={{display: "flex", alignItems: "center", gap: fs * 0.4, padding: `${fs * 0.34}px ${fs * 0.4}px`,
        borderRadius: 26, background: bg, border: `4px solid ${border}`,
        boxShadow: picked || (on && right) ? `0 0 30px ${border}88` : "0 8px 24px rgba(0,0,0,0.4)"}}>
        <div style={{width: fs * 1.25, height: fs * 1.25, borderRadius: "50%", flexShrink: 0, display: "flex",
          alignItems: "center", justifyContent: "center", background: on && right ? "#fff" : `${C.accent}33`,
          color: on && right ? "#047857" : "#fff", fontFamily: INTER, fontWeight: 900, fontSize: fs * 0.7}}>
          {on && right ? <Icon name="check" size={fs * 0.8} color="#047857" stroke={4} /> : wrongPicked ? <Icon name="x" size={fs * 0.8} color={C.bad} stroke={4} /> : LETTERS[i]}
        </div>
        <div style={{fontFamily: MONO, fontWeight: 800, fontSize: fs, color: "#fff", whiteSpace: "nowrap"}}>{text}</div>
      </div>
      {picked && (
        <div style={{position: "absolute", top: -fs * 0.45, right: -fs * 0.2, background: picked.color, color: "#0B0A14",
          fontFamily: INTER, fontWeight: 900, fontSize: fs * 0.52, padding: `4px ${fs * 0.28}px`, borderRadius: 999,
          boxShadow: `0 0 20px ${picked.color}`,
          transform: `scale(${spring({frame: f - Math.round(mine[mine.length - 1].t * fps), fps, config: {damping: 8, stiffness: 300}})})`}}>
          {picked.name}
        </div>
      )}
      {on && right && <Sparks at={Math.round(reveal! * fps)} seed={"ok" + i} n={30} spread={16} />}
    </div>
  );
};

const QuestionView: React.FC<{q: any; at: number; optAt?: number; picks: Ev[]; reveal?: number}> = ({q, at, optAt, picks, reveal}) => {
  const {width, fps} = useVideoConfig();
  const fs = width * 0.046;
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 30, width: "100%"}}>
      <Enter at={at}>
        <div style={{fontFamily: INTER, fontWeight: 900, fontSize: width * 0.064, lineHeight: 1.15, color: "#fff", textAlign: "center"}}>
          {rich(q.prompt)}
        </div>
      </Enter>
      {q.code && <Enter at={at + 2}><CodeBlock lines={q.code} at={at + 2} fs={fs} /></Enter>}
      {optAt != null && (
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, marginTop: 8}}>
          {q.options.map((o: string, i: number) => (
            <Option key={i} i={i} text={o} at={Math.round(optAt * fps)} picks={picks} reveal={reveal} answer={q.answer} fs={fs} />
          ))}
        </div>
      )}
    </div>
  );
};

const ExplainView: React.FC<{q: any; items: string[]; times: number[]; at: number}> = ({q, items, times, at}) => {
  const f = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const fs = width * 0.045;
  const shown = times.length;
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 24, width: "100%"}}>
      <Enter at={at} dx={0}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 20}}>
          <div style={{fontFamily: MONO, color: YELLOW, fontWeight: 800, letterSpacing: 6, fontSize: width * 0.036}}>VÌ SAO</div>
          <div style={{fontFamily: MONO, fontWeight: 800, fontSize: width * 0.05, color: "#fff", background: `linear-gradient(160deg, ${C.good}, #047857)`,
            padding: "6px 26px", borderRadius: 20}}>{LETTERS[q.answer]}. {q.options[q.answer]}</div>
        </div>
      </Enter>
      {q.code && <Enter at={at}><CodeBlock lines={q.code} at={at - 30} fs={width * 0.033} /></Enter>}
      {items.slice(0, shown).map((it, i) => {
        const a = Math.round(times[i] * fps);
        const latest = i === shown - 1;
        return (
          <Enter key={i} at={a} dx={160}>
            <div style={{display: "flex", alignItems: "center", gap: 20, padding: "14px 24px", borderRadius: 24,
              background: latest ? `${C.accent}30` : "rgba(22,20,42,0.85)", border: `3px solid ${latest ? C.accent : "#2A2D46"}`,
              opacity: latest ? 1 : interpolate(f - a, [0, 8], [1, 0.6], clamp)}}>
              <div style={{width: fs * 1.1, height: fs * 1.1, borderRadius: "50%", background: C.accent, color: "#fff", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: fs * 0.62}}>{i + 1}</div>
              <div style={{fontFamily: INTER, fontWeight: 800, fontSize: fs, color: "#fff", lineHeight: 1.2}}>{rich(it)}</div>
            </div>
          </Enter>
        );
      })}
    </div>
  );
};

const CtaView: React.FC<{cta: any; at: number}> = ({cta, at}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const wm = CONFIG.brand.wordmark;
  const g = 0.5 + 0.5 * Math.sin(f / 8);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 34, textAlign: "center"}}>
      <Enter at={at} dx={0}>
        <div style={{fontFamily: INTER, fontWeight: 900, fontSize: width * 0.13, letterSpacing: "-0.03em", color: "#fff"}}>
          {wm.pre}<span style={{color: C.accent, filter: `drop-shadow(0 0 30px ${C.accent})`}}>{wm.em}</span>{wm.post}
        </div>
      </Enter>
      <Enter at={at + 4} dx={0}>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: width * 0.06, color: "#fff", lineHeight: 1.2}}>{rich(cta.line)}</div>
      </Enter>
      <Enter at={at + 8} dx={0}>
        <div style={{fontFamily: MONO, fontWeight: 800, fontSize: width * 0.052, color: "#0B0A14", background: YELLOW,
          padding: "16px 44px", borderRadius: 999, boxShadow: `0 0 ${30 + 30 * g}px ${YELLOW}88`}}>{cta.pill}</div>
      </Enter>
      {cta.sub && <Enter at={at + 12} dx={0}>
        <div style={{fontFamily: INTER, fontWeight: 700, fontSize: width * 0.04, color: C.muted}}>{cta.sub}</div>
      </Enter>}
    </div>
  );
};

const Countdown: React.FC<{L: TLine}> = ({L}) => {
  const f = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = f / fps;
  if (t < L.start || t > L.end) return null;
  const total = L.end - L.start;
  const left = L.end - t;
  const n = Math.max(1, Math.ceil(left - 0.001));
  const sp = spring({frame: f - Math.round((L.start + (total - n)) * fps), fps, config: {damping: 8, stiffness: 320, mass: 0.5}});
  const R = width * 0.13;
  const p = left / total;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{position: "absolute", right: -width * 0.02, top: "26%", width: R * 2.3, height: R * 2.3,
      display: "flex", alignItems: "center", justifyContent: "center"}}>
      <svg width={R * 2.3} height={R * 2.3} style={{position: "absolute", transform: "rotate(-90deg)"}}>
        <circle cx={R * 1.15} cy={R * 1.15} r={R} fill="rgba(11,10,20,0.92)" stroke="#2A2D46" strokeWidth={14} />
        <circle cx={R * 1.15} cy={R * 1.15} r={R} fill="none" stroke={YELLOW} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} />
      </svg>
      <div style={{fontFamily: INTER, fontWeight: 900, fontSize: R * 1.25, color: YELLOW, transform: `scale(${0.6 + 0.4 * sp})`}}>{n}</div>
    </div>
  );
};

// ---------------------------------------------------------------- khung trên

const Header: React.FC<{ep?: number; topic?: string; total: number}> = ({ep, topic, total}) => {
  const f = useCurrentFrame();
  const {width, durationInFrames} = useVideoConfig();
  const d = CONFIG.duo;
  const fs = width * 0.034;
  void total;
  return (
    <>
      <div style={{position: "absolute", top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${C.accent}, ${YELLOW})`, boxShadow: `0 0 18px ${C.accent}`}} />
      <div style={{position: "absolute", top: width * 0.075, left: width * 0.06, right: width * 0.06,
        display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <div style={{fontFamily: INTER, fontWeight: 900, fontSize: fs, letterSpacing: 3, color: "#0B0A14",
            background: YELLOW, padding: "8px 20px", borderRadius: 14}}>{d.series}{ep != null ? ` #${String(ep).padStart(2, "0")}` : ""}</div>
          {topic && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: fs * 0.8, color: "#fff", letterSpacing: 2,
            border: `2px solid ${C.accent}`, padding: "6px 16px", borderRadius: 14, background: `${C.accent}22`}}>{topic}</div>}
        </div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: fs * 0.78, color: C.muted}}>{d.handle}</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- âm thanh sự kiện

const Sfx: React.FC<{at: number; name: string; volume: number}> = ({at, name, volume}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={75}>
    <Audio src={staticFile(`${CONFIG.audio.sfxDir}/${name}`)} volume={volume} />
  </Sequence>
);

// ---------------------------------------------------------------- composition

export const DuoShort: React.FC<{entry: DuoEntry}> = ({entry}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  const script = entry.script;
  const lines: TLine[] = entry.timing.lines;
  const cast = CONFIG.duo.cast;
  const ids = Object.keys(cast);

  const {events, faces, speakers} = useMemo(() => {
    const events = buildEvents(script, lines);
    const faces = buildFaces(script, lines, ids);
    const speakers = lines.map((L) => ({t: L.start - 0.1, who: L.kind === "say" ? L.who : undefined}));
    return {events, faces, speakers};
  }, [entry]);

  const before = events.filter((e) => e.t <= t);
  const view = [...before].reverse().find((e) => ["hook", "question", "explain", "cta"].includes(e.type));
  const optEv = before.find((e) => e.type === "options");
  const picks = before.filter((e) => e.type === "pick");
  const revealEv = before.find((e) => e.type === "reveal");
  const explainTimes = before.filter((e) => e.type === "explain").map((e) => e.t);
  const bumps = events.filter((e) => e.type === "jump" || e.type === "shake");
  const cd = lines.find((L) => L.kind === "countdown" && t >= L.start && t <= L.end);

  // camera: đẩy vào + rung ở các nhịp mạnh; trôi rất chậm cho khung không bao giờ đứng yên
  let cam = 1 + 0.03 * (f / (entry.timing.total * fps));
  let sx = 0, sy = 0;
  for (const e of events) {
    const d = f - Math.round(e.t * fps);
    if (d < 0 || d > 20) continue;
    const decay = Math.exp(-d / 6);
    if (["hook", "reveal", "cta"].includes(e.type)) cam += 0.05 * decay;
    if (e.type === "hook" || e.type === "shake" || (e.type === "reveal" && picks.some((p) => p.arg !== LETTERS[script.question.answer]))) {
      sx += Math.sin(d * 2.1) * 14 * decay; sy += Math.cos(d * 2.7) * 10 * decay;
    }
  }

  const vAt = view ? Math.round(view.t * fps) : 0;
  const board = !view ? null
    : view.type === "hook" ? <HookView hook={script.hook} at={vAt} />
    : view.type === "question" ? <QuestionView q={script.question} at={vAt} optAt={optEv?.t} picks={picks} reveal={revealEv?.t} />
    : view.type === "explain" ? <ExplainView q={script.question} items={script.explain || []} times={explainTimes} at={Math.round(before.find((e) => e.type === "explain")!.t * fps)} />
    : <CtaView cta={script.cta} at={vAt} />;

  const fr = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: INTER, color: C.text, overflow: "hidden"}}>
      <Bg />
      {/* sàn sáng dưới chân hai nhân vật */}
      <div style={{position: "absolute", left: "-10%", right: "-10%", bottom: height * 0.07, height: height * 0.14,
        background: `radial-gradient(50% 50% at 50% 50%, ${C.accent}55, transparent 70%)`}} />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${cam})`}}>
        <div style={{position: "absolute", left: width * 0.06, right: width * 0.06, top: height * 0.115, height: height * 0.425,
          display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div key={view ? view.type + view.t : "none"} style={{width: "100%"}}>{board}</div>
          {cd && <Countdown L={cd} />}
        </div>
        {ids.map((id) => (
          <Mascot key={id} id={id} m={cast[id]} faces={faces[id]} lines={lines} speakers={speakers} bumps={bumps} />
        ))}
        <Bubble lines={lines} />
      </AbsoluteFill>
      <Header ep={script.ep} topic={script.topic} total={entry.timing.total} />

      {/* giọng */}
      {lines.map((L, i) => L.kind === "say" && L.audio ? (
        <Sequence key={"v" + i} from={fr(L.audioStart ?? L.start)}>
          <Audio src={staticFile(L.audio)} />
        </Sequence>
      ) : null)}
      {CONFIG.audio.bed && <Audio src={staticFile(CONFIG.audio.bed)} loop volume={CONFIG.audio.bedVolume} />}

      {/* sfx theo sự kiện */}
      {events.map((e, i) => {
        const at = fr(e.t);
        switch (e.type) {
          case "hook": return <Sfx key={i} at={at + 10} name="impact.wav" volume={0.5} />;
          case "question": return <Sfx key={i} at={at - 4} name="whoosh.wav" volume={0.35} />;
          case "options": return <React.Fragment key={i}>{[0, 1, 2, 3].map((k) => <Sfx key={k} at={at + k * 3} name="pop.wav" volume={0.3} />)}</React.Fragment>;
          case "pick": return <Sfx key={i} at={at} name="click.wav" volume={0.55} />;
          case "reveal": return <React.Fragment key={i}><Sfx at={at} name="ding.wav" volume={0.6} />
            {picks.some((p) => p.arg !== LETTERS[script.question.answer]) || events.some((x) => x.type === "pick" && x.arg !== LETTERS[script.question.answer])
              ? <Sfx at={at + 6} name="wrong.wav" volume={0.3} /> : null}</React.Fragment>;
          case "explain": return <Sfx key={i} at={at} name="swish.wav" volume={0.3} />;
          case "cta": return <Sfx key={i} at={at} name="whoosh-soft.wav" volume={0.4} />;
          case "jump": return <Sfx key={i} at={at} name="pop.wav" volume={0.35} />;
          default: return null;
        }
      })}
      {lines.map((L, i) => L.kind === "countdown" ? (
        <React.Fragment key={"cd" + i}>
          {Array.from({length: Math.round(L.end - L.start)}).map((_, k) => (
            <Sfx key={k} at={fr(L.start + k)} name="click.wav" volume={0.5} />
          ))}
        </React.Fragment>
      ) : null)}
    </AbsoluteFill>
  );
};

/** tổng số frame của một tập */
export const duoFrames = (entry: DuoEntry) => Math.ceil(entry.timing.total * CONFIG.fps);
