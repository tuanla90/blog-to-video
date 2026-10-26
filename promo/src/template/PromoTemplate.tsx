import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { CLAMP, DarkCtx, Stage, Whip, ease } from '../promo/kit'
import type { Scene, Sfx } from '../promo/Promo'
import { BTN, ButtonScene, HOOK, HOOK_DONES, HOOK_FLIPS, HOOK_JOINS, HookScene, MODEL_TYPE, ModelScene, REL, RelScene, TURN_BIZ_SHIFT, TurnScene } from './scenes1'
import { CMP_AFTER, CMP_BEFORE, CompareAfterScene, CompareBeforeScene } from './scenesCompare'
import { ParamsScene, PRM } from './scenes2'
import { ExcelBuildScene, XB } from './scenesExcelBuild'
import { JINJA_T, JinjaExcelScene, RECAP_T, RecapBizScene, SEM_BIZ, SemanticBizScene } from './scenesBranch'
import { CHAT_ASK, CHAT_DRILL, CHAT_SCH, ChatAskScene, ChatDrillScene, ChatScheduleScene } from './scenesChat'
import { PTB, PortalBizScene } from './scenesPortal'
import { OUTRO_T, OutroT, RecapScene } from './scenes3'
import { TemplateModeCtx, type TemplateMode } from './ui'
import timeline from './timeline.json'

/**
 * "Tự xây template báo cáo" — 2 phiên bản video (kịch bản vòng 4, STORYBOARD-TEMPLATE.md):
 *  1. PromoTemplateBiz (mode = 'biz'): cán bộ nghiệp vụ — tiêu chí chuẩn gọn -> dán yêu cầu ra
 *     đúng 12 cột -> rẽ 3 ngả (hỏi tiếp · hẹn lịch gửi email · tạo mẫu chia sẻ có ô nhập)
 *     -> mẫu Excel có ô giữ chỗ -> đồng nghiệp tự tải ở Cổng Dữ Liệu.
 *  2. PromoTemplate (mode = 'full'): BA / Power User — cùng mạch giao diện giả lập với bản Biz,
 *     thêm mô hình + nối bảng (BA Data), ô nhập của mẫu + dựng mẫu Excel (Power User), tổng kết theo vai.
 * Thời lượng cảnh: giữ đủ thời gian đọc sau nhịp cuối, cắt đuôi đứng yên (đo bằng holds.py).
 */
const XF = 10
const LEAD = 36
/** Nhạc bản Biz: bài trong timeline.json (Calculated_Ascent, 120 BPM), lưới cảnh canh theo các đoạn của bài; bản Full chưa có nhạc. */
/**
 * Nhạc nền: bài vào sau cảnh đầu `delay` khung, cắt `trimBefore` khung đầu bài để phách 1 rơi đúng khung 0.
 * `segments` (tuỳ chọn): dựng lại bài theo ô nhịp — các đoạn [giây trong bài từ, đến) đặt nối nhau từ giây 0
 * của nhạc, đan tiếng MUSIC_XFADE khung ở mỗi chỗ nối.
 */
type Music = { file: string; delay: number; trimBefore: number; segments?: [number, number][] }
const BIZ_MUSIC: Music = timeline.music
/**
 * Nhạc bản Full: Velocity_of_Ascent (120,01 BPM, phách đầu 0,06 s, dài 176 s) dựng lại theo ô nhịp cho vừa 3:12
 * của video (lặp 4 ô verse trước drop 1 và 8 ô groove trước drop cuối). Mốc theo giây nhạc (= giây video kể từ hook
 * trừ 1): logo 12 = vào verse · Thiết kế Cột 68 = drop 1 · hẹn lịch 107 trong đoạn lắng · Cổng Dữ Liệu 156 dồn lên ·
 * điền số thật 168 = drop cuối · logo kết 180 · bài tắt ~188,5.
 */
