// Quay màn hình thật bằng CDP screencast (nét gấp đôi) + con trỏ hiển thị + nhật ký thao tác.
// Usage: node rec.mjs <profileDir> <outDir> <scenario.mjs>
//   scenario.mjs: export default async ({ page, move, click, type, wait, mark }) => { ... }
// Kết quả: <outDir>/frames/*.jpg, frames.json (thời điểm từng khung), events.json (con trỏ/bấm/gõ).
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const [profile, outDir, scenarioPath] = process.argv.slice(2)
process.env.REC_OUT = outDir
fs.mkdirSync(path.join(outDir, 'frames'), { recursive: true })

const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'msedge', headless: true,
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2,
})

if (process.env.REC_NOCURSOR) await ctx.addInitScript(() => { window.__recNoCursor = true })
// Con trỏ + gợn sóng vẽ trong trang (Playwright không vẽ con trỏ vào hình).
await ctx.addInitScript(() => {
    // Tắt banner "Cài đặt Semanio" (PWA) cho hồ sơ quay — tương đương người dùng bấm bỏ qua.
    try { localStorage.setItem('semantix_pwa_install_dismissed', '1') } catch {}
    // REC_NOCURSOR: không vẽ con trỏ/gợn sóng trong trang — Remotion tự vẽ mượt từ events.json
    if (window.__recNoCursor) return
    const install = () => {
        if (document.getElementById('__rec_cursor')) return
        const c = document.createElement('div')
        c.id = '__rec_cursor'
        c.style.cssText = 'position:fixed;left:0;top:0;width:34px;height:34px;z-index:2147483647;pointer-events:none;transform:translate(-200px,-200px);filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))'
        c.innerHTML = '<svg width="34" height="34" viewBox="0 0 28 28"><path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#fff" stroke="#231F3A" stroke-width="1.6" stroke-linejoin="round"/></svg>'
        document.documentElement.appendChild(c)
        addEventListener('mousemove', e => { c.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 2}px)` }, true)
        addEventListener('mousedown', e => {
            const r = document.createElement('div')
            r.style.cssText = `position:fixed;left:${e.clientX - 10}px;top:${e.clientY - 10}px;width:20px;height:20px;border-radius:50%;border:4px solid rgba(109,93,246,.9);z-index:2147483646;pointer-events:none;transition:all .45s cubic-bezier(.2,.7,.2,1);`
            document.documentElement.appendChild(r)
            requestAnimationFrame(() => { r.style.left = `${e.clientX - 40}px`; r.style.top = `${e.clientY - 40}px`; r.style.width = '80px'; r.style.height = '80px'; r.style.opacity = '0' })
            setTimeout(() => r.remove(), 600)
        }, true)
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install)
    else install()
})

const page = ctx.pages()[0] || (await ctx.newPage())
const cdp = await ctx.newCDPSession(page)
const frames = []
let n = 0
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = `f${String(n++).padStart(5, '0')}.jpg`
    fs.writeFileSync(path.join(outDir, 'frames', file), Buffer.from(data, 'base64'))
    frames.push({ file, t: metadata.timestamp })
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
})

const events = []
const now = () => Date.now() / 1000
let cur = { x: 960, y: 1000 }
const mark = (name, extra = {}) => events.push({ t: now(), type: 'mark', name, ...extra })
const move = async (x, y, ms = 700) => {
    // đường cong nhẹ, chậm dần ở cuối — như tay người
    const steps = Math.max(12, Math.round(ms / 16))
    const from = { ...cur }
    const mid = { x: (from.x + x) / 2 + (y - from.y) * 0.18, y: (from.y + y) / 2 - (x - from.x) * 0.12 }
    for (let i = 1; i <= steps; i++) {
        const t = 1 - Math.pow(1 - i / steps, 3)
        const u = 1 - t
        const px = u * u * from.x + 2 * u * t * mid.x + t * t * x
        const py = u * u * from.y + 2 * u * t * mid.y + t * t * y
        await page.mouse.move(px, py)
        events.push({ t: now(), type: 'move', x: px, y: py })
        await page.waitForTimeout(ms / steps)
    }
    cur = { x, y }
}
const click = async (locator, opts = {}) => {
    const box = await locator.boundingBox()
    if (!box) throw new Error('không thấy phần tử để bấm')
    const x = box.x + box.width * (opts.fx ?? 0.5)
    const y = box.y + box.height * (opts.fy ?? 0.5)
    await move(x, y, opts.ms ?? 700)
    await page.waitForTimeout(180)
    events.push({ t: now(), type: 'click', x, y, label: opts.label || '' })
    await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up()
}
const clickAt = async (x, y, label = '', ms = 700) => {
    await move(x, y, ms)
    await page.waitForTimeout(180)
    events.push({ t: now(), type: 'click', x, y, label })
    await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up()
}
const rclickAt = async (x, y, label = "", ms = 600) => {
    await move(x, y, ms)
    await page.waitForTimeout(160)
    events.push({ t: now(), type: "click", x, y, label, button: "right" })
    await page.mouse.down({ button: "right" }); await page.waitForTimeout(70); await page.mouse.up({ button: "right" })
}
const type = async (text, delay = 55) => {
    events.push({ t: now(), type: 'typeStart', x: cur.x, y: cur.y, text })
    await page.keyboard.type(text, { delay })
    events.push({ t: now(), type: 'typeEnd', x: cur.x, y: cur.y })
}
const wait = ms => page.waitForTimeout(ms)

// REC_QUALITY: jpeg nhẹ hơn → trình duyệt đẩy khung đều hơn (ít hụt khung khi trang nặng)
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: Number(process.env.REC_QUALITY || 92), maxWidth: 3840, maxHeight: 2160, everyNthFrame: 1 })
const t0 = now()
events.push({ t: t0, type: 'start' })
try {
    const scenario = (await import(pathToFileURL(path.resolve(scenarioPath)).href)).default
    await scenario({ page, move, click, clickAt, rclickAt, type, wait, mark })
} catch (e) {
    console.error('Kịch bản lỗi:', e.message)
    await page.screenshot({ path: path.join(outDir, 'error.png') })
} finally {
    events.push({ t: now(), type: 'end' })
    await cdp.send('Page.stopScreencast').catch(() => {})
    fs.writeFileSync(path.join(outDir, 'frames.json'), JSON.stringify(frames))
    fs.writeFileSync(path.join(outDir, 'events.json'), JSON.stringify(events))
    console.log(`frames=${frames.length} events=${events.length} dur=${(now() - t0).toFixed(1)}s url=${page.url()}`)
    await ctx.close()
}
