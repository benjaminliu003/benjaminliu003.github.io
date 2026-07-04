# Progress Log

Append-only session log. Newest entry first. Write entries so anyone — human
or model — can resume cold. Conventions: `AGENTS.md`.

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
2. Verify CI green on the PR (`.github/workflows/ci.yml`; LHCI ≥0.95 may
   need placeholder-page tuning — first run tells).
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
