import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { CLAMP, DarkCtx, EditionCtx, Headline, Stage, Whip, ease, useDark, type Edition } from './kit'
import { BrandScene, CAL_FLIPS, HookScene, UploadScene, accel } from './scenesA'
import { AskScene, DrillScene, ASK } from './scenesAsk'
import { OutroScene, SemanticScene, StatsScene, ZaloScene } from './scenesB'
import { AGENT, AgentScene, DeckIntro, DeckScene, EDIT, EditScene, PositionScene } from './scenesC'
import { ScreenZoom, type CursorPath } from './ScreenZoom'
import cFilter from './cursors/d-filter.json'
import cInsightMenu from './cursors/d-insight-menu.json'
import cDeck from './cursors/d-deck.json'
import cHover from './cursors/d-hover.json'
import { EDITION_OVERRIDES } from '../editions'

/**
 * Video giới thiệu Semanio — bản KHÔNG GIỌNG kiểu Holistics: chữ to vào trước, animation
 * chạy theo; đoạn quay thật (Playwright, đúng tốc độ, con trỏ vẽ lại mượt) chỉ ở phần
 * dashboard. Thứ tự: nỗi đau → định vị → tính năng (hỏi, sửa, Agent, dashboard, Insight,
 * xuất trình chiếu, Zalo) → vì sao tin được (lớp ngữ nghĩa) → triển khai → kết.
 * Kịch bản mẫu: STORYBOARD-EXAMPLE.md · quy trình: PLAYBOOK.md.
 */
const XF = 10 // khung chồng giữa hai cảnh (whip)
/** 1,2s màn hình chờ trước khi vào cảnh đầu (nhạc cũng bắt đầu sau đó). */
const LEAD = 36
/**
 * Nhạc `sfx/blueprint-150.wav` = Blueprint for Tomorrow đã ghép (tools: music_splice.py +
 * music_build.py): giữ nguyên 0–144,07s, nhảy sang 163,18s (bỏ 19,1s đoạn lặp) → đoạn kết thật
 * với nốt ngân (2:45 của bài) — đúng 150,00s. Điểm ghép rơi đúng khung vào cảnh kết.
 */
/**
 * Nhạc `sfx/Blueprint-cut.mp3` — user tự ghép (157,75s; trống dừng ở 151,3s rồi nốt ngân tới 155,0s).
 * Cảnh kết vào ở giây nhạc 150,9 (whip + lóe) để logo hiện đúng lúc nốt ngân; cảnh stats co giãn cho khớp.
 */
/** Đặt file nhạc vào public/music/ rồi ghi tên ở đây; để null = không nhạc (Studio vẫn chạy). Xem PLAYBOOK.md › Nhạc. */
const MUSIC_SRC: string | null = null // vd 'music/track.mp3'
const OUTRO_AT = LEAD + Math.round(150.9 * 30)
const OUTRO_DUR = 153 // tới 155,8s nhạc: nốt ngân hết ở 155,0 + 0,8s lặng
const TARGET_FRAMES = OUTRO_AT + OUTRO_DUR
const MUSIC_FRAMES = TARGET_FRAMES - LEAD
/** SFX nhỏ hơn nhạc: hệ số chung + hạ riêng các tiếng chói (còi báo sai, gõ phím, riser). */
const SFX_GAIN = 0.55
const SFX_TRIM: Record<string, number> = { 'wrong.wav': 0.35, 'type.wav': 0.55, 'riser.wav': 0.6, 'ding.wav': 0.8 }

/** Tiêu đề chuyển cảnh — tự co cỡ chữ cho vừa MỘT dòng (không rơi chữ xuống dòng). */
const Title: React.FC<{ text: string; accent: string[]; sub?: string }> = ({ text, accent, sub }) => {
    const size = Math.min(96, Math.floor(1600 / (text.length * 0.56)))
    const dark = useDark()
    return (
        <Stage>
            <Headline text={text} at={0} size={size} top={sub ? 400 : 450} accent={accent} />
            {sub && <Headline text={sub} at={10} size={50} top={400 + size * 1.3} color={dark ? '#CFC8FF' : '#66628C'} />}
        </Stage>
    )
}

export type Sfx = [number, string, number, number?]
export type Scene = { id: string; dur: number; el: React.ReactNode; sfx?: Sfx[]; flash?: boolean; dark?: boolean; soft?: boolean }

