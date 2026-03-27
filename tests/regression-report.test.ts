import { describe, expect, it } from 'vitest';
import { createGroupedRegressionReport } from '../lib/regression-report';
import type { NormalizedNodeViolation } from '../types/scan';

function regression(partial: Partial<NormalizedNodeViolation>): NormalizedNodeViolation {
  return {
    key: 'rule::main .field',
    ruleId: 'aria-input-field-name',
    impact: 'serious',
    help: 'ARIA input fields must have an accessible name',
    helpUrl: 'https://example.com/help',
    description: 'desc',
    target: 'main > #checkout-form > input[name="email"]',
    ...partial,
  };
}

describe('createGroupedRegressionReport', () => {
  it('builds severity counts and groups by component/context', () => {
    const report = createGroupedRegressionReport([
      regression({ key: '1', impact: 'critical' }),
      regression({ key: '2', impact: 'serious', target: 'main > #checkout-form > .email-input' }),
      regression({ key: '3', impact: 'minor', target: 'main > .promo-badge', help: 'Color contrast issue in promo text' }),
    ]);

    expect(report.totalRegressions).toBe(3);
    expect(report.severityCounts.critical).toBe(1);
    expect(report.severityCounts.serious).toBe(1);
    expect(report.severityCounts.minor).toBe(1);
    expect(report.groups[0]?.component).toBe('Checkout Form');
    expect(report.groups[0]?.context).toBe('Main');
  });

  it('falls back to help/tags when selector tokens are not meaningful', () => {
    const report = createGroupedRegressionReport([
      regression({
        key: 'unknown',
        impact: null,
        ruleId: 'image-alt',
        help: 'Images must have alternate text',
        tags: ['wcag2a'],
        target: 'body > div:nth-child(3) > span:nth-child(2)',
      }),
    ]);

    expect(report.severityCounts.unknown).toBe(1);
    expect(report.groups[0]?.component).toBe('Media content');
  });
});
