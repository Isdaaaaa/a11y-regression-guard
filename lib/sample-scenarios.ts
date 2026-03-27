export type SampleScenario = {
  id: string;
  name: string;
  description: string;
  baselineUrl: string;
  candidateUrl: string;
};

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'checkout-regression',
    name: 'Checkout flow regression',
    description: 'Form and purchase CTA accessibility regressions.',
    baselineUrl: 'https://baseline.example.com/checkout',
    candidateUrl: 'https://candidate.example.com/checkout',
  },
  {
    id: 'marketing-page-regression',
    name: 'Marketing page regression',
    description: 'Hero/media and navigation regressions on campaign pages.',
    baselineUrl: 'https://baseline.example.com/marketing',
    candidateUrl: 'https://candidate.example.com/marketing',
  },
];

export function getSampleScenarioById(id: string): SampleScenario | null {
  return SAMPLE_SCENARIOS.find((scenario) => scenario.id === id) ?? null;
}
