// Chép SFX dùng chung của blog2video (../assets/sfx) vào public/sfx cho Remotion staticFile().
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = path.resolve(here, '../../assets/sfx')
const dst = path.resolve(here, '../public/sfx')
fs.mkdirSync(dst, { recursive: true })
let n = 0
for (const f of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, f), path.join(dst, f))
    n++
}
console.log(`sfx: ${n} tệp → ${dst}`)
