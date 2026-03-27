export type FormErrors = {
  baselineUrl?: string;
  candidateUrl?: string;
  snapshot?: string;
};

export type ScanStage = 'idle' | 'running' | 'complete';

export type ScanStatus = {
  stage: ScanStage;
  stepLabel: string;
  progress: number;
  elapsedMs: number;
};

export type SnapshotSelection = {
  name: string;
  sizeInBytes: number;
  type: string;
};

export type AxeImpact = 'minor' | 'moderate' | 'serious' | 'critical';

export type AxeNodeResult = {
  target: string[];
  html?: string;
  failureSummary?: string;
};

export type AxeViolation = {
  id: string;
  impact: AxeImpact | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNodeResult[];
  tags?: string[];
};

export type NormalizedNodeViolation = {
  key: string;
  ruleId: string;
  impact: AxeImpact | null;
  help: string;
  helpUrl: string;
  description: string;
  target: string;
  failureSummary?: string;
  tags?: string[];
};

export type ViolationDiff = {
  regressions: NormalizedNodeViolation[];
  totalBaselineNodes: number;
  totalCandidateNodes: number;
  resolvedCount: number;
};

export type ScanSummary = {
  baselineViolationCount: number;
  candidateViolationCount: number;
  regressionCount: number;
};

export type ScanReport = {
  summary: ScanSummary;
  regressions: NormalizedNodeViolation[];
  baselineViolations: AxeViolation[];
  candidateViolations: AxeViolation[];
};

export type ScanRunnerInput = {
  baselineUrl: string;
  candidateUrl: string;
};

export type ScanExecutor = (url: string) => Promise<AxeViolation[]>;
