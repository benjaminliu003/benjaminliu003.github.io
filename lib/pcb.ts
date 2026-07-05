// Typed accessor for the committed PCB manifest. The manifest is produced and
// zod-validated by scripts/pcb/build-pcb.mts (local-only); the app imports the
// JSON directly so no zod ships to the client. Types here must stay compatible
// with scripts/pcb/manifest-schema.mts (tsc flags drift where these are used).
import manifest from './generated/pcb-manifest.json'

export type LayerKind = 'copper' | 'plane' | 'mask' | 'silk' | 'outline'
export type LayerSide = 'top' | 'inner' | 'bottom'

export interface PcbLayer {
  id: string
  order: number
  kind: LayerKind
  side: LayerSide
  label: string
  shipAs: 'svg' | 'raster'
  polarity: 'positive' | 'negative'
  assets: { svg: string | null; webp: string | null; avif: string | null; width: number }
  bytes: { raw: number; gzip: number }
}

export interface PcbDrill {
  id: string
  type: 'through' | 'microvia' | 'nonplated' | 'slot'
  label: string
  count: number
  asset: string | null
}

export interface PcbManifest {
  board: { name: string; title: string; sourceHash: string; units: 'mm' }
  viewBox: [number, number, number, number]
  layers: PcbLayer[]
  drills: PcbDrill[]
  composites: { top: string; bottom: string; explodedStatic: string }
}

export const pcb = manifest as PcbManifest

/**
 * Layers in physical top-to-bottom order for the exploded stackup — the
 * manifest array already preserves that order (silk/mask top → L1..L8 →
 * mask/silk bottom). The board outline is handled separately.
 */
export const stackup: PcbLayer[] = pcb.layers.filter((l) => l.kind !== 'outline')
export const outline: PcbLayer | null = pcb.layers.find((l) => l.kind === 'outline') ?? null

/** Primary shippable asset for a layer (crisp SVG when available, else raster). */
export const layerAsset = (l: PcbLayer): string => l.assets.svg ?? l.assets.webp ?? ''
