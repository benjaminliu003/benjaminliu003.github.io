import Image from 'next/image'
import { Header } from '@/components/site/Header'
import { Section } from '@/components/site/Section'
import { StackupSection } from '@/components/stackup/StackupSection'
import { pcb } from '@/lib/pcb'

const SOCIALS = [
  { ref: 'J1', label: 'GitHub', value: 'github.com/benjaminliu003', href: 'https://github.com/benjaminliu003' },
  { ref: 'J2', label: 'LinkedIn', value: 'in/bliu0326', href: 'https://www.linkedin.com/in/bliu0326/' },
  { ref: 'J3', label: 'Email', value: 'b328liu@uwaterloo.ca', href: 'mailto:b328liu@uwaterloo.ca' },
]

// Experience as a drawing's revision history: rev letters ascend with time.
const REVISIONS = [
  {
    rev: 'D',
    date: 'Jan 2025 – Present',
    role: 'Optical Component Test Engineering Intern',
    org: 'Ciena Canada ULC',
    change:
      'Optimized new product introduction (NPI): re-engineered an automated RF/DC test stack, built a TDR toolkit, and migrated laser production to new hardware — dramatically increasing yield.',
  },
  {
    rev: 'C',
    date: 'Sep 2023 – May 2024',
    role: 'Quantitative and Technical Analyst',
    org: 'NN Life Japan Ltd.',
    change:
      'Built Azure Pipelines and a Python anti-money-laundering automation system; prototyped an internal data-research tool in React.',
  },
  {
    rev: 'B',
    date: 'Jan 2023 – May 2023',
    role: 'Enterprise Information Governance Specialist',
    org: 'Ontario Lottery & Gaming',
    change:
      "Prototyped an automated data-management system with Python and OpenAI's API, saving 10–15 hours per week of manual entry.",
  },
  {
    rev: 'A',
    date: 'Jun 2022 – Sep 2022',
    role: 'Corporate Real Estate Analyst',
    org: 'Bank of Montreal',
    change:
      'Commissioned a new datacenter wing, automated logging with VBA, and shipped a multiplatform work-order app on the Power Platform.',
  },
]

// Projects as populated design blocks (U1 = the board this site is built around).
const BLOCKS = [
  {
    ref: 'U1',
    name: 'MTL Smoked Meat Sandwich',
    role: 'Solo hardware design',
    desc: 'The 8-layer HDI audio board behind this site. STM32MP1 (OSD32MP1) applications processor, I2S/PDM microphone capture, class-D speaker amps, Bluetooth radio, and USB-C — with blind/buried microvias. Routed in Altium Designer.',
    flagship: true,
  },
  {
    ref: 'U2',
    name: 'WATonomous',
    role: 'Power Systems Lead',
    desc: 'Designing a new LV/HV AC & DC power supply for the self-driving stack and main compute module, including physical emergency shutoffs and remote override.',
  },
  {
    ref: 'U3',
    name: 'Engineers Without Borders — WATurbine',
    role: 'Power Lead',
    desc: 'A DC power-generation system for a small-scale wind turbine bound for Africa, including a cost-efficient, custom-designed DC brushed motor.',
  },
  {
    ref: 'U4',
    name: "Ben's Cloud Computing",
    role: 'Founder',
    desc: 'Acquired seed funding and provided compute for scientific simulation — remote licensing and FEM/FDTD photonics runs on Optiwave and Lumerical.',
  },
]

const BOM = [
  {
    ref: 'Languages',
    parts: 'C/C++, MATLAB, Python, SQL, Microsoft VBA, ARM Assembly (Thumb2), JavaScript, HTML & CSS',
  },
  { ref: 'Frameworks', parts: 'React, Express, SQL Server' },
  {
    ref: 'Tools',
    parts: 'Git, Docker, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Microsoft Power Platform & Office, Azure DevOps',
  },
]

