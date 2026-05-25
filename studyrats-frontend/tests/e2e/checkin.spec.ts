import { test, expect, type Page } from '@playwright/test'
import path from 'path'

const login = async (page: Page) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL ?? 'e2e@test.com')
  await page.getByLabel('Senha').fill(process.env.E2E_USER_PASSWORD ?? 'pass123')
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL('/dashboard')
}

test.describe('Check-in flows', () => {
  test('submit valid check-in shows success message with group count', async ({ page }) => {
    await login(page)
    await page.goto('/checkin')
    await page.getByLabel('Título').fill('Estudei Next.js')
    await page.getByLabel('Descrição').fill('Aprendi SSR e Server Components')
    await page.getByLabel('Duração').fill('90')
    await page.getByRole('button', { name: /registrar check-in/i }).click()
    await expect(page.getByText(/check-in registrado em/i)).toBeVisible({ timeout: 10000 })
  })

  test('submitting again shows already done message', async ({ page }) => {
    await login(page)
    await page.goto('/checkin')
    await page.getByLabel('Título').fill('Re-submit')
    await page.getByLabel('Descrição').fill('Teste')
    await page.getByLabel('Duração').fill('30')
    await page.getByRole('button', { name: /registrar check-in/i }).click()
    await expect(page.getByText(/já fez check-in hoje|check-in já realizado/i)).toBeVisible({ timeout: 10000 })
  })
})
