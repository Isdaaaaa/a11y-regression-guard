import { diffViolations } from '@/lib/scan-diff';
import type { AxeViolation, ScanExecutor, ScanReport, ScanRunnerInput } from '@/types/scan';

const BASELINE_MOCK: AxeViolation[] = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Ensures text has sufficient color contrast',
    help: 'Elements must meet minimum color contrast ratio thresholds',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
    nodes: [
      { target: ['main', '.price-pill'] },
      { target: ['main', '.secondary-cta'] },
    ],
    tags: ['wcag2aa'],
  },
  {
    id: 'image-alt',
    impact: 'critical',
    description: 'Ensures <img> elements have alternate text',
    help: 'Images must have alternate text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
    nodes: [{ target: ['main', '.product-grid img:nth-child(2)'] }],
    tags: ['wcag2a'],
  },
];

const CANDIDATE_MOCK: AxeViolation[] = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Ensures text has sufficient color contrast',
    help: 'Elements must meet minimum color contrast ratio thresholds',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
    nodes: [
      { target: ['main', '.price-pill'] },
      { target: ['main', '.promo-badge'] },
    ],
    tags: ['wcag2aa'],
  },
  {
    id: 'aria-input-field-name',
    impact: 'critical',
    description: 'Ensures every ARIA input field has an accessible name',
    help: 'ARIA input fields must have an accessible name',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/aria-input-field-name',
    nodes: [{ target: ['#checkout-form', 'input[name="email"]'] }],
    tags: ['wcag2a'],
  },
];

function selectMockForUrl(url: string) {
  return url.includes('candidate') ? CANDIDATE_MOCK : BASELINE_MOCK;
}

export async function mockScanExecutor(url: string): Promise<AxeViolation[]> {
  const selected = selectMockForUrl(url);
  return structuredClone(selected);
}

export async function runA11yComparison(
  input: ScanRunnerInput,
  executeScan: ScanExecutor = mockScanExecutor,
): Promise<ScanReport> {
  const [baselineViolations, candidateViolations] = await Promise.all([
    executeScan(input.baselineUrl),
    executeScan(input.candidateUrl),
  ]);

  const diff = diffViolations(baselineViolations, candidateViolations);

  return {
    summary: {
      baselineViolationCount: diff.totalBaselineNodes,
      candidateViolationCount: diff.totalCandidateNodes,
      regressionCount: diff.regressions.length,
    },
    regressions: diff.regressions,
    baselineViolations,
    candidateViolations,
  };
}
