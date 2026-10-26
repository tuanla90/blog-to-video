/*
 * Nội dung cho video "Tự xây template báo cáo" (STORYBOARD-TEMPLATE.md), bản Semantix · use case
 * báo cáo FATCA gửi NHNN. Toàn bộ dữ liệu khách hàng là MÔ PHỎNG.
 * Đã rút gọn câu chữ ngắn, súc tích để hiển thị cỡ chữ lớn (22–28px), đọc lướt trong 2 giây.
 */

export const BRAND = 'Semantix'
export const BANK = 'NATIONAL CITIZEN COMMERCIAL J.S BANK'
export const GIIN = 'D7LWQT.99999.SL.704'

export type Row = {
    cif: string; ten: string; loai_kh: 'Individual' | 'Entity'; quoc_gia: string; tin: string
    so_tk: string; loai: 'Tài khoản' | 'Tiền gửi' | ''; tien_te: string; so_du: number | null; dong: 'Y' | 'N' | ''
}
const R = (cif: string, ten: string, loai_kh: Row['loai_kh'], quoc_gia: string, tin: string, so_tk: string, loai: Row['loai'], tien_te: string, so_du: number | null, dong: Row['dong']): Row =>
    ({ cif, ten, loai_kh, quoc_gia, tin, so_tk, loai, tien_te, so_du, dong })

/**
 * 5 dòng đại diện (đủ mọi tình huống nghiệp vụ, chữ to dễ đọc ngay trên video):
 *  - Tổ chức (Entity): luôn lên báo cáo
 *  - Cá nhân > 50.000 USD: lên báo cáo (quy đổi VND -> USD)
 *  - Tài khoản tất toán trong năm: Đóng = Y
 *  - Tiền tệ khác (EUR): giữ nguyên, không cộng gộp
 *  - Tổ chức chưa mở tài khoản: vẫn giữ 1 dòng trống số tài khoản
 */
export const REPORT_ROWS: Row[] = [
    R('10200417', 'BLUE HARBOR LLC', 'Entity', 'US', '***6721', '1001004288', 'Tài khoản', 'USD', 182450.0, 'N'),
    R('10201158', 'TRAN THI THU HA', 'Individual', 'US', '***7302', '1001006905', 'Tài khoản', 'USD', 58200.5, 'N'),
    R('10201158', 'TRAN THI THU HA', 'Individual', 'US', '***7302', '2105003019', 'Tiền gửi', 'USD', 20000.0, 'Y'),
    R('10200932', 'NGUYEN MINH KHOA', 'Individual', 'US', '***4415', '2105002881', 'Tiền gửi', 'EUR', 52000.0, 'N'),
    R('10202275', 'MEKONG SEAFOOD JSC', 'Entity', 'US', '***3158', '', '', '', null, ''),
]
export const N_CUSTOMERS = 7
export const TOTAL_REPORT_ROWS = 11

/** Bộ lọc AI ở Cổng Dữ Liệu: ngắn gọn, chữ to. */
export const AI_FILTER_TEXT = 'chỉ lấy khách tổ chức'
/** Điều kiện AI hiểu, viết bằng lời cho người xem (không hiện code). */
/** Dữ liệu và mẫu NHNN ghi Entity / Individual: AI dịch "khách tổ chức" thành Entity (user 24/10: chữ trong điều kiện phải khớp chữ trong file tải). */
export const AI_FILTER_CLAUSES = ['Loại khách hàng = Entity']
export const AI_FILTER_SQL = 'Loại khách hàng = Entity'
export const AI_FILTER_COLS = ['Loại khách hàng', 'Quốc gia', 'Tiền tệ', 'Số dư', 'Đóng trong năm']
export const FILTERED_ROWS = REPORT_ROWS.filter(r => r.loai_kh === 'Entity')