/** Tiếng bấm đúng lúc chuột thật bấm trong clip (clip phát từ giây `from`). */
const clicks = (path: CursorPath, from: number, dur: number): Sfx[] =>
    path.filter(p => p[3] === 1).map(p => [Math.round((p[0] - from) * 30), 'click.wav', 0.8] as Sfx).filter(s => s[0] >= 0 && s[0] < dur)

const FEATURES: Scene[] = [
    { id: 'hook', dur: 300, el: <HookScene />, sfx: [
        ...accel(12, 6, 2).map(c => [c + 52, 'pop.wav', 0.28] as Sfx),
        [138, 'wrong.wav', 0.35], [196, 'whoosh.wav', 0.4], ...CAL_FLIPS.map(t => [t, 'swish.wav', 0.18] as Sfx), [252, 'riser.wav', 0.45],
    ] },
    { id: 'brand', dur: 150, flash: true, el: <BrandScene />, sfx: [[76, 'impact.wav', 0.65], [92, 'ding.wav', 0.3]] },
    { id: 'position', dur: 390, flash: true, el: <PositionScene />, sfx: [
        [0, 'whoosh.wav', 0.4], [8, 'impact.wav', 0.6], [34, 'pop.wav', 0.3],
        [100, 'impact.wav', 0.5], [122, 'impact.wav', 0.5], [144, 'impact.wav', 0.55], [194, 'whoosh.wav', 0.45],
        ...accel(4, 12, 7).map(c => [c + 214, 'pop.wav', 0.5] as Sfx),
    ] },
    { id: 'upload', dur: 315, el: <UploadScene />, sfx: [
        [0, 'whoosh.wav', 0.4],
        ...accel(12, 5, 2).map(c => [c + 18, 'pop.wav', 0.22] as Sfx),
        [176, 'wrong.wav', 0.5], [232, 'ding.wav', 0.4],
    ] },
    { id: 'ask', dur: 330, el: <AskScene />, sfx: [
        [ASK.typeStart, 'type.wav', 0.5, ASK.typeEnd - ASK.typeStart], [ASK.click, 'click.wav', 1], [ASK.click + 2, 'swish.wav', 0.35],
        ...[0, 8, 15, 21, 26].map(c => [ASK.chips + c + 2, 'pop.wav', 0.3] as Sfx),
        [ASK.chartIn - 2, 'whoosh.wav', 0.45],
        [ASK.highlight + 4, 'pop.wav', 0.55], [ASK.highlight + 9, 'pop.wav', 0.5], [ASK.highlight + 14, 'pop.wav', 0.45], [ASK.highlight + 2, 'ding.wav', 0.35],
    ] },
    { id: 'drill', dur: 260, el: <DrillScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [10, 'type.wav', 0.45, 42], [56, 'click.wav', 0.8], [78, 'swish.wav', 0.35], [96, 'impact.wav', 0.45], [136, 'pop.wav', 0.4],
    ] },
    { id: 'edit', dur: 220, el: <EditScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [EDIT.typeStart, 'type.wav', 0.5, EDIT.typeEnd - EDIT.typeStart], [EDIT.send, 'click.wav', 0.9], [EDIT.send + 2, 'swish.wav', 0.35],
        [EDIT.done, 'impact.wav', 0.55], [EDIT.done + 2, 'whoosh.wav', 0.4],
    ] },
    { id: 'agent', dur: 505, flash: true, el: <AgentScene />, sfx: [
        [0, 'whoosh.wav', 0.4], [44, 'whoosh.wav', 0.35], [AGENT.flip, 'click.wav', 1], [AGENT.flip + 1, 'impact.wav', 0.6],
        [AGENT.qIn, 'pop.wav', 0.4],
        ...accel(6, 12, 6).map(c => [c + AGENT.steps, 'pop.wav', 0.12] as Sfx),
        [AGENT.answer - 4, 'whoosh.wav', 0.45], [AGENT.answer, 'impact.wav', 0.6],
        [AGENT.answer + 40, 'impact.wav', 0.5], [AGENT.answer + 66, 'ding.wav', 0.4], [AGENT.answer + 80, 'pop.wav', 0.3],
        ...[0, 9, 18].map(k => [AGENT.answer + 144 + k, 'pop.wav', 0.3] as Sfx),
    ] },
    // Dashboard: dùng thẳng bản quay thật (bỏ cảnh mô phỏng đổi KPI)
    { id: 'dashTitle', dark: true, dur: 70, el: <Title text="AI dựng dashboard trong vài phút" accent={['AI', 'vài phút']} sub="Tương tác trực tiếp trên mọi biểu đồ" />, sfx: [[0, 'whoosh.wav', 0.35]] },
    { id: 'realFilter', dark: true, dur: 168, el: <ScreenZoom src="rec/d-filter.mp4" from={1.0} cursor={cFilter} keys={[
        { t: 0, s: 1.6, x: 300, y: 260 }, { t: 0.9, s: 1.4, x: 520, y: 360 },
        { t: 2.5, s: 1.5, x: 330, y: 430 }, { t: 3.7, s: 1.5, x: 330, y: 430 }, { t: 4.5, s: 1.2, x: 1000, y: 300 }, { t: 5.6, s: 1.2, x: 1000, y: 300 },
    ]} />, sfx: [[0, 'whoosh-soft.wav', 0.4], ...clicks(cFilter, 1.0, 168)] },
    // rê chuột lên cột → tooltip hiện số thật từng đơn vị
    { id: 'realHover', dark: true, dur: 150, el: <ScreenZoom src="rec/d-hover.mp4" from={0.3} cursor={cHover} keys={[
        { t: 0, s: 1.4, x: 800, y: 660 }, { t: 0.6, s: 1.9, x: 620, y: 780 }, { t: 2.0, s: 1.9, x: 680, y: 790 }, { t: 3.3, s: 1.9, x: 760, y: 800 }, { t: 5.0, s: 1.9, x: 760, y: 800 },
    ]} />, sfx: [[0, 'whoosh-soft.wav', 0.3]] },
    { id: 'insightTitle', dark: true, dur: 90, el: <Title text="Insight: AI tóm tắt điều đáng chú ý" accent={['Insight:']} />, sfx: [[0, 'whoosh.wav', 0.35]] },
    // bấm "…" → Tạo Insight → đang phân tích …
    { id: 'realInsightMenu', dark: true, dur: 156, el: <ScreenZoom src="rec/d-insight-menu.mp4" from={0.6} cursor={cInsightMenu} keys={[
        { t: 0, s: 1.2, x: 1300, y: 300 }, { t: 0.9, s: 1.7, x: 1700, y: 200 }, { t: 3.3, s: 1.7, x: 1700, y: 220 }, { t: 4.0, s: 1.25, x: 960, y: 520 }, { t: 5.2, s: 1.25, x: 960, y: 520 },
    ]} />, sfx: [[0, 'whoosh-soft.wav', 0.4], ...clicks(cInsightMenu, 0.6, 156)] },
    // … 10 giây sau (đo thật) có bản tóm tắt — nói rõ trên hình, không tua
    { id: 'realInsight', dark: true, dur: 159, el: <ScreenZoom src="rec/d-insight-result.mp4" from={0.3} badge="⏱ 10 giây sau" keys={[
        { t: 0, s: 1.2, x: 960, y: 540 }, { t: 1.0, s: 1.2, x: 960, y: 540 }, { t: 2.2, s: 1.55, x: 960, y: 560 }, { t: 5.3, s: 1.55, x: 960, y: 620 },
    ]} />, sfx: [[8, 'ding.wav', 0.35]] },
    { id: 'deckIntro', dark: true, dur: 60, el: <DeckIntro />, sfx: [[0, 'whoosh.wav', 0.4], [2, 'riser.wav', 0.35]] },
    // mở ô Định dạng → chọn "HTML deck (.html)" → lướt tới nút Xuất
    { id: 'realDeck', dark: true, dur: 174, el: <ScreenZoom src="rec/d-deck.mp4" from={0.4} cursor={cDeck} keys={[
        { t: 0, s: 1.4, x: 960, y: 420 }, { t: 0.5, s: 1.7, x: 960, y: 400 }, { t: 2.8, s: 1.7, x: 960, y: 420 }, { t: 3.6, s: 1.4, x: 1040, y: 640 }, { t: 5.8, s: 1.55, x: 1080, y: 740 },
    ]} />, sfx: [[0, 'whoosh-soft.wav', 0.4], ...clicks(cDeck, 0.4, 174)] },
    { id: 'deck', dark: true, dur: 360, el: <DeckScene />, sfx: [
        [0, 'whoosh.wav', 0.4], ...[0, 1, 2, 3, 4].map(k => [24 + 40 + k * 52, 'swish.wav', 0.3] as Sfx),
        [30, 'pop.wav', 0.35], [36, 'pop.wav', 0.3], [42, 'pop.wav', 0.25],
    ] },
    { id: 'zalo', flash: true, dur: 330, el: <ZaloScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [22, 'pop.wav', 0.4], [40, 'pop.wav', 0.3], [84, 'ding.wav', 0.4], [112, 'pop.wav', 0.35], [150, 'swish.wav', 0.3], [186, 'pop.wav', 0.35],
    ] },
    // vì sao tin được — sau khi đã thấy đủ tính năng
    { id: 'semantic', dur: 360, el: <SemanticScene />, sfx: [
        [0, 'whoosh.wav', 0.4], [62, 'swish.wav', 0.3], [134, 'swish.wav', 0.3], [204, 'swish.wav', 0.3], [276, 'wrong.wav', 0.4], [292, 'ding.wav', 0.3],
    ] },
    { id: 'stats', dur: 0, el: <StatsScene />, sfx: [[0, 'whoosh.wav', 0.35], [36, 'pop.wav', 0.45], [62, 'pop.wav', 0.45], [88, 'pop.wav', 0.45]] },
]

