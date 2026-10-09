import { expect, test } from '@playwright/test';

const APP_URL = 'https://yoyakuto.com';
const SIGNUP_URL = `${APP_URL}/login`;

// 対応する最小の画面幅。iPhone SE（第 1 世代）などの 320px を想定する
const NARROWEST_VIEWPORT = { width: 320, height: 568 };

const SECTION_HEADINGS = ['主な機能', '使い始めるまで 3 ステップ', '料金', 'よくある質問'];

test.describe('トップページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('サービス名を含むタイトルとキャッチコピーが表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/Yoyakuto/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('チームの空き時間を、そのまま予約ページに。');
  });

  test('機能・使い方・料金・よくある質問の各セクションが表示される', async ({ page }) => {
    for (const heading of SECTION_HEADINGS) {
      await expect(page.getByRole('heading', { level: 2, name: heading, exact: true })).toBeVisible();
    }
  });

  test('「無料で始める」はすべてアプリの登録画面へ遷移する', async ({ page }) => {
    const signupLinks = page.getByRole('link', { name: '無料で始める' });
    const count = await signupLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      await expect(signupLinks.nth(index)).toHaveAttribute('href', SIGNUP_URL);
    }
  });

  test('料金は金額を出さず準備中であることを伝える', async ({ page }) => {
    const pricing = page.locator('section', { has: page.getByRole('heading', { name: '料金', exact: true }) });
    await expect(pricing.getByText('料金プランは準備中です')).toBeVisible();
    await expect(pricing).not.toContainText('円');
  });

  test('よくある質問は質問を押すと回答が開き、もう一度押すと閉じる', async ({ page }) => {
    const question = page.getByText('予約する側もアカウントが必要ですか？');
    const answer = page.getByText('予約を確定するときに、Google アカウントでのログインをお願いしています。', { exact: false });

    await expect(answer).toBeHidden();
    await question.click();
    await expect(answer).toBeVisible();
    await question.click();
    await expect(answer).toBeHidden();
  });

  test('フッターから利用規約・プライバシーポリシー・特定商取引法の表記へ遷移できる', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: '利用規約' })).toHaveAttribute('href', `${APP_URL}/terms`);
    await expect(footer.getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', `${APP_URL}/privacy`);
    await expect(footer.getByRole('link', { name: '特定商取引法に基づく表記' })).toHaveAttribute('href', `${APP_URL}/legal`);
  });

  test('ページが横にはみ出さない', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
  });

  test('最小の画面幅でもページが横にはみ出さない', async ({ page }) => {
    await page.setViewportSize(NARROWEST_VIEWPORT);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
  });
});

test.describe('ヘッダーのナビゲーション', () => {
  test.skip(({ isMobile }) => isMobile, 'スマホ幅ではナビゲーションのリンクを出さない');

  test('リンクを押すと該当するセクションまでスクロールする', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'サイト' });
    await nav.getByRole('link', { name: 'よくある質問' }).click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole('heading', { level: 2, name: 'よくある質問' })).toBeInViewport();
  });
});

test.describe('スマホ幅のヘッダー', () => {
  test.skip(({ isMobile }) => !isMobile, 'スマホ幅だけの表示を確かめる');

  test('ナビゲーションのリンクを隠し、登録ボタンだけを出す', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'サイト' });
    await expect(nav.getByRole('link', { name: '機能', exact: true })).toBeHidden();
    await expect(nav.getByRole('link', { name: '無料で始める' })).toBeVisible();
  });
});
