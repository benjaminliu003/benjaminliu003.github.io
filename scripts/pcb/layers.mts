// Layer allowlist + render policy for ELI_Frisbee_Mk.I ("MTL Smoked Meat
// Sandwich"). Single source of truth shared by the build pipeline.
//
// SECURITY: inner copper layers (physical order 2-7) ship as RASTER ONLY —
// outer layers are visible on any physical board, inner artwork is the fab
// secret. Paste layers (GTP/GBP) are excluded entirely. See AGENTS.md.

export type LayerKind = 'copper' | 'plane' | 'mask' | 'silk' | 'outline'
export type LayerSide = 'top' | 'inner' | 'bottom'
export type ShipAs = 'svg' | 'raster'

export interface LayerSpec {
  /** Gerber filename under the PCB outputs dir. */
  file: string
  /** Stable asset id / slug. */
  id: string
  /** Physical stackup order (1 = top copper .. 8 = bottom copper); 0 = non-copper. */
  order: number
  kind: LayerKind
  side: LayerSide
  /** Human label for the animation rail, e.g. "L3 · GND". */
  label: string
  shipAs: ShipAs
  /** Whether the source declares TF.FilePolarity,Negative (plane → composite). */
  negative?: boolean
  /** Baked render colour (theme-neutral; final palette applied in M6). */
  color: string
}

// Provisional Silkscreen render colours (dark/soldermask theme). Baked into
// assets at build; the animation does not recolour at runtime.
export const COLORS = {
  copper: '#b87333',
  enig: '#c9a227',
  silk: '#e8e6df',
  mask: '#0f5132',
  outline: '#5c6b64',
} as const

// Ordered top -> bottom for the exploded stackup.
export const LAYERS: LayerSpec[] = [
  { file: 'Take2.GTO', id: 'silk-top', order: 0, kind: 'silk', side: 'top', label: 'Silk · Top', shipAs: 'svg', color: COLORS.silk },
  { file: 'Take2.GTS', id: 'mask-top', order: 0, kind: 'mask', side: 'top', label: 'Soldermask · Top', shipAs: 'svg', color: COLORS.mask },
  { file: 'Take2.GTL', id: 'l1-copper-top', order: 1, kind: 'copper', side: 'top', label: 'L1 · Signal (Top)', shipAs: 'svg', color: COLORS.copper },
  { file: 'Take2.G1', id: 'l2-copper', order: 2, kind: 'copper', side: 'inner', label: 'L2 · Mid1', shipAs: 'raster', color: COLORS.copper },
  { file: 'Take2.GP1', id: 'l3-plane-gnd', order: 3, kind: 'plane', side: 'inner', label: 'L3 · GND Plane', shipAs: 'raster', negative: true, color: COLORS.copper },
  { file: 'Take2.G2', id: 'l4-copper', order: 4, kind: 'copper', side: 'inner', label: 'L4 · Core1', shipAs: 'raster', color: COLORS.copper },
  { file: 'Take2.G3', id: 'l5-copper', order: 5, kind: 'copper', side: 'inner', label: 'L5 · Core2', shipAs: 'raster', color: COLORS.copper },
  { file: 'Take2.GP2', id: 'l6-plane-pwr', order: 6, kind: 'plane', side: 'inner', label: 'L6 · Power Plane', shipAs: 'raster', negative: true, color: COLORS.copper },
  { file: 'Take2.G4', id: 'l7-copper', order: 7, kind: 'copper', side: 'inner', label: 'L7 · Mid2', shipAs: 'raster', color: COLORS.copper },
  { file: 'Take2.GBL', id: 'l8-copper-bottom', order: 8, kind: 'copper', side: 'bottom', label: 'L8 · Signal (Bottom)', shipAs: 'svg', color: COLORS.copper },
  { file: 'Take2.GBS', id: 'mask-bottom', order: 0, kind: 'mask', side: 'bottom', label: 'Soldermask · Bottom', shipAs: 'svg', color: COLORS.mask },
  { file: 'Take2.GBO', id: 'silk-bottom', order: 0, kind: 'silk', side: 'bottom', label: 'Silk · Bottom', shipAs: 'svg', color: COLORS.silk },
  { file: 'Take2.GM', id: 'outline', order: 0, kind: 'outline', side: 'top', label: 'Board Outline', shipAs: 'svg', color: COLORS.outline },
]

// Drill files → manifest drill spans (types from the DRR: TX3 = Top→Mid1 µvia).
export interface DrillSpec {
  file: string
  id: string
  type: 'through' | 'microvia' | 'nonplated' | 'slot'
  label: string
}

export const DRILLS: DrillSpec[] = [
  { file: 'Take2-RoundHoles-Plated.TXT', id: 'drill-through', type: 'through', label: 'Plated through-holes' },
  { file: 'Take2-RoundHoles-Plated.TX3', id: 'drill-uvia-t', type: 'microvia', label: 'Microvias · Top→Mid1' },
  { file: 'Take2-RoundHoles-Plated.TX4', id: 'drill-uvia-b', type: 'microvia', label: 'Microvias · buried' },
  { file: 'Take2-RoundHoles-NonPlated.TXT', id: 'drill-npth', type: 'nonplated', label: 'Non-plated holes' },
  { file: 'Take2-SlotHoles-Plated.TXT', id: 'drill-slots', type: 'slot', label: 'Plated slots' },
]

export const DEFAULT_PCB_SRC =
  'D:/Current Projects/Inherited Projects/Personal Site/PCB/Project Outputs for ELI_Frisbee_Mk.I'
