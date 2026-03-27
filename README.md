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

## Design baseline

Initial scaffold includes a design-aligned shell using:

- Primary: `#2D2A6A`
- Accent: `#20C997`
- Warning: `#F6A700`
- Critical: `#D7263D`
- Base text: `#0F172A`

Typography uses Inter (UI/body) and JetBrains Mono (code/locators).
