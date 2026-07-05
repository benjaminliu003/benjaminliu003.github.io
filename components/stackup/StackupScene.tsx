'use client'

import type { RefObject } from 'react'
import {
  motion,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { layerAsset, type PcbLayer } from '@/lib/pcb'

const GAP_Z = 44 // px separation between layers along the board normal (tier A)
const GAP_Y = 40 // px separation for the flat mobile fan (tier B)

const swatch: Record<PcbLayer['kind'], string> = {
  silk: 'var(--color-silk)',
  mask: 'var(--color-mask)',
  copper: 'var(--color-copper)',
  plane: 'var(--color-gold)',
  outline: 'var(--color-line)',
}

function StackupLayer({
  layer,
  index,
  count,
  spread,
  flat,
}: {
  layer: PcbLayer
  index: number
  count: number
  spread: MotionValue<number>
  flat: boolean
}) {
  const center = (count - 1) / 2
  const offset = (index - center) * (flat ? GAP_Y : GAP_Z)
  const z = useTransform(spread, [0, 1], [0, flat ? 0 : offset])
  const y = useTransform(spread, [0, 1], [0, flat ? offset : 0])
  // Fade layers in slightly as they separate so the assembled state reads clean.
  const opacity = useTransform(spread, [0, 0.25], [flat ? 1 : 0.7, 1])

  return (
    <motion.div
      className="absolute inset-0 grid place-items-center"
      style={{ z, y, opacity, transformStyle: 'preserve-3d' }}
    >
      <div
        className="relative aspect-square w-[70%] max-w-[350px] rounded-full"
        style={{
          // Translucent FR4 wafer so every layer reads as a distinct sheet
          // (not just the solid copper planes). Alpha in the fill keeps the
          // artwork crisp; the gold inner-ring defines each sheet's edge.
          background: 'rgba(18, 31, 25, 0.55)',
          boxShadow:
            'inset 0 0 0 1px rgba(212, 167, 44, 0.32), 0 10px 34px rgba(0, 0, 0, 0.4)',
        }}
      >
        <img
          src={layerAsset(layer)}
          alt=""
          aria-hidden
          width={350}
          height={350}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: layer.kind === 'plane' ? 0.72 : 1 }}
        />
      </div>
    </motion.div>
  )
}

export function StackupScene({
  sectionRef,
  tier,
  layers,
}: {
  sectionRef: RefObject<HTMLElement | null>
  tier: 'A' | 'B'
  layers: PcbLayer[]
}) {
  const flat = tier === 'B'
  const { scrollYProgress: progress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const spread = useSpring(useTransform(progress, [0.06, 0.5], [0, 1]), {
    stiffness: 90,
    damping: 24,
  })
  // Turn the exploded stack to reveal the back half of the board.
  const flip = useTransform(progress, [0.6, 0.95], [0, flat ? 0 : 180])
  const rotateX = flat ? 0 : 54
  const rotateZ = flat ? 0 : -8

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative grid h-full place-items-center" style={{ perspective: 1500 }}>
      <motion.div
        className="relative aspect-square w-full max-w-[520px]"
        style={{ rotateX, rotateZ, rotateY: flip, transformStyle: 'preserve-3d' }}
      >
        {layers.map((layer, i) => (
          <StackupLayer
            key={layer.id}
            layer={layer}
            index={i}
            count={layers.length}
            spread={spread}
            flat={flat}
          />
        ))}
      </motion.div>

      {/* Designator rail — the layer legend, top of stack to bottom. */}
      <ol className="pointer-events-none absolute right-2 top-2 hidden space-y-1 text-[0.62rem] uppercase tracking-widest text-muted sm:block md:right-4">
        {layers.map((l) => (
          <li key={l.id} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: swatch[l.kind] }}
            />
            {l.label}
          </li>
        ))}
      </ol>
      </div>
    </MotionConfig>
  )
}
