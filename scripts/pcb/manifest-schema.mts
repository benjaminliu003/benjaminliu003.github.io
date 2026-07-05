// Zod schema for the PCB manifest. Lives in the pipeline (build-time only) so
// the app bundle never imports zod — lib/pcb.ts consumes the validated JSON
// with a plain TS type. Keep the two in sync (tsc catches drift at consumption).
import { z } from 'zod'

export const AssetSet = z.object({
  svg: z.string().nullable(),
  webp: z.string().nullable(),
  avif: z.string().nullable(),
  /** Intrinsic pixel width of the raster tier (0 for svg-only layers). */
  width: z.number().int().nonnegative(),
})

export const LayerEntry = z.object({
  id: z.string(),
  order: z.number().int(),
  kind: z.enum(['copper', 'plane', 'mask', 'silk', 'outline']),
  side: z.enum(['top', 'inner', 'bottom']),
  label: z.string(),
  shipAs: z.enum(['svg', 'raster']),
  polarity: z.enum(['positive', 'negative']),
  assets: AssetSet,
  bytes: z.object({ raw: z.number().int(), gzip: z.number().int() }),
})

export const DrillEntry = z.object({
  id: z.string(),
  type: z.enum(['through', 'microvia', 'nonplated', 'slot']),
  label: z.string(),
  count: z.number().int().nonnegative(),
  asset: z.string().nullable(),
})

export const Manifest = z.object({
  board: z.object({
    name: z.string(),
    title: z.string(),
    sourceHash: z.string(),
    units: z.literal('mm'),
  }),
  viewBox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  layers: z.array(LayerEntry),
  drills: z.array(DrillEntry),
  composites: z.object({
    top: z.string(),
    bottom: z.string(),
    explodedStatic: z.string(),
  }),
})

export type Manifest = z.infer<typeof Manifest>
export type LayerEntry = z.infer<typeof LayerEntry>
