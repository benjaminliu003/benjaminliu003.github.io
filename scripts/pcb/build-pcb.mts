// M2 — Gerber -> derived-asset pipeline for ELI_Frisbee_Mk.I.
//
// LOCAL ONLY. Reads raw Gerbers from PCB_SRC (gitignored) and writes derived,
// shippable assets to public/pcb/ + a zod-validated manifest to
// lib/generated/pcb-manifest.json. CI never runs this; the derived assets are
// committed. Raw fab data never leaves this machine. See AGENTS.md.
//
// Pipeline: render each allowlisted layer with gerber-to-svg (baked colour),
// reframe every layer onto a common viewBox + common Y-flip so they overlay
// exactly, SVGO the shipped-SVG layers, raster-composite the inner + plane
// layers (negative planes = copper disc MINUS clearance artwork via sharp
// dest-out), build the pcb-stackup "money shot" composite, emit an exploded
// static fallback, and write the manifest.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import gerberToSvg from 'gerber-to-svg'
import pcbStackup from 'pcb-stackup'
import { optimize } from 'svgo'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { LAYERS, DRILLS, DEFAULT_PCB_SRC, type LayerSpec } from './layers.mts'
import { Manifest, type LayerEntry } from './manifest-schema.mts'

const SRC = process.env.PCB_SRC || DEFAULT_PCB_SRC
const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const OUT_DIR = join(ROOT, 'public', 'pcb')
const MANIFEST_PATH = join(ROOT, 'lib', 'generated', 'pcb-manifest.json')
const INNER_RASTER_W = 1000 // px; inner/plane layers are seen tilted/smaller in the stack
const BOARD_TOP_W = 1000 // hero board image (M4 generates the real OG card separately)
const BOARD_BOTTOM_W = 640 // flip/detail view (least critical; trimmed for budget margin)

if (!existsSync(SRC)) {
  console.error(`\n[pcb:build] PCB source not found: ${SRC}`)
  console.error('Set PCB_SRC to the Gerber output dir. This pipeline is LOCAL ONLY;')
  console.error('CI builds from the committed public/pcb assets, not from Gerbers.\n')
  process.exit(1)
}

const read = (file: string) => readFileSync(join(SRC, file), 'utf8')
const present = new Set(readdirSync(SRC))

// --- gerber-to-svg render (streaming -> string), colour baked via svg style ---
function renderGerber(gerber: string, id: string): Promise<{ svg: string; viewBox: number[] }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const conv = gerberToSvg(gerber, { id }, (err: unknown) => {
      if (err) reject(err)
    })
    conv.on('data', (c: Buffer) => chunks.push(c))
    conv.on('error', reject)
    conv.on('end', () => resolve({ svg: Buffer.concat(chunks).toString('utf8'), viewBox: conv.viewBox }))
  })
}

// Common frame: gerber coords are absolute board microns shared by every file;
// only each layer's computed bbox differs. Force one viewBox + one Y-flip
// (translate(0, 2*yMin+height) scale(1,-1)) and all layers overlay exactly.
function reframe(svg: string, view: number[], flipT: number, color: string): string {
  const [x, y, w, h] = view
  const mm = (n: number) => Math.round((n / 1000) * 1000) / 1000
  return svg
    .replace(/viewBox="[^"]*"/, `viewBox="${x} ${y} ${w} ${h}"`)
    .replace(/\swidth="[^"]*"/, ` width="${mm(w)}mm"`)
    .replace(/\sheight="[^"]*"/, ` height="${mm(h)}mm"`)
    .replace(/translate\(0,[\d.]+\) scale\(1,-1\)/, `translate(0,${flipT}) scale(1,-1)`)
    .replace(/<svg /, `<svg style="color:${color}" `)
}

function svgo(svg: string): string {
  // SVGO v4's preset-default no longer strips viewBox, so no override is needed.
  const { data } = optimize(svg, { multipass: true, floatPrecision: 2 })
  return data
}

