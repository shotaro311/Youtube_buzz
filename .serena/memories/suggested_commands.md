# Suggested commands

- Install dependencies: `pnpm install` (README also mentions copying `.env.local.example` to `.env.local` and setting values)
- Start local Next.js dev server: `pnpm dev`
- Build production app: `pnpm build`
- Start production server: `pnpm start`
- Lint: `pnpm lint`
- Type-check: `pnpm typecheck`
- Unit tests: `pnpm test`
- Unit tests in watch mode: `pnpm test:watch`
- Coverage: `pnpm test:coverage`
- E2E tests (configured, but current repo snapshot has no `tests/e2e` folder): `pnpm test:e2e`
- Run Cloudflare Worker locally: `pnpm cf:dev`
- Deploy Cloudflare Worker: `pnpm cf:deploy`
- Apply D1 migrations: `pnpm d1:migrate`
- Dry-run GAS save script: `pnpm save:dry-run`
- Common Darwin shell utilities available: `git`, `ls`, `cd`, `pwd`, `rg`, `find`, `sed`, `cat`, `npm`, `pnpm`.