/** Dựng danh sách cảnh cho một edition (src/editions: thay nội dung theo id, giữ thời lượng) và xếp mốc; cảnh stats lấp cho đủ TARGET_FRAMES. */
const layout = (edition: Edition) => {
    const feats: Scene[] = FEATURES.map(s => ({ ...s, ...EDITION_OVERRIDES[edition]?.[s.id] }))
    const featStarts: number[] = []
    const beforeStats = feats.slice(0, -1).reduce((at, s) => { featStarts.push(at); return at + s.dur - XF }, LEAD)
    featStarts.push(beforeStats)
    feats[feats.length - 1].dur = OUTRO_AT - beforeStats + XF
    if (feats[feats.length - 1].dur < 180) throw new Error(`Promo quá dài: cảnh stats chỉ còn ${feats[feats.length - 1].dur} khung`)
    const scenes: Scene[] = [...feats, { id: 'outro', dur: OUTRO_DUR, flash: true, el: <OutroScene />, sfx: [[0, 'impact.wav', 0.55]] }]
    return { scenes, starts: [...featStarts, OUTRO_AT] }
}
const LAYOUTS: Record<Edition, ReturnType<typeof layout>> = { general: layout('general'), dfl: layout('dfl'), internal: layout('internal') }
export const PROMO_FRAMES = TARGET_FRAMES
/** Mốc bắt đầu từng cảnh (khung) — để xem nhanh trong Studio / chụp khung. */
export const PROMO_STARTS = Object.fromEntries(LAYOUTS.general.scenes.map((s, i) => [s.id, LAYOUTS.general.starts[i]]))