const rasterize = (svg: string, width: number, background?: string): Buffer =>
  Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: width }, ...(background ? { background } : {}) })
      .render()
      .asPng(),
  )

const sizeOf = (buf: Buffer | string) => {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
  return { raw: b.length, gzip: gzipSync(b).length }
}

// WebP-only for v1: broad support, strong compression, half the committed
// bytes and build time of shipping an AVIF twin. AVIF can be added in M7 if a
// budget needs the extra squeeze (it was only marginally smaller here).
async function writeRaster(
  base: string,
  png: Buffer,
): Promise<{ webp: string; width: number; bytes: number }> {
  const meta = await sharp(png).metadata()
  const info = await sharp(png).webp({ quality: 80, effort: 6 }).toFile(join(OUT_DIR, `${base}.webp`))
  return { webp: `/pcb/${base}.webp`, width: meta.width ?? INNER_RASTER_W, bytes: info.size }
}

async function main() {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })
  mkdirSync(join(ROOT, 'lib', 'generated'), { recursive: true })

  const active = LAYERS.filter((l) => present.has(l.file))
  const missing = LAYERS.filter((l) => !present.has(l.file))
  if (missing.length) console.warn(`[pcb:build] missing (skipped): ${missing.map((l) => l.file).join(', ')}`)

  // Render every layer once (raw, own frame) so we can compute the common frame.
  const raw = new Map<string, { svg: string; viewBox: number[]; spec: LayerSpec }>()
  for (const spec of active) {
    const r = await renderGerber(read(spec.file), spec.id)
    raw.set(spec.id, { ...r, spec })
  }

  // Common frame = union of all layer viewBoxes.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const { viewBox } of raw.values()) {
    const [x, y, w, h] = viewBox
    minX = Math.min(minX, x); minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h)
  }
  const common: [number, number, number, number] = [minX, minY, maxX - minX, maxY - minY]
  const flipT = 2 * minY + (maxY - minY) // = minY + maxY
  const round = (n: number) => Math.round(n * 100) / 100
  const commonR = common.map(round) as [number, number, number, number]

  // Board disc = the outline geometry, filled — perfectly aligned, no math.
  const outlineSpec = active.find((l) => l.kind === 'outline')!
  const outlineRaw = raw.get(outlineSpec.id)!
  const boardDisc = (color: string) =>
    reframe(outlineRaw.svg, commonR, round(flipT), color).replace(/fill="none"/g, `fill="${color}"`)

  const layerEntries: LayerEntry[] = []

  for (const spec of active) {
    const { svg } = raw.get(spec.id)!
    const framed = reframe(svg, commonR, round(flipT), spec.color)

    if (spec.shipAs === 'svg') {
      const opt = svgo(framed)
      writeFileSync(join(OUT_DIR, `${spec.id}.svg`), opt)
      layerEntries.push(entry(spec, { svg: `/pcb/${spec.id}.svg`, webp: null, avif: null, width: 0 }, sizeOf(opt)))
      continue
    }

    // Raster layers (inner copper + planes). Planes: copper disc MINUS clearances.
    let png: Buffer
    if (spec.negative) {
      const base = rasterize(boardDisc(spec.color), INNER_RASTER_W) // solid copper disc
      const knock = rasterize(reframe(svg, commonR, round(flipT), '#ffffff'), INNER_RASTER_W) // clearances, opaque
      png = await sharp(base).composite([{ input: knock, blend: 'dest-out' }]).png().toBuffer()
    } else {
      png = rasterize(framed, INNER_RASTER_W)
    }
    // WebP is pre-compressed, so gzip ≈ raw; record the shipped file size.
    const { webp, width, bytes } = await writeRaster(spec.id, png)
    layerEntries.push(entry(spec, { svg: null, webp, avif: null, width }, { raw: bytes, gzip: bytes }))
  }

  // --- Money shot: pcb-stackup top/bottom composite (hero + OG). Shipped as
  // raster: pcb-stackup emits random per-layer ids (non-deterministic SVG),
  // but the rasterised pixels are stable. Vector composite deferred to M5/M6.
  const stackLayers = active.map((l) => ({ filename: l.file, gerber: read(l.file) }))
  const stackup = await pcbStackup(stackLayers)
  const topPng = rasterize(stackup.top.svg, BOARD_TOP_W, '#0d1a14')
  const bottomPng = rasterize(stackup.bottom.svg, BOARD_BOTTOM_W, '#0d1a14')
  await sharp(topPng).webp({ quality: 84, effort: 6 }).toFile(join(OUT_DIR, 'board-top.webp'))
  await sharp(bottomPng).webp({ quality: 84, effort: 6 }).toFile(join(OUT_DIR, 'board-bottom.webp'))

  // --- Exploded static fallback (no-JS / reduced-motion / SSR) ---
  const explodedStatic = buildExplodedStatic(commonR, layerEntries)
  writeFileSync(join(OUT_DIR, 'exploded-static.svg'), svgo(explodedStatic))

  // --- Drills (counts for the manifest; through-hole overlay as SVG) ---
  const drills = DRILLS.filter((d) => present.has(d.file)).map((d) => {
    const body = read(d.file)
    const count = (body.match(/X[\d.-]+Y[\d.-]+/g) || []).length
    return { id: d.id, type: d.type, label: d.label, count, asset: null }
  })

  // --- Manifest ---
  const sourceHash = createHash('sha256')
    .update(active.map((l) => read(l.file)).join('\0'))
    .digest('hex')
    .slice(0, 16)

  const manifest = Manifest.parse({
    board: { name: 'ELI_Frisbee_Mk.I', title: 'MTL Smoked Meat Sandwich', sourceHash, units: 'mm' },
    viewBox: commonR,
    layers: layerEntries,
    drills,
    composites: {
      top: '/pcb/board-top.webp',
      bottom: '/pcb/board-bottom.webp',
      explodedStatic: '/pcb/exploded-static.svg',
    },
  })
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')

  report(layerEntries, drills)
}