export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="pt-14">
        {/* Hero — the drawing's title block + the board it documents. */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:pt-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="designator">Drawing · Personal Portfolio · Rev 2.0</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-6xl">
                Benjamin Liu
              </h1>
              <p className="mt-3 text-lg text-muted md:text-xl">
                Computer Engineering @ University of Waterloo
              </p>
              <p className="mt-6 max-w-md text-ink">
                I design hardware and the software that tests it. Pictured: the{' '}
                <span className="text-gold">MTL Smoked Meat Sandwich</span> — an 8-layer HDI audio
                board I routed in Altium.
              </p>
              <p className="annotation mt-4 inline-block text-sm">
                {'// fabrication note: I Like Cheese :)'}
              </p>

              <ul className="mt-8 space-y-1.5">
                {SOCIALS.map((s) => (
                  <li key={s.ref} className="flex items-baseline gap-3 text-sm">
                    <span className="w-6 shrink-0 font-display text-copper">{s.ref}</span>
                    <span className="w-20 shrink-0 text-muted">{s.label}</span>
                    <a
                      href={s.href}
                      className="trace-link"
                      {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {s.value}
                    </a>
                  </li>
                ))}
              </ul>

              <a href="#resume" className="pad-btn mt-8 px-5 py-2.5 text-sm">
                Download datasheet ↓
              </a>
            </div>

            {/* Board render — dimensioned like a fab drawing. */}
            <figure className="keepout p-4">
              <Image
                src={pcb.composites.top}
                width={520}
                height={512}
                alt="Top view of Benjamin Liu's 8-layer HDI audio board, the MTL Smoked Meat Sandwich, showing green soldermask, gold pads, and silkscreen designators."
                className="mx-auto h-auto w-full max-w-md"
                priority
              />
              <figcaption className="mt-3 flex items-center justify-between text-[0.7rem] uppercase tracking-widest text-muted">
                <span>MTL Smoked Meat Sandwich</span>
                <span className="text-copper">Rev 0.0.1 · 8-layer HDI</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Exploded stackup — the scroll-driven centerpiece: all 8 layers + the back. */}
        <StackupSection />

        {/* About — U1, the main controller. */}
        <Section id="about" designator="U1 · Main Controller" title="About" note="1 of 5">
          <div className="keepout max-w-3xl space-y-4 p-6 text-ink">
            <p>
              I am a Computer Engineering student at the University of Waterloo with a passion for
              tackling complex challenges in both software and hardware. My experience ranges from
              optimizing new product introduction (NPI) at Ciena to developing anti-money-laundering
              systems at NN Life Japan. I thrive on creating efficient, automated solutions that
              deliver significant impact.
            </p>
            <p>
              Beyond my internships, I lead power systems design on the WATonomous design team and
              founded a cloud computing venture to support scientific simulations. I&rsquo;m always
              eager to apply my skills to new and meaningful projects.
            </p>
          </div>
        </Section>

        {/* Experience — revision history table. */}
        <Section
          id="experience"
          designator="Revision History"
          title="Experience"
          note="Newest rev first"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-y border-line text-[0.68rem] uppercase tracking-widest text-muted">
                  <th className="py-2 pr-4 font-normal">Rev</th>
                  <th className="py-2 pr-4 font-normal">Date</th>
                  <th className="py-2 pr-4 font-normal">Role / Description of change</th>
                  <th className="py-2 font-normal">Organization</th>
                </tr>
              </thead>
              <tbody>
                {REVISIONS.map((r) => (
                  <tr key={r.rev} className="border-b border-line/60 align-top">
                    <td className="py-4 pr-4 font-display text-gold">{r.rev}</td>
                    <td className="py-4 pr-4 whitespace-nowrap text-muted">{r.date}</td>
                    <td className="py-4 pr-4">
                      <span className="text-ink">{r.role}</span>
                      <span className="mt-1 block text-muted">{r.change}</span>
                    </td>
                    <td className="py-4 text-copper">{r.org}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Projects — populated design blocks. */}
        <Section id="projects" designator="Design Blocks" title="Projects & Teams" note="U1–U4">
          <div className="grid gap-5 md:grid-cols-2">
            {BLOCKS.map((b) => (
              <article
                key={b.ref}
                className={`keepout p-6 ${b.flagship ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-copper">{b.ref}</span>
                  <h3 className="font-display text-lg text-ink">{b.name}</h3>
                  {b.flagship ? (
                    <span className="ml-auto text-[0.65rem] uppercase tracking-widest text-gold">
                      Flagship
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[0.72rem] uppercase tracking-widest text-muted">{b.role}</p>
                <p className="mt-3 text-ink">{b.desc}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* Skills — bill of materials. */}
        <Section id="skills" designator="Bill of Materials" title="Technical Skills" note="3 refs">
          <div className="keepout divide-y divide-line/60 p-2">
            {BOM.map((row) => (
              <div key={row.ref} className="grid gap-2 px-4 py-4 md:grid-cols-[10rem_1fr]">
                <div className="font-display text-copper">{row.ref}</div>
                <div className="text-ink">{row.parts}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Resume — datasheet. */}
        <Section id="resume" designator="Datasheet" title="Full Resume" note="PDF · 1 page">
          <div className="flex flex-col items-start gap-5">
            <p className="max-w-2xl text-ink">
              The complete datasheet — full experience, coursework, and contact — as a one-page PDF.
            </p>
            <a href="/Benjamin_Liu_Resume.pdf" download className="pad-btn px-6 py-3">
              Download Benjamin_Liu_Resume.pdf ↓
            </a>
          </div>
        </Section>
      </main>

      {/* Footer — DRC report + title block. */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <p className="text-[0.72rem] uppercase tracking-widest text-muted">
            <span className="text-copper">DRC</span> 0 errors · 2 warnings (cosmetic) · last run 2026-07-05
          </p>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-[0.72rem] uppercase tracking-widest text-muted">
            <span>Drawn by Benjamin Liu</span>
            <span>Sheet 1 of 1 · Rev 2.0</span>
            <span>&copy; 2025 Benjamin Liu</span>
          </div>
        </div>
      </footer>
    </>
  )
}
