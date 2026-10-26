import { createContext, useContext } from 'react'
import { continueRender, delayRender, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import { C } from '../theme'
import { ACCENT_TEXT, CLAMP, ease, INK, panelStyle, useDark } from '../promo/kit'
import { MONO } from '../promo/scenesA'
import { COLS, REPORT_NOTE, REPORT_TITLE, type Row } from './data'

/*
 * Mảnh giao diện dùng chung cho video "Tự xây template báo cáo": icon Lucide, con trỏ +
 * gợn sóng bấm, huy hiệu vai trò (RoleBanner), dải tiến trình, khung cửa sổ, bảng tính Excel.
 */

/**
 * Tiêu đề chữ to cho video template. Khác Headline của kit (tô MỌI từ trùng với bất kỳ từ nào
 * trong `accent`, nên câu bị tô loang lổ): ở đây chỉ tô MỘT cụm liền nhau — `accent[0]` — tại lần
 * xuất hiện đầu tiên (user 23/10: mỗi câu chỉ nhấn một chỗ quan trọng).
 */
/**
 * Font tiêu đề (user 24/10: thử Inter hoặc Google Sans Flex); chữ thân vẫn Be Vietnam Pro.
 * Google Sans Flex chưa có trong @remotion/google-fonts 4.0.351 nên tự nạp 3 tệp woff2 nét 800
 * (latin, latin-ext, vietnamese) tải từ Google Fonts về public/fonts.
 */
type TitleFontPick = 'inter' | 'googleSansFlex'
const TITLE_FONT_PICK = 'googleSansFlex' as TitleFontPick
const { fontFamily: INTER } = loadInter('normal', { weights: ['800'], subsets: ['latin', 'vietnamese'] })
const GSF = 'Google Sans Flex'
const GSF_SUBSETS: [string, string][] = [
    ['vietnamese', 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB'],
    ['latin-ext', 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF'],
    ['latin', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'],
]
if (typeof document !== 'undefined') {
    const handle = delayRender(`Nạp font ${GSF}`)
    Promise.all(GSF_SUBSETS.map(([sub, unicodeRange]) => {
        const face = new FontFace(GSF, `url(${staticFile(`fonts/google-sans-flex-800-${sub}.woff2`)}) format('woff2')`, { weight: '800', unicodeRange })
        ;(document.fonts as unknown as { add: (f: FontFace) => void }).add(face) // lib DOM của tsconfig thiếu FontFaceSet.add
        return face.load()
    })).then(() => continueRender(handle), err => { console.error(err); continueRender(handle) })
}
const TITLE_FONT = TITLE_FONT_PICK === 'inter' ? INTER : `'${GSF}', ${INTER}`
/** Tiêu đề đầu màn (top ≤ 60) hạ xuống + nhỏ lại chút, chừa khoảng cho nhãn vai / ngả ở góc trên (user 24/10). */
const HEAD_TOP_SHIFT = 6
const HEAD_TOP_SCALE = 0.9

export const Headline: React.FC<{
    text: string; at: number; out?: number; accent?: string[]; size?: number; top?: number; color?: string
}> = ({ text, at, out, accent = [], size: sizeProp = 112, top: topProp = 80, color: colorProp }) => {
    const atTop = topProp <= 60
    const top = atTop ? topProp + HEAD_TOP_SHIFT : topProp
    const size = atTop ? Math.round(sizeProp * HEAD_TOP_SCALE) : sizeProp
    const f = useCurrentFrame()
    const dark = useDark()
    const color = colorProp ?? (dark ? '#FFFFFF' : INK)
    const { fps } = useVideoConfig()
    if (f < at - 1 || (out !== undefined && f > out + 10)) return null
    const words = text.split(' ')
    const bare = (s: string) => s.replace(/[.,?!:—]/g, '').toLowerCase()
    const phrase = (accent[0] ?? '').split(' ').filter(Boolean).map(bare)
    let from = -1
    for (let i = 0; phrase.length && i + phrase.length <= words.length; i++) {
        if (phrase.every((p, k) => bare(words[i + k]) === p)) { from = i; break }
    }
    const leave = out === undefined ? 0 : ease(f, [out, out + 8], [0, 1], Easing.in(Easing.cubic))
    return (
        <div style={{
            position: 'absolute', top, left: 0, width: 1920, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.26}px`,
            padding: '0 120px', boxSizing: 'border-box', fontFamily: TITLE_FONT, fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', color,
            opacity: 1 - leave, transform: `translateY(${-leave * 60}px) scale(${1 - leave * 0.06})`, filter: `blur(${leave * 12}px)`,
        }}>
            {words.map((w, i) => {
                const p = spring({ frame: f - at - i * 2, fps, config: { damping: 11, stiffness: 190, mass: 0.6 } })
                const isAccent = from >= 0 && i >= from && i < from + phrase.length
                const shine = isAccent ? interpolate(f - at - i * 2, [8, 40], [100, -100], CLAMP) : 0
                return (
                    <span key={i} style={{
                        display: 'inline-block', opacity: Math.min(1, p * 2.2), transform: `translateY(${(1 - p) * size * 0.3}px) scale(${1 + (1 - p) * 0.55})`,
                        filter: `blur(${Math.max(0, 1 - p) * 14}px)`, paddingBottom: size * 0.08, ...(isAccent ? { ...ACCENT_TEXT, backgroundPosition: `${shine}% 0` } : {}),
                    }}>{w}</span>
                )
            })}
        </div>
    )
}

export type TemplateMode = 'full' | 'biz'
export const TemplateModeCtx = createContext<TemplateMode>('full')
export const useTemplateMode = () => useContext(TemplateModeCtx)

export const GRAD = 'linear-gradient(135deg, #6D5DF6 0%, #B45FD8 55%, #E86FC6 100%)'
export const GRAD_H = 'linear-gradient(90deg, #6D5DF6, #E86FC6)'
export const XL_GREEN = '#1D6F42'

const NODES = {
    fileDown: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></>,
    fileSheet: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M8 13h2" /><path d="M14 13h2" /><path d="M8 17h2" /><path d="M14 17h2" /></>,
    fileText: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></>,
    send: <><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></>,
    more: <><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></>,
    sparkles: <><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" /></>,
    calendarClock: <><path d="M16 14v2.2l1.6 1" /><path d="M16 2v4" /><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path d="M3 10h5" /><path d="M8 2v4" /><circle cx="16" cy="16" r="6" /></>,
    table: <><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" /></>,
    shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
    chat: <><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" /><path d="M7 11h10" /><path d="M7 15h6" /><path d="M7 7h8" /></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    download: <><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></>,
    bot: <><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></>,
    type: <><path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" /></>,
    sheet: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="9" y2="21" /><line x1="15" x2="15" y1="9" y2="21" /></>,
    userCheck: <><path d="M2 21a8 8 0 0 1 13.292-6" /><circle cx="10" cy="8" r="5" /><path d="m16 19 2 2 4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    eye: <><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></>,
    badgeCheck: <><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></>,
    history: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>,
    lock: <><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></>,
    pull: <><circle cx="5" cy="6" r="3" /><path d="M5 9v12" /><circle cx="19" cy="18" r="3" /><path d="m15 9-3-3 3-3" /><path d="M12 6h5a2 2 0 0 1 2 2v7" /></>,
    input: <><path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6" /><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" /><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" /><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1" /><path d="M9 6v12" /></>,
    clock: <><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></>,
    chevronDown: <><path d="m6 9 6 6 6-6" /></>,
    x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    shieldAlert: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></>,
    pin: <><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" /></>,
    bookmark: <><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
    mail: <><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></>,
    barChart: <><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></>,
    play: <><polygon points="6 3 20 12 6 21 6 3" /></>,
    grip: <><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></>,
}
export type IconKind = keyof typeof NODES
export const Ico: React.FC<{ k: IconKind; size?: number; color?: string; stroke?: number; style?: React.CSSProperties }> = ({ k, size = 24, color = 'currentColor', stroke = 2, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>{NODES[k]}</svg>
)

// ─── Huy hiệu Vai trò phụ trách (RoleBanner) ở góc trên ─────────────────────────
export type RoleKind = 'data' | 'collab-def' | 'collab-gov' | 'enduser' | 'power'
const ROLE_CFG: Record<RoleKind, { badge: string; note: string; icon: IconKind; bg: string; fg: string; border: string }> = {
    data: {
        badge: 'BA DATA · KỸ SƯ DỮ LIỆU',
        note: '',
        icon: 'database',
        bg: '#E8F0FE',
        fg: '#1D5BD8',
        border: '#93B8F8',
    },
    'collab-def': {
        badge: 'CÁN BỘ NGHIỆP VỤ + AI',
        note: '',
        icon: 'sparkles',
        bg: '#EFEAFE',
        fg: '#5B3FD6',
        border: '#C4B5FD',
    },
    'collab-gov': {
        badge: 'BA DATA · TRƯỞNG PHÒNG',
        note: '',
        icon: 'badgeCheck',
        bg: '#F3E8FF',
        fg: '#6D28D9',
        border: '#D8B4FE',
    },
    enduser: {
        badge: 'CÁN BỘ NGHIỆP VỤ',
        note: '',
        icon: 'userCheck',
        bg: '#E6F6EE',
        fg: '#0E7A5F',
        border: '#86EFAC',
    },
    power: {
        badge: 'POWER USER · BA',
        note: '',
        icon: 'sparkles',
        bg: '#FEF3D7',
        fg: '#A15C00',
        border: '#FCD34D',
    },
}

export const RoleBanner: React.FC<{ role: RoleKind }> = ({ role }) => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    const dark = useDark()
    const p = spring({ frame: f - 2, fps, config: { damping: 16, stiffness: 190 } })
    const c = ROLE_CFG[role]
    return (
        <div style={{
            position: 'absolute', left: 40, top: 20, zIndex: 55, display: 'inline-flex', alignItems: 'center',
            padding: '4px', borderRadius: 999, background: dark ? 'rgba(22,19,43,0.9)' : 'rgba(255,255,255,0.92)',
            border: `1.5px solid ${c.border}`, boxShadow: '0 6px 20px rgba(34,26,102,0.1)',
            opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -14}px)`,
        }}>
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 14px', borderRadius: 999,
                background: c.bg, color: c.fg, fontSize: 15, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap',
            }}>
                <Ico k={c.icon} size={16} color={c.fg} stroke={2.5} />
                {c.badge}
            </span>
        </div>
    )
}

// ─── Con trỏ ────────────────────────────────────────────────────────────────
export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
    <svg width={46} height={46} viewBox="0 0 28 28" style={{ position: 'absolute', left: x - 3.3, top: y - 1.6 + press * 3, filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.35))', zIndex: 500 }}>
        <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#fff" stroke="#231F3A" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
)

