// Shared Lottie animations, referenced from scenes.json via { el: "lottie", name }.
// Tier 1 (đã recolor về brand — xem scripts/recolor_tier1.py; gốc ở assets/lottie/_src/).
// Thêm mới: thả .json vào assets/lottie/ + recolor + thêm 1 dòng ở đây.
import check from "../assets/lottie/check.json";
import cross from "../assets/lottie/cross.json";
import question from "../assets/lottie/question.json";
import idea from "../assets/lottie/idea.json";
import alert from "../assets/lottie/alert.json";
import error from "../assets/lottie/error.json";
import target from "../assets/lottie/target.json";
import search from "../assets/lottie/search.json";
import loading from "../assets/lottie/loading.json";
import progress from "../assets/lottie/progress.json";
import arrowUp from "../assets/lottie/arrow-up.json";
import arrowDown from "../assets/lottie/arrow-down.json";
import subscribe from "../assets/lottie/subscribe.json";
import swipe from "../assets/lottie/swipe.json";

export const LOTTIES: Record<string, unknown> = {
  check,       // tick xanh — "đúng/chốt"
  cross,       // chữ X đỏ — "sai"
  question,    // bong bóng dấu hỏi tím — hook "bắt đầu từ câu hỏi"
  idea,        // bóng đèn vàng — insight
  alert,       // TRÒN + chấm than (cam) — chú ý/cảnh báo nhẹ
  error,       // TAM GIÁC + chấm than (đỏ) — lỗi/nguy hiểm nặng
  target,      // bia tím — KPI/mục tiêu
  search,      // kính lúp — phân tích/soi số
  loading,     // spinner tím — đang xử lý/AI nghĩ (loop)
  progress,    // thanh tiến trình — loading có %
  "arrow-up": arrowUp,     // mũi tên lên xanh — tăng
  "arrow-down": arrowDown, // mũi tên xuống đỏ — giảm
  subscribe,   // nút Subscribe YouTube — outro CTA
  swipe,       // vuốt trái trắng — chuyển cảnh
};
