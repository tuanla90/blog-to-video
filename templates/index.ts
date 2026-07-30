// Entry Remotion của dự án. Chạy `npx blog2video registry` để sinh ./videos.gen.ts trước.
import {registerRoot} from "remotion";
import {applyConfig, makeRoot} from "blog2video/root";
import {VIDEOS} from "./videos.gen";
import cfg from "../video.config.json";

applyConfig(cfg as any);          // PHẢI gọi trước registerRoot — brand/nhịp/nhạc lấy từ đây
registerRoot(makeRoot(VIDEOS));
