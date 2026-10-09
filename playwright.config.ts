import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;
const BASE_URL = `http://localhost:${PORT}`;
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: DESKTOP_VIEWPORT } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // 既定ではバックグラウンドで起動して終了してしまうため、ロックを使わずフォアグラウンドで動かす
    command: `npm run build && npx astro preview --port ${PORT} --ignore-lock`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
