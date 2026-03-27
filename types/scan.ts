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
