import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#resume', label: 'Datasheet' },
]

// Top border of the drawing sheet: title on the left, nav + material toggle
// on the right — like the edge legend of a fabrication drawing.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5">
        <a href="#top" className="font-display text-sm tracking-widest text-ink">
          BENJAMIN LIU
          <span className="ml-2 text-[0.65rem] text-muted">SHEET 1/1</span>
        </a>
        <nav className="hidden items-center gap-5 text-[0.72rem] uppercase tracking-widest text-muted md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-gold">
              {n.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
