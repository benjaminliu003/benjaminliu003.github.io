# Personal Site Redesign: PCB-Native ("Silkscreen")

**Date:** 2026-07-03
**Author:** Benjamin Liu + Claude
**Status:** Approved (supersedes 2026-04-18 "Glass Over Silicon")

## Overview

Complete redesign of benjaminliu003.github.io. The current site is a single
hand-written `index.html` (Tailwind CDN, lava-lamp canvas, glassmorphism) that
reads as a generated template. The redesign's goal is the opposite: a site
unique enough that the layout is *known as Ben's*, handmade in feel, cleaned up
but never polished into AI-corporate sameness, with an integrated blog — and
buildable by Ben's whole toolchain (Claude Code, Codex, Cursor, Vercel,
Framer/Motion) working together.

**Primary audience:** balanced — memorable to recruiters in a 30-second skim,
credible to engineers who dig deeper.

## Decisions (locked 2026-07-03)

1. PCB-native design language; **no glassmorphism**.
2. Centerpiece: Ben's real Altium board **ELI_Frisbee_Mk.I** (OSD32MP1 MPU,
   RF/SDIO, I2S/PDM audio, battery + buck PMIC) animated from its actual
   Gerbers. Verified 8-layer HDI stackup (GTL, G1, GP1‑neg, G2, G3, GP2‑neg,
   G4, GBL), masks/silks, 5 drill files incl. Top→Mid1 microvias, outline =
   `Take2.GM` (X2 Profile). RS-274X, Altium 26.2.
3. Stack: Next.js (App Router, `output:'export'`) + Tailwind v4 + Motion
   (`motion/react`) + Velite MDX. pnpm, TypeScript strict.
4. Hosting: GitHub Pages stays canonical; Vercel provides PR previews.
5. Blog: integrated MDX "Lab Notes" with RSS; launches with post #1 = the
   build log of this redesign (dated originality receipts).

## Design language — "Silkscreen" (working name; Ben ratifies at checkpoint a)

The site presents as **Ben's own engineering documentation — a board under
design review** — not a SaaS page.

- **The board is the site.** ELI_Frisbee_Mk.I is the scroll centerpiece:
  assembled at the hero; scrolling explodes the stackup (silk lifts, masks
  peel, copper/plane layers fan out, microvias ghost through). Real geometry,
  real layer labels (`L3 · GND`), microvia callouts.
- **Typography as silkscreen.** Headings/UI in mono (proposal: IBM Plex Mono,
  self-hosted), uppercase with reference-designator prefixes (`U2 — ABOUT`,
  `J1 — EXPERIENCE`); body in a warmer readable face (proposal: IBM Plex
  Sans). Final call at visual checkpoint (a).
- **Themes as materials.** Dark = *Soldermask*: deep green-black FR4, copper
  `#b87333` / ENIG gold `#c9a227`, off-white silk. Light = *Engineering
  paper*: warm grid paper, graphite text, blueprint-blue + red-pencil accents.
  (Token assumption — cheap to reverse; finalized at checkpoint.)
- **The handmade layer.** SVG red-pencil annotations (circles, arrows, margin
  notes), slightly imperfect placement/rotation, dimension lines measuring
  real layout gaps, a DRC footer quoting the board's real DRC report numbers,
  U-Boot boot-log microcopy (the OSD32MP1 runs Linux), footer links styled as
  a netlist. "I Like Cheese :)" survives; a cheese silkscreen easter egg goes
  on the board layer.
- **Content panels as courtyards.** Thin dashed keepout borders + corner
  fiducials — explicitly not glass cards.
- **Banned:** purple gradients, glassmorphism, Inter-on-dark-SaaS, emoji
  feature grids, stock art.
- **Originality receipts:** dated build-log post + git history, `/colophon`
  page naming and documenting the design language, OG image generated from the
  real board render.

## Information architecture

- `/` — one-pager: hero (name, "Computer Engineering @ UWaterloo", retained
  personality; assembled board), About, Experience (4 real entries), Projects
  (existing 3 + **ELI Frisbee Mk.I added as flagship**), Skills, stackup
  animation section, Resume CTA (`/Benjamin_Liu_Resume.pdf`, unchanged URL),
  footer. All existing copy and links preserved verbatim.
- `/blog` + `/blog/[slug]` — Lab Notes: dated lab-notebook entries with rev
  letters; RSS at `/rss.xml`.
- `/colophon` — how and why it's made; design-language documentation.
- 404 styled as a DRC error.
- SEO/ATS: all content in static HTML (readable with JS off), semantic
  landmarks, JSON-LD Person (+ BlogPosting), full OG/Twitter meta, build-time
  OG images, `robots.ts` / `sitemap.ts`, print stylesheet, `<time>` elements.

## Security constraint (hard)

Raw Gerber/drill/BOM/pick-place files are full fabrication data. They are
never committed and never deployed. Only derived renders ship; inner-layer
artwork ships raster-only. A CI guard scans tracked files and the built `out/`
for fab-data signatures. Until the M8 cutover the legacy workflow deploys the
repo root on every main push, so all app work happens on the `rebuild` branch.

## Visual checkpoints

(a) design-language mockup during M3 before mass application;
(b) animation feel during M5;
(c) pre-cutover review at M8. Ben approves each before work proceeds.

## Verification

Full gates per milestone (build, lint, typecheck, unit, Playwright e2e against
the built `out/`, Lighthouse ≥95 all categories, asset budgets, gerber guard).
Details live in `Roadmap/Roadmap.md`.
