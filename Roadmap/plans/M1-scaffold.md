# M1: Next.js Scaffold + Toolchain + CI Skeleton — Implementation Plan

> **For agentic workers:** Execute tasks in order. Steps use checkbox (`- [ ]`)
> syntax. Commit after each task on the `rebuild` branch. Do NOT push. If a
> library API differs from the code given here, adapt minimally, note it in
> your final report, and keep all acceptance commands green.

**Goal:** A hand-written Next.js static-export scaffold (App Router, TS
strict, Tailwind v4, Velite MDX, vitest, Playwright, CI) that builds to
`out/` with placeholder pages, on the `rebuild` branch.

**Architecture:** No generator — every file is written explicitly below.
Velite compiles `content/` before `next build`; Playwright tests the built
`out/` served statically (GitHub Pages parity). The legacy root site
(`index.html` etc.) remains untouched and coexists until M8.

**Tech Stack:** Next.js (current stable, ≥16), React, TypeScript strict,
Tailwind CSS v4 (`@tailwindcss/postcss`), Velite, vitest, @playwright/test,
`serve`, ESLint 9 flat + `eslint-config-next`, Prettier, pnpm@11.5.1, Node 22.

## Global Constraints

- Branch: `rebuild` only. Never commit to `main`. Never push.
- **Never touch `PCB/`**, `Personal Site Testing Grounds - ARCHIVED/`, or the
  legacy root files (`index.html`, `robots.txt`, `sitemap.xml`, `cheese.png`,
  `Benjamin_Liu_Resume.pdf`, `README.md`).
- **Never edit `.github/workflows/deploy.yaml`.** Creating
  `.github/workflows/ci.yml` (Task 7) is the only workflow change allowed.
- Install latest stable versions (`pnpm add <pkg>@latest`); the lockfile pins
  them. Report the resolved versions of next/tailwindcss/velite in your final
  message.
- `next.config.ts` must keep `output:'export'`, `trailingSlash:true`,
  `images:{unoptimized:true}` — the site must build with zero server features.
- TypeScript `strict: true`; no `any` unless annotated with a reason comment.
- Definition of done for every task: its acceptance command(s) pass; final
  task ends with `pnpm lint && pnpm typecheck && pnpm test && pnpm build &&
  pnpm e2e` all green.
- Commit messages: one-line summary + short paragraph (what & why).

---

### Task 1: Package manifest + core Next config

**Files:**
- Create: `package.json`, `.nvmrc`, `next.config.ts`, `tsconfig.json`,
  `postcss.config.mjs`, `app/globals.css`

**Interfaces:**
- Produces: pnpm scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `e2e`,
  `format`) used by every later task and by CI; path alias `@/*` → repo root.

- [ ] **Step 1: Create `.nvmrc`**

```
22
```

- [ ] **Step 2: Create `package.json`** (scripts first; deps installed in Step 3)

```json
{
  "name": "baen-site",
  "private": true,
  "packageManager": "pnpm@11.5.1",
  "engines": { "node": ">=22 <23" },
  "scripts": {
    "dev": "velite && next dev",
    "build": "velite && next build",
    "lint": "eslint .",
    "typecheck": "velite && tsc --noEmit",
    "test": "vitest run",
    "e2e": "playwright test",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:
```
pnpm add next@latest react@latest react-dom@latest velite@latest
pnpm add -D typescript@latest @types/react@latest @types/react-dom@latest @types/node@latest tailwindcss@latest @tailwindcss/postcss@latest eslint@latest eslint-config-next@latest prettier@latest vitest@latest @playwright/test@latest serve@latest
```
Expected: `pnpm-lock.yaml` created; no peer-dependency errors.

- [ ] **Step 4: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"], "#velite": ["./.velite"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".velite", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out", "PCB"]
}
```

- [ ] **Step 6: Create `postcss.config.mjs`**

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
}
```

- [ ] **Step 7: Create `app/globals.css`** (provisional tokens; real design
  system lands in M3/M6 — do not invent more)

```css
@import 'tailwindcss';

/* Provisional "Silkscreen" tokens — ratified at visual checkpoint (a), M3 */
@theme {
  --color-soldermask: #0d1a14;
  --color-copper: #b87333;
  --color-enig: #c9a227;
  --color-silk: #e8e6df;
  --font-mono: ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', monospace;
}
```

- [ ] **Step 8: Commit**

```bash
git add .nvmrc package.json pnpm-lock.yaml next.config.ts tsconfig.json postcss.config.mjs app/globals.css
git commit -m "feat(m1): package manifest, Next static-export config, Tailwind v4 wiring"
```

---

### Task 2: App shell (layout, home placeholder, 404)

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx`, `app/not-found.tsx`, `lib/seo.ts`

