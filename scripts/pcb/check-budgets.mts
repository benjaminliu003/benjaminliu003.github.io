// Asset-budget gate (CI-blocking). Enforces the PCB asset budgets from the
// Roadmap so the signature centerpiece can never regress site performance.
// SVG layers are measured gzip (served gzipped); WebP/AVIF are pre-compressed
// so measured by raw file size. See Roadmap/Roadmap.md "Asset budgets".
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const PCB_DIR = join(ROOT, 'public', 'pcb')

const KB = 1024
const BUDGET = {
  svgLayerGzip: 45 * KB, // per shipped SVG layer
  rasterLayer: 60 * KB, // per raster layer (webp)
  composite: 150 * KB, // per hero/OG composite
  totalCompressed: 450 * KB, // entire public/pcb (svg gzip + image raw)
}

if (!existsSync(PCB_DIR)) {
  console.error('[check:budgets] public/pcb missing — run pnpm pcb:build first.')
  process.exit(1)
}

const files = readdirSync(PCB_DIR).filter((f) => statSync(join(PCB_DIR, f)).isFile())
const failures: string[] = []
let totalCompressed = 0

const compressedSize = (file: string): number => {
  const buf = readFileSync(join(PCB_DIR, file))
  // Text assets (svg) are served gzipped; images are already compressed.
  return extname(file) === '.svg' ? gzipSync(buf).length : buf.length
}
const kb = (n: number) => (n / KB).toFixed(1)

for (const file of files) {
  const size = compressedSize(file)
  totalCompressed += size
  const isComposite = /^board-(top|bottom)\./.test(file)
  const isSvg = extname(file) === '.svg'
  let limit = Infinity
  let label = ''
  if (isComposite) { limit = BUDGET.composite; label = 'composite' }
  else if (isSvg) { limit = BUDGET.svgLayerGzip; label = 'svg-layer(gzip)' }
  else if (/\.(webp|avif|png)$/.test(file)) { limit = BUDGET.rasterLayer; label = 'raster' }
  if (size > limit) failures.push(`${file} (${label}) ${kb(size)}KB > ${kb(limit)}KB`)
}

if (totalCompressed > BUDGET.totalCompressed)
  failures.push(`public/pcb total ${kb(totalCompressed)}KB > ${kb(BUDGET.totalCompressed)}KB`)

console.log(`[check:budgets] public/pcb total (compressed): ${kb(totalCompressed)}KB / ${kb(BUDGET.totalCompressed)}KB`)
if (failures.length) {
  console.error('\n[check:budgets] BUDGET EXCEEDED:')
  for (const f of failures) console.error(`  ✗ ${f}`)
  console.error('\nReduce raster width, tighten SVGO, or drop a layer. See Roadmap budgets.\n')
  process.exit(1)
}
console.log('[check:budgets] OK — all PCB assets within budget.')