/** Các cột hiển thị trong bảng: rút gọn nhãn để chữ to, thoáng. */
export type Col = { key: string; header: string; w: number; num?: boolean; get: (r: Row) => string }
export const vn2 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const COLS: Col[] = [
    { key: 'ten_ngan_hang', header: 'Ngân hàng', w: 180, get: () => BANK },
    { key: 'giin', header: 'GIIN', w: 180, get: () => GIIN },
    { key: 'cif', header: 'CIF', w: 130, get: r => r.cif },
    { key: 'ten_chu_tai_khoan', header: 'Tên khách hàng', w: 280, get: r => r.ten },
    { key: 'ca_nhan_to_chuc', header: 'Loại KH', w: 140, get: r => r.loai_kh },
    { key: 'quoc_gia', header: 'QG', w: 80, get: r => r.quoc_gia },
    { key: 'tin', header: 'TIN', w: 120, get: r => r.tin },
    { key: 'so_tai_khoan', header: 'Số tài khoản', w: 170, get: r => r.so_tk },
    { key: 'loai', header: 'Loại TK', w: 130, get: r => r.loai },
    { key: 'don_vi_tien_te', header: 'Tiền tệ', w: 100, get: r => r.tien_te },
    { key: 'so_du', header: 'Số dư', w: 170, num: true, get: r => (r.so_du === null ? '' : vn2(r.so_du)) },
    { key: 'dong_trong_nam', header: 'Đóng', w: 96, get: r => r.dong },
]

/** Yêu cầu nghiệp vụ dán vào Agent — cực ngắn gọn, chữ to đọc lướt trong 2 giây. */
export const SPEC: string[] = [
    'Báo cáo FATCA gửi NHNN · Năm 2025',
    '• Chỉ lấy khách thuộc diện FATCA',
    '• Tổ chức lấy hết · Cá nhân > 50.000 USD',
    '• Xuất đủ 12 cột chuẩn NHNN',
]
export const SPEC_TITLE = 'Báo cáo FATCA gửi NHNN · Năm 2025'

/** 4 bước Agent ngắn gọn, chữ lớn dễ đọc, bỏ dòng code SQL rườm rà. */
export const AGENT_STEPS: [string, string, string][] = [
    ['Dùng tiêu chí phòng đã duyệt', 'Thuộc diện FATCA', ''],
    ['Tự lấy đủ dữ liệu', 'Khách hàng · Tài khoản · Tiền gửi', ''],
    ['Quy đổi & lọc ngưỡng', 'Cá nhân > 50.000 USD', ''],
    ['Xuất bảng 12 cột NHNN', '7 khách hàng · 11 dòng', ''],
]

/** Một dòng SQL = các mảnh; `m` đánh dấu mảnh bị AI bỏ (del) / thêm (add). */
export type Seg = { t: string; m?: 'del' | 'add' }
export type SqlLine = Seg[]
const L = (...segs: (string | Seg)[]): SqlLine => segs.map(s => (typeof s === 'string' ? { t: s } : s))
const del = (t: string): Seg => ({ t, m: 'del' })
const add = (t: string): Seg => ({ t, m: 'add' })

/** Câu lệnh Agent đã chạy — 6 dòng ngắn gọn, chữ to 21px. */
export const SQL_RAN: SqlLine[] = [
    L('SELECT cif, customer_name, customer_type,'),
    L('       account_no, currency, so_du, dong_trong_nam'),
    L('FROM v_fatca_report_base'),
    L("WHERE flag_fatca = 'Có'"),
    L("  AND snapshot_date <= DATE '2025-12-31'"),
    L('  AND ty_gia_usd = 26000'),
]

/** So sánh SQL trước và sau khi AI gắn tham số — 4 dòng cực gọn, chữ 21px nhìn rõ ngay. */
export const SQL_BEFORE: SqlLine[] = [
    L("WHERE flag_fatca = 'Có'"),
    L('  AND snapshot_date <= ', del("DATE '2025-12-31'")),
    L('  AND so_du_vnd / ', del('26000'), ' > 50000'),
    L('  AND report_year = ', del('2025')),
]
export const SQL_AFTER: SqlLine[] = [
    L("WHERE flag_fatca = 'Có'"),
    L('  AND snapshot_date <= ', add('DATE(@nam_bao_cao, 12, 31)')),
    L('  AND so_du_vnd / ', add('@ty_gia'), ' > 50000'),
    L('  AND report_year = ', add('@nam_bao_cao')),
]

