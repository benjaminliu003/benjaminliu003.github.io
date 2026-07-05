// One-off: turn the oversized root cheese.png (~1.84 MB) into a small favicon
// set under public/. The cheese stays — it's the "I Like Cheese :)" signature.
// Outputs are committed; re-run only if the source changes. Budget: ≤40 KB total.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const SRC = join(ROOT, 'cheese.png')
const PUBLIC = join(ROOT, 'public')

if (!existsSync(SRC)) {
  console.error('[favicons] cheese.png not found at repo root.')
  process.exit(1)
}
const src = readFileSync(SRC)

const targets = [
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'icon-180.png', size: 180 }, // apple-touch
]

let total = 0
for (const t of targets) {
  const out = await sharp(src)
    .resize(t.size, t.size, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  writeFileSync(join(PUBLIC, t.name), out)
  total += out.length
  console.log(`[favicons] ${t.name.padEnd(16)} ${(out.length / 1024).toFixed(1)}KB`)
}
console.log(`[favicons] total ${(total / 1024).toFixed(1)}KB (budget 40KB)`)