export type CurKey = [number, number, number]
export const curAt = (f: number, keys: CurKey[]) => {
    if (f <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] }
    for (let i = 1; i < keys.length; i++) {
        const [t1, x1, y1] = keys[i]
        const [t0, x0, y0] = keys[i - 1]
        if (f <= t1) {
            const p = ease(f, [t0, t1], [0, 1], Easing.inOut(Easing.cubic))
            return { x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p }
        }
    }
    const k = keys[keys.length - 1]
    return { x: k[1], y: k[2] }
}

export const PathCursor: React.FC<{ keys: CurKey[]; clicks: number[]; from: number; to: number }> = ({ keys, clicks, from, to }) => {
    const f = useCurrentFrame()
    if (f < from || f > to) return null
    const p = curAt(f, keys)
    const press = Math.max(0, ...clicks.map(c => interpolate(f, [c, c + 2, c + 6], [0, 1, 0], CLAMP)))
    const fade = ease(f, [from, from + 6], [0, 1]) * ease(f, [to - 8, to], [1, 0])
    return (
        <div style={{ position: 'absolute', inset: 0, opacity: fade, pointerEvents: 'none' }}>
            {clicks.map(c => <Ripple key={c} at={c} {...curAt(c, keys)} />)}
            <Cursor x={p.x} y={p.y} press={press} />
        </div>
    )
}
export const Ripple: React.FC<{ at: number; x: number; y: number; color?: string }> = ({ at, x, y, color = C.violet }) => {
    const f = useCurrentFrame()
    if (f < at || f > at + 24) return null
    const r = ease(f, [at, at + 22], [20, 150])
    return <div style={{ position: 'absolute', left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: '50%', border: `5px solid ${color}`, opacity: interpolate(f, [at, at + 24], [0.85, 0], CLAMP), zIndex: 499 }} />
}

