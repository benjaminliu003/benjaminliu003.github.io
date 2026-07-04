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
