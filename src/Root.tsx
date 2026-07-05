import React from "react";
import {Composition, Sequence, Audio, AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, interpolate} from "remotion";
import {VIDEOS, VideoEntry} from "./videos.gen";
import {Beat, BeatData} from "./kit";
import {Caption} from "./Caption";
import {C, INTER, MONO, Bg, titleGrad} from "./ui";
import {BRAND} from "./brand";

const FPS = 30;
const root = {background: C.bg, fontFamily: INTER, color: C.text};
const BED = "audio/music/suong-sach.mp3";   // calm bed (swap in brand later)
const BED_VOL = 0.15;                         // ducked to sit UNDER the voice
const WHOOSH_LEAD = Math.round(0.89 * FPS);   // whoosh peaks ~0.89s in -> start before the cut
const LEAD_IN = Math.round(0.4 * FPS);        // breath after transition before voice resumes

// "thở" thêm: mở đầu không bụp vào, kết không gắt, giữa các section có nhịp nghỉ.
const INTRO_PAD = Math.round(2.2 * FPS);      // trước beat đầu (ảnh mở đầu thở lâu hơn)
const SECTION_GAP = Math.round(0.8 * FPS);    // giữa các section (ambient) - nới rộng cho đỡ gấp, không nuốt chữ
const OUTRO_PAD = Math.round(4.5 * FPS);      // sau beat cuối (CTA): đuôi dài để đặt logo kênh + nhạc fade hẳn
const SHORT_GAP = Math.round(0.33 * FPS);     // Short: nhịp nghỉ giữa cliffhanger và đáp án
const SHORT_TAIL = Math.round(1.2 * FPS);     // Short: giữ CTA cuối, tránh cắt tiếng cộc

const holdFrames = (entry: VideoEntry, id: string) =>
  Math.round((((entry.scenes[id] as any)?.holdSec) ?? 0) * FPS);

// fade mềm 2 đầu mỗi đoạn voice -> chuyển cảnh không bị cắt cộc lốc / click
// fade mềm 2 đầu đoạn voice: vào ~0.17s, RA ~0.5s (đuôi dài để không "to xuống 0" cộc lốc).
const voiceVol = (audioFrames: number) => (f: number) =>
  Math.max(0, Math.min(1, (f + 1) / 5, (audioFrames - f) / 6));

// vị trí start mỗi beat (có intro + gap) + tổng frame. Beat render đúng độ dài gốc -> KHÔNG lệch sync.
const layout = (entry: VideoEntry) => {
  const starts: number[] = [];
  let off = INTRO_PAD;
  const last = entry.beats.length - 1;
  entry.beats.forEach((b, i) => {
    starts.push(off);
    off += b.durationInFrames + holdFrames(entry, b.id) + (i < last ? SECTION_GAP : 0);
  });
  return {starts, beatsEnd: off, total: off + OUTRO_PAD};
};

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
// để KHÔNG chớp "Tuấn LA Lab" giữa lúc chuyển section (Metric -> ... -> Dimension).
const Pad: React.FC<{brand?: boolean; label?: string}> = ({brand, label}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={root}>
      <Bg label={label ?? BRAND.label} />
      {brand && (
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity: o, textAlign: "center"}}>
          <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 66, letterSpacing: "-0.02em", ...titleGrad}}>
            Tuấn <span style={{color: C.accent, WebkitTextFillColor: C.accent}}>LA</span> Lab
          </div>
          <div style={{color: C.muted, fontSize: 19, letterSpacing: 7, marginTop: 14, fontWeight: 600}}>
            DATA · AI · MỖI TUẦN MỘT KHÁI NIỆM
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const LongForm: React.FC<{entry: VideoEntry}> = ({entry}) => {
  const {starts, beatsEnd, total} = layout(entry);
  const last = entry.beats.length - 1;
  // nhạc nền: dùng useCurrentFrame (frame TOÀN video) -> ra 1 SỐ. KHÔNG dùng volume-callback vì với
  // <Audio loop> Remotion trả frame theo từng vòng lặp -> điều kiện fade cuối không bao giờ đúng.
  const gFrame = useCurrentFrame();
  const bedVol = (() => {
    const inF = Math.round(1.2 * FPS), outF = Math.round(4.0 * FPS);   // fade nhạc dài, tan hẳn ở đuôi (chỗ đặt logo)
    let g = 1;
    if (gFrame < inF) g = gFrame / inF; else if (gFrame > total - outF) g = (total - gFrame) / outF;
    g = Math.max(0, Math.min(1, g));
    return BED_VOL * g * g;
  })();
  return (
    <AbsoluteFill style={root}>
      <Audio src={staticFile(BED)} loop volume={bedVol} />
      <Sequence from={0} durationInFrames={INTRO_PAD}><Pad brand /></Sequence>
      {entry.beats.map((b, i) => (
        <React.Fragment key={b.id}>
          <Sequence from={starts[i]} durationInFrames={b.durationInFrames + holdFrames(entry, b.id)}>
            {entry.scenes[b.id] ? <Beat data={entry.scenes[b.id]} customs={entry.customs} lines={entry.timings[b.id]} /> : null}
            <Sequence from={LEAD_IN}>
              <Audio src={staticFile(b.audio)} volume={voiceVol(Math.round(b.durationSec * FPS))} />
              <Caption id={b.id} timings={entry.timings} />
            </Sequence>
          </Sequence>
          {i < last && (
            <Sequence from={starts[i] + b.durationInFrames + holdFrames(entry, b.id)} durationInFrames={SECTION_GAP}>
              <Pad label={entry.scenes[b.id]?.bg} />
            </Sequence>
          )}
        </React.Fragment>
      ))}
      <Sequence from={beatsEnd} durationInFrames={OUTRO_PAD}><Pad brand /></Sequence>
      {/* whoosh on each section change, peak-aligned to the cut (skip first = intro) */}
      {entry.beats.map((b, i) => (i === 0 ? null : (
        <Sequence key={"wh" + i} from={Math.max(0, starts[i] - WHOOSH_LEAD)} durationInFrames={90}>
          <Audio src={staticFile("audio/sfx/whoosh.wav")} volume={0.28} />
        </Sequence>
      )))}
      <Sig />
      <Progress total={total} />
    </AbsoluteFill>
  );
};