export const pressAt = (f: number, at: number) => interpolate(f, [at, at + 2, at + 7], [1, 0.92, 1], CLAMP)
export const typed = (f: number, text: string, a: number, b: number) => text.slice(0, Math.floor(interpolate(f, [a, b], [0, text.length], CLAMP)))
export const Caret: React.FC<{ on?: boolean; color?: string }> = ({ on = true, color = C.violet }) => {
    const f = useCurrentFrame()
    return on && Math.floor(f / 7) % 2 === 0 ? <span style={{ color, fontWeight: 300 }}>|</span> : null
}
export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = C.violet }) => {
    const f = useCurrentFrame()
    return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', border: `3px solid ${C.rule}`, borderTopColor: color, transform: `rotate(${f * 18}deg)`, flexShrink: 0 }} />
}
export const usePop = (at: number, cfg = { damping: 13, stiffness: 190 }) => {
    const f = useCurrentFrame()
    const { fps } = useVideoConfig()
    return spring({ frame: f - at, fps, config: cfg })
}

// ─── Nhãn ngả ──────────────────────────────────────────────────────────────────
/** Ba ngả sau khi có bảng kết quả (cảnh `hub` và các cảnh nhánh). */
export const BRANCHES: { icon: IconKind; label: string }[] = [
    { icon: 'chat', label: 'Hỏi tiếp' },
    { icon: 'calendarClock', label: 'Hẹn lịch gửi email' },
    { icon: 'users', label: 'Tạo mẫu chia sẻ' },
]

