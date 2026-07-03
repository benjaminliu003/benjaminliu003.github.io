# Progress Log

Append-only session log. Newest entry first. Write entries so anyone — human
or model — can resume cold. Conventions: `AGENTS.md`.

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
