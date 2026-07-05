'use client'

import { useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

// The theme lives on <html data-theme> (set pre-paint by the no-flash script).
// useSyncExternalStore reads it as external state — no setState-in-effect — and
// a MutationObserver keeps every toggle instance (desktop + mobile) in sync.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const getSnapshot = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'

const getServerSnapshot = (): Theme => 'dark'

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next) // observer → re-render
    try {
      localStorage.setItem('site-theme', next)
    } catch {
      /* private mode — non-fatal */
    }
  }

  const label = theme === 'light' ? 'Paper' : 'Soldermask'

  return (
    <button
      type="button"
      onClick={toggle}
      className="no-print inline-flex items-center gap-2 border border-line px-2 py-1 text-[0.7rem] uppercase tracking-widest text-muted transition-colors hover:text-gold"
      aria-label={`Material: ${label}. Switch material.`}
      title="Toggle material"
      suppressHydrationWarning
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-copper" />
      {label}
    </button>
  )
}
