import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pcb, stackup } from './pcb'

// Validates the COMMITTED manifest + derived assets. Runs in CI without any
// Gerbers present — this is the contract the app relies on.
describe('committed PCB manifest', () => {
  it('describes the 8-layer stackup of the real board', () => {
    expect(pcb.board.name).toBe('ELI_Frisbee_Mk.I')
    expect(pcb.viewBox).toHaveLength(4)
    const copperOrders = pcb.layers.filter((l) => l.order > 0).map((l) => l.order)
    expect(new Set(copperOrders)).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]))
  })

  it('ships inner layers as raster only (security invariant)', () => {
    for (const l of pcb.layers) {
      if (l.side === 'inner') {
        expect(l.shipAs, l.id).toBe('raster')
        expect(l.assets.svg, l.id).toBeNull()
      }
    }
  })

  it('stacks layers top -> bottom, copper L1..L8 in order, outline excluded', () => {
    expect(stackup.some((l) => l.kind === 'outline')).toBe(false)
    const copperOrders = stackup.filter((l) => l.order > 0).map((l) => l.order)
    expect(copperOrders).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('references derived assets that exist on disk', () => {
    const paths = [
      ...pcb.layers.map((l) => l.assets.svg ?? l.assets.webp),
      pcb.composites.top,
      pcb.composites.bottom,
      pcb.composites.explodedStatic,
    ].filter((p): p is string => !!p)
    for (const p of paths) {
      expect(existsSync(join(process.cwd(), 'public', p)), p).toBe(true)
    }
  })

  it('records the microvia drill spans from the DRR', () => {
    const uvia = pcb.drills.find((d) => d.type === 'microvia')
    expect(uvia).toBeDefined()
    expect(uvia!.count).toBeGreaterThan(0)
  })
})
