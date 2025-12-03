import { test, expect } from '@playwright/test';

test('create new form', async ({ page }) => {
  await page.goto('http://localhost:4173/login');

  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await expect(page).toHaveURL('http://localhost:4173/forms/new');
});
