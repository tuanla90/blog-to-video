import { useId } from 'react'
import { C, FONT } from '../theme'

/**
 * Logo Semanio — phương án "Balance" (chốt 2026-09-08).
 *
 * Hai bong bóng hội thoại lồng nhau; phần KHÔNG GIAN ÂM giữa chúng đọc thành
 * chữ "S". Khác bản cũ (ô vuông bị khoét hai miếng) ở chỗ đường viền ngoài là
 * hình bong bóng chứ không phải hình vuông, nên chữ S có chỗ thở và đọc được
 * tới cỡ 18px — bản cũ xuống 18px là thành vệt màu.
 *
 * Màu nắn về đúng gradient thương hiệu (#6D5DF6 → #E86FC6), khớp nền video và
 * hồ sơ; file gốc từ Codex dùng #7563ED → #D779CF, lệch nhẹ.
 *
 * progress: [tổng thể, bong bóng trên, bong bóng dưới] 0→1 để animate;
 * mặc định hiện đủ. Giữ nguyên chữ ký cũ để cảnh Intro không phải sửa.
 */
export const LogoMark: React.FC<{
    size?: number
    progress?: [number, number, number]
}> = ({ size = 140, progress = [1, 1, 1] }) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '')
    const [all, b1, b2] = progress
    // pop quanh tâm từng bong bóng
    const pop = (p: number, cx: number, cy: number) =>
        `translate(${cx} ${cy}) scale(${Math.max(p, 0.001)}) translate(${-cx} ${-cy})`
    return (
        <svg width={size} height={size} viewBox="0 0 96 96">
            <defs>
                <linearGradient id={`sGrad${id}`} x1="10" y1="8" x2="88" y2="88" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6D5DF6" />
                    <stop offset="1" stopColor="#E86FC6" />
                </linearGradient>
            </defs>
            <g transform="translate(0 -2)" fill={`url(#sGrad${id})`} opacity={all}>
                {/* Bong bóng trên (câu hỏi) — đuôi mềm phía dưới-trái */}
                <g opacity={b1} transform={pop(b1, 48, 36)}>
                    <path d="M28 8H68C76.6 8 83.9 12.3 86.8 18.5H45C29 18.5 19 25.5 19 36.5C19 47.5 29 54.5 45 54.5H51C60 54.5 64 57 64 59.5C64 62 60 64.5 51 64.5H22C16 64.5 11.4 67.8 6 68.5C4.8 68.7 4.1 67.8 4.9 66.6C7.3 63 8 59.7 8 55V28C8 16.954 16.954 8 28 8Z" />
                </g>
                {/* Bong bóng dưới (trả lời) — đuôi mềm phía trên-phải */}
                <g opacity={b2} transform={pop(b2, 48, 62)}>
                    <path d="M68 88H28C19.4 88 12.1 83.7 9.2 77.5H51C67 77.5 77 70.5 77 59.5C77 48.5 67 41.5 51 41.5H45C36 41.5 32 39 32 36.5C32 34 36 31.5 45 31.5H78C83.523 31.5 88 35.977 88 41.5V78.5C88 83.2 88.7 86.5 91.1 90.1C91.9 91.3 91.2 92.2 90 92C84.6 91.3 80 88 74 88H68Z" />
                </g>
            </g>
        </svg>
    )
}

/**
 * Chữ SEMANIO: "SEMAN" tím, "IO" hồng.
 * Tách màu ở IO có chủ đích — đọc thành cặp 1-0 / input-output của dân tin học.
 */
export const LogoWordmark: React.FC<{
    fontSize?: number
    mode?: 'dark' | 'light'
    opacity?: number
    /** 0→1 cho từng chữ cái, dùng để chạy hiệu ứng gõ dần. Bỏ trống = hiện đủ. */
    letterProgress?: (index: number, total: number) => number
    /** Tên trên hình: 'SEMANIO' (mặc định) hoặc 'SEMANTIX' (bản nội bộ) — 5 chữ đầu tím, phần còn lại hồng. */
    text?: 'SEMANIO' | 'SEMANTIX'
}> = ({ fontSize = 96, mode = 'dark', opacity = 1, letterProgress, text = 'SEMANIO' }) => {
    const letters = text.split('')
    const base = {
        fontFamily: FONT,
        fontSize,
        fontWeight: 800,
        letterSpacing: '0.05em',
        color: mode === 'dark' ? '#FFFFFF' : C.violet,
        opacity,
    } as const

    if (!letterProgress) {
        return (
            <div style={base}>
                SEMAN<span style={{ color: C.pink }}>{text.slice(5)}</span>
            </div>
        )
    }

    return (
        <div style={{ ...base, display: 'flex' }}>
            {letters.map((ch, i) => {
                const p = letterProgress(i, letters.length)
                return (
                    <span
                        key={`${ch}-${i}`}
                        style={{
                            color: i >= 5 ? C.pink : undefined,
                            opacity: p,
                            transform: `translateY(${(1 - p) * 0.16 * fontSize}px)`,
                            display: 'inline-block',
                        }}
                    >
                        {ch}
                    </span>
                )
            })}
        </div>
    )
}