**Interfaces:**
- Produces: `SITE` const (`lib/seo.ts`): `{ name: string; url: string;
  title: string; description: string }` — used by RSS (Task 4), metadata, CI
  smoke tests.
- Home page MUST render `<h1>Benjamin Liu</h1>` and section landmarks with
  ids `about`, `experience`, `projects`, `skills`, `resume` (JS-off e2e
  depends on these; M3 fills real content).

- [ ] **Step 1: Create `lib/seo.ts`**

```ts
export const SITE = {
  name: 'Benjamin Liu',
  url: 'https://benjaminliu003.github.io',
  title: 'Benjamin Liu | Computer Engineering @ UWaterloo',
  description:
    'Computer Engineering student at the University of Waterloo. Test automation, power systems, and an 8-layer HDI board named after a frisbee.',
} as const
```

- [ ] **Step 2: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { SITE } from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-soldermask text-silk font-mono">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create `app/page.tsx`**

```tsx
const SECTIONS = ['about', 'experience', 'projects', 'skills', 'resume'] as const

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl">Benjamin Liu</h1>
      <p className="mt-2 text-copper">
        Rebuild in progress on the <code>rebuild</code> branch — PCB-native
        redesign. Content lands in M3.
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
```

- [ ] **Step 4: Create `app/not-found.tsx`**

```tsx
export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">DRC Error: net not found</h1>
      <p className="mt-2">
        This route is unrouted. <a className="underline text-copper" href="/">Back to the board</a>.
      </p>
    </main>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: succeeds; `out/index.html` and `out/404.html` exist. (Velite runs
first and warns about an empty `content/` dir or missing config — that is
fine until Task 3; if velite hard-fails without a config, create
`content/blog/.gitkeep` and proceed, noting it.)

- [ ] **Step 6: Commit**

```bash
git add app lib
git commit -m "feat(m1): app shell with placeholder one-pager and DRC-styled 404"
```

---

### Task 3: Velite content pipeline + temp fixture post

**Files:**
- Create: `velite.config.ts`, `content/blog/hello-world.mdx`,
  `lib/content.ts`, `lib/mdx.tsx`

**Interfaces:**
- Produces: `allPosts: Post[]` and `getPost(slug: string): Post | undefined`
  from `lib/content.ts`, where `Post` has `{ title: string; date: string;
  summary: string; tags: string[]; draft: boolean; rev: string; slug: string;
  body: string }` (`body` = compiled MDX function-body). `MDXContent({ code })`
  React component from `lib/mdx.tsx`. Tasks 4–6 and M4 consume these.

- [ ] **Step 1: Create `velite.config.ts`**

```ts
import { defineConfig, s } from 'velite'