export const AI_PREFILL = 'Biến các giá trị cố định (năm, tỷ giá) thành ô nhập cho người dùng chọn'
export const AI_EXTRA = 'Năm báo cáo mặc định 2025, Tỷ giá USD/VND mặc định 26.000'

export type Param = { id: string; label: string; kind: string; detail: string; manual?: boolean }
export const PARAMS: Param[] = [
    { id: 'nam_bao_cao', label: 'Năm báo cáo', kind: 'Số', detail: 'mặc định 2025' },
    { id: 'ty_gia', label: 'Tỷ giá USD/VND', kind: 'Số', detail: 'mặc định 26.000' },
    { id: 'dieu_kien', label: 'Điều kiện lọc', kind: 'Gõ bằng lời', detail: 'chỉ trên cột được phép', manual: true },
]

export const TEMPLATE_NAME = 'Báo cáo FATCA gửi NHNN'
export const REPORT_TITLE_TPL = 'BÁO CÁO FATCA NĂM {nam_bao_cao}'
export const REPORT_TITLE = 'BÁO CÁO FATCA NĂM 2025'
export const REPORT_NOTE_TPL = 'Tỷ giá: {ty_gia} · Người lập: {user} · Ngày xuất: {today}'
export const REPORT_NOTE = 'Tỷ giá: 26000 · Người lập: Nguyễn Thị Lan · Ngày xuất: 23/10/2026'
export const FILE_NAME = 'Bao_cao_FATCA_2025.xlsx'

export const EMAIL = 'lan.nguyen@example.com'
export const SCHEDULE_ASK = `8 giờ ngày 15/1 hằng năm gửi báo cáo này vào ${EMAIL}`
export const ROUTINE_NAME = 'Báo cáo FATCA hằng năm'
export const ROUTINE_CRON = '0 8 15 1 *'
export const ROUTINE_MSG = [
    'Báo cáo FATCA năm 2026 đã chạy xong theo mẫu chuẩn',
    'File Excel 12 cột đính kèm ngay bên dưới',
]

/** Kịch bản Chuẩn hoá ngữ nghĩa (Standardized Dimension / Metric) — ngắn gọn, chữ lớn. */
export const SEM_DIM_NAME = 'Thuộc diện FATCA'
export const SEM_BIZ_DEF = 'Khi bản ghi còn hiệu lực và quốc gia là Mỹ (US) thì để là Có'
export const SEM_SQL_INIT = "CASE WHEN expiry_date IS NULL AND fatca_country = 'US' THEN 'Có' ELSE 'Không' END"
export const SEM_TEST_PROMPT = 'Liệt kê khách hàng thuộc diện FATCA'

export type SemCaseRow = { cif: string; ten: string; quoc_gia: string; het_hl: string; flag: 'Có' }
export const SEM_TEST_ROWS: SemCaseRow[] = [
    { cif: '10200417', ten: 'BLUE HARBOR LLC', quoc_gia: 'US', het_hl: 'NULL (Còn HL)', flag: 'Có' },
    { cif: '10200932', ten: 'NGUYEN MINH KHOA', quoc_gia: 'US', het_hl: 'NULL (Còn HL)', flag: 'Có' },
    { cif: '10201158', ten: 'TRAN THI THU HA', quoc_gia: 'US', het_hl: 'NULL (Còn HL)', flag: 'Có' },
]

export const SEM_EDGE_CASES: { title: string; code: string }[] = [
    { title: 'Loại bản ghi đảo bút toán', code: "record_status <> 'REVE'" },
    { title: 'Lấy bản ghi hiệu lực mới nhất mỗi KH', code: 'ROW_NUMBER() theo ngày hiệu lực = 1' },
]