const Flash: React.FC = () => {
    const f = useCurrentFrame()
    const o = ease(f, [XF - 2, XF + 8], [0.75, 0])
    return o > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: o, pointerEvents: 'none' }} /> : null
}

export const Promo: React.FC<{ edition?: Edition }> = ({ edition = 'general' }) => {
    const { scenes: SCENES, starts } = LAYOUTS[edition]
    return (
    <EditionCtx.Provider value={edition}>
    <AbsoluteFill style={{ background: '#F7F6FE' }}>
        {/* màn hình chờ: chỉ nền */}
        <Sequence name="lead" durationInFrames={LEAD + XF}><Stage /></Sequence>
        {SCENES.map((s, i) => (
            <Sequence key={s.id} name={s.id} from={starts[i]} durationInFrames={s.dur}>
                <DarkCtx.Provider value={!!s.dark}>
                    <Whip dur={s.dur} len={XF} first={i === 0} last={i === SCENES.length - 1} softIn={s.soft} softOut={SCENES[i + 1]?.soft}>{s.el}</Whip>
                </DarkCtx.Provider>
                {s.flash && <Flash />}
            </Sequence>
        ))}
        {MUSIC_SRC && <Sequence name="music" from={LEAD} durationInFrames={MUSIC_FRAMES} layout="none">
            <Audio src={staticFile(MUSIC_SRC)} volume={f => interpolate(f, [0, 60, MUSIC_FRAMES - 4, MUSIC_FRAMES], [0, 1, 1, 0], CLAMP) * 0.5} />
        </Sequence>}
        {SCENES.flatMap((s, i) => (s.sfx || []).map(([at, src, vol, len], k) => (
            <Sequence key={`${s.id}-${k}`} from={starts[i] + at} durationInFrames={len ?? 90} layout="none">
                <Audio src={staticFile(`sfx/${src}`)} volume={vol * SFX_GAIN * (SFX_TRIM[src] ?? 1)} />
            </Sequence>
        )))}
    </AbsoluteFill>
    </EditionCtx.Provider>
    )
}
