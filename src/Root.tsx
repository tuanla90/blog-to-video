import React from "react";
import {Composition, Sequence, Audio, AbsoluteFill, staticFile} from "remotion";
import beats from "./beats.json";
import outro from "./outro.json";
import {SCENES, OutroShort} from "./scenes";
import {Caption} from "./Caption";
import {C, INTER} from "./ui";

const FPS = 30;
const total = beats.reduce((s, b) => s + b.durationInFrames, 0);
const beat00 = beats.find((b) => b.id === "00")!;
const shortTotal = beat00.durationInFrames + outro.durationInFrames;

const root = {background: C.bg, fontFamily: INTER};

const LongForm: React.FC = () => {
  let off = 0;
  return (
    <AbsoluteFill style={root}>
      {beats.map((b) => {
        const from = off;
        off += b.durationInFrames;
        const Scene = SCENES[b.id];
        return (
          <Sequence key={b.id} from={from} durationInFrames={b.durationInFrames}>
            <Audio src={staticFile(b.audio)} />
            <Scene />
            <Caption id={b.id} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Short: React.FC = () => {
  const Scene = SCENES["00"];
  return (
    <AbsoluteFill style={root}>
      <Sequence durationInFrames={beat00.durationInFrames}>
        <Audio src={staticFile(beat00.audio)} />
        <Scene />
        <Caption id="00" />
      </Sequence>
      <Sequence from={beat00.durationInFrames} durationInFrames={outro.durationInFrames}>
        <Audio src={staticFile(outro.audio)} />
        <OutroShort />
        <Caption id="short-outro" />
      </Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LongForm" component={LongForm} durationInFrames={total}
      fps={FPS} width={1920} height={1080} />
    <Composition id="Short" component={Short} durationInFrames={shortTotal}
      fps={FPS} width={1080} height={1920} />
  </>
);