const FULL_MUSIC: Music = { file: 'music/velocity-of-ascent.mp3', delay: 30, trimBefore: 2, segments: [[4, 56], [16, 24], [56, 136], [112, 128], [132, 160], [172, 177]] }
const MUSIC_XFADE = 3
const MUSIC_GAIN = 0.7
const SFX_GAIN = 0.55
const SFX_TRIM: Record<string, number> = { 'wrong.wav': 0.35, 'type.wav': 0.55, 'riser.wav': 0.6, 'ding.wav': 0.8 }

const SCENE_HOOK: Scene = {
    id: 'hook', dur: 400, el: <HookScene />, sfx: [
        [8, 'type.wav', 0.45, 44], [54, 'pop.wav', 0.4], [HOOK.send, 'click.wav', 0.9], [HOOK.fly, 'whoosh.wav', 0.4],
        [82, 'swish.wav', 0.3],
        ...HOOK_JOINS.map(t => [t, 'pop.wav', 0.25] as Sfx), ...HOOK_DONES.map(t => [t, 'ding.wav', 0.18] as Sfx),
        ...HOOK_FLIPS.map(t => [t, 'swish.wav', 0.18] as Sfx),
        [HOOK.change, 'wrong.wav', 0.4], [386, 'riser.wav', 0.4],
    ],
}
/** Bản có nhạc (Biz + Full): trống của bài nhạc dồn lên cuối hook, không cần riser. */
const SCENE_HOOK_MUSIC: Scene = { ...SCENE_HOOK, sfx: SCENE_HOOK.sfx?.filter(([, src]) => src !== 'riser.wav') }
const SCENE_TURN: Scene = {
    id: 'turnFull', dur: 310, flash: true, el: <TurnScene />,
    sfx: [
        [0, 'impact.wav', 0.6], [2, 'whoosh.wav', 0.4],
        [106, 'whoosh-soft.wav', 0.35], [130, 'ding.wav', 0.3],
        [142, 'pop.wav', 0.3], [150, 'pop.wav', 0.3], [158, 'pop.wav', 0.3],
    ],
}
/** Bản Biz: không thẻ phụ, chỉ logo + một câu hứa; mốc chậm hơn bản Full TURN_BIZ_SHIFT khung để chữ hiện đúng ô nhịp. */
const SCENE_TURN_BIZ: Scene = {
    id: 'turn', dur: 250, flash: true, el: <TurnScene />,
    sfx: [[0, 'impact.wav', 0.5], [2, 'whoosh.wav', 0.4], [70 + TURN_BIZ_SHIFT, 'whoosh-soft.wav', 0.35], [130 + TURN_BIZ_SHIFT, 'ding.wav', 0.3]],
}
const SCENE_SEM_BIZ: Scene = {
    id: 'semBiz', dur: 490, el: <SemanticBizScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [SEM_BIZ.aiBtn, 'click.wav', 0.9], [SEM_BIZ.dialog, 'whoosh-soft.wav', 0.35], [SEM_BIZ.type, 'type.wav', 0.45, SEM_BIZ.typeEnd - SEM_BIZ.type],
        [SEM_BIZ.gen, 'click.wav', 1], [SEM_BIZ.proposal, 'pop.wav', 0.45], [SEM_BIZ.addCanvas, 'click.wav', 1], [SEM_BIZ.item, 'pop.wav', 0.4],
        [SEM_BIZ.run, 'click.wav', 1], ...[0, 1, 2, 3, 4].map(i => [SEM_BIZ.rows + i * SEM_BIZ.rowGap + 6, 'pop.wav', 0.22] as Sfx),
        [SEM_BIZ.submit, 'click.wav', 1], [SEM_BIZ.toast, 'pop.wav', 0.4], [SEM_BIZ.approved, 'ding.wav', 0.45], [SEM_BIZ.toCatalog, 'swish.wav', 0.35], [SEM_BIZ.banner, 'whoosh-soft.wav', 0.4],
    ],
}
const SCENE_JINJA: Scene = {
    id: 'excelJinja', dur: 310, el: <JinjaExcelScene />, sfx: [
        [0, 'whoosh.wav', 0.35], ...[0, 1, 2, 3, 4, 5, 6].map(i => [JINJA_T.slots + i * JINJA_T.slotGap, 'pop.wav', 0.25] as Sfx),
        [JINJA_T.attach, 'whoosh-soft.wav', 0.4], [JINJA_T.fly, 'swish.wav', 0.35], [JINJA_T.fly + 18, 'pop.wav', 0.35], [JINJA_T.click, 'click.wav', 1], [JINJA_T.click + 4, 'ding.wav', 0.4],
    ],
}
const SCENE_RECAP_BIZ: Scene = {
    id: 'recapBiz', dur: 280, el: <RecapBizScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [RECAP_T.before, 'pop.wav', 0.35], [RECAP_T.strike, 'wrong.wav', 0.35], [RECAP_T.arrow, 'whoosh.wav', 0.4], [RECAP_T.after, 'pop.wav', 0.45],
        ...[0, 1, 2].map(i => [RECAP_T.pills + i * RECAP_T.pillGap, 'pop.wav', 0.3] as Sfx),
    ],
}
/** Bản Biz: hỏi → ba ngả trong cùng một khung chat. */
const SCENE_CHAT_ASK: Scene = {
    id: 'chatAsk', dur: 430, flash: true, el: <ChatAskScene />, sfx: [
        [0, 'whoosh.wav', 0.4], [CHAT_ASK.paste, 'pop.wav', 0.45], [CHAT_ASK.send, 'click.wav', 1], [CHAT_ASK.send + 2, 'swish.wav', 0.3],
        ...[0, 1, 2].map(k => [CHAT_ASK.steps + k * CHAT_ASK.stepGap, 'pop.wav', 0.28] as Sfx),
        [CHAT_ASK.result - 4, 'whoosh.wav', 0.4], [CHAT_ASK.result + 2, 'pop.wav', 0.45], ...[0, 20, 40].map(k => [CHAT_ASK.cols + k, 'pop.wav', 0.2] as Sfx), [CHAT_ASK.cols + 58, 'ding.wav', 0.35],
        ...[0, 1, 2].map(i => [CHAT_ASK.actions + i * CHAT_ASK.actionGap, 'pop.wav', 0.4] as Sfx),
    ],
}
const SCENE_CHAT_DRILL: Scene = {
    id: 'chatDrill', dur: 280, el: <ChatDrillScene />, sfx: [
        [CHAT_DRILL.typeStart, 'type.wav', 0.45, CHAT_DRILL.typeEnd - CHAT_DRILL.typeStart], [CHAT_DRILL.send, 'click.wav', 1], [CHAT_DRILL.chart, 'whoosh-soft.wav', 0.4],
        ...[0, 12, 24].map(k => [CHAT_DRILL.bars + k, 'pop.wav', 0.3] as Sfx), [CHAT_DRILL.note, 'ding.wav', 0.4],
    ],
}
const SCENE_CHAT_SCH: Scene = {
    id: 'chatSchedule', dur: 370, el: <ChatScheduleScene />, sfx: [
        [CHAT_SCH.typeStart, 'type.wav', 0.45, CHAT_SCH.typeEnd - CHAT_SCH.typeStart], [CHAT_SCH.send, 'click.wav', 1], [CHAT_SCH.confirm, 'pop.wav', 0.45],
        [CHAT_SCH.approve, 'click.wav', 1], [CHAT_SCH.approve + 4, 'ding.wav', 0.4], [CHAT_SCH.inbox, 'whoosh.wav', 0.45], [CHAT_SCH.mail, 'ding.wav', 0.4],
    ],
}
const SCENE_PORTAL_BIZ: Scene = {
    id: 'portalBiz', dur: 490, el: <PortalBizScene />, sfx: [
        [0, 'whoosh.wav', 0.35], ...[1, 2, 3, 4, 5].map(i => [PTB.grid + i * 7, 'pop.wav', 0.2] as Sfx), [PTB.pick, 'click.wav', 0.9], [PTB.open, 'whoosh-soft.wav', 0.4],
        ...[0, 1, 2].map(i => [PTB.fields + i * PTB.fieldGap, 'pop.wav', 0.3] as Sfx), [PTB.focus, 'click.wav', 0.7], [PTB.type, 'type.wav', 0.5, PTB.typeEnd - PTB.type],
        [PTB.analyze, 'click.wav', 1], [PTB.understood, 'ding.wav', 0.35], [PTB.download, 'click.wav', 1], [PTB.file, 'pop.wav', 0.4], [PTB.sheet, 'whoosh.wav', 0.45],
        [PTB.fill, 'impact.wav', 0.5], [PTB.chips, 'ding.wav', 0.35],
    ],
}
/** Bản Full: hai sơ đồ so sánh trước / sau (kiến trúc dữ liệu, quy trình). "Bùm" đổi thành pop theo luật bớt tiếng mạnh. */
const SCENE_COMPARE_BEFORE: Scene = {
    id: 'compareBefore', dur: 430, el: <CompareBeforeScene />,
    sfx: [
        [0, 'whoosh.wav', 0.35],
        [CMP_BEFORE.tradSources, 'pop.wav', 0.35],
        [CMP_BEFORE.tradRms, 'pop.wav', 0.35],
        [CMP_BEFORE.tradUser, 'pop.wav', 0.35],
        [CMP_BEFORE.tradWarn, 'wrong.wav', 0.35],
        [CMP_BEFORE.newStart, 'whoosh-soft.wav', 0.4],
        [CMP_BEFORE.newMarts, 'pop.wav', 0.35],
        [CMP_BEFORE.newSemantix, 'pop.wav', 0.4],
        [CMP_BEFORE.newNotes, 'ding.wav', 0.4],
    ],
}
const SCENE_COMPARE_AFTER: Scene = {
    id: 'compareAfter', dur: 430, flash: true, el: <CompareAfterScene />,
    sfx: [
        [0, 'whoosh.wav', 0.4],
        [CMP_AFTER.oldStep1, 'pop.wav', 0.3],
        [CMP_AFTER.oldStep3, 'pop.wav', 0.3],
        [CMP_AFTER.oldClarify, 'pop.wav', 0.3],
        [CMP_AFTER.oldStep5, 'pop.wav', 0.3],
        [CMP_AFTER.oldGap, 'wrong.wav', 0.3],
        [CMP_AFTER.oldRework, 'whoosh-soft.wav', 0.25],
        [CMP_AFTER.oldPass, 'ding.wav', 0.3],
        [CMP_AFTER.newStart, 'whoosh-soft.wav', 0.4],
        [CMP_AFTER.newIt1, 'pop.wav', 0.35],
        [CMP_AFTER.newUser1, 'pop.wav', 0.35],
        [CMP_AFTER.newUser3, 'pop.wav', 0.4],
        [CMP_AFTER.newUser4, 'ding.wav', 0.45],
    ],
}
const SCENE_MODEL: Scene = {
    id: 'model', dur: 220, el: <ModelScene />, sfx: [
        [0, 'whoosh.wav', 0.35], ...[0, 1, 2, 3, 4, 5].map(i => [MODEL_TYPE(i) + 10, 'pop.wav', 0.25] as Sfx), [98, 'swish.wav', 0.3], [112, 'pop.wav', 0.4],
    ],
}
const SCENE_RELATIONS: Scene = {
    id: 'relations', dur: 340, el: <RelScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [REL.detect, 'click.wav', 0.9], [REL.dialog, 'pop.wav', 0.4], ...[0, 5, 10, 15].map(k => [REL.dialog + 8 + k, 'pop.wav', 0.2] as Sfx),
        [REL.accept, 'click.wav', 0.9], ...[0, 5, 10, 15].map(k => [REL.lines + k, 'swish.wav', 0.25] as Sfx), [REL.lines + 20, 'ding.wav', 0.3], [REL.ask, 'whoosh-soft.wav', 0.4],
    ],
}
const SCENE_BUTTON: Scene = {
    id: 'share', dur: 310, el: <ButtonScene />, sfx: [
        [0, 'whoosh.wav', 0.35], [BTN.click, 'click.wav', 1], [BTN.morph, 'whoosh.wav', 0.45],
        [BTN.name, 'pop.wav', 0.35], ...[0, 18, 36].map(k => [BTN.inputs + k, 'pop.wav', 0.35] as Sfx),
        [BTN.share, 'pop.wav', 0.4], [BTN.share + 14, 'swish.wav', 0.3], [BTN.save, 'click.wav', 1], [BTN.save + 4, 'ding.wav', 0.4],
    ],
}
const SCENE_PARAMS: Scene = {
    id: 'params', dur: 370, flash: true, el: <ParamsScene />, sfx: [
        [0, 'whoosh.wav', 0.4], [PRM.extraStart, 'type.wav', 0.45, PRM.extraEnd - PRM.extraStart], [PRM.ask, 'click.wav', 1],
        [PRM.diff, 'pop.wav', 0.45], ...[0, 8].map(k => [PRM.params + k, 'pop.wav', 0.4] as Sfx), [PRM.checks, 'ding.wav', 0.3],
        [PRM.apply, 'click.wav', 1], [PRM.manual + 4, 'pop.wav', 0.45], [PRM.morph, 'whoosh.wav', 0.45],
    ],
}
/** Dựng mẫu Excel trên MỘT trang tính: kéo khối / cột vào từng khu, bấm định dạng số, sửa tên cột, lưu. */
const SCENE_EXCEL: Scene = {
    id: 'excel', dur: 460, el: <ExcelBuildScene />, sfx: [
        [0, 'whoosh.wav', 0.35],
        [XB.title, 'swish.wav', 0.3], [XB.titleDrop, 'pop.wav', 0.4], [XB.titleDrop + 2, 'type.wav', 0.4, 18],
        [XB.note, 'swish.wav', 0.3], [XB.noteDrop, 'pop.wav', 0.4], [XB.noteDrop + 2, 'type.wav', 0.4, 28],
        ...[0, 1, 2, 3, 4].flatMap(i => [[XB.cols + i * XB.colGap, 'swish.wav', 0.25], [XB.cols + i * XB.colGap + XB.colDrag, 'pop.wav', 0.35]] as Sfx[]),
        [XB.select, 'click.wav', 0.9], [XB.fmtOpen, 'click.wav', 0.9], [XB.fmtPick, 'click.wav', 1], [XB.fmtPick + 4, 'ding.wav', 0.35],
        [XB.rename, 'click.wav', 0.8], [XB.renameType, 'type.wav', 0.45, XB.renameEnd - XB.renameType],
        [XB.save, 'click.wav', 1], [XB.save + 4, 'ding.wav', 0.4],
    ],
}
const SCENE_RECAP: Scene = {
    id: 'recap', dur: 250, el: <RecapScene />, sfx: [[0, 'whoosh.wav', 0.35], ...[0, 12, 24, 36, 48, 60].map(k => [18 + k, 'pop.wav', 0.33] as Sfx), [100, 'pop.wav', 0.4]],
}
const SCENE_OUTRO: Scene = {
    id: 'outro', dur: 300, flash: true, el: <OutroT />, sfx: [[0, 'impact.wav', 0.55], [OUTRO_T.word, 'whoosh.wav', 0.35], [OUTRO_T.cta, 'pop.wav', 0.4]],
}

