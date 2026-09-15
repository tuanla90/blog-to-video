// Chạy một chuỗi thao tác (chỉ đọc/khám phá) rồi chụp ảnh + cây ARIA sau mỗi bước "shot".
// Usage: node act.mjs <profileDir> <url> <outDir> <steps.json>
// steps: [{ "click": {"role":"button","name":"E-com"} } | { "clickText": "..." } | { "type": "..." }
//         | { "press": "Enter" } | { "wait": 1500 } | { "shot": "name" } | { "goto": "url" }]
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const [profile, url, outDir, stepsFile] = process.argv.slice(2)
const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8'))
const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'msedge', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: Number(process.env.DPR || 1),
})
const page = ctx.pages()[0] || (await ctx.newPage())
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4000)
for (const s of steps) {
    if (s.goto) { await page.goto(s.goto, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(3000) }
    if (s.click) await page.getByRole(s.click.role, { name: s.click.name, exact: !!s.click.exact }).first().click()
    if (s.clickText) await page.getByText(s.clickText, { exact: false }).first().click()
    if (s.clickPlaceholder) await page.getByPlaceholder(s.clickPlaceholder).first().click()
    if (s.wheel) { await page.mouse.move(s.wheel[0], s.wheel[1]); await page.mouse.wheel(0, s.wheel[2]) }
    if (s.clickXY) await page.mouse.click(s.clickXY[0], s.clickXY[1])
    if (s.rclickXY) await page.mouse.click(s.rclickXY[0], s.rclickXY[1], { button: "right" })
    if (s.hoverXY) await page.mouse.move(s.hoverXY[0], s.hoverXY[1], { steps: 8 })
    if (s.type) await page.keyboard.type(s.type, { delay: 20 })
    if (s.press) await page.keyboard.press(s.press)
    if (s.wait) await page.waitForTimeout(s.wait)
    if (s.shot) {
        await page.screenshot({ path: `${outDir}/${s.shot}.png` })
        const aria = await page.locator('body').ariaSnapshot().catch(e => `aria failed: ${e}`)
        fs.writeFileSync(`${outDir}/${s.shot}.aria.txt`, `URL: ${page.url()}\n\n${aria}`)
        console.log('shot', s.shot, page.url())
    }
}
await ctx.close()
