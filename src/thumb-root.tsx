// Thumbnail compositions. Add a line per video (each needs videos/<slug>/thumb.json).
// Render: npx remotion still src/thumb.ts thumb-<slug> out/<slug>/thumb.png --browser-executable=...
import React from "react";
import {Composition} from "remotion";
import {Thumbnail, ThumbData} from "./thumbnail";
import mnst from "../videos/mot-nguon-su-that/thumb.json";
import {OgCard, OgLogo} from "./og";

const THUMBS: {slug: string; d: ThumbData}[] = [
  {slug: "mot-nguon-su-that", d: mnst as ThumbData},
];

export const ThumbRoot: React.FC = () => (
  <>
    {THUMBS.map((t) => (
      <Composition key={t.slug} id={`thumb-${t.slug}`}
        component={() => <Thumbnail d={t.d} width={1280} height={720} />}
        durationInFrames={1} fps={30} width={1280} height={720} />
    ))}
    <Composition id="og-default" component={OgCard} durationInFrames={1} fps={30} width={1200} height={630} />
    <Composition id="og-logo" component={OgLogo} durationInFrames={1} fps={30} width={512} height={512} />
  </>
);
