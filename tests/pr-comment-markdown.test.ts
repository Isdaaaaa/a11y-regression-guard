import { describe, expect, it } from 'vitest';
import { createPrCommentMarkdown } from '../lib/pr-comment-markdown';
import type { ScanReport } from '../types/scan';

const BASE_REPORT: ScanReport = {
  summary: {
    baselineViolationCount: 3,
    candidateViolationCount: 5,
    regressionCount: 2,
  },
  baselineViolations: [],
  candidateViolations: [],
  regressions: [
    {
      key: 'critical-1',
      ruleId: 'image-alt',
      impact: 'critical',
      help: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
      description: 'desc',
      target: 'main > .hero img',
    },
    {
      key: 'serious-1',
      ruleId: 'color-contrast',
      impact: 'serious',
      help: 'Elements must meet minimum color contrast ratio thresholds',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
      description: 'desc',
      target: 'main > .promo-badge',
    },
  ],
};

describe('createPrCommentMarkdown', () => {
  it('builds markdown with summary and regression details', () => {
    const output = createPrCommentMarkdown({
      report: BASE_REPORT,
      baselineUrl: 'https://baseline.example.com/checkout',
      candidateUrl: 'https://candidate.example.com/checkout',
    });

    expect(output).toContain('## ♿ Accessibility Regression Guard Report');
    expect(output).toContain('**New regressions:** 2');
    expect(output).toContain('**[CRITICAL]** `image-alt`');
    expect(output).toContain('Guidance: https://dequeuniversity.com/rules/axe/4.8/image-alt');
    expect(output).toContain('Suggested fix:');
  });

  it('returns no-regressions message when none are present', () => {
    const output = createPrCommentMarkdown({
      report: {
        ...BASE_REPORT,
        summary: {
          baselineViolationCount: 1,
          candidateViolationCount: 1,
          regressionCount: 0,
        },
        regressions: [],
      },
      baselineUrl: 'https://baseline.example.com/checkout',
      candidateUrl: 'https://candidate.example.com/checkout',
    });

    expect(output).toContain('✅ No new accessibility regressions detected in this comparison.');
  });
});
