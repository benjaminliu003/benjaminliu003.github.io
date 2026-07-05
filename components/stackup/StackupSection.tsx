'use client'

import dynamic from 'next/dynamic'
import { pcb, stackup } from '@/lib/pcb'
import { useStackupTier } from './useStackupTier'
import { useInViewOnce } from './useInViewOnce'

// The scene (and its Motion chunk + 12 layer images) is a separate bundle,
// mounted only once the section nears the viewport — so the initial home load
// carries none of it. Keeps LHCI performance ≥95 with the animation present.
const StackupScene = dynamic(() => import('./StackupScene').then((m) => ({ default: m.StackupScene })), {
  ssr: false,
})

export function StackupSection() {
  const [ref, inView] = useInViewOnce<HTMLElement>('400px')
  const tier = useStackupTier()
  const showScene = (tier === 'A' || tier === 'B') && inView

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
          {/* Lightweight fallback (SSR / no-JS / reduced-motion / pre-mount): the
              assembled board — cached from the hero — plus the full layer list. */}
          <div className={showScene ? 'hidden' : 'grid h-full place-items-center px-5'}>
            <div className="w-full max-w-md">
              <img
                src={pcb.composites.top}
                alt={`The ${stackup.length}-layer board, assembled — see the layer list below.`}
                className="mx-auto w-full max-w-[300px] opacity-90"
                loading="lazy"
              />
              <ol className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted">
                {stackup.map((l) => (
                  <li key={l.id}>{l.label}</li>
                ))}
              </ol>
            </div>
          </div>

          {showScene ? <StackupScene sectionRef={ref} tier={tier} layers={stackup} /> : null}
        </div>
      </div>
    </section>
  )
}
