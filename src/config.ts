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

/** một nhân vật trong Short đối đáp (duo) */
export type CastMember = {
  /** tên hiện trên bong bóng thoại */
  name: string;
  /** màu nhận diện: viền bong bóng, huy hiệu chọn đáp án */
  color: string;
  side: "left" | "right";
  /** thư mục ảnh biểu cảm trong public/, mỗi biểu cảm một file <tên>.png */
  dir: string;
  /** các biểu cảm có thật trong dir */
  faces: string[];
  /** biểu cảm thiếu -> biểu cảm gần nghĩa (gọi tên nào cũng ra ảnh có thật) */
  alias?: Record<string, string>;
  /** biểu cảm mặc định khi chưa có lệnh nào */
  idle?: string;
  /** giọng — chỉ gen_duo.py đọc: {provider: "edge"|"google", voice, rate, pitch} */
  voice?: Record<string, any>;
};

/** Short đối đáp: hai nhân vật thay nhau nói, xem src/duo.tsx */
export type DuoConfig = {
  /** tên series trên huy hiệu góc trên, vd "BẪY ĐỀ THI" */
  series: string;
  /** chữ ký / tên miền ở góc trên-phải */
  handle: string;
  /** nghỉ giữa hai câu thoại (giây) */
  gap: number;
  /** trước câu đầu */
  introPad: number;
  /** giữ khung cuối */
  outroPad: number;
  cast: Record<string, CastMember>;
};

export type VideoConfig = {
  fps: number;
  brand: BrandConfig;
  audio: AudioConfig;
  pacing: PacingConfig;
  thumb: ThumbConfig;
  categories: CategoryConfig[];
  duo: DuoConfig;
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
  duo: {
    series: "",
    handle: "",
    gap: 0.06,
    introPad: 0.1,
    outroPad: 1.2,
    cast: {},
  },
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
