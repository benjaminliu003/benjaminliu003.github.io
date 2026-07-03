# Portfolio Redesign: Glass Over Silicon

**Date:** 2026-04-18
**Author:** Benjamin Liu + Claude
**Status:** Draft

---

## Overview

Full redesign of benjaminliu003.github.io personal portfolio with a liquid glass aesthetic over a scroll-driven PCB animation background. Includes a separate analytics/evaluation dashboard and a workflow for adding new projects.

**Primary audience:** Recruiters & hiring managers
**Goal:** A visually striking, professionally credible portfolio that makes Ben memorable while keeping content scannable and ATS-friendly.

---

## Part 1: Website Redesign

### 1.1 Design Direction — "Glass Over Silicon"

A real PCB (designed by Ben in Altium Designer) serves as the persistent animated background. The PCB is pre-rendered as a Lottie animation that syncs to scroll position — starting assembled and progressively disassembling into an exploded layer view as the user scrolls down. All content floats above this in frosted glass panels.

**Personality:** Professional with a subtle easter egg — a ghostly cheese silkscreen on the SoC pad of the PCB, nodding to Ben's "I Like Cheese" branding without being unprofessional.

### 1.2 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Structure | Vanilla HTML5 | No framework overhead, simple deployment |
| Styling | Tailwind CSS (CDN) + custom glass CSS | Keep existing familiarity, add glass system |
| Animation | Lottie (lottie-web) | Pre-rendered PCB, small file, scroll-syncable |
| Scroll | GSAP + ScrollTrigger | Industry-standard scroll animation, ties Lottie progress to scroll |
| Interactivity | Vanilla JS | Theme toggle, nav, mobile menu |
| Fonts | Inter (Google Fonts) | Already in use, clean professional typeface |
| Deployment | GitHub Pages + GitHub Actions | Keep existing pipeline |

### 1.3 File Structure

```
index.html                  — page structure & content
css/
  glass.css                 — liquid glass design system (cards, badges, buttons, nav)
  theme.css                 — dark/light CSS custom properties
js/
  pcb-scene.js              — Lottie loader + GSAP ScrollTrigger sync
  scroll-engine.js          — glass panel entrance animations
  theme.js                  — dark/light toggle with localStorage
  main.js                   — nav, mobile menu, init
assets/
  pcb-animation.json        — Lottie JSON (placeholder until Ben exports from Altium)
  headshot-placeholder.jpg  — placeholder headshot
  projects/                 — project image placeholders
  resume-placeholder.pdf    — placeholder resume
tools/
  add-project.sh            — helper script to generate project card HTML
```

### 1.4 Liquid Glass Design System

**Core glass effect (dark mode):**
- `background: rgba(255,255,255,0.06)`
- `backdrop-filter: blur(20px) saturate(120%)`
- `border: 1px solid rgba(255,255,255,0.12)`
- Top-edge highlight: `inset 0 1px 0 rgba(255,255,255,0.08)`
- Radial refraction overlay via `::after` pseudo-element
- Hover: lift + brand-colored glow shadow

**Core glass effect (light mode):**
- `background: rgba(255,255,255,0.55)`
- `backdrop-filter: blur(20px) saturate(120%)`
- `border: 1px solid rgba(255,255,255,0.6)`
- Stronger white fills, deeper purple/teal accents

**Component library:**
- `glass-card` — content container with hover lift
- `glass-nav` — sticky frosted navigation bar
- `glass-badge` — skill/tech tags (default, brand, accent variants)
- `glass-btn` — buttons (primary gradient, secondary, accent)
- `photo-placeholder` — circular placeholder for headshot
- `project-image-placeholder` — rectangular dashed-border placeholder

**Color tokens (CSS custom properties):**

Dark theme:
- `--bg-deep: #0a0e1a` (page background)
- `--brand: #8b5cf6` (violet)
- `--accent: #22d3ee` (cyan)
- `--warm: #fde68a` (gold)

Light theme:
- `--bg-deep: #f8f6f3` (warm sand)
- `--brand: #7c3aed` (deep violet)
- `--accent: #0891b2` (teal)
- `--warm: #d97706` (amber)

### 1.5 Page Layout (Single Page, Scroll Order)

