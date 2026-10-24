import { expect, test } from './fixtures';

test.describe('smoke @smoke', () => {
  test('home page renders with security headers and working assets', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-security-policy']).toContain("script-src 'self' 'nonce-");
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const logo = page
      .getByRole('img', { name: 'NUH - National University Hospital' })
      .filter({ visible: true });
    await expect(logo).toBeVisible();
    await expect
      .poll(() => logo.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  });

  test('health probe responds without rendering the home page', async ({ request }) => {
    const response = await request.get('/healthz');
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe('ok');
  });

  test('unknown route returns 404', async ({ request }) => {
    expect((await request.get('/this-page-does-not-exist')).status()).toBe(404);
  });
});
