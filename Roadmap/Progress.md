# Progress Log

Append-only session log. Newest entry first. Write entries so anyone — human
or model — can resume cold. Conventions: `AGENTS.md`.

---

## 2026-07-04 (cont.) — M2 spike: tracespace v4 GO (Claude Code / Opus 4.8)

Spike ran in the session scratchpad (nothing committed to the repo tree yet —
raw Gerbers stay out of git per the security invariant). Rendered all 18 real
layer/drill files of ELI_Frisbee_Mk.I with pcb-stackup/gerber-to-svg/
whats-that-gerber v4 and rasterized key layers with @resvg/resvg-js.

### Answers to the spike's open questions

1. **tracespace v4 = GO.** Every layer + drill rendered, zero errors, pure JS,
   fast. No need for the gerbonara/tracespace-v5 fallbacks. Pin the trio;
   whats-that-gerber is **4.2.7** (4.2.6 in the plan was a typo — nonexistent).
2. **Negative planes confirmed inverted, fix proven.** GP1/GP2 carry Altium's
   `TF.FilePolarity,Negative` *metadata attribute* but NO `%IPNEG%`/`%LPC%` in
   the body, so gerber-to-svg draws the clearances/anti-pads as positive shapes
   → visual render is scattered dots on an empty field (the inverse of a
   plane). Verified visually (PNG). Fix: composite plane = board-profile fill
   MINUS clearance artwork via SVG `<mask>`, then rasterize. Since inner layers
   (orders 2–7, incl. both planes) ship **raster-only** per the security
   invariant, the composite is baked to WebP/AVIF — no clever mask ships. Not a
   blocker.
3. **`Take2.GM` = the outline/profile** (0.3 KB gz, clean board boundary).
   whats-that-gerber can't type GM or the microvia drills (TX3/TX4) — expected;
   the pipeline uses an explicit allowlist + DRR parse, not auto-detection.
4. **Sizes: every individual layer is within the 45 KB-gz budget even before
   SVGO** (largest GTO 23 KB gz, GTL 21.5 KB gz). pcb-stackup composite
   board-top 54 KB gz / bottom 30 KB gz (one-off hero/OG assets, SVGO + the
   450 KB total budget absorb it). All layers share alignment via pcb-stackup;
   raw gerber-to-svg per-layer viewBoxes differ → force a common viewBox from
   GM (or reuse pcb-stackup's) in the hardening build.
5. **@resvg/resvg-js rasterizes cleanly** — raster-tier dependency validated.

### Bonus discovery (content/personality)

The board's real silkscreen title is **"MTL Smoked Meat Sandwich, Rev 0.0.1 ·
By Ben Liu · Feb '26"** — a compact audio board (I2S/PDM mics, speakers,
Bluetooth, USB-C ESD, OSD32MP1) Ben named after a Montreal deli sandwich.
Directly reinforces the site's food-humor thread ("I Like Cheese :)"). The
pcb-stackup top composite is a ready-made hero/OG "money shot" (green mask,
ENIG-gold pads, full silk designators). Feed this into M3 content + M6 design.

### Decisions (asked Ben; he was AFK — proceeded on defaults, cheap-to-reverse)

Asked two questions at the hold; no response in 60s. Proceeded because M2's
technical pipeline is **framing-independent** and doesn't block on either:
1. **Board-identity framing** (lean-in vs balanced vs professional): DEFERRED
   to M3 visual checkpoint (a), which was always a Ben-gate. M2 renders the
   same geometry regardless; the "money shot" composite is built framing-
   neutral (labels/copy come in M3). Re-ask at M3.
2. **M2 builder**: building **inline on Opus** — Codex hung in M1, and the
   plane-compositing is taste-bearing. Documented fallback; most reliable.
   Building inline (not delegating) → no heavy plan-file needed, per the
   pattern Fable set (plan-files are for delegation handoffs). Structured via
   the task list instead.

### M2 build — architecture locked (from spike evidence)

- **Ship as SVG** (outer, visible on any physical board): GTL, GBL copper;
  GTS/GBS mask; GTO/GBO silk; GM outline. **Ship as raster only** (inner =
  fab secret + perf): G1, GP1, G2, G3, GP2, G4. Paste (GTP/GBP) excluded.