1. **Hero** — headshot placeholder, "Hi, I'm Benjamin Liu.", subtitle (Computer Engineering @ UWaterloo), CTA buttons (Resume download, GitHub, LinkedIn)
2. **About** — brief professional bio in a glass card
3. **Experience** — 4 positions in a 2x2 grid of glass cards (role, company, dates, description, tech badges)
4. **Projects** — project cards with image placeholders, descriptions, tech tags. 2-column grid.
5. **Skills** — single glass card with categorized badge groups (Languages, Frameworks, Tools)
6. **Resume** — download CTA button
7. **Footer** — social links, email, copyright

### 1.6 PCB Scroll Animation

**Source:** Ben's real PCB designed in Altium Designer
**Format:** Lottie JSON (exported via After Effects + Bodymovin)
**Position:** Fixed behind all content (`position: fixed; z-index: -1`)
**Sync:** GSAP ScrollTrigger ties `lottie.goToAndStop(frame)` to `scrollY / documentHeight`

**Timeline:**
| Scroll % | PCB State |
|----------|-----------|
| 0% | Assembled, slightly tilted toward viewer |
| 0–25% | Slow rotation (subtle perspective shift) |
| 25–50% | Layers begin separating (silkscreen lifts first) |
| 50–75% | Full explosion (copper, solder mask, substrate spread apart) |
| 75–100% | Fully separated, gentle float, cheese silkscreen visible on SoC |

**Mobile:** Simplified version — fewer layers, smaller model, or static fallback image for low-power devices.
**Reduced motion:** Respects `prefers-reduced-motion` — shows a static assembled PCB image instead.

### 1.7 Theme System

- Dark mode (default) + Light mode toggle
- Toggle button in fixed position (bottom-left, consistent with current site)
- localStorage persistence (`site-theme` key)
- Respects `prefers-color-scheme` on first visit
- All glass properties adapt via CSS custom properties
- Lottie animation color adjustments per theme (if needed)
- Custom `themechange` event for reactive updates

### 1.8 SEO & ATS Optimization

