import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('example@example.com');
    await page.getByLabel('Password').fill('mypassword');

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/dashboard/);
  });

  test('Shows toast error when fields are empty', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /sign in/i }).click();

    const toastMessage = page.locator('div:text("Please fill in both email and password")');
    await expect(toastMessage).toBeVisible({ timeout: 5000 });
  });
});
