import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const remoteURL = process.env.BASE_URL;
const baseURL = remoteURL ?? 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: './e2e',
  // Bun collects .test and .spec files, so browser tests use a distinct suffix.
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: remoteURL
    ? undefined
    : {
        command: 'bun run build && PORT=3100 HOSTNAME=127.0.0.1 bun run e2e:serve',
        url: `${baseURL}/healthz`,
        reuseExistingServer: false,
        timeout: 300_000,
      },
});