**Meta tags to add:**
- `<meta name="description" content="Benjamin Liu – Computer Engineering student at the University of Waterloo. Experience in test automation, power systems design, and cloud computing.">`
- Full Open Graph tag set (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- `<meta name="theme-color" content="#0a0e1a">`
- Canonical URL

**Structured data (JSON-LD):**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Benjamin Liu",
  "jobTitle": "Computer Engineering Student",
  "alumniOf": "University of Waterloo",
  "url": "https://benjaminliu003.github.io",
  "sameAs": [
    "https://github.com/benjaminliu003",
    "https://www.linkedin.com/in/bliu0326/"
  ]
}
```

**ATS-friendliness:**
- Semantic HTML throughout (`<section>`, `<article>`, `<h1>`–`<h3>` hierarchy)
- All content visible in DOM (not hidden behind JS-only rendering)
- `aria-label` attributes on interactive elements
- Print stylesheet that strips animations and shows clean, readable content
- Machine-readable dates (ISO 8601 in `<time>` elements)

**Fixes:**
- `robots.txt` — fix malformed sitemap URL
- `sitemap.xml` — update last modified date

### 1.9 Responsive Design

- Mobile-first Tailwind classes
- Glass nav collapses to hamburger menu on mobile
- Project/experience grids collapse to single column
- PCB animation scales or falls back to static on small/low-power devices
- Touch-friendly spacing and tap targets

### 1.10 Placeholders

All downloadable files and images use placeholders:
- `assets/resume-placeholder.pdf` — placeholder PDF
- `assets/headshot-placeholder.jpg` — placeholder headshot image
- `assets/projects/*.jpg` — placeholder project images
- `assets/pcb-animation.json` — placeholder Lottie JSON (simple rotating rectangle until Ben exports real PCB)

---

## Part 2: Analytics & Evaluation Dashboard

### 2.1 Purpose

A separate web application that evaluates the portfolio site for recruiter impact, SEO performance, and ATS compatibility. Designed to be extended with visitor analytics over time.

### 2.2 Architecture (Phased)

**Phase 1 — Core Evaluation (MVP):**
- Static HTML/JS/CSS dashboard (no backend)
- Fetches the deployed portfolio site via Fetch API
- Parses DOM to run client-side evaluation checks
- Displays scores and actionable checklists
- Can run locally or deploy alongside portfolio

**Checks include:**
- Meta tag completeness (description, OG, Twitter)
- Semantic HTML structure validation
- Structured data (JSON-LD) presence
- Keyword density and relevance
- Content visibility timing (name visible < 1s)
- Resume download click depth (< 2 clicks)
- Mobile responsiveness
- Print stylesheet availability
- Accessibility score (basic checks)
- Lighthouse performance score (via API if available)

**Phase 2 — Analytics Integration (Future):**
- Add privacy-respecting analytics to portfolio (Plausible or Umami)
- Dashboard reads analytics API to display:
  - Visitor count and traffic sources
  - Time on page per section
  - Scroll depth
  - Resume download count
  - Device/browser breakdown
  - Peak traffic times
- Tech: Analytics service API + Chart.js for visualization

**Phase 3 — Advanced Analysis (Future):**
- Node.js backend for server-side crawling (Puppeteer)
- Heatmap generation from scroll/click data
- Before/after comparison reports
- Automated SEO recommendations
- Competitor site benchmarking

### 2.3 Dashboard UI

- Sidebar navigation with section groups (Analysis, Analytics, Settings)
- Overview page with 4 score cards (SEO, ATS, Recruiter Impact, Performance)
- Detailed checklists with pass/warn/fail statuses per category
- Chart placeholders for score history and keyword analysis
- Future analytics sections grayed out in sidebar until implemented

### 2.4 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vanilla HTML/JS/CSS |
| Site fetching | Fetch API + DOMParser |
| Charts | Chart.js (when needed) |
| Performance | Lighthouse API (optional) |
| Analytics (Phase 2) | Plausible or Umami |
| Advanced (Phase 3) | Node.js + Puppeteer |

### 2.5 File Structure

```
dashboard/
  index.html              — dashboard shell
  css/
    dashboard.css          — dashboard-specific styles (reuse glass system)
  js/
    evaluator.js           — site fetching + DOM analysis engine
    scores.js              — score calculation and display
    charts.js              — Chart.js integration (Phase 2+)
  config.json              — site URL and check configuration
```

---

## Part 3: Project Addition Workflow

### 3.1 Template Approach

Each project in `index.html` follows a consistent glass card pattern. A clearly commented HTML block serves as the copy-paste template:

```html
<!-- === NEW PROJECT TEMPLATE === -->
<!-- Copy this block and fill in the values -->
<div class="glass-card project-card">
  <div class="project-image-placeholder">
    <img src="assets/projects/YOUR_IMAGE.jpg" alt="Project name" loading="lazy">
  </div>
  <h3 class="project-title">PROJECT NAME — Your Role</h3>
  <p class="project-desc">1-2 sentence description of the project.</p>
  <div class="project-tags">
    <span class="glass-badge brand">Tag 1</span>
    <span class="glass-badge accent">Tag 2</span>
  </div>
  <!-- Optional: <a href="URL" class="glass-btn">View Project</a> -->
</div>
<!-- === END PROJECT TEMPLATE === -->
```

### 3.2 Helper Script

`tools/add-project.sh` — prompts for project fields and generates the HTML:

```
$ ./tools/add-project.sh
Project name: Photonics Simulator
Your role: Creator
Description: GPU-accelerated FDTD simulator for photonic crystal design
Tags (comma-separated): CUDA, Python, Photonics
Image filename (or 'placeholder'): photonics-sim.jpg
GitHub URL (or 'none'): https://github.com/benjaminliu003/photonics-sim

✅ Generated project card HTML — paste it into index.html in the projects section.
```

The script outputs the filled HTML block to stdout (and copies to clipboard if available).

### 3.3 Steps to Add a Project

1. Run `./tools/add-project.sh` (or copy the template manually)
2. Drop project image into `assets/projects/` (800x450px recommended)
3. Paste the generated HTML into the projects section of `index.html`
4. Push to `main` — GitHub Actions deploys automatically
5. (Optional) Run the evaluation dashboard to verify SEO impact

---

## Verification Plan

1. **Visual:** Open the site locally, scroll through all sections, verify glass effects render on both themes
2. **PCB animation:** Verify Lottie loads and syncs to scroll (placeholder animation until real PCB exported)
3. **Responsive:** Test on mobile viewport (Chrome DevTools)
4. **SEO:** Run Lighthouse audit, verify meta tags and structured data
5. **ATS:** Print the page (Ctrl+P), verify clean readable output
6. **Dashboard:** Open dashboard, verify it can fetch and evaluate the portfolio site
7. **Project workflow:** Run `add-project.sh`, paste output into HTML, verify card renders correctly
8. **Theme:** Toggle dark/light, verify all components adapt
9. **Performance:** Check Lighthouse performance score (target: 90+)
10. **Accessibility:** Verify keyboard navigation and screen reader compatibility