/**
 * Bản Full cho BA / Power User (24/10): giữ hai sơ đồ so sánh kiến trúc / quy trình (user thêm lại), bỏ
 * ba thẻ chuẩn hoá, các cảnh nền tối và thẻ kiểm soát; dùng chung giao diện giả lập với bản Biz (Column Builder, khung chat,
 * Cổng Dữ Liệu), giữ phần riêng của BA Data (mô hình, nối bảng) và Power User (ô nhập, dựng mẫu Excel). Bỏ cảnh gắn
 * file Excel có sẵn cho vừa bài nhạc (user 24/10). Thời lượng canh theo FULL_MUSIC.
 */
export const SCENES_FULL: Scene[] = [
    SCENE_HOOK_MUSIC, SCENE_TURN, SCENE_COMPARE_BEFORE, SCENE_COMPARE_AFTER, SCENE_MODEL, SCENE_RELATIONS, SCENE_SEM_BIZ,
    SCENE_CHAT_ASK, SCENE_CHAT_DRILL, SCENE_CHAT_SCH, SCENE_BUTTON,
    SCENE_PARAMS, SCENE_EXCEL, SCENE_PORTAL_BIZ, SCENE_RECAP, { ...SCENE_OUTRO, dur: 290 },
]

/** Bản Biz cho cán bộ nghiệp vụ: thứ tự + thời lượng lấy từ timeline.json (chung với tools/gen_score.py). */
const BIZ_BY_ID: Record<string, Scene> = Object.fromEntries([
    SCENE_HOOK_MUSIC, SCENE_TURN_BIZ, SCENE_SEM_BIZ, SCENE_CHAT_ASK, SCENE_CHAT_DRILL, SCENE_CHAT_SCH, SCENE_BUTTON,
    SCENE_JINJA, SCENE_PORTAL_BIZ, SCENE_RECAP_BIZ, SCENE_OUTRO,
].map(s => [s.id, s]))
export const SCENES_BIZ: Scene[] = timeline.biz.map(({ id, dur }) => ({ ...BIZ_BY_ID[id], dur }))

