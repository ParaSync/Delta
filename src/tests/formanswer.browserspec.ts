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

  await expect(page.getByRole('textbox', { name: 'Text Field' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Date & Time Field' })).toBeVisible();

  const formContainer = page.getByRole('main');
  await expect(formContainer).toBeVisible();

  const formElement = page.getByRole('form');
  await expect(formElement).toHaveAttribute('aria-label', /.+/);

  const fieldGroups = page.getByRole('group');
  const expectedFieldGroupCount = 2; // Text field + Date & Time field
  await expect(fieldGroups).toHaveCount(expectedFieldGroupCount);

  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
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

test('Form is accessible', async ({ page }) => {
  const formName = `Accessible Form ${Date.now()}`;

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

  const formContainer = page.getByRole('main');
  await expect(formContainer).toBeVisible();

  const formElement = page.getByRole('form');
  await expect(formElement).toHaveAttribute('aria-label', /.+/);

  const fieldGroups = page.getByRole('group');
  const expectedFieldGroupCount = 4;
  await expect(fieldGroups).toHaveCount(expectedFieldGroupCount);

  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
});

test('invalid date input prevents submission', async ({ page }) => {
  const formName = `Invalid Date Form ${Date.now()}`;

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

  const shareLinkContainer2 = page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: 'Copy' }) })
    .last();

  const shareInput2 = shareLinkContainer2.locator('input');
  await expect(shareInput2).not.toBeEmpty();
  const publicUrl2 = await shareInput2.inputValue();

  await page.goto(publicUrl2);

  const dateInput = page.locator('input[type="datetime-local"]');
  const invalidDate = '99/99/9999 12:00:00';
  let fillError = null;
  try {
    await dateInput.fill(invalidDate);
  } catch (error) {
    fillError = error;
  }

  expect(String(fillError)).toContain('Malformed value');

  const submitButton = page.getByRole('button', { name: /submit/i });
  await submitButton.click();
  await expect(page.getByRole('alert', { name: 'toast-notification' })).not.toBeVisible();
});

test('table enforces max rows limit', async ({ page }) => {
  const formName = `Table Max Rows Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();

  await page.getByTestId('palette-component-table').click();
  const maxRowsInput = page.getByTestId('property-maxrows');
  await maxRowsInput.fill('3');
  const maxRowsValue = await maxRowsInput.inputValue();
  const maxRows = Number(maxRowsValue);

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
  const addButton = page.getByTestId('table-add-row');
  for (let i = 0; i < maxRows; i++) {
    await addButton.click();
  }
  await expect(addButton).toBeDisabled();
  await expect(addButton).toHaveAttribute('aria-disabled', 'true');
  const tableRows = page.locator('[data-testid="table"] tbody tr');
  await expect(tableRows).toHaveCount(maxRows);
  await expect(addButton).toBeDisabled();
  await expect(page.getByRole('alert', { name: 'toast-notification' })).not.toBeVisible();
});

test('submitting form with no required fields behaves correctly', async ({ page }) => {
  const formName = `No Required Fields Form ${Date.now()}`;

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
  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  const emptyMessage = page.getByText(/empty form|no responses|no data|submission error/i, {
    exact: false,
  });
  await emptyMessage.waitFor({ state: 'visible', timeout: 5000 });
  expect(emptyMessage).toBeVisible();
});

test('very long text input is handled and preserved', async ({ page }) => {
  const formName = `Long Text Form ${Date.now()}`;
  const consoleMessages: string[] = [];

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();
  await page.getByTestId('palette-component-text').click();

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
  const longText = 'A'.repeat(1500);
  const cutText = 'A'.repeat(1000);
  const textInput = page.locator('input[type="text"]');
  await textInput.fill(longText, { force: false });
  await expect(textInput).toHaveValue(cutText);
  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  const successMessage = page.getByRole('heading', { name: 'Thank you!' });
  await successMessage.waitFor({ state: 'visible' });
  expect(successMessage.isVisible()).toBeTruthy();
});

test('pasting text with special characters preserves data integrity', async ({ page }) => {
  const formName = `Paste Text Form ${Date.now()}`;
  const consoleMessages: string[] = [];

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();
  await page.getByTestId('palette-component-text').click();

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
  const testText = 'Test™ © 2025 \n Special. 你好！ 감나합니다!';
  const textInput = page.locator('input');
  await textInput.fill(testText);
  await expect(textInput).toHaveValue(testText.replace('\n', ' '));
  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  const successToast = page.getByRole('alert', { name: 'toast-notification' });
  const toastVisible = await successToast.isVisible().catch(() => false);
  if (!toastVisible) {
    const successHeading = page.getByRole('heading', { name: 'Thank you!' });
    await successHeading.waitFor({ state: 'visible' });
    expect(await successHeading.isVisible()).toBeTruthy();
  }
});

test('hidden fields remain hidden but (eventually) can be included in submitted data', async ({
  page,
}) => {
  const formName = `Hidden Fields Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();
  await page.getByTestId('palette-component-text').click();
  await page.getByRole('textbox', { name: 'Field label' }).fill('Visible Field');

  await page.getByTestId('palette-component-text').click();
  await page.getByRole('textbox', { name: 'Field label' }).fill('Hidden Field');
  await page.getByTestId('visibility-toggle').click();

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
  await page.getByRole('heading', { name: formName }).waitFor({ state: 'visible' });

  const form = page.getByRole('form');
  const formChildrenCount = await form.locator('input').count();
  expect(formChildrenCount).toBe(1);
  const visibleInput = page.getByLabel('Visible Field');
  await visibleInput.fill('visible-value');
  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  const successToast = page.getByRole('alert', { name: 'toast-notification' });
  const toastVisible = await successToast.isVisible().catch(() => false);
  if (!toastVisible) {
    const successHeading = page.getByRole('heading', { name: 'Thank you!' });
    await successHeading.waitFor({ state: 'visible' });
    expect(await successHeading.isVisible()).toBeTruthy();
  }
});

test('empty form with only submit/reset behaves correctly', async ({ page }) => {
  const formName = `Empty Form ${Date.now()}`;

  await page.goto('http://localhost:4173/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example4@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Forms' }).click();
  await page.getByRole('button', { name: 'Create New Form' }).click();
  await page.getByTestId('palette-component-reset').click();

  const titleInput = page.getByRole('textbox', { name: 'Untitled Form' });
  await titleInput.fill(formName);
  await titleInput.press('Enter');

  await page.getByRole('button', { name: 'Save' }).click();
  const toast = page
    .getByRole('alert', { name: 'toast-notification' })
    .getByText('Your form must have at least one input component');
  await toast.waitFor({ state: 'visible' });
  expect(toast.isVisible()).toBeTruthy();
});
