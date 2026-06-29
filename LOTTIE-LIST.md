# Lottie shopping list — animation cần tải cho video

Suy ra từ nội dung 151 bài blog (6 danh mục). Tải dần theo Tier (1 = ưu tiên cao nhất).

## Chuẩn bị / quy ước (đọc trước khi tải)
- **Nguồn**: [lottiefiles.com](https://lottiefiles.com) (lọc **Free**) là chính. Dự phòng cùng-style: **Lordicon**, IconScout.
- **Định dạng**: tải **Lottie JSON** (`.json`) — KHÔNG `.lottie`/dotLottie (file zip). Kit đọc `animationData` JSON thuần. Nền trong suốt.
- **ĐỒNG BỘ STYLE là quan trọng nhất** (tránh lỗi "vẽ xấu/loạn"): chọn **1 phong cách duy nhất** (khuyên: line/outline mảnh) + ưu tiên animation **1 màu hoặc đổi màu được** để recolor về **trắng / tím brand** trên nền tối. Đừng trộn flat-3D + cartoon + line. Mẹo: lấy nguyên 1 "pack" cùng tác giả, hoặc dùng Lordicon (cùng hệ).
- **loop**: `false` cho hầu hết (chơi 1 lần lúc reveal); `true` chỉ cho loading/ambient.
- **Tích hợp**: bỏ vào `public/lottie/<tên>.json` → khai báo trong `src/lotties.ts` (key = tên) → dùng `{el:"lottie", name:"<tên>", at, size, loop}`. `check.json` ĐÃ có.

---

## Tier 1 — Bắt buộc (xài gần như MỌI video) · ~12 cái
| tên file | keyword search (EN) | dùng cho | loop |
|---|---|---|---|
| `check` ✓ (đã có) | success check tick | "đúng", xác nhận | no |
| `cross` | error cross wrong x | "sai", "bẫy" | no |
| `question` | question mark | "bắt đầu từ câu hỏi", hook | no |
| `idea` | lightbulb idea | insight, khoảnh khắc "à há" | no |
| `alert` | warning alert / notification bell | cảnh báo KPI, anomaly, tồn kho về 0 | no |
| `target` | target goal bullseye | KPI, mục tiêu | no |
| `search` | magnifying glass search | phân tích, "soi số" | no |
| `loading` | loading dots spinner | đang xử lý / AI đang nghĩ | **loop** |
| `arrow-up` | growth trend arrow up | tăng trưởng, doanh thu lên | no |
| `arrow-down` | decline trend arrow down | giảm, churn, rò rỉ | no |
| `subscribe` | youtube subscribe bell | outro CTA | no |
| `swipe` | swipe / transition wipe | chuyển cảnh | no |

## Tier 2A — Họ biểu đồ (52 bài Phân tích + dashboard)
| tên | keyword | dùng cho |
|---|---|---|
| `chart-line` | line chart growth animated | xu hướng, time series, MoM/YoY |
| `chart-bar` | bar chart grow | so sánh, doanh thu theo kênh |
| `chart-pie` | pie / donut chart | cơ cấu (lưu ý: blog dạy hạn chế pie) |
| `funnel` | sales funnel | Funnel/AARRR, phễu rò |
| `gauge` | speedometer gauge | KPI đạt %, mục tiêu |
| `scatter` | scatter plot dots | tương quan, hồi quy |
| `dashboard` | analytics dashboard | BI, "có dashboard" |
| `spreadsheet` | spreadsheet excel table | Excel/Sheets, "tám file Excel" |

## Tier 2B — Họ hạ tầng dữ liệu (45 bài Nền tảng)
| tên | keyword | dùng cho |
|---|---|---|
| `database` | database server stack | warehouse, OLAP, OLTP |
| `cloud` | cloud data upload | cloud vs on-prem |
| `pipeline` | data pipeline flow | ETL/ELT, Text2SQL "dây chuyền" |
| `gears` | gears processing cog | xử lý, tự động hoá |
| `filter` | filter funnel | lọc, schema linking |
| `sync` | sync refresh loop | realtime, đồng bộ, "dữ liệu luôn mới" |
| `lock` | lock shield security | RLS, governance, bảo vệ data cá nhân |
| `network` | network nodes connect | semantic layer, quan hệ bảng |
| `folder` | folder files documents | data catalog, data mart |
| `merge` | merge combine arrows | hợp nhất đa kênh, gộp trùng |

## Tier 2C — Họ AI (9 bài AI + nhiều bài có AI)
| tên | keyword | dùng cho |
|---|---|---|
| `robot` | ai robot assistant | AI BI, text-to-SQL |
| `brain` | ai brain thinking | suy luận, RAG |
| `chat` | chat bubbles conversation | dual-agent, "AI hỏi lại" |
| `sparkles` | ai sparkles magic | AI generate, gợi ý |
| `typing` | typing text cursor | text-to-SQL, viết câu hỏi |

## Tier 2D — Họ kinh doanh / con người (use case, metric)
| tên | keyword | dùng cho |
|---|---|---|
| `people` | team people users | cohort, segmentation, RFM |
| `money` | money coins revenue | doanh thu, dòng tiền, lợi nhuận |
| `cart` | shopping cart | giỏ bỏ quên, e-commerce |
| `clock` | clock time calendar | time series, seasonality, "11h đêm" |
| `store` | shop store building | chuỗi F&B, đa kênh |
| `notification` | message notification phone | báo cáo Telegram/Zalo, alert |
| `balance` | scale balance compare | so sánh, build-vs-buy, tradeoff |

## Tier 3 — Ẩn dụ tạo điểm nhấn (tuỳ chọn)
`maze` (lạc lối) · `iceberg` (ẩn/vanity metric) · `magnet` (giữ chân/retention) · `puzzle` (ghép mảnh) · `rocket` hoặc `plant-growth` (tăng trưởng) · `warning-triangle` (thiên kiến/bẫy) · `branching` (phân nhóm/cây quyết định) · `key` (chìa khoá dữ liệu) · `handshake` (quyết định).

---
**Bắt đầu từ Tier 1** (12 cái) là đủ làm vài video; thêm 2A/2B khi làm bài phân tích/hạ tầng. Tải xong cứ quăng folder cho mình map vào `lotties.ts`.