function entry(spec: LayerSpec, assets: LayerEntry['assets'], bytes: { raw: number; gzip: number }): LayerEntry {
  return {
    id: spec.id, order: spec.order, kind: spec.kind, side: spec.side, label: spec.label,
    shipAs: spec.shipAs, polarity: spec.negative ? 'negative' : 'positive', assets, bytes,
  }
}

// Simple isometric exploded stack: each layer offset in Y, back-to-front.
function buildExplodedStatic(view: [number, number, number, number], layers: LayerEntry[]): string {
  const [x, y, w, h] = view
  const gap = h * 0.16
  const ordered = [...layers].sort((a, b) => b.order - a.order) // bottom drawn first
  const vh = h + gap * (ordered.length - 1)
  const parts = ordered
    .map((l, i) => {
      const href = l.assets.svg ?? l.assets.webp
      const ty = i * gap
      return `<image x="${x}" y="${y + ty}" width="${w}" height="${h}" href="${href}" opacity="0.92" transform="skewX(-12)"/>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - w * 0.15} ${y} ${w * 1.3} ${vh}" role="img" aria-label="Exploded 8-layer stackup of the board">${parts}</svg>`
}

function report(layers: LayerEntry[], drills: { id: string; count: number }[]) {
  const kb = (n: number) => (n / 1024).toFixed(1)
  let totalGz = 0
  console.log('\n[pcb:build] layers:')
  for (const l of layers) {
    totalGz += l.bytes.gzip
    console.log(`  ${l.id.padEnd(20)} ${l.shipAs.padEnd(6)} raw=${kb(l.bytes.raw)}KB gz=${kb(l.bytes.gzip)}KB`)
  }
  console.log(`[pcb:build] drills: ${drills.map((d) => `${d.id}=${d.count}`).join(' ')}`)
  console.log(`[pcb:build] total layer gzip: ${kb(totalGz)}KB (budget note: full public/pcb checked by check:budgets)`)
  console.log('[pcb:build] done.\n')
}

main().catch((e) => {
  console.error('[pcb:build] FAILED:', e)
  process.exit(1)
})
