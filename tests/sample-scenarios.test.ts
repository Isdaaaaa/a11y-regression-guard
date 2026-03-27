import { describe, expect, it } from 'vitest';
import { runA11yComparison } from '../lib/mock-scan-runner';
import { SAMPLE_SCENARIOS, getSampleScenarioById } from '../lib/sample-scenarios';

describe('sample scenarios', () => {
  it('exposes multiple named scenarios', () => {
    expect(SAMPLE_SCENARIOS.length).toBeGreaterThanOrEqual(2);
    expect(SAMPLE_SCENARIOS.map((scenario) => scenario.id)).toContain('checkout-regression');
    expect(SAMPLE_SCENARIOS.map((scenario) => scenario.id)).toContain('marketing-page-regression');
  });

  it('resolves scenario by id', () => {
    const scenario = getSampleScenarioById('marketing-page-regression');
    expect(scenario?.candidateUrl).toContain('marketing');
    expect(getSampleScenarioById('missing')).toBeNull();
  });

  it('uses deterministic mock data per scenario', async () => {
    const checkout = await runA11yComparison({
      baselineUrl: 'https://baseline.example.com/checkout',
      candidateUrl: 'https://candidate.example.com/checkout',
    });

    const marketing = await runA11yComparison({
      baselineUrl: 'https://baseline.example.com/marketing',
      candidateUrl: 'https://candidate.example.com/marketing',
    });

    expect(checkout.regressions.some((regression) => regression.ruleId === 'aria-input-field-name')).toBe(true);
    expect(marketing.regressions.some((regression) => regression.ruleId === 'image-alt')).toBe(true);
    expect(marketing.summary.candidateViolationCount).not.toBe(checkout.summary.candidateViolationCount);
  });

  it('does not overwrite baseline scenario when URLs are mixed', async () => {
    const mixed = await runA11yComparison({
      baselineUrl: 'https://baseline.example.com/checkout',
      candidateUrl: 'https://candidate.example.com/marketing',
    });

    expect(mixed.summary.baselineViolationCount).toBe(3);
    expect(mixed.summary.candidateViolationCount).toBe(4);
    expect(mixed.regressions.some((regression) => regression.ruleId === 'image-alt')).toBe(true);
  });
});
