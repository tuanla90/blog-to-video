// Dựng composition Remotion từ registry video + config.
//
// Repo tiêu dùng chỉ cần:
//     import {registerRoot} from "remotion";
//     import {applyConfig, makeRoot} from "blog2video/root";
//     import cfg from "../video.config.json";
//     import {VIDEOS} from "./videos.gen";
//     applyConfig(cfg);
//     registerRoot(makeRoot(VIDEOS));
//
// Mọi hằng số nhịp/nhạc/brand đọc từ CONFIG LÚC RENDER (không phải lúc import) — xem config.ts.
import React from "react";
import {Composition, Sequence, Audio, AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, interpolate} from "remotion";
import {Beat as BeatScene, BeatData} from "./kit";
import {Caption} from "./Caption";
import {C, INTER, MONO, Bg, titleGrad} from "./ui";
import {BRAND, CONFIG, sec} from "./config";
import type {VideoEntry} from "./types";

export {applyConfig, CONFIG, BRAND} from "./config";
export type {VideoEntry, Beat, Line, Word} from "./types";

const root = () => ({background: C.bg, fontFamily: INTER, color: C.text});
const sfx = (name: string) => staticFile(`${CONFIG.audio.sfxDir}/${name}`);

const holdFrames = (entry: VideoEntry, id: string) =>
  Math.round((((entry.scenes[id] as any)?.holdSec) ?? 0) * CONFIG.fps);

// fade mềm 2 đầu đoạn voice: vào ~0.17s, RA ~0.5s (đuôi dài để không "to xuống 0" cộc lốc).
const voiceVol = (audioFrames: number) => (f: number) =>
  Math.max(0, Math.min(1, (f + 1) / 5, (audioFrames - f) / 6));

// vị trí start mỗi beat (có intro + gap) + tổng frame. Beat render đúng độ dài gốc -> KHÔNG lệch sync.
const layout = (entry: VideoEntry) => {
  const starts: number[] = [];
  let off = sec(CONFIG.pacing.introPad);
  const gap = sec(CONFIG.pacing.sectionGap);
  const last = entry.beats.length - 1;
  entry.beats.forEach((b, i) => {
    starts.push(off);
    off += b.durationInFrames + holdFrames(entry, b.id) + (i < last ? gap : 0);
  });
  return {starts, beatsEnd: off, total: off + sec(CONFIG.pacing.outroPad)};
};

const shortLayout = (entry: VideoEntry) => {
  const beat00 = entry.beats.find((b) => b.id === "00");
  if (!beat00) return null;
  const outroStart = beat00.durationInFrames + sec(CONFIG.pacing.shortGap);
  const outroLen = entry.outro.durationInFrames + sec(CONFIG.pacing.shortTail);
  return {beat00, outroStart, outroLen, total: outroStart + outroLen};
};

// nhạc nền: dùng useCurrentFrame (frame TOÀN video) -> ra 1 SỐ. KHÔNG dùng volume-callback vì với
// <Audio loop> Remotion trả frame theo từng vòng lặp -> điều kiện fade cuối không bao giờ đúng.
const useBedVolume = (total: number, inSec: number, outSec: number) => {
  const gFrame = useCurrentFrame();
  const inF = sec(inSec), outF = sec(outSec);
  let g = 1;
  if (gFrame < inF) g = gFrame / inF;
  else if (gFrame > total - outF) g = (total - gFrame) / outF;
  g = Math.max(0, Math.min(1, g));
  return CONFIG.audio.bedVolume * g * g;
};

const Bed: React.FC<{volume: number}> = ({volume}) =>
  CONFIG.audio.bed ? <Audio src={staticFile(CONFIG.audio.bed)} loop volume={volume} /> : null;

const Whoosh: React.FC<{from: number; volume: number}> = ({from, volume}) =>
  CONFIG.audio.whoosh ? (
    <Sequence from={from} durationInFrames={90}>
      <Audio src={sfx(CONFIG.audio.whoosh)} volume={volume} />
    </Sequence>
  ) : null;

// dải gradient mỏng trên đỉnh chạy theo tiến trình TOÀN video (retention cue).
// Đặt ở cấp LongForm/ShortForm (ngoài mọi Sequence) để frame tính trên cả video, không reset theo beat.
const Progress: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  const {height} = useVideoConfig();
  const h = Math.max(4, Math.round(height * 0.006));
  return (
    <div style={{position: "absolute", top: 0, left: 0, height: h, width: `${Math.min(100, (f / total) * 100)}%`,
      background: `linear-gradient(90deg, ${BRAND.accent}, ${C.purple}, ${BRAND.bubble})`,
      boxShadow: `0 0 ${h * 2}px ${BRAND.accent}aa`, borderRadius: `0 ${h}px ${h}px 0`, opacity: 0.9}} />
  );
};

