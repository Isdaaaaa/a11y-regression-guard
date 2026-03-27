import type { ScanStatus } from '@/types/scan';

type ScanStatusCardProps = {
  status: ScanStatus;
};

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${seconds}s`;
}

export function ScanStatusCard({ status }: ScanStatusCardProps) {
  if (status.stage === 'idle') {
    return (
      <article className="card">
        <h2 className="section-title">Scan Status</h2>
        <p className="mt-3 text-sm text-slate-600">
          Ready to compare baseline and candidate pages. Fill both URLs and run a scan.
        </p>
      </article>
    );
  }

  if (status.stage === 'complete') {
    return (
      <article className="card">
        <h2 className="section-title">Scan Status</h2>
        <p className="mt-3 text-sm text-slate-700">Scan completed successfully.</p>
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">Comparison complete</p>
          <p className="mt-1">Total run time: {formatDuration(status.elapsedMs)}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="card">
      <h2 className="section-title">Scan Status</h2>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-700">
          <p className="font-medium">{status.stepLabel}</p>
          <p className="font-semibold text-[var(--primary)]">{status.progress}%</p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Scan progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={status.progress}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">Elapsed: {formatDuration(status.elapsedMs)}</p>
      </div>
    </article>
  );
}
