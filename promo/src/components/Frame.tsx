import { AbsoluteFill } from 'remotion'
import { BRAND_BG, C } from '../theme'

/**
 * Khung chuẩn của video: nền gradient thương hiệu + một "thẻ" bo góc nổi ở giữa.
 *
 * Đây chính là bố cục của cảnh quay màn hình (cửa sổ ứng dụng trắng nổi trên nền
 * gradient tím→hồng), nên phân cảnh dựng và phân cảnh quay thật cắt qua lại
 * thành một mạch. Lề lấy theo tỷ lệ đo được từ footage (≈5% ngang).
 *
 * Chữ nằm TRONG thẻ, không đặt thẳng lên gradient: trắng trên đầu hồng của
 * gradient chỉ đạt ~2,4:1 — không đọc nổi trên màn chiếu.
 */
export const GradientFrame: React.FC<{
    children: React.ReactNode
    /** Nền thẻ — để C.wash khi nội dung tự vẽ mask nền cùng màu (sơ đồ). */
    cardBg?: string
    padX?: number
    padY?: number
}> = ({ children, cardBg = '#FFFFFF', padX = 96, padY = 84 }) => (
    <AbsoluteFill style={{ background: BRAND_BG }}>
        <AbsoluteFill style={{ padding: `${padY}px ${padX}px` }}>
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 26,
                    background: cardBg,
                    boxShadow: `0 42px 96px rgba(34,26,102,0.30)`,
                    overflow: 'hidden',
                }}
            >
                {children}
            </div>
        </AbsoluteFill>
    </AbsoluteFill>
)

/** Màu chữ phụ trên thẻ sáng (thay #BFD3E6 của thời nền navy). */
export const SUBTLE = C.steel