const ShortForm: React.FC<{entry: VideoEntry}> = ({entry}) => {
  const beat00 = entry.beats.find((b) => b.id === "00")!;
  const outroStart = beat00.durationInFrames + SHORT_GAP;          // nghỉ 1 nhịp trước đáp án
  const outroLen = entry.outro.durationInFrames + SHORT_TAIL;      // giữ CTA cuối thêm 1 đoạn
  const total = outroStart + outroLen;
  const gFrame = useCurrentFrame();                                // frame toàn video (không dùng volume-callback vì Audio loop)
  const bedVol = (() => {                                          // nhạc nền fade-in + fade-out cong
    const inF = Math.round(0.8 * FPS), outF = Math.round(1.6 * FPS);
    let g = 1;
    if (gFrame < inF) g = gFrame / inF; else if (gFrame > total - outF) g = (total - gFrame) / outF;
    g = Math.max(0, Math.min(1, g));
    return BED_VOL * g * g;
  })();
  return (
    <AbsoluteFill style={root}>
      <Audio src={staticFile(BED)} loop volume={bedVol} />
      <Sequence durationInFrames={beat00.durationInFrames}>
        {entry.scenes["00"] ? <Beat data={entry.scenes["00"]} customs={entry.customs} lines={entry.timings["00"]} /> : null}
        <Sequence from={LEAD_IN}>
          <Audio src={staticFile(beat00.audio)} volume={voiceVol(Math.round(beat00.durationSec * FPS))} />
          <Caption id="00" timings={entry.timings} />
        </Sequence>
      </Sequence>
      <Sequence from={beat00.durationInFrames} durationInFrames={SHORT_GAP}><Pad /></Sequence>
      {/* whoosh chuyển sang đáp án — nhỏ lại (0.45 -> 0.26) để không nhảy âm */}
      <Sequence from={Math.max(0, outroStart - WHOOSH_LEAD)} durationInFrames={90}>
        <Audio src={staticFile("audio/sfx/whoosh.wav")} volume={0.26} />
      </Sequence>
      <Sequence from={outroStart} durationInFrames={outroLen}>
        {entry.scenes["short-outro"] ? <Beat data={entry.scenes["short-outro"]} customs={entry.customs} lines={entry.timings["short-outro"]} /> : null}
        <Sequence from={LEAD_IN}>
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
  <AbsoluteFill style={root}>
    <Beat data={DEMO} />
    <Sig />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="demo-kit" component={DemoKit} durationInFrames={420} fps={FPS} width={1920} height={1080} />
    {VIDEOS.map((entry) => {
      const total = layout(entry).total;
      const beat00 = entry.beats.find((b) => b.id === "00");
      const shortTotal = (beat00?.durationInFrames || 0) + SHORT_GAP + entry.outro.durationInFrames + SHORT_TAIL;
      const Long: React.FC = () => <LongForm entry={entry} />;
      const Short: React.FC = () => <ShortForm entry={entry} />;
      return (
        <React.Fragment key={entry.slug}>
          <Composition id={`${entry.slug}-Long`} component={Long} durationInFrames={total}
            fps={FPS} width={1920} height={1080} />
          {beat00 && entry.scenes["short-outro"] && (
            <Composition id={`${entry.slug}-Short`} component={Short} durationInFrames={shortTotal}
              fps={FPS} width={1080} height={1920} />
          )}
        </React.Fragment>
      );
    })}
  </>
);