- **Alignment**: gerber coords are absolute board microns shared across all
  files; only each layer's computed bbox/viewBox differs. So render per-layer
  then FORCE a common viewBox (union, = pcb-stackup's) → perfect overlay.
- **Negative planes**: copper-fill rect masked by the clearance artwork,
  clipped to the board outline, rasterized. Verify visually with resvg.
- **Money shot**: pcb-stackup top/bottom composite → SVG + raster for hero/OG.
- Deps added to project as devDependencies (local-only pipeline; never in CI).

### M2 BUILT & verified (Claude inline)

Pipeline shipped and all gates green locally (lint, typecheck, 12 unit tests,
build, `pnpm pcb:verify`, `pnpm check:budgets`). Files:
- `scripts/pcb/`: `layers.mts` (allowlist + render policy), `build-pcb.mts`
  (render → reframe → SVGO / raster-composite → manifest), `manifest-schema.mts`
  (zod, build-time only), `fab-detect.ts` (+ `.test.ts`), `verify-no-gerbers.mts`
  (CI guard), `check-budgets.mts`.
- `lib/pcb.ts` (typed manifest accessor, zod-free bundle) + `lib/pcb.test.ts`
  (manifest integrity, runs in CI without Gerbers).
- `lib/generated/pcb-manifest.json` + `public/pcb/*` (13 layer assets + 2
  board composites + exploded-static) — COMMITTED derivatives.
- `pnpm pcb:build|pcb:verify|check:budgets` scripts; guard + budgets wired into
  `ci.yml`.

Verified: **negative planes render correctly** (solid copper disc with
transparent anti-pad holes — the M2 flagged risk, confirmed by eye); layer
alignment correct (disc-from-outline + holes-from-GP1 overlay perfectly, so the
common-viewBox reframe works across layers); **build is deterministic**
(public/pcb + manifest byte-identical across two runs); budgets 443/450 KB;
guard red-teamed (planted `.GTL` + innocent-named fab file → exit 1; clean → 0).

Deviations from plan (cheap-to-reverse, recorded): (1) WebP-only, no AVIF twin
for v1 (budgets met; halves committed bytes/build time; AVIF marginal here —
add in M7 if needed); (2) money shot shipped as raster not vector (pcb-stackup
emits random ids → non-deterministic SVG; raster pixels are stable); (3) masks
shipped as simple SVG openings, not the green-sheet composite (that polish is
M6); (4) inner-raster width 1000px, board-bottom 640px to hit the 450 KB total.

**CRITICAL bug caught before commit**: M0's `.gitignore` rule `PCB/` (no
leading slash, and git ignore is case-insensitive on Windows) was silently
ignoring `scripts/pcb/` AND `public/pcb/` — committing would have omitted the
whole pipeline + assets and broken CI. Fixed to `/PCB/` (root-anchored). Lesson
for future dirs: anchor repo-root ignores with a leading slash.

## 2026-07-05 — M3 in progress: content + Silkscreen design language (Opus 4.8)

- **Ben ratified board-identity framing: LEAN IN** — the board is celebrated as
  the "MTL Smoked Meat Sandwich" (real 8-layer HDI audio board underneath);
  food-humor thread with "I Like Cheese :)" becomes a signature.
- **Vercel connected by Ben** (main→Production, other branches→Preview). Works
  as-is because vercel.json noindexes ALL Vercel deploys → Pages stays
  canonical. No preview on PR yet (integration added after last push); next
  rebuild push produces one. "OAuth link" = adding the project; already done.
- **Design language locked (frontend-design skill):** the page presents as
  Ben's fabrication drawing. Palette: Soldermask dark / Engineering-pad light
  (deliberately NOT the AI-default cream). Type: all-mono — Space Mono (display)
  + IBM Plex Mono (body), self-hosted via next/font. Structure-as-information:
  title-block hero + real board render; Experience = revision-history table
  (rev D→A = 4 roles); Projects = design blocks U1–U4 (U1 = the board);
  Skills = bill of materials; Resume = datasheet; footer = DRC report.
- M3 = provisional language + all real content (ported verbatim from
  index.html) + SEO/favicon/resume plumbing → **visual checkpoint (a)**. Full
  polish is M6. Content facts preserved verbatim; only framing/structure is new.

### M3 BUILT — awaiting visual checkpoint (a)

Home page rebuilt in the Silkscreen language; all gates green (lint, typecheck,
10 e2e, build, **LHCI exit 0 = perf/a11y/best-practices/SEO all ≥95** on home
+ blog). Files: `app/{layout,page,not-found}.tsx`, `app/globals.css` (token
system + primitives), `components/site/{Header,Section,ThemeToggle}.tsx`,
`lib/seo.ts`, `scripts/generate-favicons.mts` (cheese.png → 27KB icon set),
resume copied to `public/`. Verified in-browser (Playwright) dark + light +
mobile 390px.

