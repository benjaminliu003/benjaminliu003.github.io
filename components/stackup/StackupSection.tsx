'use client'

import { useRef } from 'react'
import { MotionConfig, useScroll } from 'motion/react'
import { pcb, stackup } from '@/lib/pcb'
import { useStackupTier } from './useStackupTier'
import { StackupScene } from './StackupScene'

// Scroll-driven exploded stackup. The section is tall; a sticky inner stage
// stays pinned while the scroll drives the animation. The static fallback is
// always in the SSR HTML (no-JS / ATS / reduced-motion); the client scene
// overlays it on tier A/B. Section height is constant across tiers → no CLS.
export function StackupSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const tier = useStackupTier()
  const animated = tier === 'A' || tier === 'B'

  return (
    <section id="stackup" ref={ref} className="relative border-t border-line" style={{ height: '320vh' }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-5 pt-16">
          <p className="designator">Assembly · Exploded View</p>
          <h2 className="mt-1 font-display text-2xl text-ink md:text-3xl">8-Layer Stackup</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            The {stackup.length}-layer build of the MTL Smoked Meat Sandwich. Scroll to lift the
            layers apart and turn the board over.
          </p>
        </div>

        <div className="relative min-h-0 flex-1">
          {/* Accessible static exploded view — in the SSR HTML; hidden once the scene runs. */}
          <div className={animated ? 'hidden' : 'grid h-full place-items-center px-5'}>
            <div className="w-full max-w-2xl">
              <img
                src={pcb.composites.explodedStatic}
                alt={`Exploded view of the ${stackup.length}-layer board stackup.`}
                className="mx-auto w-full max-w-md"
                loading="lazy"
              />
              <ol className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted sm:grid-cols-3">
                {stackup.map((l) => (
                  <li key={l.id}>{l.label}</li>
                ))}
              </ol>
            </div>
          </div>

          {animated ? (
            <div className="absolute inset-0">
              <MotionConfig reducedMotion="user">
                <StackupScene progress={scrollYProgress} tier={tier} layers={stackup} />
              </MotionConfig>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
