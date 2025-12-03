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

test('add row functionality for table input', async ({ page }) => {
  const formName = `Add Row Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-table').click();

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

  await page.getByTestId('table-add-row').click();

  await expect(page.getByTestId('table-cell-0-col1')).toBeVisible();

  await expect(page.getByTestId('table-cell-0-col2')).toBeVisible();
});

test('delete row functionality for table input', async ({ page }) => {
  const formName = `Delete Row Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-table').click();

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

  await page.getByTestId('table-add-row').click();
  await page.getByTestId('table-add-row').click();
  await page.getByTestId('table-add-row').click();
  await page.getByTestId('table-remove-row-0').click();
  await page.getByTestId('table-remove-row-0').click();

  await expect(page.getByTestId('table-cell-1-col1')).not.toBeVisible();

  await expect(page.getByTestId('table-cell-1-col2')).not.toBeVisible();
});

test('multiple input for table functionality', async ({ page }) => {
  const formName = `Multiple Input Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-table').click();

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

  await page.getByTestId('table-add-row').click();
  await page.getByTestId('table-add-row').click();

  await expect(page.getByTestId('table-cell-0-col1')).toBeVisible();

  await expect(page.getByTestId('table-cell-0-col2')).toBeVisible();

  await page.getByTestId('table-cell-0-col1').fill('input1');

  await page.getByTestId('table-cell-0-col2').fill('input2');

  await page.getByTestId('table-cell-1-col1').fill('input3');

  await page.getByTestId('table-cell-1-col2').fill('input4');

  await expect(page.getByTestId('table-cell-0-col1')).toHaveValue('input1');
  await expect(page.getByTestId('table-cell-0-col2')).toHaveValue('input2');

  await expect(page.getByTestId('table-cell-1-col1')).toHaveValue('input3');
  await expect(page.getByTestId('table-cell-1-col2')).toHaveValue('input4');
});

test('form submission functionality', async ({ page }) => {
  const formName = `Submission Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-text').click();
  await page.getByTestId('palette-component-number').click();
  await page.getByTestId('palette-component-datetime').click();
  await page.getByTestId('property-label').fill('Sample Form');

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

  await page.getByTestId('input-text').fill('sampleInput');
  await page.getByTestId('input-number').fill('123456789');
  await page.getByTestId('input-datetime').fill('2008-02-10T00:00');

  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('alert', { name: 'toast-notification' })).toBeVisible();
});

test('verify validation error', async ({ page }) => {
  const formName = `Validation Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');

  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-text').click();
  await page.getByTestId('property-required').check();
  await page.getByTestId('palette-component-number').click();
  await page.getByTestId('palette-component-datetime').click();
  await page.getByTestId('property-label').fill('Sample Form');

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

  await page.getByTestId('input-number').fill('123456789');
  await page.getByTestId('input-datetime').fill('2008-02-10T00:00');

  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('alert', { name: 'toast-notification' })).not.toBeVisible();
});

test('Reset button must clear all inputs', async ({ page }) => {
  const formName = `Reset Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');

  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-text').click();
  await page.getByTestId('palette-component-number').click();
  await page.getByTestId('palette-component-datetime').click();
  await page.getByTestId('palette-component-textarea').click();
  await page.getByTestId('palette-component-reset').click();

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

  await page.getByTestId('input-text').fill('sampleInput');
  await page.getByTestId('input-number').fill('123456789');
  await page.getByTestId('input-datetime').fill('2008-02-10T00:00');
  await page.getByTestId('input-textarea').fill('helloworld');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByTestId('input-text')).toHaveValue('');
  await expect(page.getByTestId('input-number')).toHaveValue('');
  await expect(page.getByTestId('input-datetime')).toHaveValue('');
  await expect(page.getByTestId('input-textarea')).toHaveValue('');
});
