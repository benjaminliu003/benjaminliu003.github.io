# AGENTS.md — benjaminliu003.github.io

Shared conventions for every agent and human working in this repo (Claude Code,
Codex CLI, Cursor, Ben). Read this file, `Roadmap/Roadmap.md`, and the latest
`Roadmap/Progress.md` entries at the start of every session.

## What this project is

Ben Liu's personal site, being rebuilt as a "PCB-native" portfolio + Lab Notes
blog. The design centerpiece is Ben's real 8-layer HDI board
(ELI_Frisbee_Mk.I), rendered from its Gerbers into a scroll-driven exploded
stackup. Full approved plan: `Roadmap/Roadmap.md`; design spec:
`docs/superpowers/specs/2026-07-03-pcb-native-redesign-design.md`.

- Production: GitHub Pages at https://benjaminliu003.github.io (canonical).
- Previews: Vercel, attached to PRs (never canonical; sends `X-Robots-Tag: noindex`).
- Stack (from M1 on): Next.js (App Router, `output:'export'`), TypeScript
  strict, Tailwind v4, Motion (`motion/react`), Velite MDX, pnpm.

## Commands

Pre-M1 the site is a single static `index.html` (no build). From M1 onward:

| Action    | Command                                   |
|-----------|-------------------------------------------|
| Install   | `pnpm install --frozen-lockfile`          |
| Dev       | `pnpm dev`                                |
| Build     | `pnpm build` (velite → og → next build → `out/`) |
| Lint      | `pnpm lint`                               |
| Typecheck | `pnpm typecheck`                          |
| Unit      | `pnpm test`                               |
| E2E       | `pnpm e2e` (Playwright against built `out/`) |
| PCB assets| `pnpm pcb:build` (LOCAL ONLY — needs `PCB/` sources) |

Node 22 (`.nvmrc`), pnpm pinned via `packageManager`. Update this table the
moment commands change.

## SECURITY INVARIANTS (non-negotiable)

1. **Never commit or publish anything under `PCB/`** or any raw fab data
   (Gerber, drill, BOM, pick-place, Altium sources). The `.gitignore` blocks
   the extensions; `scripts/pcb/verify-no-gerbers.mts` (from M2) blocks CI.
2. Only derived renders in `public/pcb/` (svg/webp/avif/png/json) may ship.
   Inner-layer artwork (layers 2–7) ships raster-only, never vector.
3. The Pages artifact must only ever be the build output (`out/`), never the
   repo root — the legacy workflow still uploads root until the M8 cutover,
   which is why all app work happens on the `rebuild` branch.
4. No secrets exist in this project. If one ever becomes necessary: `.env`
   (gitignored) + committed `.env.example`, never hardcoded.
5. Do not edit `.github/workflows/*` unless the task explicitly says so.

## Working agreements

- Correctness first, simplicity second, speed third. Smallest change that
  fully solves the problem; flag refactors instead of bundling them.
- One logical change per commit: one-line summary + short paragraph (what &
  why). Never skip hooks. Never force-push without Ben's explicit approval.
- Every milestone ends: build green, lint/typecheck/tests pass (paste real
  output — never report from memory), commit, `Roadmap/Progress.md` entry.
- `Roadmap/Progress.md` is the project's persistent memory: one entry per
  session — what was done, decisions + rationale, open questions, next steps.
  Write it so anyone can resume cold.
- Ambiguity: cheap-to-reverse → pick the simpler reading and record it in
  Progress.md; expensive-to-reverse (architecture, schema, public API, new
  dependency) → ask Ben. Real money, credentials, publishing beyond the site
  itself, destructive ops → always ask Ben.
- Verify library specifics against current docs (context7 MCP for Claude;
  official docs otherwise) rather than trusting training data.

## Delegation protocol (Codex as executor)

Large, self-contained milestones are delegated to Codex; Claude Code stays
architect/reviewer. Taste-heavy work (design system, animation feel) is never
delegated.

- Handoff = a written plan file in `Roadmap/plans/M{n}-{slug}.md` (context,
  invariants, exact files, complete code, acceptance commands, out-of-scope).
- Pinned invocation (run from repo root; capture full JSON stream). Two
  hard-won gotchas: `--full-auto` is deprecated (use `--sandbox
  workspace-write`), and `codex exec` blocks forever "Reading additional
  input from stdin..." when launched detached with an open-but-empty stdin —
  always pipe stdin closed. Never switch git branches in the working tree
  while a delegated run is active (shared tree).

  ```powershell
  $null | codex exec --sandbox workspace-write -c model="gpt-5.5" -c model_reasoning_effort="xhigh" --json "Read AGENTS.md and Roadmap/plans/<file>. Implement it exactly. Iterate until pnpm lint && pnpm typecheck && pnpm test && pnpm build all pass." > Roadmap/logs/M{n}.jsonl
  ```

- The run of record is the JSONL log (`Roadmap/logs/`, gitignored). Reviewer
  reads the actual diff, runs all gates locally, and only then commits.
- Fallback order if Codex is unavailable or fails review: (1) Claude builds
  inline; (2) platform structured workflows, milestone by milestone.

## Repo geography

- `index.html`, `robots.txt`, `sitemap.xml`, `cheese.png` — the LEGACY site;
  untouched until the M8 cutover deletes them.
- `Roadmap/` — Roadmap.md (milestones), Progress.md (session log),
  plans/ (delegation handoffs), logs/ (gitignored run logs).
- `docs/superpowers/specs/` — committed design specs.
- `PCB/` — Ben's Altium project + Gerber outputs (gitignored, nested repo).
  Read-only input to `pnpm pcb:build`; never modified, never committed.
- From M1: `app/`, `components/`, `content/`, `lib/`, `public/`, `scripts/`,
  `e2e/` per the plan in `Roadmap/Roadmap.md`.
