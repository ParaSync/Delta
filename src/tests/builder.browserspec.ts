import { test, expect } from '@playwright/test';

test('create form and verify components persist after save', async ({ page }) => {
  const formName = `My Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-text').click();
  await page.getByTestId('palette-component-datetime').click();

  const titleInput = page.getByRole('textbox', { name: 'Untitled Form' });

  await titleInput.fill(formName);
  await titleInput.press('Enter');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Forms' }).click();

  const formCard = page
    .locator('div.bg-card')
    .filter({ has: page.getByRole('heading', { name: formName }) });

  await expect(formCard).toBeVisible();

  await formCard.getByRole('button', { name: 'Edit Form' }).click();

  const formCanvas = page.getByRole('list', { name: 'Form components' });

  await expect(formCanvas).toContainText('Text Field');
  await expect(formCanvas).toContainText('Date & Time Field');

  await expect(page.getByRole('textbox', { name: /Untitled Form|My Form/ })).toHaveValue(formName);
});

test('publish should display success modal', async ({ page }) => {
  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  const formName = `Sample Form ${Date.now()}`;
  await page.getByRole('textbox', { name: 'Untitled Form' }).fill(formName);
  await page.getByRole('textbox', { name: 'Untitled Form' }).press('Enter');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('link', { name: 'Forms' })).toHaveAttribute('aria-current', 'page');

  await expect(page.getByText(formName)).toBeVisible();

  const formRow = page.locator('div').filter({ hasText: formName }).first();

  await page.getByRole('button', { name: 'Edit Form' }).first().click();

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Confirm Publish' }).click();

  await expect(page.getByText('Form Published!')).toBeVisible();
});

test('offline mode should throw error', async ({ page, context }) => {
  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Save' }).click();

  const errorToast = page.getByRole('alert').filter({ hasText: 'Network error' });

  await expect(errorToast).toBeVisible();
  await expect(errorToast).toContainText('Unable to reach the server');

  await context.setOffline(false);
});
