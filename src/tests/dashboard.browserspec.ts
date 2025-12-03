import { test, expect } from '@playwright/test';

test('create new form should redirect to proper route', async ({ page }) => {
  await page.goto('http://localhost:4173/login');

  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await expect(page).toHaveURL('http://localhost:4173/forms/new');
});

test('delete form should give confirmation', async ({ page }) => {
  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const uniqueName = `Deletable Form ${Date.now()}`;

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  const titleInput = page.getByRole('textbox', { name: 'Untitled Form' });
  await titleInput.fill(uniqueName);
  await titleInput.press('Enter');
  await page.getByTestId('palette-component-textarea').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();

  const form = page
    .locator('div.flex.items-start.justify-between')
    .filter({ hasText: uniqueName })
    .first();

  await form.getByRole('button').click();

  await page.getByRole('menuitem', { name: 'Delete' }).click();

  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(form).not.toBeVisible();
});
