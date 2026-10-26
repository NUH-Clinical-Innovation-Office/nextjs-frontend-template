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

test('slider keeps focus through consecutive keyboard adjustments', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByRole('slider');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '52');
});

test('progress exposes its current value to assistive technology', async ({ page }) => {
  await page.goto('/');
  const progress = page.getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '45');
  await page.getByRole('button', { name: '+10%', exact: true }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '55');
});

test.describe('Singapore locale', () => {
  test.use({ locale: 'en-SG', timezoneId: 'America/Los_Angeles' });

  test('calendar hydrates across locales and timezones', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-01T00:01:00Z'));
    await page.goto('/');
    await expect(page.getByText(/^Selected:/)).toBeVisible();
    await page.getByRole('button', { name: 'Go to the next month' }).click();
  });
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