export default defineConfig({
  root: 'content',
  collections: {
    posts: {
      name: 'Post',
      pattern: 'blog/**/*.mdx',
      schema: s
        .object({
          title: s.string().max(120),
          date: s.isodate(),
          summary: s.string().max(300),
          tags: s.array(s.string()).default([]),
          draft: s.boolean().default(false),
          rev: s.string().default('A'),
          slug: s.path(),
          body: s.mdx(),
        })
        .transform((data) => ({ ...data, slug: data.slug.replace(/^blog\//, '') })),
    },
  },
})
```

- [ ] **Step 2: Create `content/blog/hello-world.mdx`**

```mdx
---
title: Hello, world (fixture)
date: 2026-07-03
summary: Temporary fixture post proving the MDX pipeline. Deleted in M4 when the real build-log post lands.
tags: [meta]
rev: A
---

## Lab note 000

This post exists so the blog pipeline has something to compile, render, and
test. If you are reading this after M4, something forgot to delete it.
```

- [ ] **Step 3: Create `lib/content.ts`**

```ts
import { posts } from '#velite'

export type Post = (typeof posts)[number]

export const allPosts: Post[] = [...posts]
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug: string): Post | undefined =>
  allPosts.find((p) => p.slug === slug)
```

(If the `#velite` alias fails at build under the bundler resolution, fall back
to a relative import `../.velite` and note it.)

- [ ] **Step 4: Create `lib/mdx.tsx`**

```tsx
import * as runtime from 'react/jsx-runtime'

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component />
}
```

- [ ] **Step 5: Verify**

Run: `pnpm typecheck`
Expected: velite emits `.velite/` (posts collection, 1 entry) and tsc passes.

- [ ] **Step 6: Commit**

```bash
git add velite.config.ts content lib/content.ts lib/mdx.tsx
git commit -m "feat(m1): velite content pipeline with typed posts collection and fixture post"
```

---

### Task 4: Blog routes, RSS, robots, sitemap

**Files:**
- Create: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`,
  `app/rss.xml/route.ts`, `app/robots.ts`, `app/sitemap.ts`

**Interfaces:**
- Consumes: `allPosts`, `getPost`, `MDXContent`, `SITE`.
- Produces: static routes `/blog/`, `/blog/hello-world/`, `/rss.xml`,
  `/robots.txt`, `/sitemap.xml` in `out/` (e2e in Task 6 asserts these).

- [ ] **Step 1: Create `app/blog/page.tsx`**

```tsx
import Link from 'next/link'
import { allPosts } from '@/lib/content'

export const metadata = { title: 'Lab Notes' }

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl uppercase tracking-widest">Lab Notes</h1>
      <ol className="mt-8 space-y-6">
        {allPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}/`} className="underline text-copper">
              {post.title}
            </Link>
            <p className="text-sm opacity-70">
              <time dateTime={post.date}>{post.date.slice(0, 10)}</time> · Rev {post.rev}
            </p>
            <p className="mt-1">{post.summary}</p>
          </li>
        ))}
      </ol>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { allPosts, getPost } from '@/lib/content'
import { MDXContent } from '@/lib/mdx'

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  return post ? { title: post.title, description: post.summary } : {}
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">{post.title}</h1>
      <p className="text-sm opacity-70">
        <time dateTime={post.date}>{post.date.slice(0, 10)}</time> · Rev {post.rev}
      </p>
      <article className="prose prose-invert mt-8">
        <MDXContent code={post.body} />
      </article>
    </main>
  )
}
```

(Note: in current Next majors, `params` for pages may be a Promise —
`{ params }: { params: Promise<{ slug: string }> }` with `await`. Use
whichever the installed version's types require; typecheck will tell you.)

- [ ] **Step 3: Create `app/rss.xml/route.ts`**

```ts
import { allPosts } from '@/lib/content'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!,
  )

export function GET() {
  const items = allPosts
    .map(
      (p) => `<item>
  <title>${escapeXml(p.title)}</title>
  <link>${SITE.url}/blog/${p.slug}/</link>
  <guid>${SITE.url}/blog/${p.slug}/</guid>
  <pubDate>${new Date(p.date).toUTCString()}</pubDate>
  <description>${escapeXml(p.summary)}</description>
</item>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${escapeXml(SITE.title)} — Lab Notes</title>
<link>${SITE.url}</link>
<description>${escapeXml(SITE.description)}</description>
${items}
</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } })
}
```

- [ ] **Step 4: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
```

- [ ] **Step 5: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { allPosts } from '@/lib/content'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, lastModified: new Date() },
    { url: `${SITE.url}/blog/`, lastModified: new Date() },
    ...allPosts.map((p) => ({ url: `${SITE.url}/blog/${p.slug}/`, lastModified: new Date(p.date) })),
  ]
}
```

- [ ] **Step 6: Verify**

Run: `pnpm build`
Expected: `out/blog/index.html`, `out/blog/hello-world/index.html`,
`out/rss.xml`, `out/robots.txt`, `out/sitemap.xml` all exist.

- [ ] **Step 7: Commit**

```bash
git add app
git commit -m "feat(m1): blog routes, force-static RSS, robots and sitemap metadata routes"
```

---

### Task 5: Lint, typecheck, unit-test toolchain

**Files:**
- Create: `eslint.config.mjs`, `.prettierrc.json`, `vitest.config.ts`,
  `lib/content.test.ts`

**Interfaces:**
- Produces: `pnpm lint`, `pnpm test` green — CI (Task 7) runs both.

- [ ] **Step 1: Create `eslint.config.mjs`**

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import next from 'eslint-config-next'

export default defineConfig([
  ...next,
  globalIgnores(['.next/**', 'out/**', '.velite/**', 'node_modules/**', 'playwright-report/**', 'test-results/**']),
])
```

(If the installed `eslint-config-next` doesn't export a flat array, use its
documented flat setup — check its README in node_modules — and note the
deviation. `pnpm lint` must pass either way.)

- [ ] **Step 2: Create `.prettierrc.json`**