/** Cắt cảnh đúng phách: mỗi cảnh (trừ cảnh cuối) dài dur - XF = bội số 2 phách, nếu không nhạc lệch hình. */
const BEAT = (timeline.fps * 60) / timeline.bpm
if (timeline.lead !== LEAD || timeline.xf !== XF) throw new Error('timeline.json: lead / xf phải khớp LEAD / XF trong PromoTemplate.tsx')
SCENES_BIZ.slice(0, -1).forEach(s => {
    if ((s.dur - XF) % (2 * BEAT) !== 0) throw new Error(`timeline.json: cảnh ${s.id} có dur - ${XF} = ${s.dur - XF}, phải là bội số ${2 * BEAT} khung để cắt đúng phách nhạc`)
})
// Bản Full cũng giữ lưới 2 phách để sau này ghép nhạc 120 BPM không phải dời cảnh
SCENES_FULL.slice(0, -1).forEach(s => {
    if ((s.dur - XF) % (2 * BEAT) !== 0) throw new Error(`Bản Full: cảnh ${s.id} có dur - ${XF} = ${s.dur - XF}, phải là bội số ${2 * BEAT} khung để cắt đúng phách nhạc`)
})

const computeTimeline = (scenes: Scene[]) => {
    const starts = scenes.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? LEAD : acc[i - 1] + scenes[i - 1].dur - XF], [])
    const total = starts[starts.length - 1] + scenes[scenes.length - 1].dur
    const map = Object.fromEntries(scenes.map((s, i) => [s.id, starts[i]]))
    return { starts, total, map }
}

