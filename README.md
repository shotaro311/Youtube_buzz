# YouTube バズリサーチ

Next.js(App Router) + Tailwind CSS を用いたバズ動画リサーチツールです。Cloudflare D1 と Google Apps Script を組み合わせて、伸び率スコアの高い動画を検索・保存するワークフローを提供します。

## セットアップ

```bash
pnpm install
cp .env.local.example .env.local # 必要に応じて値を設定
```

`.env.local` では `YOUTUBE_API_KEYS` にカンマ区切りで複数の API キーを設定できます（例: `KEY1,KEY2`）。キーはローテーションされ、クォータ超過時に自動で切り替わります。

ローカル開発は `pnpm dev` で起動し、[http://localhost:3000](http://localhost:3000) にアクセスします。

## 主要コマンド

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | Next.js 開発サーバーを起動 |
| `pnpm build && pnpm start` | 本番ビルド→本番モードで起動 |
| `pnpm lint` | ESLint を実行し、警告を失敗として扱う |
| `pnpm typecheck` | TypeScript 型チェックのみ実行 |
| `pnpm test` | Vitest によるユニットテストを実行 |
| `pnpm test:e2e` | Playwright による E2E テストを実行 |
| `pnpm cf:dev` | Cloudflare Workers をローカルで起動（`src/server/worker.ts`） |
| `pnpm d1:migrate` | D1 データベースのマイグレーションを適用 |
| `pnpm save:dry-run` | GAS 保存処理のダミースクリプト（ネットワーク送信なし） |

## ディレクトリ構成

- `src/app` — UI ルート / API ルート / Server Actions
- `src/components` — 再利用可能なクライアントコンポーネント
- `src/lib` — ユーティリティや共有ロジック
- `src/server` — Cloudflare Workers などサーバー側モジュール
- `migrations/` — D1 用 SQL マイグレーション
- `tests/e2e/` — Playwright シナリオ

詳細な開発プロセスやタスク運用はリポジトリ直下の `docs/` フォルダと `AGENTS.md` を参照してください。