Decisions/notes:
- ThemeToggle uses `useSyncExternalStore` + MutationObserver (reads
  `<html data-theme>` set by the no-flash script; syncs desktop+mobile
  instances; satisfies the new react-hooks/set-state-in-effect rule).
- Board hero uses `next/image` (unoptimized under static export) pointed at the
  committed money-shot `pcb.composites.top` — dogfoods `lib/pcb.ts`.
- Resume section keeps `id="resume"` (deep-link + e2e) but is LABELLED
  "Datasheet". Experience is a REVISION HISTORY table; Skills a BILL OF
  MATERIALS; Projects design blocks U1–U4 (U1 = the board). NPI correction
  applied to the Ciena entry + About ("optimizing new product introduction").
- **CHECKPOINT (a) is a hard Ben-gate.** Full design-system polish (hand
  annotations, dimension-line system, mobile section nav, board-bg theming) is
  M6 — intentionally not done yet. Awaiting Ben's ratification of palette /
  type / concept before mass application. Pushing rebuild → Vercel preview URL
  on PR #1 for live click-through.

M3 is the next milestone. It reaches **visual checkpoint (a)** — the first hard
Ben-gate — where the design-language name/palette AND the deferred board-
identity framing question (lean-in vs balanced vs professional on "MTL Smoked
Meat Sandwich") get ratified. Re-ask both at M3. The money-shot raster
(`public/pcb/board-top.webp`) and `lib/pcb.ts` are ready for the hero/animation
(M5) and for M3 to reference.

---

## 2026-07-04 — M1 done inline; Pages deploy wedge fixed; HANDOFF → Opus 4.8

### State right now (cold-resume summary)

- Branch `rebuild` (tracking origin) has the complete M1 scaffold; **all five
  gates green locally**: `pnpm lint` (clean), `pnpm typecheck` (velite+tsc
  clean), `pnpm test` (2/2), `pnpm build` (8 static routes → `out/`),
  `pnpm e2e` (6/6 incl. no-JS project). PR rebuild→main opened for CI +
  Vercel preview. Live site healthy at benjaminliu003.github.io (old design,
  from main — untouched by rebuild work, as designed).
- Resolved versions: next 16.2.10, react 19.2.7, velite 0.4.0, tailwindcss
  4.3.2, @tailwindcss/postcss 4.3.2, eslint 9.39.4 (10.x crashes
  eslint-plugin-react — pinned back), eslint-config-next 16.2.10, typescript
  6.0.3, vitest 4.1.9, @playwright/test 1.61.1, pnpm 11.5.1, node 22.22.2.

### The GitHub Pages deploy saga (2026-07-03, after the M0 entry was written)

Symptom: every Actions deploy failed at `deploy-pages` with "Deployment
failed, try again later" (deployment created, then rejected; no error detail
anywhere). Site kept serving a build of a pre-rewrite commit from 2025-08.
Ruled out: reruns, fresh dispatches, deploy-pages v4→v5 (kept v5 — it's the
current canonical), Pages-site delete (403: forbidden on user-site repos),
`github-pages` environment delete/recreate, branch policies (fine).
**Fix that worked**: switch Pages build_type to `legacy` via API, **force a
real build** with `POST /pages/builds` (this refreshed the backend's stale
state — the earlier quick toggle without a build did nothing), verify the
legacy build served current main, then switch build_type back to `workflow`
→ Actions deploys succeed. Root cause: stale Pages provisioning after the
repo rename (baen.github.io → benjaminliu003.github.io) with no deploy in 10
months; the rename redirect note also means: remote URL updated locally.

### M1 execution notes

- Codex delegation FAILED before writing a byte: `codex exec` launched
  detached blocks on "Reading additional input from stdin..." and
  `--full-auto` is deprecated. Killed after 30 min. AGENTS.md invocation
  updated (pipe `$null |` into stdin, `--sandbox workspace-write`). Also
  learned: never `git switch` in the shared tree while a delegated run is
  live (Codex flipped itself back to `rebuild`, no harm done).
- Fallback per principles: built M1 inline from `Roadmap/plans/M1-scaffold.md`
  exactly; deviations: (1) pnpm 11.5 build-script approvals live in
  `pnpm-workspace.yaml` `allowBuilds:` (not package.json); (2) eslint pinned
  ^9; (3) `react-hooks/static-components` file-level disable in `lib/mdx.tsx`
  with reason (server-component MDX evaluation); (4) commits batched into 3
  logical chunks instead of 7 micro-commits (credit economy).

