# Project Design

## Personality
Confident, empathetic, and precise. Tone: "We found issues and here’s how to fix them." Avoid alarmism; emphasize enablement.

## Colors
- Primary: Deep indigo (#2D2A6A) for trust and focus
- Accent: Electric teal (#20C997) for actionable highlights
- Warning: Amber (#F6A700) for moderate issues
- Critical: Crimson (#D7263D) for severe regressions
- Neutrals: Cool gray scale (#0F172A text, #E2E8F0 surfaces)

## Typography
- Headings: Inter SemiBold
- Body: Inter Regular
- Code/locators: JetBrains Mono

## Components
- Dual input panel (URL + snapshot upload) with validation states
- Scan status card with progress and timing
- Regression list grouped by component/context with severity pills
- Detail drawer showing rule description, WCAG link, locator, and suggested fix
- Export bar with copy-to-clipboard for markdown/PR comment
- Empty states with sample data quick-load buttons

## Layout
- Two-column: left for inputs/status, right for results
- Sticky header with CTA to run scan; footer with quick links (WCAG references, sample data)
- Use cards with subtle shadows; avoid dense tables—prefer grouped panels with bullets

## Inspiration
- axe DevTools reports (clarity in issue presentation)
- Linear app panel spacing and typography rhythm
- Vercel dashboard simplicity for status surfaces
