// Mở Edge (có sẵn trên máy) với một hồ sơ riêng để NGƯỜI DÙNG tự đăng nhập.
// Script không đọc, không nhập mật khẩu — chỉ chờ tới khi rời trang /login rồi đóng,
// để các script quay/chụp sau dùng lại phiên trong cùng hồ sơ.
// Usage: node login.mjs <profileDir> [baseUrl]
import { chromium } from 'playwright-core'

const profile = process.argv[2]
const base = process.argv[3] || 'https://semanio.vn'
const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'msedge',
    headless: false,
    viewport: { width: 1440, height: 900 },
})
const page = ctx.pages()[0] || (await ctx.newPage())
await page.goto(`${base}/vi/login`)
// base có thể là domain khác: phiên đăng nhập lưu theo từng domain trong cùng hồ sơ
console.log('Đã mở cửa sổ Edge — chờ người dùng đăng nhập (tối đa 15 phút)…')
const deadline = Date.now() + 15 * 60 * 1000
while (Date.now() < deadline) {
    await page.waitForTimeout(2000)
    const url = page.url()
    if (!url.includes('/login') && !url.includes('/auth')) {
        console.log('Đã đăng nhập, đang ở:', url)
        await page.waitForTimeout(3000)
        await ctx.close()
        process.exit(0)
    }
}
console.log('Hết thời gian chờ đăng nhập.')
await ctx.close()
process.exit(1)
