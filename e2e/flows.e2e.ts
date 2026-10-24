import { expect, test } from './fixtures';

test.use({ colorScheme: 'light' });

test('theme toggle supports keyboard input and remembers the selected theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('switch', { name: 'Toggle theme' });
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('tabs and form controls update after hydration', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Records', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toHaveText('Medical records content');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Cardiology', exact: true }).click();
  await expect(page.getByRole('combobox')).toHaveText('Cardiology');
  const notifications = page.getByRole('switch', { name: 'Notifications disabled' });
  await notifications.check();
  await expect(page.getByRole('switch', { name: 'Notifications enabled' })).toBeChecked();
  await page.getByRole('textbox', { name: 'Email address' }).fill('doctor@example.com');
  await expect(page.getByRole('textbox', { name: 'Email address' })).toHaveValue(
    'doctor@example.com',
  );
});

test('dialog opens, saves preferences, and closes with Escape', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open Dialog', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Update consent preferences' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Preferences saved', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
