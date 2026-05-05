# Style and conventions

- Language: TypeScript with `strict: true` in `tsconfig.json`.
- Framework: Next.js App Router with React 19.
- Imports: Uses `@/*` path alias for `src/*`.
- Formatting (from Prettier): single quotes, semicolons, trailing commas `all`, width 100, tab width 2, arrow parens avoided where possible.
- Linting: ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Tests: Vitest + Testing Library for unit/component tests, Playwright configured for E2E.
- Code style observed in source:
  - Functional React components.
  - Hooks-based client state (`useReducer`, `useEffect`, `useCallback`, `useMemo`).
  - Explicit TypeScript interfaces/types in `src/lib/types.ts`.
  - Validation errors are user-readable Japanese strings in request validators.
  - Tailwind utility classes are used directly in components.
- Important current convention mismatch:
  - Current `SearchRequest` shape uses `excludeDurations`, `maxSubscribers`, and `maxViews`.
  - Some tests still assert legacy fields `videoDuration` and `includeShorts`, so tests are behind the current implementation.