/** Nhãn ngả ở góc phải trên: cho người xem biết đang đi ngả nào trong ba ngả. */
export const BranchTag: React.FC<{ active: number }> = ({ active }) => {
    const f = useCurrentFrame()
    const dark = useDark()
    const show = ease(f, [4, 16], [0, 1])
    return (
        <div style={{ position: 'absolute', right: 40, top: 20, zIndex: 55, display: 'flex', gap: 8, opacity: show, transform: `translateY(${(1 - show) * -14}px)` }}>
            {BRANCHES.map((b, i) => {
                const on = i === active
                return (
                    <div key={b.label} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: on ? 800 : 600, whiteSpace: 'nowrap',
                        background: on ? GRAD_H : dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                        color: on ? '#fff' : dark ? '#8C86B8' : '#A3A0B8',
                        border: on ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.14)' : C.rule}`,
                    }}>
                        <Ico k={b.icon} size={18} color={on ? '#fff' : 'currentColor'} />
                        {`Ngả ${i + 1} · ${b.label}`}
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Nhãn ngả khi cảnh thuộc một trong ba ngả. Dải bước chữ nhỏ ở đáy màn đã bỏ ở cả hai bản (Biz 23/10,
 * Full 24/10): chữ nhỏ khó đọc, kéo mắt khỏi giao diện. `active` giữ lại cho các chỗ gọi cũ.
 */
export const StepRail: React.FC<{ active: number; branch?: number }> = ({ branch }) => (branch === undefined ? null : <BranchTag active={branch} />)

// ─── Khung cửa sổ ───────────────────────────────────────────────────────────────
export const AppWindow: React.FC<{ title: string; children: React.ReactNode; style?: React.CSSProperties; bar?: string; barColor?: string; icon?: IconKind }> = ({ title, children, style, bar = '#F4F3FB', barColor = C.steel, icon }) => (
    <div style={{ position: 'absolute', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(34,26,102,0.18), 0 2px 6px rgba(34,26,102,0.06)', border: `1px solid ${C.rule}`, ...style }}>
        <div style={{ height: 46, background: bar, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: `1px solid ${C.rule}` }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
            {icon && <Ico k={icon} size={20} color={barColor} style={{ marginLeft: 10 }} />}
            <span style={{ marginLeft: icon ? 0 : 10, fontSize: 19, fontWeight: 700, color: barColor, whiteSpace: 'nowrap' }}>{title}</span>
        </div>
        {children}
    </div>
)

/**
 * Màn Mô hình: cùng một cửa sổ cho ba cảnh, mỗi cảnh một tab, xếp theo thứ tự video trình bày — Bảng (đặt tên
 * cột) → Mối quan hệ (nối bảng) → Thiết kế Cột (Column Builder). Nhãn theo messages/vi/admin-models.json (form.tabs.*).
 */
export const MODEL_TABS = ['Bảng', 'Mối quan hệ', 'Thiết kế Cột'] as const
/** Thanh tiêu đề cửa sổ Mô hình; tab sáng đổi từ `from` sang `active` ở khung `at` như vừa bấm sang tab đó. */
export const ModelWindowBar: React.FC<{ active: number; from?: number; at?: number }> = ({ active, from = active, at = 10 }) => {
    const f = useCurrentFrame()
    const on = f >= at ? active : from
    return (
        <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: `1px solid ${C.rule}`, background: '#FAFAFE' }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
            <span style={{ marginLeft: 8, fontSize: 20, fontWeight: 800, color: C.navy }}>Mô hình · Hồ sơ khách hàng FATCA</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {MODEL_TABS.map((t, i) => (
                    <span key={t} style={{
                        padding: '6px 14px', borderRadius: 10, fontSize: 17, fontWeight: 800, background: i === on ? '#EFEAFE' : 'transparent', color: i === on ? '#5B3FD6' : C.steel,
                        transform: i === active && from !== active ? `scale(${pressAt(f, at)})` : undefined,
                    }}>{t}</span>
                ))}
            </span>
        </div>
    )
}
export const ModelWindow: React.FC<{ active: number; from?: number; at?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ active, from, at, style, children }) => (
    <div style={{ ...panelStyle, overflow: 'hidden', ...style }}>
        <ModelWindowBar active={active} from={from} at={at} />
        {children}
    </div>
)

export const Chip: React.FC<{ children: React.ReactNode; tone?: 'violet' | 'green' | 'amber' | 'blue' | 'ink'; style?: React.CSSProperties }> = ({ children, tone = 'violet', style }) => {
    const T = { violet: ['#EFEAFE', '#5B3FD6'], green: ['#E6F6EE', '#0E7A5F'], amber: ['#FEF3D7', '#A15C00'], blue: ['#E8F0FE', '#1D5BD8'], ink: [INK, '#fff'] }[tone]
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 10, fontWeight: 700, background: T[0], color: T[1], whiteSpace: 'nowrap', ...style }}>{children}</span>
}

/** Tên hiển thị của ô giữ chỗ: trên hình chỉ hiện chip mang tên dễ đọc, không hiện cú pháp `{...}`. */
const SLOT_LABEL: Record<string, string> = { nam_bao_cao: 'Năm báo cáo', ty_gia: 'Tỷ giá', user: 'Người lập', today: 'Ngày xuất' }
export const withPlaceholders = (text: string) =>
    text.split(/(\{[a-z_]*\}?)/).map((p, i) => !p.startsWith('{') ? <span key={i}>{p}</span> : !p.endsWith('}') ? null /* đang gõ dở: chưa hiện, đủ tên mới bật chip */
        : <span key={i} style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 800, color: '#5B3FD6', background: '#EFEAFE', border: '1.5px solid #A78BFA', borderRadius: 8, padding: '0 8px' }}>{SLOT_LABEL[p.slice(1, -1)] ?? p.slice(1, -1)}</span>)

