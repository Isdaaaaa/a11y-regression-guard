import { describe, expect, it } from 'vitest';
import { diffViolations, normalizeViolations } from '../lib/scan-diff';
import type { AxeViolation } from '../types/scan';

function violation(partial: Partial<AxeViolation>): AxeViolation {
  return {
    id: 'color-contrast',
    impact: 'serious',
    description: 'desc',
    help: 'help',
    helpUrl: 'https://example.com',
    nodes: [{ target: ['main', '.btn'] }],
    ...partial,
  };
}

describe('normalizeViolations', () => {
  it('deduplicates identical rule/target combinations', () => {
    const input = [
      violation({ nodes: [{ target: ['main', '.btn'] }, { target: ['main', '.btn'] }] }),
      violation({ impact: 'critical', nodes: [{ target: ['main', '.btn'] }] }),
    ];

    const normalized = normalizeViolations(input);
    expect(normalized).toHaveLength(1);
    expect(normalized[0]?.impact).toBe('critical');
  });
});

describe('diffViolations', () => {
  it('treats same rule on different nodes as separate entries', () => {
    const baseline = [violation({ nodes: [{ target: ['main', '.a'] }] })];
    const candidate = [
      violation({ nodes: [{ target: ['main', '.a'] }, { target: ['main', '.b'] }] }),
    ];

    const diff = diffViolations(baseline, candidate);
    expect(diff.regressions).toHaveLength(1);
    expect(diff.regressions[0]?.target).toContain('.b');
  });

  it('does not count severity-only changes as new regression', () => {
    const baseline = [
      violation({ impact: 'moderate', id: 'aria-label', nodes: [{ target: ['#email'] }] }),
    ];
    const candidate = [
      violation({ impact: 'critical', id: 'aria-label', nodes: [{ target: ['#email'] }] }),
    ];

    const diff = diffViolations(baseline, candidate);
    expect(diff.regressions).toHaveLength(0);
  });

  it('tracks resolved baseline issues when target disappears', () => {
    const baseline = [
      violation({ id: 'image-alt', nodes: [{ target: ['main', '.legacy-card img'] }] }),
    ];
    const candidate: AxeViolation[] = [];

    const diff = diffViolations(baseline, candidate);
    expect(diff.resolvedCount).toBe(1);
    expect(diff.regressions).toHaveLength(0);
  });
});
