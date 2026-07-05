import { expect, test } from '@playwright/test'

test('home renders name and all section landmarks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Benjamin Liu' })).toBeVisible()
  for (const id of ['about', 'experience', 'projects', 'skills', 'resume']) {
    await expect(page.locator(`section#${id}`)).toBeAttached()
  }
})

test('home exposes real content without JS: resume link, board image, revisions', async ({
  page,
}) => {
  await page.goto('/')
  // Resume download at the unchanged, deep-linkable path.
  await expect(page.locator('a[href="/Benjamin_Liu_Resume.pdf"]').first()).toBeAttached()
  // Board money-shot has descriptive alt text (a11y + ATS).
  await expect(page.locator('img[alt*="MTL Smoked Meat Sandwich"]')).toBeAttached()
  // Experience revision table carries the four roles.
  await expect(page.getByText('Optical Component Test Engineering Intern')).toBeAttached()
  await expect(page.getByText('Corporate Real Estate Analyst')).toBeAttached()
})

test('theme toggle switches material and persists', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'no-js', 'the toggle requires JavaScript')
  await page.goto('/')
  const html = page.locator('html')
  const initial = await html.getAttribute('data-theme')
  await page.getByRole('button', { name: /switch material/i }).first().click()
  const toggled = await html.getAttribute('data-theme')
  expect(toggled).not.toBe(initial)
  await page.reload()
  await expect(html).toHaveAttribute('data-theme', toggled!) // localStorage persisted
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