```json
{ "semi": false, "singleQuote": true, "printWidth": 100 }
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.'), '#velite': path.resolve(__dirname, '.velite') },
  },
  test: { include: ['**/*.test.ts'], exclude: ['node_modules', 'e2e', 'out'] },
})
```

- [ ] **Step 4: Create `lib/content.test.ts`** (write it, watch it fail if
  wiring is wrong, then make it pass)

```ts
import { describe, expect, it } from 'vitest'
import { allPosts, getPost } from './content'

describe('content collection', () => {
  it('exposes the fixture post, newest first, drafts excluded', () => {
    expect(allPosts.length).toBeGreaterThan(0)
    expect(allPosts.every((p) => !p.draft)).toBe(true)
    const sorted = [...allPosts].sort((a, b) => b.date.localeCompare(a.date))
    expect(allPosts).toEqual(sorted)
  })

  it('getPost round-trips a slug', () => {
    const first = allPosts[0]
    expect(getPost(first.slug)?.title).toBe(first.title)
  })
})
```

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass (vitest: 2 passed).

- [ ] **Step 6: Commit**

```bash
git add eslint.config.mjs .prettierrc.json vitest.config.ts lib/content.test.ts
git commit -m "feat(m1): ESLint 9 flat config, prettier, vitest with content-collection tests"
```

---

### Task 6: Playwright e2e against built `out/`

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: `pnpm build` output in `out/`; `serve` dependency.
- Produces: `pnpm e2e` green; CI runs it after build.

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'pnpm exec serve out -l 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'no-js', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
  ],
})
```

- [ ] **Step 2: Create `e2e/smoke.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test('home renders name and all section landmarks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Benjamin Liu' })).toBeVisible()
  for (const id of ['about', 'experience', 'projects', 'skills', 'resume']) {
    await expect(page.locator(`section#${id}`)).toBeAttached()
  }
})

test('blog index links to the fixture post and the post renders MDX body', async ({ page }) => {
  await page.goto('/blog/')
  await page.getByRole('link', { name: /hello, world/i }).click()
  await expect(page.getByRole('heading', { level: 2, name: /lab note 000/i })).toBeVisible()
})

test('rss.xml is valid-enough XML with the fixture item', async ({ request }) => {
  const res = await request.get('/rss.xml')
  expect(res.ok()).toBeTruthy()
  const body = await res.text()
  expect(body).toContain('<rss version="2.0">')
  expect(body).toContain('/blog/hello-world/')
})
```

- [ ] **Step 3: Install browsers and verify**

Run: `pnpm exec playwright install chromium && pnpm build && pnpm e2e`
Expected: all tests pass in both projects (the no-js project proves static
content readable without JavaScript).

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts e2e
git commit -m "feat(m1): playwright smoke tests against the built static export, incl. no-JS project"
```

---

### Task 7: CI workflow + Vercel config

**Files:**
- Create: `.github/workflows/ci.yml`, `vercel.json`, `lighthouserc.json`

**Interfaces:**
- Consumes: every pnpm script above.
- Produces: PR-blocking CI; Vercel preview behavior config. (The Vercel OAuth
  repo-link itself is Ben's manual step — out of scope for you.)

- [ ] **Step 1: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": { "staticDistDir": "out", "url": ["http://localhost/index.html", "http://localhost/blog/index.html"] },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "trailingSlash": true,
  "outputDirectory": "out",
  "headers": [
    { "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }] }
  ]
}
```

- [ ] **Step 3: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [rebuild]
permissions:
  contents: read
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: test -f out/index.html && test -f out/rss.xml
      - run: pnpm exec playwright install chromium --with-deps
      - run: pnpm e2e
      - run: pnpm dlx @lhci/cli autorun
```

- [ ] **Step 4: Verify everything end-to-end locally**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e`
Expected: all green. Paste the tail of each command's output in your report.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml vercel.json lighthouserc.json
git commit -m "feat(m1): CI quality gate and Vercel preview config"
```

---

## Out of scope for this plan (do not do)

- Gerber pipeline, `scripts/` dir, anything reading `PCB/` (M2).
- Real content port, fonts, favicons, JSON-LD, theme toggle (M3).
- MDX component map, Shiki, OG images, real post #1 (M4).
- Motion dependency and any animation (M5).
- Touching `deploy.yaml`, pushing, opening PRs (reviewer does that).

## Final report format

List: resolved versions (next, react, tailwindcss, velite, eslint-config-next),
any API deviations you had to make (file + reason), and the pasted tails of
the five acceptance commands.
