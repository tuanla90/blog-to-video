// Đóng gói một lần, chụp nhiều khung của một composition (nhanh hơn gọi `remotion still` từng lần).
// Usage: node tools/stills.mjs <compositionId> <outDir> <frame,frame,...> [scale]
// API không đọc remotion.config.ts → truyền thẳng Chrome cài sẵn (mạng chặn tải Chrome Headless Shell).
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'node:path'
import fs from 'node:fs'

const browserExecutable = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const [id, outDir, framesArg, scaleArg] = process.argv.slice(2)
fs.mkdirSync(outDir, { recursive: true })
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
const composition = await selectComposition({ serveUrl, id, browserExecutable })
for (const frame of framesArg.split(',').map(Number)) {
    const output = path.join(outDir, `${id}-${String(frame).padStart(5, '0')}.png`)
    await renderStill({ serveUrl, composition, frame, output, scale: Number(scaleArg || 0.5), browserExecutable })
    console.log('still', frame)
}
