# A11y Regression Guard

A focused accessibility regression scanning dashboard for comparing snapshots, surfacing new issues, and generating fix-ready reports.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Vitest + Testing Library
- ESLint + Prettier

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — lint with Next.js ESLint config
- `npm run format` — format with Prettier
- `npm run format:check` — verify formatting
- `npm run test` — run Vitest test suite
- `npm run test:watch` — watch mode tests

## Optional GitHub webhook stub (future CI hook)

Slice 006 adds a **feature-flagged webhook stub** for future GitHub Actions/CI integration.

### Endpoint

- `POST /api/github/webhook`

### Environment flags

- `GITHUB_WEBHOOK_STUB_ENABLED=true` — enables the endpoint behavior
- `GITHUB_WEBHOOK_STUB_SECRET=<shared-secret>` — optional; when set, the request must include `x-hub-signature-256`

When disabled (default), the endpoint returns a `not_enabled` response and does not process payloads.

When enabled, the endpoint validates a minimal GitHub payload shape:

- `x-github-event` header is required
- JSON body must include `repository.full_name`
- `action` is optional but must be a string if present

A valid request returns `202` with `status: "stub_received"` and explicit messaging that no CI or PR automation is executed yet.

### Intended future flow

A later slice can connect this endpoint to:

1. Verify webhook signatures cryptographically
2. Trigger accessibility regression jobs (e.g., GitHub Actions workflow dispatch)
3. Post or update PR comments with regression summaries
4. Gate merges based on regression severity policy

## Design baseline

Initial scaffold includes a design-aligned shell using:

- Primary: `#2D2A6A`
- Accent: `#20C997`
- Warning: `#F6A700`
- Critical: `#D7263D`
- Base text: `#0F172A`

Typography uses Inter (UI/body) and JetBrains Mono (code/locators).
