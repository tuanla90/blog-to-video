import { createContext, useContext } from 'react'
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, FONT } from '../theme'

/**
 * Bộ khung cho bản promo KHÔNG GIỌNG (kiểu Holistics): chữ to vào TRƯỚC, animation
 * giao diện chạy theo ngay. Bản "năng lượng" (2026-09-11): chữ đập vào có nảy,
 * nền có lưới trôi + tia sáng, rung khung ở nhịp nhấn, tia bung ở chữ nhấn.
 */
export const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
export const ease = (f: number, [a, b]: [number, number], [x, y]: [number, number], e = Easing.out(Easing.cubic)) =>
    interpolate(f, [a, b], [x, y], { ...CLAMP, easing: e })

export const INK = '#1B1838'

/** 'general' = bản giới thiệu sản phẩm; 'dfl' = bản nộp Data for Life 2026; 'internal' = bản nội bộ (đổi tên thương hiệu, link, nhãn dữ liệu mô phỏng). */
export type Edition = 'general' | 'dfl' | 'internal'
export const EditionCtx = createContext<Edition>('general')
export const useEdition = () => useContext(EditionCtx)
/** Chương nền tối (AI Agent → xuất trình chiếu): Stage/Headline/nhãn tự đổi màu theo. */
export const DarkCtx = createContext(false)
export const useDark = () => useContext(DarkCtx)
/** Chữ nhấn: gradient thương hiệu tím → hồng (rộng gấp đôi để quét ánh sáng). */
export const ACCENT_TEXT: React.CSSProperties = {
    backgroundImage: 'linear-gradient(90deg, #6D5DF6 0%, #B45FD8 30%, #E86FC6 50%, #B45FD8 70%, #6D5DF6 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
}

/**
 * Nền: sáng (mặc định) hoặc tối (`dark`) để đổi nhịp giữa các cảnh. Hai mảng màu
 * trôi, lưới chéo trôi đều, một vệt sáng quét ngang định kỳ.
 */
export const Stage: React.FC<{ children?: React.ReactNode; dark?: boolean }> = ({ children, dark: darkProp }) => {
    const f = useCurrentFrame()
    const ctxDark = useDark()
    const dark = darkProp ?? ctxDark
    const d = Math.sin(f / 45) * 70
    const sweep = ((f % 150) / 150) * 3200 - 900
    return (
        <AbsoluteFill style={{ background: dark ? '#120E33' : '#F7F6FE', fontFamily: FONT, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', width: 1300, height: 1300, left: -420 + d, top: -620 + d * 0.4, borderRadius: '50%',
                background: `radial-gradient(circle, rgba(109,93,246,${dark ? 0.55 : 0.32}) 0%, rgba(109,93,246,0) 65%)`,
            }} />
            <div style={{
                position: 'absolute', width: 1400, height: 1400, right: -520 - d, bottom: -760 - d * 0.3, borderRadius: '50%',
                background: `radial-gradient(circle, rgba(232,111,198,${dark ? 0.45 : 0.28}) 0%, rgba(232,111,198,0) 65%)`,
            }} />
            {/* lưới trôi */}
            <div style={{
                position: 'absolute', inset: -200,
                backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,0.05)' : 'rgba(75,59,211,0.06)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(75,59,211,0.06)'} 1px, transparent 1px)`,
                backgroundSize: '80px 80px', transform: `translate(${(f * 1.2) % 80}px, ${(f * 0.6) % 80}px)`,
                maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
            }} />
            {/* vệt sáng quét */}
            <div style={{
                position: 'absolute', top: -300, left: sweep, width: 260, height: 1700, transform: 'rotate(18deg)',
                background: `linear-gradient(90deg, transparent, ${dark ? 'rgba(180,160,255,0.10)' : 'rgba(255,255,255,0.55)'}, transparent)`,
            }} />
            {children}
        </AbsoluteFill>
    )
}

/**
 * Tiêu đề chữ to: từng từ ĐẬP vào (to → vừa, có nảy, mờ → nét), cách nhau 2 khung.
 * `accent` = các từ tô gradient (có vệt sáng quét). `out` = khung bắt đầu rút.
 */
