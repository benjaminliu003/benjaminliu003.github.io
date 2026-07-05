import type { ReactNode } from 'react'

// A designated block on the drawing: reference-designator eyebrow + title,
// optional right-aligned note (like a callout on a fab drawing).
export function Section({
  id,
  designator,
  title,
  note,
  children,
}: {
  id: string
  designator: string
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-line py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="designator">{designator}</p>
            <h2 className="mt-1 font-display text-2xl text-ink md:text-3xl">{title}</h2>
          </div>
          {note ? (
            <p className="hidden shrink-0 text-[0.7rem] uppercase tracking-widest text-muted sm:block">
              {note}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}