// ─── Nhãn trung thực ─────────────────────────────────────────────────────────────
export const Badge: React.FC<{ kind: 'sim' | 'soon'; size?: number; style?: React.CSSProperties }> = ({ kind, size = 17, style }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: `${size * 0.22}px ${size * 0.65}px`, borderRadius: 999, fontSize: size, fontWeight: 800,
        whiteSpace: 'nowrap', letterSpacing: '0.01em',
        ...(kind === 'soon'
            ? { background: GRAD_H, color: '#fff', boxShadow: '0 6px 18px rgba(232,111,198,0.35)' }
            : { background: '#FEF3D7', color: '#A15C00', border: '1px solid #F4D58D' }),
        ...style,
    }}>
        <Ico k={kind === 'soon' ? 'sparkles' : 'info'} size={size * 0.95} color={kind === 'soon' ? '#fff' : '#A15C00'} />
        {kind === 'soon' ? 'Sắp ra mắt' : 'Mô phỏng'}
    </span>
)

// ─── Bảng tính Excel ───────────────────────────────────────────────────────────
const LETTERS = 'ABCDEFGHIJKLMNOP'
export const ExcelSheet: React.FC<{
    width: number; data: Row[]; rows: number; titleText?: React.ReactNode; noteText?: React.ReactNode
    header?: number; rowH?: number; fileName?: string; style?: React.CSSProperties; fromCol?: number; scale?: number
}> = ({ width, data, rows, titleText = REPORT_TITLE, noteText = REPORT_NOTE, header = 1, rowH = 44, fileName, style, fromCol = 0, scale = 1 }) => {
    const numW = 44
    const cols = COLS.slice(fromCol)
    const cw = cols.map(c => c.w * scale)
    const full = cw.reduce((s, w) => s + w, 0)
    const cell = (w: number, extra?: React.CSSProperties): React.CSSProperties => ({ width: w, flexShrink: 0, height: rowH, boxSizing: 'border-box', borderRight: '1px solid #E1E5EA', borderBottom: '1px solid #E1E5EA', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: rowH * 0.46, whiteSpace: 'nowrap', overflow: 'hidden', ...extra })
    const rowNo = (n: number | string) => <div style={cell(numW, { justifyContent: 'center', background: '#F3F5F7', color: '#7B8794', fontSize: rowH * 0.4, padding: 0 })}>{n}</div>
    return (
        <div style={{ position: 'absolute', width, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(16,60,35,0.22)', border: '1px solid #CFD8D3', ...style }}>
            <div style={{ height: 46, background: XL_GREEN, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', fontSize: 19, fontWeight: 700 }}>
                <Ico k="fileSheet" size={22} color="#fff" />{fileName ?? 'Xem trước · Sheet1 (Đủ 12 cột mẫu NHNN)'}
            </div>
            <div style={{ display: 'flex' }}>
                {rowNo('')}
                {cols.map((c, i) => <div key={c.key} style={cell(cw[i], { justifyContent: 'center', background: '#F3F5F7', color: '#7B8794', fontSize: rowH * 0.4 })}>{LETTERS[fromCol + i]}</div>)}
            </div>
            <div style={{ display: 'flex' }}>{rowNo(1)}<div style={cell(full, { justifyContent: fromCol ? 'flex-start' : 'center', fontWeight: 800, fontSize: rowH * 0.52, color: '#1F2A37' })}>{titleText}</div></div>
            <div style={{ display: 'flex' }}>{rowNo(2)}<div style={cell(full, { fontStyle: 'italic', color: '#52606D', fontSize: rowH * 0.42 })}>{noteText}</div></div>
            <div style={{ display: 'flex' }}>{rowNo(3)}{cw.map((w, i) => <div key={i} style={cell(w)} />)}</div>
            <div style={{ display: 'flex', opacity: header }}>
                {rowNo(4)}
                {cols.map((c, i) => (
                    <div key={c.key} style={cell(cw[i], { background: '#1F4E78', color: '#fff', fontWeight: 700, justifyContent: c.num ? 'flex-end' : 'flex-start', borderRight: '1px solid #3A6A94' })}>{c.header}</div>
                ))}
            </div>
            {data.map((r, i) => {
                const p = Math.max(0, Math.min(1, rows - i))
                const bg = i % 2 ? '#EEF3F8' : '#fff'
                return (
                    <div key={i} style={{ display: 'flex' }}>
                        {rowNo(5 + i)}
                        {cols.map((c, k) => (
                            <div key={c.key} style={cell(cw[k], { background: bg, opacity: p, justifyContent: c.num ? 'flex-end' : c.key === 'dong_trong_nam' ? 'center' : 'flex-start', fontVariantNumeric: 'tabular-nums', fontWeight: (c.key === 'dong_trong_nam' && r.dong === 'Y') || c.key === 'so_du' ? 800 : 600, color: c.key === 'dong_trong_nam' && r.dong === 'Y' ? '#C0392B' : undefined })}>{c.get(r)}</div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
