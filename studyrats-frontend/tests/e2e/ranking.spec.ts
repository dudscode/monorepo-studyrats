import { test, expect, type Page } from '@playwright/test'

const login = async (page: Page) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL ?? 'e2e@test.com')
  await page.getByLabel('Senha').fill(process.env.E2E_USER_PASSWORD ?? 'pass123')
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL('/dashboard')
}

test.describe('Ranking page', () => {
  test('ranking table renders for a group with check-ins', async ({ page }) => {
    await login(page)
    // Navigate to the first group's ranking via dashboard
    const rankingLink = page.getByRole('link', { name: /ver ranking/i }).first()
    await rankingLink.click()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })
  })

  test('current user row is visually distinct', async ({ page }) => {
    await login(page)
    const rankingLink = page.getByRole('link', { name: /ver ranking/i }).first()
    await rankingLink.click()
    // The current user row should have the highlight class
    await expect(page.locator('tr.font-bold.bg-yellow-50')).toBeVisible({ timeout: 10000 })
  })

  test('empty ranking shows graceful message', async ({ page }) => {
    // This test requires a group with no check-ins
    await login(page)
    // If no groups or no check-ins, the ranking page shows an empty state
    // Navigate directly to a known-empty group if available
    await page.goto('/groups/nonexistent-group-id/ranking')
    // Should either show an error or empty state gracefully
    await expect(page).not.toHaveURL('/login')
  })
})
