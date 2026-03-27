import type { NormalizedNodeViolation } from '@/types/scan';

export type FixTemplate = {
  ruleId: string;
  title: string;
  whyThisMatters: string;
  suggestedFix: string;
  snippet: string;
};

function titleFromRuleId(ruleId: string) {
  return ruleId
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function buildFixTemplate(ruleId: string): FixTemplate {
  switch (ruleId) {
    case 'color-contrast':
      return {
        ruleId,
        title: 'Color Contrast',
        whyThisMatters:
          'People with low vision or color-vision differences may not be able to read low-contrast text, especially on mobile screens or bright environments.',
        suggestedFix:
          'Increase foreground/background contrast to meet at least WCAG AA (4.5:1 for normal text, 3:1 for large text) and avoid using color alone to convey meaning.',
        snippet: `<button className="promo-badge">Limited offer</button>\n\n/* ✅ Higher contrast foreground/background */\n.promo-badge {\n  background: #155eef;\n  color: #ffffff;\n  border: 1px solid #0b4acb;\n}`,
      };

    case 'image-alt':
      return {
        ruleId,
        title: 'Image Alternative Text',
        whyThisMatters:
          'Screen reader users depend on text alternatives to understand the purpose and content of images.',
        suggestedFix:
          'Provide meaningful alt text for informative images. Use empty alt (alt="") for decorative images so assistive technology can skip them.',
        snippet: `{/* Informative image */}\n<img src="/products/headphones.jpg" alt="Noise-cancelling headphones in matte black" />\n\n{/* Decorative image */}\n<img src="/decor/divider-wave.svg" alt="" role="presentation" />`,
      };

    case 'aria-input-field-name':
      return {
        ruleId,
        title: 'Accessible Input Name',
        whyThisMatters:
          'Inputs without an accessible name are announced ambiguously by screen readers, making forms hard or impossible to complete.',
        suggestedFix:
          'Ensure every input has a programmatically associated label (native <label>, aria-label, or aria-labelledby). Prefer visible labels whenever possible.',
        snippet: `<label htmlFor="email">Email address</label>\n<input id="email" name="email" type="email" autoComplete="email" />\n\n{/* If no visible label is possible */}\n<input aria-label="Email address" name="email" type="email" />`,
      };

    default:
      return {
        ruleId,
        title: titleFromRuleId(ruleId),
        whyThisMatters:
          'Accessibility issues can block users from perceiving content, understanding controls, or completing key flows.',
        suggestedFix:
          'Follow the linked rule guidance, fix semantic structure first, then verify with keyboard + screen reader checks and re-run the scan.',
        snippet: `<!-- Generic remediation workflow -->\n<!-- 1) Use semantic HTML first -->\n<button type="button">Continue</button>\n\n<!-- 2) Add accessible name/state where needed -->\n<button aria-pressed="false">Toggle filters</button>\n\n<!-- 3) Validate with axe + keyboard navigation -->`,
      };
  }
}

export type DetailGuide = {
  ruleLabel: string;
  whyThisMatters: string;
  suggestedFix: string;
  snippet: string;
};

export function buildDetailGuide(regression: NormalizedNodeViolation): DetailGuide {
  const template = buildFixTemplate(regression.ruleId);

  return {
    ruleLabel: template.title,
    whyThisMatters: template.whyThisMatters,
    suggestedFix: template.suggestedFix,
    snippet: template.snippet,
  };
}
