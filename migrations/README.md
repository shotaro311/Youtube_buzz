# D1 マイグレーション指針

- ファイル名は `YYYYMMDDHHMM-description.sql` の形式で作成してください。
- ローカル適用: `pnpm d1:migrate --local` を利用し、Cloudflare D1 Emulator で検証します。
- 本番適用前にステージングで動作確認し、`wrangler d1 migrations list` で状態を確認してください。
