'use client'

import { useEffect, useRef, useState } from 'react'

// Fires once when the element first approaches the viewport. Used to defer
// mounting the (heavy) stackup scene — and its Motion chunk + 12 layer images —
// until the reader scrolls near it, keeping initial home-page load light.
// setState lives in the observer callback (not the effect body), so it does not
// trip react-hooks/set-state-in-effect.
export function useInViewOnce<T extends Element>(rootMargin = '300px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true)
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return [ref, inView] as const
}
