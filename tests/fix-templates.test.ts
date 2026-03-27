import { describe, expect, it } from 'vitest';
import { buildDetailGuide, buildFixTemplate } from '../lib/fix-templates';

describe('buildFixTemplate', () => {
  it('returns color-contrast specific guidance', () => {
    const template = buildFixTemplate('color-contrast');

    expect(template.title).toBe('Color Contrast');
    expect(template.snippet).toContain('promo-badge');
  });

  it('returns image-alt specific guidance', () => {
    const template = buildFixTemplate('image-alt');

    expect(template.title).toBe('Image Alternative Text');
    expect(template.snippet).toContain('alt=""');
  });

  it('returns aria-input-field-name specific guidance', () => {
    const template = buildFixTemplate('aria-input-field-name');

    expect(template.title).toBe('Accessible Input Name');
    expect(template.snippet).toContain('label htmlFor="email"');
  });

  it('falls back to generic guidance for unknown rules', () => {
    const template = buildFixTemplate('nested-interactive');

    expect(template.title).toBe('Nested Interactive');
    expect(template.suggestedFix).toContain('semantic');
  });
});

describe('buildDetailGuide', () => {
  it('builds a drawer-friendly guide from regression data', () => {
    const guide = buildDetailGuide({
      key: 'k',
      ruleId: 'image-alt',
      impact: 'critical',
      help: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
      description: 'Ensures img elements have alternate text',
      target: 'main > .product img',
    });

    expect(guide.ruleLabel).toBe('Image Alternative Text');
    expect(guide.whyThisMatters.length).toBeGreaterThan(20);
  });
});
