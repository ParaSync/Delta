import { test, expect } from '@playwright/test';

test('view published form has correct elements', async ({ page }) => {
  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-text').click();
  await page.getByTestId('palette-component-datetime').click();

  const titleInput = page.getByRole('textbox', { name: 'Untitled Form' });
  await titleInput.fill('My Form');
  await titleInput.press('Enter');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Forms' }).click();

  const formRow = page.locator('tr', { hasText: 'My Form' });
  await page.getByRole('button', { name: 'Edit Form' }).first().click();

  const formCanvas = page.getByRole('list', { name: 'Form components' });
  await expect(formCanvas).toContainText('Text Field');
  await expect(formCanvas).toContainText('Date & Time Field');

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Confirm Publish' }).click();

  const shareLinkContainer = page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: 'Copy' }) })
    .last();

  const shareInput = shareLinkContainer.locator('input');

  await expect(shareInput).not.toBeEmpty();
  const publicUrl = await shareInput.inputValue();

  await page.goto(publicUrl);
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  await page.locator('div').filter({ hasText: 'Text Field' }).nth(5).click();
  await page.locator('div').filter({ hasText: 'Date & Time Field' }).nth(5).click();
});

test('numeric input should only accept numeric characters', async ({ page }) => {
  const formName = `Numeric Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-number').click();
  await page.getByTestId('palette-component-datetime').click();

  const titleInput = page.getByRole('textbox', { name: 'Untitled Form' });
  await titleInput.fill(formName);
  await titleInput.press('Enter');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Forms' }).click();

  const formCard = page
    .locator('div.bg-card')
    .filter({ has: page.getByRole('heading', { name: formName, exact: true }) });

  await expect(formCard).toBeVisible({ timeout: 10000 });

  await formCard.getByRole('button', { name: 'Edit Form' }).click();

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Confirm Publish' }).click();

  const shareLinkContainer = page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: 'Copy' }) })
    .last();

  const shareInput = shareLinkContainer.locator('input');
  await expect(shareInput).not.toBeEmpty();
  const publicUrl = await shareInput.inputValue();

  await page.goto(publicUrl);
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

  const numberInput = page.getByTestId('input-number');
  await numberInput.click();

  await numberInput.pressSequentially('10231a23');

  const value = await numberInput.inputValue();

  expect(value).toMatch(/^\d+$/);
});

test('fill text input field should persist when out of focus', async ({ page }) => {
  const formName = `TextInput Form ${Date.now()}`;

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

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Confirm Publish' }).click();

  const shareLinkContainer = page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: 'Copy' }) })
    .last();

  const shareInput = shareLinkContainer.locator('input');

  await expect(shareInput).not.toBeEmpty();
  const publicUrl = await shareInput.inputValue();

  await page.goto(publicUrl);
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

  await page.getByTestId('input-text').fill('testValue');

  await expect(page.getByTestId('input-text')).toHaveValue('testValue');
});

test('dropdown selections should persist', async ({ page }) => {
  const formName = `Dropdown Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-select').click();
  await page.getByTestId('add-option').click();
  await page.getByTestId('add-option').click();

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

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Confirm Publish' }).click();

  const shareLinkContainer = page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: 'Copy' }) })
    .last();

  const shareInput = shareLinkContainer.locator('input');

  await expect(shareInput).not.toBeEmpty();
  const publicUrl = await shareInput.inputValue();

  await page.goto(publicUrl);
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

  await page.getByTestId('select').selectOption('Option 3');

  await page.getByRole('heading', { name: formName }).click();

  const checkedOption = page.locator('select >> option:checked');
  await expect(checkedOption).toHaveText('Option 3');
});

test('textarea must wrap appropriately with content preserved', async ({ page }) => {
  const formName = `Textarea Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-textarea').click();

  const titleInput = page.getByPlaceholder('Untitled form');
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

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Confirm Publish' }).click();

  const shareLinkContainer = page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: 'Copy' }) })
    .last();

  const shareInput = shareLinkContainer.locator('input');

  await expect(shareInput).not.toBeEmpty();
  const publicUrl = await shareInput.inputValue();

  await page.goto(publicUrl);
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

  await page.getByRole('heading', { name: formName }).click();

  const textarea = page.getByTestId('input-textarea').first();

  await page
    .getByTestId('input-textarea')
    .fill(
      'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
    );

  await expect(page.getByTestId('input-textarea')).toHaveCSS('white-space', 'pre-wrap');

  const clientHeight = await textarea.evaluate((el) => el.clientHeight);
  const scrollHeight = await textarea.evaluate((el) => el.scrollHeight);

  expect(scrollHeight).toBeGreaterThan(clientHeight);
});
