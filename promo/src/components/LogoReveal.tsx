import { useId } from 'react'
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

/**
 * Logo Semanio dựng dần — bản animation từ Codex (2026-09-08), đưa vào Remotion.
 *
 * Ba nhịp:
 *   1. Bong bóng trên (câu hỏi) nảy vào  — spring từ frame `delay`
 *   2. Bong bóng dưới (trả lời) nảy vào  — spring từ frame `delay + 16`
 *   3. Một nét chữ S chạy dọc đường cong gọt khe âm bản — frame 35 → 75
 *   4. Từ frame 75 trở đi: đổi sang đúng 2 path của logo chuẩn, để frame cuối
 *      trùng khít `docs/dfl2026-img/logo-semanio-mark.svg` (giai đoạn gọt dùng
 *      khối bong bóng VẼ KÍN + mask, hình hơi khác bản chuẩn vài pixel).
 *
 * Màu lấy từ gradient thương hiệu #6D5DF6 → #E86FC6. id của gradient và mask
 * sinh theo useId — cùng một trang có nhiều bản vẽ vẫn không đè nhau.
 */
export const LogoReveal: React.FC<{
    size?: number
    delay?: number
    startColor?: string
    endColor?: string
}> = ({ size = 170, delay = 0, startColor = '#6D5DF6', endColor = '#E86FC6' }) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
    const gradId = `reveal-grad-${uid}`
    const maskId = `reveal-mask-${uid}`

    const { fps } = useVideoConfig()
    const frame = useCurrentFrame() - delay

    const springCfg = { damping: 12, stiffness: 100, mass: 0.8 }
    const bubble1 = spring({ frame, fps, config: springCfg })
    const bubble2 = spring({ frame: frame - 16, fps, config: springCfg })

    // Chiều dài THẬT của đường cong dao gọt, đo bằng path.getTotalLength() trong
    // viewBox 96×96. Bản Codex ghi 175 — thiếu 11,6 đơn vị so với thực tế, nên
    // dasharray lặp lại và để lọt một đoạn nét ở CUỐI đường: từ frame 0 đã thấy
    // một vệt trắng bo tròn nằm ở đuôi chữ S phía dưới-trái. Phải khớp đúng.
    const S_PATH_LENGTH = 186.63
    // Nhịp dao gọt: chậm ở đầu, nhanh ở giữa, ghìm lại ở cuối. Bản HTML gốc dùng
    // easeInOutCubic; bản port sang Remotion để trôi tuyến tính nên nét chạy đều
    // đều như máy — trả lại đúng easing.
    const cutOffset = interpolate(frame, [35, 75], [S_PATH_LENGTH, 0], {
        easing: Easing.inOut(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    })
    const carved = frame >= 75

    const popIn = (s: number) => ({
        transform: `scale(${Math.max(s, 0.001)})`,
        opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
    })

    return (
        <svg width={size} height={size} viewBox="0 0 96 96" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={gradId} x1="10" y1="8" x2="88" y2="88" gradientUnits="userSpaceOnUse">
                    <stop stopColor={startColor} />
                    <stop offset="1" stopColor={endColor} />
                </linearGradient>
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96">
                    <rect width="96" height="96" fill="white" />
                    <path
                        d="M85 25 H45 C32 25 25.5 30 25.5 36.5 C25.5 43 32 48 45 48 H51 C64 48 70.5 53 70.5 59.5 C70.5 66 64 71 51 71 H11"
                        fill="none"
                        stroke="black"
                        strokeWidth={13}
                        strokeLinecap="round"
                        strokeDasharray={S_PATH_LENGTH}
                        strokeDashoffset={cutOffset}
                    />
                </mask>
            </defs>

            <g transform="translate(0 -2)">
                {carved ? (
                    <g fill={`url(#${gradId})`}>
                        <path d="M28 8H68C76.6 8 83.9 12.3 86.8 18.5H45C29 18.5 19 25.5 19 36.5C19 47.5 29 54.5 45 54.5H51C60 54.5 64 57 64 59.5C64 62 60 64.5 51 64.5H22C16 64.5 11.4 67.8 6 68.5C4.8 68.7 4.1 67.8 4.9 66.6C7.3 63 8 59.7 8 55V28C8 16.954 16.954 8 28 8Z" />
                        <path d="M68 88H28C19.4 88 12.1 83.7 9.2 77.5H51C67 77.5 77 70.5 77 59.5C77 48.5 67 41.5 51 41.5H45C36 41.5 32 39 32 36.5C32 34 36 31.5 45 31.5H78C83.523 31.5 88 35.977 88 41.5V78.5C88 83.2 88.7 86.5 91.1 90.1C91.9 91.3 91.2 92.2 90 92C84.6 91.3 80 88 74 88H68Z" />
                    </g>
                ) : (
                    <g mask={`url(#${maskId})`}>
                        <g style={{ transformOrigin: '28px 28px', ...popIn(bubble1) }}>
                            <path
                                d="M28 8 H68 C79 8 88 17 88 28 V48 C88 57 79 64.5 68 64.5 H22 C16 64.5 11.4 67.8 6 68.5 C4.8 68.7 4.1 67.8 4.9 66.6 C7.3 63 8 59.7 8 55 V28 C8 16.954 16.954 8 28 8 Z"
                                fill={`url(#${gradId})`}
                            />
                        </g>
                        <g style={{ transformOrigin: '68px 68px', ...popIn(bubble2) }}>
                            <path
                                d="M68 88 H28 C17 88 8 79 8 68 V48 C8 39 17 31.5 28 31.5 H74 C81.7 31.5 88 37.8 88 45.5 V78.5 C88 83.2 88.7 86.5 91.1 90.1 C91.9 91.3 91.2 92.2 90 92 C84.6 91.3 80 88 74 88 H68 Z"
                                fill={`url(#${gradId})`}
                            />
                        </g>
                    </g>
                )}
            </g>
        </svg>
    )
}