const FULL_TL = computeTimeline(SCENES_FULL)
const BIZ_TL = computeTimeline(SCENES_BIZ)

export const TEMPLATE_FRAMES = FULL_TL.total
export const TEMPLATE_STARTS = FULL_TL.map

export const TEMPLATE_BIZ_FRAMES = BIZ_TL.total
export const TEMPLATE_BIZ_STARTS = BIZ_TL.map

const Flash: React.FC = () => {
    const f = useCurrentFrame()
    const o = ease(f, [XF - 2, XF + 8], [0.75, 0])
    return o > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: o, pointerEvents: 'none' }} /> : null
}

/** Nhạc nền một bài liền, hoặc dựng từ nhiều đoạn (đan tiếng ở chỗ nối). Bài tự tắt cùng video nên không fade cuối. */
const MusicTrack: React.FC<{ music: Music; total: number }> = ({ music, total }) => {
    const from = LEAD + music.delay
    const fps = timeline.fps
    if (!music.segments) {
        return (
            <Sequence name="music" from={from} durationInFrames={total - from} layout="none">
                <Audio src={staticFile(music.file)} trimBefore={music.trimBefore} volume={f => interpolate(f, [0, 6], [0, 1], CLAMP) * MUSIC_GAIN} />
            </Sequence>
        )
    }
    const segs = music.segments
    const offsets = segs.reduce<number[]>((acc, [a, b], i) => [...acc, i === 0 ? 0 : acc[i - 1] + (segs[i - 1][1] - segs[i - 1][0]) * fps], [])
    return (
        <>
            {segs.map(([a, b], i) => {
                const first = i === 0, last = i === segs.length - 1
                const pre = first ? 0 : MUSIC_XFADE, post = last ? 0 : MUSIC_XFADE
                const start = from + offsets[i] - pre
                const dur = Math.min((b - a) * fps + pre + post, total - start)
                if (dur <= 0) return null
                const vol = (f: number) => {
                    const fin = first ? Math.min(1, f / 6) : Math.min(1, f / (2 * MUSIC_XFADE))
                    const fout = last ? 1 : Math.min(1, (dur - f) / (2 * MUSIC_XFADE))
                    return Math.max(0, fin) * Math.max(0, fout) * MUSIC_GAIN
                }
                return (
                    <Sequence key={i} name={`music ${a}-${b}s`} from={start} durationInFrames={dur} layout="none">
                        <Audio src={staticFile(music.file)} trimBefore={a * fps + music.trimBefore - pre} volume={vol} />
                    </Sequence>
                )
            })}
        </>
    )
}

