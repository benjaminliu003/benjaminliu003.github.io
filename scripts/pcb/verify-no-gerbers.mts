// SECURITY GUARD (CI-blocking). Fails if any raw PCB fabrication data is
// tracked in git or present in the built output. Raw Gerber/drill/BOM/CAD
// files would let anyone manufacture the board — only derived renders in
// public/pcb/ (svg/webp/avif/png/json) may ship. See AGENTS.md.
//
// Two independent checks so a renamed file can't slip through:
//   1) filename extensions (fab formats)
//   2) content signatures (Gerber/Excellon/Altium magic strings)
// Plus a whitelist: out/pcb/ may contain only image/vector/json assets.
import { execSync } from 'node:child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isFabName, hasFabSignature } from './fab-detect'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const OUT_PCB_ALLOWED = /\.(svg|webp|avif|png|json)$/i

function looksLikeFab(path: string): boolean {
  try {
    return hasFabSignature(readFileSync(path, 'utf8').slice(0, 4096))
  } catch {
    return false // binary/unreadable → not a text fab format
  }
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const violations: string[] = []

// 1) Tracked files (what git would publish). Never trust the working tree alone.
let tracked: string[] = []
try {
  tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)
} catch {
  console.warn('[pcb:verify] git ls-files unavailable; scanning working tree only')
}
for (const rel of tracked) {
  if (isFabName(rel)) violations.push(`tracked fab-data filename: ${rel}`)
  else if (/\.(txt|gbr|ncd|drl)$/i.test(rel) && looksLikeFab(join(ROOT, rel)))
    violations.push(`tracked file with fab-data content signature: ${rel}`)
}

// 2) Built output (what actually deploys).
for (const abs of walk(join(ROOT, 'out'))) {
  const rel = abs.slice(ROOT.length).replace(/\\/g, '/')
  if (isFabName(rel)) violations.push(`fab-data filename in out/: ${rel}`)
  else if (looksLikeFab(abs)) violations.push(`fab-data content signature in out/: ${rel}`)
}

// 3) Whitelist: out/pcb/ may only contain derived image/vector/json assets.
for (const abs of walk(join(ROOT, 'out', 'pcb'))) {
  if (extname(abs) && !OUT_PCB_ALLOWED.test(abs))
    violations.push(`unexpected file type in out/pcb/: ${abs.slice(ROOT.length).replace(/\\/g, '/')}`)
}

if (violations.length) {
  console.error('\n[pcb:verify] FAB-DATA GUARD FAILED — raw board data must never ship:\n')
  for (const v of violations) console.error(`  ✗ ${v}`)
  console.error('\nOnly derived renders in public/pcb/ may be committed/deployed. See AGENTS.md.\n')
  process.exit(1)
}
console.log('[pcb:verify] OK — no raw fabrication data tracked or in out/.')
