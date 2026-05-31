import { test, expect } from '@playwright/test'

const TEST_USER = {
  firstName: 'E2E',
  lastName: 'Tester',
  email: `e2e.${Date.now()}@test.com`,
  password: 'e2epass123',
  birthDate: '1990-01-01',
}

test.describe('Authentication flows', () => {
  test('full registration flow — redirected to login after register', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nome').fill(TEST_USER.firstName)
    await page.getByLabel('Sobrenome').fill(TEST_USER.lastName)
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill(TEST_USER.password)
    await page.getByLabel('Data de Nascimento').fill(TEST_USER.birthDate)
    await page.getByRole('button', { name: /cadastrar/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('duplicate email registration shows error', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nome').fill('Dup')
    await page.getByLabel('Sobrenome').fill('User')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill(TEST_USER.password)
    await page.getByLabel('Data de Nascimento').fill(TEST_USER.birthDate)
    await page.getByRole('button', { name: /cadastrar/i }).click()
    await expect(page.getByText(/email já está cadastrado/i)).toBeVisible()
  })

  test('successful login redirects to /dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill(TEST_USER.password)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('wrong credentials shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill('wrongpassword')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email ou senha inválidos/i)).toBeVisible()
  })

  test('logout redirects to /login and dashboard becomes inaccessible', async ({ page }) => {
    // login first
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill(TEST_USER.password)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL('/dashboard')

    // logout
    await page.getByRole('button', { name: /sair|logout/i }).click()
    await expect(page).toHaveURL('/login')

    // dashboard should redirect to login
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
