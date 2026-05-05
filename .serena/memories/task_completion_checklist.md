# Task completion checklist

- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run `pnpm test` and make sure tests match the current request schema.
- If touching browser flow, consider `pnpm test:e2e` after restoring or adding Playwright scenarios.
- If changing Cloudflare Worker or DB schema, verify relevant D1 migrations and `pnpm cf:dev` / `pnpm d1:migrate` workflow.
- Keep README, tests, and implementation synchronized when search fields or save payloads change.
- Do not expose secret values from `.env` or API credentials in outputs.