'use client'

import { useSyncExternalStore } from 'react'

// Rendering tier for the stackup:
//   A = desktop, full 3-D explode + back-flip
//   B = mobile / low-power / save-data, flat vertical explode (still all layers)
//   C = reduced-motion / SSR / no-JS, static exploded SVG only
export type StackupTier = 'A' | 'B' | 'C'

type NavExtras = { deviceMemory?: number; connection?: { saveData?: boolean } }

function subscribe(onChange: () => void) {
  const queries = ['(prefers-reduced-motion: reduce)', '(max-width: 820px)'].map((q) =>
    window.matchMedia(q),
  )
  queries.forEach((m) => m.addEventListener('change', onChange))
  return () => queries.forEach((m) => m.removeEventListener('change', onChange))
}

function getSnapshot(): StackupTier {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'C'
  const nav = navigator as Navigator & NavExtras
  const lowPower = nav.connection?.saveData === true || (nav.deviceMemory ?? 8) <= 4
  if (window.matchMedia('(max-width: 820px)').matches || lowPower) return 'B'
  return 'A'
}

// Server / first hydration render = static, so the SSR HTML carries the
// accessible fallback; the client upgrades to A or B after mount.
const getServerSnapshot = (): StackupTier => 'C'

export function useStackupTier(): StackupTier {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
