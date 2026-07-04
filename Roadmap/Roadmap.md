# Roadmap — PCB-Native Site Rebuild

Approved 2026-07-03. Design spec:
`docs/superpowers/specs/2026-07-03-pcb-native-redesign-design.md`.
Session log: `Roadmap/Progress.md`. Conventions: `AGENTS.md`.

## Status

| Milestone | Owner | Status |
|---|---|---|
| M0 Hygiene, docs, guardrails | Claude inline | **done 2026-07-03** |
| M1 Scaffold + toolchain + CI | Claude inline (Codex hung; see Progress 2026-07-04) | **done 2026-07-04** (CI + Vercel link pending) |
| M2 Gerber pipeline | Claude inline (spike + build) | **done 2026-07-04** |
| M3 Content, IA, SEO/ATS + tokens | Codex plumbing + Claude tokens | pending |
| M4 Blog + RSS + OG | Codex | pending |
| M5 Exploded-stackup animation | Claude inline | pending |
| M6 Design-system application | Claude inline | pending |
| M7 Quality-gate hardening | Codex | pending |
| M8 Cutover + launch | Claude + Ben | pending |

## Architecture (fixed by approved plan)

- **Stack:** Next.js current stable (App Router, `output:'export'`,
  `trailingSlash:true`, `images.unoptimized`), TS strict, Tailwind v4,
  Motion (`motion/react`), Velite MDX, pnpm, Node 22.
- **Hosting:** GitHub Pages canonical (deploy uploads **only `out/`** after
  cutover); Vercel PR previews (`vercel.json`: `X-Robots-Tag: noindex`,
  `outputDirectory: out`, production branch pointed at a dummy name).
- **Gerber→SVG pipeline** (`pnpm pcb:build`, local-only; committed-derivatives
  model — CI/Vercel never see Gerbers): layer allowlist (8 copper/plane +
  masks + silks + GM profile + drills; paste excluded), pcb-stackup@4.2.8 /
  gerber-to-svg@4.2.8 / whats-that-gerber@**4.2.7** pinned (4.2.6 was a plan
  typo — does not exist; corrected at the M2 spike) (fallbacks: gerbonara,
  then @tracespace/core v5 alpha); negative planes composed via SVG mask
  (fallback rasters); sanitize + SVGO precision 2; raster tier WebP+AVIF via
  sharp + resvg; inner layers raster-only (security); static exploded
  fallback SVG; zod-validated manifest at `lib/generated/pcb-manifest.json`.
- **Asset budgets (CI-enforced, gzip):** SVG layer ≤45 KB; raster ≤60 KB;
  `public/pcb/` total ≤450 KB; first-load HTML ≤45 / CSS ≤15 / JS ≤160 /
  fonts ≤90 KB; LCP = hero text, never the stackup; OG ≤150 KB; favicons
  ≤40 KB. Escalation: precision → path merge → rasterize layer → 1.5× →
  drop plane vectors.
- **Animation:** ~350vh section, sticky stage; server-rendered static
  exploded SVG + semantic `<ol>` (no-JS/ATS, zero CLS); client scene with
  Motion `useScroll` → `useSpring`/`useTransform` per-layer MotionValues
  (zero React state per frame); compositor-only transforms; tiers
  A (desktop 13-plane 3D) / B (mobile raster flat) / C (static only).
- **Blog:** Velite collections → typed JSON + compiled MDX; Shiki at build;
  `rss.xml` force-static route; OG via satori + resvg at build.
- **CI:** `ci.yml` on PRs + rebuild: lint, typecheck, vitest, build, gerber
  guard + budgets, Playwright e2e against built `out/`, LHCI ≥0.95 all
  categories. `deploy.yaml` rewritten at cutover: build → upload `out/` →
  deploy; `concurrency: pages` kept.

## Milestones & acceptance

- **M0 — Hygiene, docs, guardrails** (main): gitignore PCB/ + fab extensions;
  delete AUTHOR-EMAIL-FIX.md; create AGENTS.md, Roadmap/, spec, M1 plan;
  `rebuild` branch. *Accept:* `git check-ignore PCB` passes; old site deploys
  unchanged.
- **M1 — Scaffold + toolchain + CI skeleton** (rebuild): hand-written Next
  scaffold (no generator), Tailwind v4, ESLint 9 flat, vitest, Playwright,
  Velite wiring, ci.yml, vercel.json; Ben performs the Vercel OAuth link.
  *Accept:* `pnpm build` emits `out/index.html`; CI green; preview URL on PR.
- **M2 — Gerber pipeline**: spike answers negative-plane compositing, GM
  outline, SVGO precision, sizes vs budget, tracespace go/no-go; then full
  pipeline + manifest + guard + budgets + golden tests (tiny fixture, never
  the real board). *Accept:* `pnpm pcb:build` deterministic; budgets met;
  guard fails CI on planted `.GTL`; CI green without `PCB/`.
- **M3 — Content, IA, SEO/ATS + provisional tokens**: port all real content
  verbatim; semantic structure, JSON-LD, meta, robots/sitemap, favicons from
  compressed cheese.png, print stylesheet, 404, theme toggle (no-FOUC);
  provisional Silkscreen tokens; **visual checkpoint (a)**. *Accept:*
  JS-disabled e2e sees all sections; Lighthouse SEO/A11y ≥95; favicons ≤40 KB.
- **M4 — Blog + RSS + OG**: Velite collection, blog index + [slug] via
  `generateStaticParams`, MDX map + Shiki, force-static rss.xml,
  generate-og.mts, post #1 skeleton. *Accept:* post renders statically;
  rss.xml parses in e2e; OG PNGs generated + referenced.
- **M5 — Exploded-stackup animation**: full architecture above; perf tuning on
  CPU-throttled traces; **visual checkpoint (b)**. *Accept:* e2e proves
  scroll-driven transforms, reduced-motion tier, no-JS fallback; LHCI mobile
  ≥95 with section present; zero CLS; no >50 ms long tasks.
- **M6 — Design-system application**: full Silkscreen system (designator
  headings, courtyards, dimension lines, annotations, DRC footer with real
  DRC numbers, netlist footer, final fonts). *Accept:* visual QA; budgets
  green.
- **M7 — Quality-gate hardening**: LHCI PR-blocking, e2e matrix (chromium +
  mobile), final budgets, caching, README rewrite. *Accept:* broken budget
  fails CI; pipeline <8 min.
- **M8 — Cutover + launch**: write post #1 from Progress.md; rewrite
  deploy.yaml in the merge; delete legacy root files; **checkpoint (c)**;
  merge rebuild→main; verify live; tag v2.0.0; release-path passes
  (simplification, bug hunt, security review) before merge. *Accept:*
  Lighthouse ≥95 all categories on live site; old URLs intact.

## Top risks

1. Legacy workflow deploys repo root on every main push → rebuild branch;
   atomic workflow swap at cutover.
2. tracespace v4 unmaintained; negative-polarity planes may render wrong →
   M2 spike-first; pinned versions; gerbonara fallback; rasters worst case.
3. Animation weight/jank on mobile → hard CI budgets; MotionValue-only
   writes; compositor-only transforms; raster LOD; PR-blocking LHCI.
4. Static-export/Pages gotchas → confirmed-supported patterns only; e2e runs
   against built `out/` every PR.
5. Codex handoff drift → self-contained plan files with acceptance commands;
   AGENTS.md invariants; Claude gates every diff; M5/M6 never delegated.

## Post-launch (separate, ask-first)

Analytics dashboard (April spec Part 2), custom domain (~$12/yr), community
sharing (Hackaday etc.), Wayback snapshot.
