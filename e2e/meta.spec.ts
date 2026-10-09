import { expect, test } from '@playwright/test';

const SITE_ORIGIN = 'https://yoyakuto.com';
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const NONE = 0;

test.describe('検索エンジンと SNS 向けの情報', () => {
  test('OGP 画像の URL とサイズを head に出す', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE_ORIGIN}/og/index.png`);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', OG_IMAGE_WIDTH);
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', OG_IMAGE_HEIGHT);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_ORIGIN}/`);
  });

  test('OGP のサイト名はサービス名だけにする', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Yoyakuto');
  });

  test('OGP 画像を PNG として配信する', async ({ request }) => {
    const response = await request.get('/og/index.png');
    expect(response.status()).toBe(HTTP_OK);
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('sitemap にトップページの URL を載せる', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(HTTP_OK);
    expect(await response.text()).toContain(`<loc>${SITE_ORIGIN}/</loc>`);
  });

  test('robots.txt で sitemap の場所を伝える', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(HTTP_OK);
    expect(await response.text()).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
  });
});

test.describe('存在しないページ', () => {
  test('404 を返し、トップへ戻るリンクを出す', async ({ page }) => {
    const response = await page.goto('/not-found-page/');
    expect(response?.status()).toBe(HTTP_NOT_FOUND);
    await expect(page.getByRole('heading', { level: 1, name: 'ページが見つかりません' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'トップへ戻る' })).toHaveAttribute('href', '/');
  });

  test('検索結果に載せず、正規 URL も出さない', async ({ page }) => {
    await page.goto('/not-found-page/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(NONE);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(NONE);
  });
});