export const Headline: React.FC<{
    text: string
    at: number
    out?: number
    accent?: string[]
    size?: number
    top?: number
    align?: 'center' | 'left'
    left?: number
    width?: number
    color?: string
}> = ({ text, at, out, accent = [], size = 112, top = 80, align = 'center', left = 0, width = 1920, color: colorProp }) => {
    const f = useCurrentFrame()
    const ctxDark = useDark()
    const color = colorProp ?? (ctxDark ? '#FFFFFF' : INK)
    const { fps } = useVideoConfig()
    if (f < at - 1 || (out !== undefined && f > out + 10)) return null
    const words = text.split(' ')
    const leave = out === undefined ? 0 : ease(f, [out, out + 8], [0, 1], Easing.in(Easing.cubic))
    return (
        <div style={{
            position: 'absolute', top, left, width, display: 'flex', flexWrap: 'wrap',
            justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.26}px`,
            padding: align === 'center' ? '0 120px' : 0, boxSizing: 'border-box',
            fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', color,
            opacity: 1 - leave, transform: `translateY(${-leave * 60}px) scale(${1 - leave * 0.06})`, filter: `blur(${leave * 12}px)`,
        }}>
            {words.map((w, i) => {
                const p = spring({ frame: f - at - i * 2, fps, config: { damping: 11, stiffness: 190, mass: 0.6 } })
                const bare = (s: string) => s.replace(/[.,?!:—]/g, '')
                const isAccent = accent.some(a => a.split(' ').map(bare).includes(bare(w)))
                const shine = isAccent ? interpolate(f - at - i * 2, [8, 40], [100, -100], CLAMP) : 0
                return (
                    <span key={i} style={{
                        display: 'inline-block', opacity: Math.min(1, p * 2.2),
                        transform: `translateY(${(1 - p) * size * 0.3}px) scale(${1 + (1 - p) * 0.55})`,
                        filter: `blur(${Math.max(0, 1 - p) * 14}px)`, ...(isAccent ? { ...ACCENT_TEXT, backgroundPosition: `${shine}% 0` } : {}),
                        paddingBottom: size * 0.08,
                    }}>
                        {w}
                    </span>
                )
            })}
        </div>
    )
}

/** Rung khung ngắn sau mỗi mốc `hits` (khung trong cảnh) — dùng ở nhịp nhấn. */
export const Shake: React.FC<{ hits: number[]; amp?: number; len?: number; children: React.ReactNode }> = ({ hits, amp = 14, len = 12, children }) => {
    const f = useCurrentFrame()
    const h = hits.filter(t => f >= t && f < t + len).pop()
    let x = 0, y = 0
    if (h !== undefined) {
        const k = 1 - (f - h) / len
        x = (random(`sx${f}`) - 0.5) * 2 * amp * k
        y = (random(`sy${f}`) - 0.5) * 2 * amp * k
    }
    return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }}>{children}</AbsoluteFill>
}

/** Tia bung toả từ (x, y) tại khung `at`. */
export const Burst: React.FC<{ at: number; x: number; y: number; color?: string; rays?: number; r?: number }> = ({ at, x, y, color = '#B45FD8', rays = 12, r = 170 }) => {
    const f = useCurrentFrame()
    const p = ease(f, [at, at + 16], [0, 1])
    if (f < at || f > at + 18) return null
    return (
        <svg style={{ position: 'absolute', left: x - r * 1.4, top: y - r * 1.4, width: r * 2.8, height: r * 2.8, overflow: 'visible', pointerEvents: 'none' }}>
            {Array.from({ length: rays }, (_, i) => {
                const a = (i / rays) * Math.PI * 2 + 0.2
                const r0 = r * (0.35 + 0.65 * p), r1 = r * (0.55 + 0.85 * p)
                const c = r * 1.4
                return <line key={i} x1={c + Math.cos(a) * r0} y1={c + Math.sin(a) * r0} x2={c + Math.cos(a) * r1} y2={c + Math.sin(a) * r1}
                    stroke={color} strokeWidth={10 * (1 - p) + 1} strokeLinecap="round" opacity={1 - p} />
            })}
            <circle cx={r * 1.4} cy={r * 1.4} r={r * 1.2 * p} fill="none" stroke={color} strokeWidth={6 * (1 - p)} opacity={1 - p} />
        </svg>
    )
}

/** Chuyển cảnh kiểu "whip": vào từ phải (mờ chuyển động), ra sang trái; `len` khung mỗi đầu. */
/** `softIn`/`softOut`: nối hai clip quay màn hình liền mạch — chỉ hoà tan (không trượt, không mờ chuyển động). */
export const Whip: React.FC<{ dur: number; len: number; first?: boolean; last?: boolean; softIn?: boolean; softOut?: boolean; children: React.ReactNode }> = ({ dur, len, first, last, softIn, softOut, children }) => {
    const f = useCurrentFrame()
    const inP = first ? 1 : ease(f, [0, len], [0, 1], softIn ? Easing.inOut(Easing.quad) : Easing.out(Easing.exp))
    const outP = last ? 0 : ease(f, [dur - len, dur], [0, 1], softOut ? Easing.inOut(Easing.quad) : Easing.in(Easing.exp))
    const x = (softIn ? 0 : (1 - inP) * 260) - (softOut ? 0 : outP * 260)
    const blur = (softIn ? 0 : (1 - inP) * 22) + (softOut ? 0 : outP * 22)
    const opacity = first ? 1 : softIn ? inP : Math.min(1, inP * 1.6)
    return (
        <AbsoluteFill style={{ transform: `translateX(${x}px) scale(${1 + (softIn ? 0 : (1 - inP) * 0.05)})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity }}>
            {children}
        </AbsoluteFill>
    )
}

export const panelStyle: React.CSSProperties = {
    position: 'absolute',
    background: '#FFFFFF',
    borderRadius: 24,
    boxShadow: '0 30px 80px rgba(34,26,102,0.16), 0 2px 6px rgba(34,26,102,0.06)',
    border: `1px solid ${C.rule}`,
}
