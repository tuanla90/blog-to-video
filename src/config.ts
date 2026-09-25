// Cấu hình engine — mọi thứ RIÊNG của một kênh/dự án nằm ở đây, không nằm trong code kit.
//
// Repo tiêu dùng viết `video.config.json`, rồi ở entry Remotion gọi:
//     import cfg from "../video.config.json";
//     applyConfig(cfg);
//
// Vì sao là singleton mutable chứ không phải prop truyền xuống: `ui.tsx` dựng bảng màu `C`
// ở module scope và ~1400 dòng kit đọc `C.accent` khắp nơi. Mutate tại chỗ + getter lười
// trong `ui.tsx` giữ nguyên mọi call-site, không phải thread config qua từng component.
// Điều kiện: applyConfig phải chạy TRƯỚC lúc render (đúng vậy — nó chạy ở entry, trước registerRoot).

export type BrandConfig = {
  /** tên kênh, hiện trên thumbnail */
  name: string;
  /** nhãn góc trên-trái mọi frame (channel bug) */
  label: string;
  /** chữ ký góc dưới-phải mọi frame */
  sig: string;
  /** màu chính — dùng cho accent, progress bar, icon */
  accent: string;
  /** accent phụ, nhạt hơn (data bubble, đuôi gradient) */
  bubble: string;
  /** wordmark ở scene intro/outro: pre + [em tô accent] + post */
  wordmark: {pre: string; em: string; post: string};
  /** dòng nhỏ dưới wordmark */
  tagline: string;
};

export type AudioConfig = {
  /** nhạc nền, đường dẫn trong public/. null = không có nhạc nền */
  bed: string | null;
  /** âm lượng nhạc nền khi đã duck xuống dưới giọng */
  bedVolume: number;
  /** thư mục sfx trong public/ */
  sfxDir: string;
  /** file whoosh lúc chuyển section (trong sfxDir). null = tắt */
  whoosh: string | null;
};

/** nhịp thở của video, tính bằng GIÂY (engine đổi ra frame theo fps) */
export type PacingConfig = {
  /** trước beat đầu */
  introPad: number;
  /** giữa 2 beat */
  sectionGap: number;
  /** giữa 2 beat thường: "gap" = khoảng nền sectionGap (mặc định) · "cut" = cắt thẳng, không nền, không whoosh */
  between?: "gap" | "cut";
  /** thẻ chương (beat có `chapter` trong scenes.json): bao lâu, tính cả đoạn tối dần */
  chapterGap?: number;
  /** sau beat cuối — chỗ đặt logo, nhạc fade hẳn */
  outroPad: number;
  /** Short: nghỉ giữa cliffhanger và đáp án */
  shortGap: number;
  /** Short: giữ CTA cuối, tránh cắt tiếng cộc */
  shortTail: number;
  /** khoảng thở sau chuyển cảnh trước khi giọng vào lại */
  leadIn: number;
  /** whoosh vào sớm bao lâu để đỉnh sóng trùng nhát cắt */
  whooshLead: number;
};

export type ThumbConfig = {
  /** ảnh người dẫn đã tách nền, đường dẫn trong public/ */
  person: string;
  /** logo (svg/png) trong public/ */
  logo: string;
  /** logo bản trắng dùng trên nền tím */
  logoWhite: string;
};

export type CategoryConfig = {
  name: string;
  /** màu chữ nhấn */
  accT: string;
  /** màu chính */
  acc: string;
  /** màu phụ (gradient) */
  acc2: string;
};

/** chữ trên hình: một video chỉ mang MỘT lớp chữ (YouTube multi-audio chỉ đổi track giọng). Chữ khai
 *  dạng {vi, en} trong scenes.json thì engine chọn theo lang. */
export type TextConfig = {lang: string};
/** mực của trang sổ (element notepage): ink = mực chính, accent = màu nhấn (đường năng lượng, ngưỡng) */
export type NotebookConfig = {ink?: string; accent?: string};

export type VideoConfig = {
  fps: number;
  brand: BrandConfig;
  audio: AudioConfig;
  pacing: PacingConfig;
  thumb: ThumbConfig;
  categories: CategoryConfig[];
  text?: TextConfig;
  notebook?: NotebookConfig;
};

export const CONFIG: VideoConfig = {
  fps: 30,
  brand: {
    name: "Kênh của bạn",
    label: "KÊNH CỦA BẠN",
    sig: "Kênh của bạn",
    accent: "#783ABF",
    bubble: "#C4B5FD",
    wordmark: {pre: "Kênh ", em: "của", post: " bạn"},
    tagline: "MÔ TẢ NGẮN CỦA KÊNH",
  },
  audio: {
    bed: null,
    bedVolume: 0.15,
    sfxDir: "audio/sfx",
    whoosh: "whoosh.wav",
  },
  pacing: {
    introPad: 2.2,
    sectionGap: 0.8,
    between: "gap",
    chapterGap: 2.2,
    outroPad: 4.5,
    shortGap: 0.33,
    shortTail: 1.2,
    leadIn: 0.4,
    whooshLead: 0.89,
  },
  thumb: {
    person: "thumb/person.png",
    logo: "thumb/logo.svg",
    logoWhite: "thumb/logo-white.png",
  },
  categories: [],
  text: {lang: "vi"},
  notebook: {},
};

/** alias tiện tay — CÙNG object với CONFIG.brand, giữ nguyên reference sau applyConfig */
export const BRAND = CONFIG.brand;

type DeepPartial<T> = {[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]};

/** merge tại chỗ (giữ reference) — mảng thì thay hẳn, object thì merge sâu */
const mergeInto = (target: any, patch: any) => {
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (v === undefined) continue;
    if (v !== null && typeof v === "object" && !Array.isArray(v) && typeof target[k] === "object" && target[k] !== null) {
      mergeInto(target[k], v);
    } else {
      target[k] = v;
    }
  }
};

export const applyConfig = (patch: DeepPartial<VideoConfig>) => {
  mergeInto(CONFIG, patch);
  return CONFIG;
};

/** giây -> frame theo fps đang cấu hình */
export const sec = (s: number) => Math.round(s * CONFIG.fps);
