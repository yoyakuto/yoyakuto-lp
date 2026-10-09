# yoyakuto-lp

日程調整サービス Yoyakuto（ヨヤクト）の LP。Astro の静的ビルドで作っている。

## 開発

Node のバージョンは `.nvmrc` に合わせる。

```sh
npm ci
npm run dev        # 開発サーバー
npm run check      # 型チェック
npm run build      # dist/ に静的ファイルを出力する
```

## E2E テスト

Playwright でビルド成果物を配信し、PC とスマホの 2 つの画面幅で確認する。

```sh
npx playwright install chromium   # 初回のみ
npm run test:e2e
```

ページ全体のスクリーンショットは `test-results/screenshots/` に保存される。

CI ではビルドが通るかだけを確かめ、E2E テストは動かさない。見た目や導線を変えたときは、手元で E2E テストを流してから PR を出す。