### Open items for the next session (Opus 4.8)

1. **Ben**: Vercel OAuth-link the repo (framework Next.js, build `pnpm
   build`, output `out`) + set production branch to a dummy name → preview
   URL appears on the rebuild PR. `vercel.json` already enforces noindex.
2. ~~Verify CI green on the PR~~ DONE before handoff: PR #1 `quality` checks
   SUCCESS on both triggers, incl. LHCI ≥0.95 all categories.
3. Then **M2 per Roadmap**: spike `pcb-stackup@4.2.8` on the real Gerbers at
   `PCB\Project Outputs for ELI_Frisbee_Mk.I\` — first question: negative-
   polarity planes GP1/GP2 (`TF.FilePolarity,Negative`), outline from
   `Take2.GM`. Golden-test fixtures must be a tiny synthetic gerber, never
   the real board. Session start: read AGENTS.md, Roadmap/Roadmap.md, this
   entry, then `Roadmap/plans/` for the pattern to write M2's plan.
4. Delete `content/blog/hello-world.mdx` in M4 (fixture; e2e references it).
5. Design-language name + palette ratification at visual checkpoint (a), M3.

---

## 2026-07-03 — Redesign approved; M0 executed (Claude Code / Fable 5)

### What happened

- Full brainstorm → research → architecture cycle with Ben; complete redesign
  plan approved (PCB-native "Silkscreen" direction). Spec committed at
  `docs/superpowers/specs/2026-07-03-pcb-native-redesign-design.md`; roadmap
  at `Roadmap/Roadmap.md`.
- M0 executed: hardened `.gitignore` (PCB/ + all fab-data extensions + tool
  state), deleted stale `AUTHOR-EMAIL-FIX.md`, created `AGENTS.md`,
  `Roadmap/{Roadmap,Progress}.md`, M1 delegation plan
  (`Roadmap/plans/M1-scaffold.md`), `rebuild` branch.

### Decisions & rationale

1. **Ben's Q&A decisions**: balanced audience; PCB-native, no glass; real
   ELI_Frisbee_Mk.I Gerbers (files in `PCB/`, verified 8-layer HDI + µvias);
   Next.js static export + Tailwind v4 + Motion + Velite on pnpm; GH Pages
   canonical + Vercel previews; integrated Lab Notes blog launching with the
   build-log post.
2. **Git history**: local main = June email-fix rewrite; origin/main = old
   typo'd history; tip trees identical except the note file. **Ben explicitly
   approved `git push --force-with-lease origin main`** to complete the June
   fix. Executed this session (see SECURITY).
3. **`docs/` stays tracked** (the architecture draft suggested ignoring it —
   contradiction with committing specs there; resolved in favor of tracking).
   `.claude/` trackable except `settings.local.json`; `.superpowers/` ignored
   (transient tool state).
4. **Blog route is `/blog`** (labeled "Lab Notes" in UI). Paste layers
   (GTP/GBP) excluded from shipped renders — no visual value, less fab data.
5. **writing-plans adaptation**: M0 executed directly from the approved plan
   (small, Claude-inline, immediate); the full bite-sized plan-file treatment
   is reserved for delegation handoffs (M1 file written this session). Plan
   files live in `Roadmap/plans/` per Ben's principles, overriding the
   skill's default location.
6. All work after M0 happens on the **`rebuild`** branch because the legacy
   workflow deploys the repo root on every main push (see Roadmap risk #1).

### SECURITY

- `PCB/` contained full fab data (Gerbers, drills, BOM, pick-place) inside a
  publicly-deployed repo root — never committed (verified: zero history), but
  one `git add -A` away from publication. Now blocked by `.gitignore`
  (directory + extension patterns); CI content-signature guard lands in M2.
- Force-push of main was Ben-approved (hard gate honored), executed with
  `--force-with-lease`.

### Open questions / waiting on Ben

- Vercel OAuth repo link + dummy production branch (needed during M1; Codex
  cannot do it).
- Design-language name + palette ratification at visual checkpoint (a) in M3.

### Next steps

- Delegate M1 to Codex per `Roadmap/plans/M1-scaffold.md` and the AGENTS.md
  protocol; Claude reviews the diff, runs all gates, then pushes `rebuild`
  and opens the PR.
- Then M2 spike (Claude inline): pcb-stackup v4 vs the 8-layer negative-plane
  reality, on the real Gerbers.
