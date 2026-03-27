import { diffViolations } from '@/lib/scan-diff';
import type { AxeViolation, ScanExecutor, ScanReport, ScanRunnerInput } from '@/types/scan';

type ScenarioMockSet = {
  baseline: AxeViolation[];
  candidate: AxeViolation[];
};

type ScenarioId = 'checkout' | 'marketing';

const CHECKOUT_SCENARIO: ScenarioMockSet = {
  baseline: [
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
  ],
  candidate: [
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
  ],
};

const MARKETING_SCENARIO: ScenarioMockSet = {
  baseline: [
    {
      id: 'heading-order',
      impact: 'moderate',
      description: 'Ensures the order of headings is semantically correct',
      help: 'Heading levels should only increase by one',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/heading-order',
      nodes: [{ target: ['main', '.hero-content h3'] }],
      tags: ['wcag2aa'],
    },
    {
      id: 'link-name',
      impact: 'serious',
      description: 'Ensures links have discernible text',
      help: 'Links must have discernible text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/link-name',
      nodes: [{ target: ['header', '.top-nav a.cta-link'] }],
      tags: ['wcag2a'],
    },
  ],
  candidate: [
    {
      id: 'heading-order',
      impact: 'moderate',
      description: 'Ensures the order of headings is semantically correct',
      help: 'Heading levels should only increase by one',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/heading-order',
      nodes: [{ target: ['main', '.hero-content h3'] }],
      tags: ['wcag2aa'],
    },
    {
      id: 'link-name',
      impact: 'serious',
      description: 'Ensures links have discernible text',
      help: 'Links must have discernible text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/link-name',
      nodes: [
        { target: ['header', '.top-nav a.cta-link'] },
        { target: ['main', '.hero-banner a'] },
      ],
      tags: ['wcag2a'],
    },
    {
      id: 'image-alt',
      impact: 'critical',
      description: 'Ensures <img> elements have alternate text',
      help: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
      nodes: [{ target: ['main', '.campaign-gallery img:nth-child(1)'] }],
      tags: ['wcag2a'],
    },
  ],
};

const DEFAULT_SCENARIO = CHECKOUT_SCENARIO;

function findScenarioId(url: string): ScenarioId | null {
  const normalized = url.toLowerCase();
  if (normalized.includes('marketing')) {
    return 'marketing';
  }

  if (normalized.includes('checkout')) {
    return 'checkout';
  }

  return null;
}

function resolveScenario(id: ScenarioId | null): ScenarioMockSet {
  if (id === 'marketing') {
    return MARKETING_SCENARIO;
  }

  if (id === 'checkout') {
    return CHECKOUT_SCENARIO;
  }

  return DEFAULT_SCENARIO;
}

function selectMockViolations(url: string, expectedKind: 'baseline' | 'candidate'): AxeViolation[] {
  const scenario = resolveScenario(findScenarioId(url));
  const isCandidateUrl = url.toLowerCase().includes('candidate');
  const kind = isCandidateUrl ? 'candidate' : expectedKind;
  return kind === 'candidate' ? scenario.candidate : scenario.baseline;
}

export async function mockScanExecutor(url: string): Promise<AxeViolation[]> {
  return structuredClone(selectMockViolations(url, 'baseline'));
}

export async function runA11yComparison(
  input: ScanRunnerInput,
  executeScan: ScanExecutor = mockScanExecutor,
): Promise<ScanReport> {
  const [baselineViolations, candidateViolations] =
    executeScan === mockScanExecutor
      ? [
          structuredClone(selectMockViolations(input.baselineUrl, 'baseline')),
          structuredClone(selectMockViolations(input.candidateUrl, 'candidate')),
        ]
      : await Promise.all([executeScan(input.baselineUrl), executeScan(input.candidateUrl)]);

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
