import { loadFont } from '@remotion/google-fonts/BeVietnamPro'

const { fontFamily } = loadFont('normal', {
    weights: ['400', '500', '600', '700', '800'],
    subsets: ['latin', 'vietnamese'],
})

export const FONT = fontFamily

// Hệ màu theo gradient logo #6D5DF6 (indigo) → #E86FC6 (hồng), 2026-09-06.
// Giữ nguyên TÊN key (navy = primary, gold = accent) để không phải sửa các scene.
/**
 * Nền thương hiệu — ĐO TỪ FOOTAGE quay màn hình (canh-2.mp4): góc trái-trên
 * #6C5BF6, góc phải-dưới #E86EC5, chuyển 135°. Mọi phân cảnh Remotion dùng
 * đúng nền này để cắt qua lại với cảnh quay thật không bị "đổi tông".
 */
export const BRAND_BG = 'linear-gradient(135deg, #6D5DF6 0%, #E86FC6 100%)'

export const C = {
    navy: '#4B3BD3',      // indigo chính (chữ/khung trên nền sáng)
    navyDeep: '#221A66',  // indigo sẫm (nền intro/outro/log)
    violet: '#6D5DF6',    // đầu gradient — điểm nhấn sáng
    pink: '#E86FC6',      // cuối gradient
    ink: '#232039',
    steel: '#66628C',
    wash: '#F2F1FC',
    paper: '#FFFFFF',
    gold: '#D857B0',      // accent hồng (thay vàng): badge, focal, IX
    goldBg: '#FBEEF7',
    emerald: '#0E7A5F',
    red: '#C0392B',
    rule: '#D8D5F0',
}
