const SECTIONS = ['about', 'experience', 'projects', 'skills', 'resume'] as const

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl">Benjamin Liu</h1>
      <p className="mt-2 text-copper">
        Rebuild in progress on the <code>rebuild</code> branch — PCB-native redesign. Content lands
        in M3.
      </p>
      {SECTIONS.map((id) => (
        <section key={id} id={id} aria-label={id} className="mt-12">
          <h2 className="uppercase tracking-widest text-enig">{id}</h2>
          <p className="mt-2 opacity-70">Placeholder — ported verbatim in M3.</p>
        </section>
      ))}
    </main>
  )
}
