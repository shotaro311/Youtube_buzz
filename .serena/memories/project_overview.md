# YouTube_buzz project overview

- Purpose: A YouTube buzz research tool for finding fast-growing videos and saving selected results.
- Product shape: Next.js App Router frontend/API app plus a Cloudflare Worker and D1 database configuration.
- External integrations: YouTube Data API for search, Google Apps Script endpoint for save/export, Cloudflare D1 for worker-side health/database integration.
- Main flow: User enters search filters in the UI -> `/api/search` validates and calls YouTube fetch logic -> results are shown and can be locally saved in browser storage or sent to `/api/save` for GAS forwarding.
- Runtime split:
  - `src/app` contains the Next.js UI and API routes.
  - `src/components` contains client UI components.
  - `src/lib` contains shared types, validation, sorting, request normalization, YouTube fetching, browser saved-results storage, and the main search experience hook.
  - `src/server/worker.ts` contains a Cloudflare Worker with a `/health` endpoint that reads D1.
  - `migrations/` contains D1 SQL migrations.
- Testing state observed on 2026-04-04: lint and typecheck pass, but unit tests fail because tests still expect removed fields like `videoDuration` and `includeShorts`. Playwright config exists but there is currently no `tests/e2e` directory in the repository.