// chữ ký kênh cố định góc dưới-phải mọi frame (dưới vùng caption nên không đụng nhau)
const Sig: React.FC = () => {
  const {width, height} = useVideoConfig();
  const vmin = Math.min(width, height) / 100;
  return (
    <div style={{position: "absolute", right: 3.2 * vmin, bottom: 2.4 * vmin, fontFamily: MONO,
      color: C.muted, fontSize: 1.7 * vmin, letterSpacing: 2, fontWeight: 600, opacity: 0.6}}>
      <span style={{color: C.accent}}>●</span> {BRAND.sig}
    </div>
  );
};

// nền ambient (intro/outro/gap). brand=true -> hiện wordmark mờ dần vào.
// label: nhãn góc trên-trái (mặc định wordmark); gap giữa 2 beat truyền nhãn beat trước
// để KHÔNG chớp tên kênh giữa lúc chuyển section.
const Pad: React.FC<{brand?: boolean; label?: string}> = ({brand, label}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const wm = BRAND.wordmark;
  return (
    <AbsoluteFill style={root()}>
      <Bg label={label ?? BRAND.label} />
      {brand && (
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity: o, textAlign: "center"}}>
          <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 66, letterSpacing: "-0.02em", ...titleGrad}}>
            {wm.pre}<span style={{color: C.accent, WebkitTextFillColor: C.accent}}>{wm.em}</span>{wm.post}
          </div>
          <div style={{color: C.muted, fontSize: 19, letterSpacing: 7, marginTop: 14, fontWeight: 600}}>
            {BRAND.tagline}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const LongForm: React.FC<{entry: VideoEntry}> = ({entry}) => {
  const {starts, beatsEnd, total} = layout(entry);
  const last = entry.beats.length - 1;
  const introPad = sec(CONFIG.pacing.introPad);
  const outroPad = sec(CONFIG.pacing.outroPad);
  const gap = sec(CONFIG.pacing.sectionGap);
  const leadIn = sec(CONFIG.pacing.leadIn);
  const whooshLead = sec(CONFIG.pacing.whooshLead);
  const bedVol = useBedVolume(total, 1.2, 4.0);   // fade nhạc dài, tan hẳn ở đuôi (chỗ đặt logo)
  return (
    <AbsoluteFill style={root()}>
      <Bed volume={bedVol} />
      <Sequence from={0} durationInFrames={introPad}><Pad brand /></Sequence>
      {entry.beats.map((b, i) => (
        <React.Fragment key={b.id}>
          <Sequence from={starts[i]} durationInFrames={b.durationInFrames + holdFrames(entry, b.id)}>
            {entry.scenes[b.id] ? <BeatScene data={entry.scenes[b.id]} customs={entry.customs} lines={entry.timings[b.id]} /> : null}
            <Sequence from={leadIn}>
              <Audio src={staticFile(b.audio)} volume={voiceVol(Math.round((b.durationSec ?? 0) * CONFIG.fps))} />
              <Caption id={b.id} timings={entry.timings} />
            </Sequence>
          </Sequence>
          {i < last && (
            <Sequence from={starts[i] + b.durationInFrames + holdFrames(entry, b.id)} durationInFrames={gap}>
              <Pad label={entry.scenes[b.id]?.bg} />
            </Sequence>
          )}
        </React.Fragment>
      ))}
      <Sequence from={beatsEnd} durationInFrames={outroPad}><Pad brand /></Sequence>
      {/* whoosh mỗi lần đổi section, đỉnh sóng trùng nhát cắt (bỏ beat đầu = intro) */}
      {entry.beats.map((b, i) => (i === 0 ? null :
        <Whoosh key={"wh" + i} from={Math.max(0, starts[i] - whooshLead)} volume={0.28} />
      ))}
      <Sig />
      <Progress total={total} />
    </AbsoluteFill>
  );
};