const renderTimeline = (scenes: Scene[], starts: number[], total: number, mode: TemplateMode, music: Music | null = null) => {
    return (
        <TemplateModeCtx.Provider value={mode}>
            <AbsoluteFill style={{ background: '#F7F6FE' }}>
                <Sequence name="lead" durationInFrames={LEAD + XF}><Stage /></Sequence>
                {scenes.map((s, i) => (
                    <Sequence key={s.id} name={s.id} from={starts[i]} durationInFrames={s.dur}>
                        <DarkCtx.Provider value={!!s.dark}>
                            <Whip dur={s.dur} len={XF} first={i === 0} last={i === scenes.length - 1} softIn={s.soft} softOut={scenes[i + 1]?.soft}>{s.el}</Whip>
                        </DarkCtx.Provider>
                        {s.flash && <Flash />}
                    </Sequence>
                ))}
                {music && <MusicTrack music={music} total={total} />}
                {scenes.flatMap((s, i) => (s.sfx || []).map(([at, src, vol, len], k) => (
                    <Sequence key={`${s.id}-${k}`} from={starts[i] + at} durationInFrames={len ?? 90} layout="none">
                        <Audio src={staticFile(`sfx/${src}`)} volume={vol * SFX_GAIN * (SFX_TRIM[src] ?? 1)} />
                    </Sequence>
                )))}
            </AbsoluteFill>
        </TemplateModeCtx.Provider>
    )
}

export const PromoTemplate: React.FC = () => renderTimeline(SCENES_FULL, FULL_TL.starts, FULL_TL.total, 'full', FULL_MUSIC)
export const PromoTemplateBiz: React.FC = () => renderTimeline(SCENES_BIZ, BIZ_TL.starts, BIZ_TL.total, 'biz', BIZ_MUSIC)
