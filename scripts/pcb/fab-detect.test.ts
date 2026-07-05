import { describe, expect, it } from 'vitest'
import { isFabName, hasFabSignature } from './fab-detect'

// A TINY SYNTHETIC Gerber — enough to trip the signature check. NEVER use the
// real board's Gerbers in tests (they must never enter the repo).
const SYNTHETIC_GERBER = `G04 #@! TF.FilePolarity,Positive*
%FSLAX45Y45*%
%MOMM*%
%ADD10C,1.0*%
D10*
X0Y0D03*
M02*`

const SYNTHETIC_DRILL = `M48
FMAT,2
METRIC
T1C0.300
%
T1
X10Y10
M30`

describe('fab-data filename detection', () => {
  it('flags raw Gerber/drill/CAD extensions', () => {
    for (const name of [
      'Take2.GTL', 'take2.gbl', 'Board.GP1', 'Board.G3', 'x.GM', 'x.GM13',
      'x.DRR', 'x.EXTREP', 'design.PcbDoc', 'sheet.SchDoc', 'proj.PrjPcb',
      'Take2-RoundHoles-Plated.TX3', 'Take2-RoundHoles-Plated.TXT', 'Pick Place for x.txt',
    ]) {
      expect(isFabName(name), name).toBe(true)
    }
  })

  it('passes derived/shippable assets and ordinary files', () => {
    for (const name of [
      'l3-plane-gnd.webp', 'board-top.webp', 'silk-top.svg', 'pcb-manifest.json',
      'README.md', 'index.html', 'app/page.tsx', 'Benjamin_Liu_Resume.pdf', 'notes.txt',
    ]) {
      expect(isFabName(name), name).toBe(false)
    }
  })
})

describe('fab-data content-signature detection', () => {
  it('catches Gerber and Excellon signatures even under an innocent name', () => {
    expect(hasFabSignature(SYNTHETIC_GERBER)).toBe(true)
    expect(hasFabSignature(SYNTHETIC_DRILL)).toBe(true)
  })

  it('does not flag ordinary text', () => {
    expect(hasFabSignature('# Lab Notes\n\nJust a blog post about cheese.')).toBe(false)
    expect(hasFabSignature('<svg viewBox="0 0 10 10"></svg>')).toBe(false)
  })

  it('does not false-positive on SVG path data containing M48', () => {
    // The Excellon "M48" header must be line-anchored, or reframed layer SVGs
    // whose paths move to x≈48000 ("M48000 ...") would trip the drill signature.
    expect(hasFabSignature('<path d="M48,20 L60,80 M480 90 z"/>')).toBe(false)
    expect(hasFabSignature('<path d="M 48000 78000 L 49000 79000"/>')).toBe(false)
  })
})
