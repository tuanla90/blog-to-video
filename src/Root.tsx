import React from "react";
import {Composition, Sequence, Audio, AbsoluteFill, staticFile, useCurrentFrame, interpolate} from "remotion";
import {VIDEOS, VideoEntry} from "./videos.gen";
import {Beat} from "./kit";
import {Caption} from "./Caption";
import {C, INTER, Bg} from "./ui";
import {BRAND} from "./brand";

const FPS = 30;
const root = {background: C.bg, fontFamily: INTER, color: C.text};
const BED = "audio/music/suong-sach.mp3";   // calm bed (swap in brand later)
const BED_VOL = 0.15;                         // ducked to sit UNDER the voice
const WHOOSH_LEAD = Math.round(0.89 * FPS);   // whoosh peaks ~0.89s in -> start before the cut
const LEAD_IN = Math.round(0.4 * FPS);        // breath after transition before voice resumes

// "thở" thêm: mở đầu không bụp vào, kết không gắt, giữa các section có nhịp nghỉ.
const INTRO_PAD = Math.round(2.2 * FPS);      // trước beat đầu (ảnh mở đầu thở lâu hơn)
const SECTION_GAP = Math.round(0.5 * FPS);    // giữa các section (ambient, không đụng sync moment)
const OUTRO_PAD = Math.round(2.0 * FPS);      // sau beat cuối, giữ rồi mới hết
const SHORT_GAP = Math.round(0.33 * FPS);     // Short: nhịp nghỉ giữa cliffhanger và đáp án
const SHORT_TAIL = Math.round(1.2 * FPS);     // Short: giữ CTA cuối, tránh cắt tiếng cộc

const holdFrames = (entry: VideoEntry, id: string) =>
  Math.round((((entry.scenes[id] as any)?.holdSec) ?? 0) * FPS);

// fade mềm 2 đầu mỗi đoạn voice -> chuyển cảnh không bị cắt cộc lốc / click
const voiceVol = (audioFrames: number) => (f: number) =>
  Math.max(0, Math.min(1, (f + 1) / 4, (audioFrames - f) / 6));

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

// nền ambient (intro/outro/gap). brand=true -> hiện wordmark mờ dần vào.
const Pad: React.FC<{brand?: boolean}> = ({brand}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={root}>
      <Bg label={BRAND.label} />
      {brand && (
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity: o, textAlign: "center"}}>
          <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 66, letterSpacing: "-0.02em", color: C.text}}>
            Tuấn <span style={{color: C.accent}}>LA</span> Lab
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
  const bedVol = (f: number) => {                 // nhạc nền: fade-in đầu + fade-out cuối theo đường cong
    const inF = Math.round(1.2 * FPS), outF = Math.round(2.0 * FPS);
    let g = 1;
    if (f < inF) g = f / inF; else if (f > total - outF) g = (total - f) / outF;
    g = Math.max(0, Math.min(1, g));
    return BED_VOL * g * g;
  };
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
              <Pad />
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
    </AbsoluteFill>
  );
};

const ShortForm: React.FC<{entry: VideoEntry}> = ({entry}) => {
  const beat00 = entry.beats.find((b) => b.id === "00")!;
  const outroStart = beat00.durationInFrames + SHORT_GAP;          // nghỉ 1 nhịp trước đáp án
  const outroLen = entry.outro.durationInFrames + SHORT_TAIL;      // giữ CTA cuối thêm 1 đoạn
  const total = outroStart + outroLen;
  const bedVol = (f: number) => {                                  // nhạc nền fade-in + fade-out cong
    const inF = Math.round(0.8 * FPS), outF = Math.round(1.6 * FPS);
    let g = 1;
    if (f < inF) g = f / inF; else if (f > total - outF) g = (total - f) / outF;
    g = Math.max(0, Math.min(1, g));
    return BED_VOL * g * g;
  };
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
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
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
