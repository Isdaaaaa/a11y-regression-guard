# A11y Regression Guard — Plan

## Summary
A PR companion that compares baseline and PR previews to surface newly introduced accessibility regressions with fix-ready guidance.

## Target user
- Frontend engineers and design system teams shipping UI changes
- QA/QA automation engineers responsible for accessibility checks

## Portfolio positioning
Shows ability to combine browser automation, accessibility tooling, and practical developer UX. Highlights empathy for inclusive design and measurable QA impact.

## MVP scope
- Input: two URLs or two uploaded HTML snapshots
- Run axe-core scans on both, diff violations, and keep only new regressions
- Present a concise report with severity, affected components/locators, and links to WCAG rules
- Export report as markdown/PR comment template

## Non-goals (initially)
- Full GitHub App integration or CI bot
- Advanced WCAG manual testing coverage
- Multi-page crawl or auth flows
- Team dashboards or permissions

## Technical approach
- Next.js app with server routes to orchestrate Playwright-driven axe-core scans
- Deterministic HTML snapshot mode for reproducible demos
- Diff engine keyed by rule id + selector/locator to isolate new issues
- Report builder that groups by component/context and attaches WCAG references
- Optional fix-suggestion templates for common issues (labels, roles, contrast)

## Execution notes
- Seed with sample baseline/PR snapshots to demo without external URLs
- Keep scan concurrency bounded; add timeouts and clear error surfaces
- Ensure deterministic selectors for consistent diffs
- Use feature-flag stubs to enable future GitHub webhook/CI integration without shipping it now
