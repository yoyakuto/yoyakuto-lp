import { test } from '@playwright/test';

const SCREENSHOT_DIR = 'test-results/screenshots';

// 見た目の確認用にページ全体を保存する。CI では成果物として残す
test('トップページ全体のスクリーンショットを保存する', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const path = `${SCREENSHOT_DIR}/top-${testInfo.project.name}.png`;
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(`top-${testInfo.project.name}`, { path, contentType: 'image/png' });
});