const ShortForm: React.FC<{entry: VideoEntry}> = ({entry}) => {
  const {beat00, outroStart, outroLen, total} = shortLayout(entry)!;
  const leadIn = sec(CONFIG.pacing.leadIn);
  const bedVol = useBedVolume(total, 0.8, 1.6);
  return (
    <AbsoluteFill style={root()}>
      <Bed volume={bedVol} />
      <Sequence durationInFrames={beat00.durationInFrames}>
        {entry.scenes["00"] ? <BeatScene data={entry.scenes["00"]} customs={entry.customs} lines={entry.timings["00"]} /> : null}
        <Sequence from={leadIn}>
          <Audio src={staticFile(beat00.audio)} volume={voiceVol(Math.round((beat00.durationSec ?? 0) * CONFIG.fps))} />
          <Caption id="00" timings={entry.timings} />
        </Sequence>
      </Sequence>
      <Sequence from={beat00.durationInFrames} durationInFrames={sec(CONFIG.pacing.shortGap)}><Pad /></Sequence>
      {/* whoosh chuyển sang đáp án — nhỏ hơn bản Long để không nhảy âm */}
      <Whoosh from={Math.max(0, outroStart - sec(CONFIG.pacing.whooshLead))} volume={0.26} />
      <Sequence from={outroStart} durationInFrames={outroLen}>
        {entry.scenes["short-outro"] ? <BeatScene data={entry.scenes["short-outro"]} customs={entry.customs} lines={entry.timings["short-outro"]} /> : null}
        <Sequence from={leadIn}>
          <Audio src={staticFile(entry.outro.audio)} volume={voiceVol(entry.outro.durationInFrames)} />
          <Caption id="short-outro" timings={entry.timings} />
        </Sequence>
      </Sequence>
      <Sig />
      <Progress total={total} />
    </AbsoluteFill>
  );
};

// sân demo cho kit: xem nhanh element mới (icon/chips/cards/flow + sparks) mà không đụng video thật
const DEMO: BeatData = {bg: "KIT DEMO", moments: [
  {w: 1, gap: 4.5, stack: [
    {el: "label", text: "ICON KIT · LUCIDE · 5 BIẾN THỂ NỀN + GRADIENT"},
    {el: "text", value: "Biến thể [accent:icon]", size: 5.5},
    {el: "icons", at: 8, stagger: 7, size: 11, items: [
      {name: "brain", color: "accent", label: "trơn", variant: "none"},
      {name: "brain", color: "accent", label: "glass"},
      {name: "brain", color: "accent", label: "nền nhẹ", variant: "soft"},
      {name: "brain", color: "accent", label: "nền trắng", variant: "white"},
      {name: "brain", color: "accent", label: "nền đặc", variant: "solid"},
      {name: "brain", color: "accent", label: "gradient", grad: true},
    ]},
    {el: "icons", at: 58, stagger: 9, items: [
      {name: "brain", color: "accent", label: "Model", variant: "soft"},
      {name: "database", color: "warn", label: "Dữ liệu", variant: "soft"},
      {name: "bot", color: "good", label: "Agent", variant: "soft"},
    ]},
  ]},
  {w: 1, gap: 4, stack: [
    {el: "text", value: "Chip, flow, CTA [good:có icon]", size: 5.5},
    {el: "chips", at: 8, items: [["METRIC", "accent", "gauge"], ["DIMENSION", "good", "layers"], ["KPI", "warn", "target"]]},
    {el: "flow", at: 22, nodes: [
      {key: "Thu thập", sub: "log", color: "accent", icon: "download"},
      {key: "Chuẩn hoá", sub: "model", color: "good", icon: "settings-2"},
      {key: "Quyết định", sub: "KPI", color: "warn", icon: "trophy"}]},
    {el: "cta", at: 60, pill: "ĐĂNG KÝ KÊNH", icon: "bell-ring", tagline: "demo nút có icon"},
  ]},
]};
const DemoKit: React.FC = () => (
  <AbsoluteFill style={root()}>
    <BeatScene data={DEMO} />
    <Sig />
  </AbsoluteFill>
);

/** Dựng RemotionRoot từ registry. `demo: false` để bỏ composition "demo-kit". */
export const makeRoot = (videos: VideoEntry[], opts: {demo?: boolean} = {}): React.FC => {
  const showDemo = opts.demo !== false;
  return () => {
    const fps = CONFIG.fps;
    return (
      <>
        {showDemo && (
          <Composition id="demo-kit" component={DemoKit} durationInFrames={420} fps={fps} width={1920} height={1080} />
        )}
        {videos.map((entry) => {
          const total = layout(entry).total;
          const sl = shortLayout(entry);
          const Long: React.FC = () => <LongForm entry={entry} />;
          const Short: React.FC = () => <ShortForm entry={entry} />;
          return (
            <React.Fragment key={entry.slug}>
              <Composition id={`${entry.slug}-Long`} component={Long} durationInFrames={total}
                fps={fps} width={1920} height={1080} />
              {sl && entry.scenes["short-outro"] && (
                <Composition id={`${entry.slug}-Short`} component={Short} durationInFrames={sl.total}
                  fps={fps} width={1080} height={1920} />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };
};
