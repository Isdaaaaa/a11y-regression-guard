import {
  createGroupedRegressionReport,
  type GroupedRegressionReport,
  type SeverityKey,
} from '@/lib/regression-report';
import { SeverityPill } from '@/components/severity-pill';
import type { NormalizedNodeViolation, ScanReport } from '@/types/scan';

type NewRegressionsReportProps = {
  report: ScanReport | null;
  isLoading: boolean;
  selectedKey: string | null;
  onSelectRegression: (regression: NormalizedNodeViolation) => void;
};

const SEVERITY_ORDER: SeverityKey[] = ['critical', 'serious', 'moderate', 'minor'];

function SummaryCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | SeverityKey;
}) {
  const styles: Record<'neutral' | SeverityKey, string> = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-800',
    critical: 'border-[var(--critical)]/25 bg-[var(--critical)]/8 text-[var(--critical)]',
    serious: 'border-[var(--primary)]/25 bg-[var(--primary)]/8 text-[var(--primary)]',
    moderate: 'border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[#8F5600]',
    minor: 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[#0B634F]',
    unknown: 'border-slate-300 bg-slate-100 text-slate-700',
  };

  return (
    <div className={`rounded-xl border p-3 ${styles[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-[var(--primary)]">Building regression report…</p>
      <p className="mt-1 text-sm text-slate-600">Grouping findings by component context and severity.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-200/70" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="h-3 w-44 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function IdleEmptyState() {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">No regressions report yet</p>
      <p className="mt-2">
        Run a baseline vs candidate scan to generate grouped findings, severity counts, and context-focused remediation details.
      </p>
      <ul className="mt-3 space-y-1.5 text-slate-600">
        <li>• Add baseline and candidate URLs</li>
        <li>• Optionally upload a snapshot for context</li>
        <li>
          • Click <span className="font-semibold text-[var(--primary)]">Run Scan</span>
        </li>
      </ul>
    </div>
  );
}

function ZeroRegressionState({ report }: { report: ScanReport }) {
  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
      <p className="font-semibold">No new accessibility regressions detected.</p>
      <p className="mt-2 text-emerald-800">
        Baseline nodes: {report.summary.baselineViolationCount} • Candidate nodes:{' '}
        {report.summary.candidateViolationCount}
      </p>
    </div>
  );
}

function Findings({
  grouped,
  selectedKey,
  onSelectRegression,
}: {
  grouped: GroupedRegressionReport;
  selectedKey: string | null;
  onSelectRegression: (regression: NormalizedNodeViolation) => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <SummaryCard label="Total" value={grouped.totalRegressions} />
        {SEVERITY_ORDER.map((severity) => (
          <SummaryCard
            key={severity}
            label={severity}
            value={grouped.severityCounts[severity]}
            tone={severity}
          />
        ))}
      </div>

      <div className="space-y-3">
        {grouped.groups.map((group) => (
          <section key={group.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--primary)]">{group.component}</h3>
                <p className="text-xs text-slate-500">Context: {group.context}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {group.regressions.length} issue{group.regressions.length > 1 ? 's' : ''}
                </span>
                {SEVERITY_ORDER.map((severity) =>
                  group.severityCounts[severity] > 0 ? (
                    <span
                      key={severity}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                    >
                      {severity}: {group.severityCounts[severity]}
                    </span>
                  ) : null,
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {group.regressions.map((regression) => {
                const isSelected = selectedKey === regression.key;

                return (
                  <button
                    key={regression.key}
                    type="button"
                    aria-pressed={isSelected}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm'
                        : 'border-slate-200/90 bg-slate-50 hover:border-[var(--accent)]/45 hover:bg-[var(--accent)]/8'
                    }`}
                    onClick={() => onSelectRegression(regression)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{regression.ruleId}</p>
                      <SeverityPill severity={regression.impact} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700">{regression.help}</p>
                    <p className="mt-2 rounded-md bg-white px-2 py-1 font-[var(--font-mono)] text-xs text-slate-600">
                      {regression.target}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function NewRegressionsReport({
  report,
  isLoading,
  selectedKey,
  onSelectRegression,
}: NewRegressionsReportProps) {
  const grouped = report ? createGroupedRegressionReport(report.regressions) : null;

  return (
    <article className="card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="section-title">New Regressions Report</h2>
        {grouped ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {grouped.totalRegressions} regressions
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Waiting for scan
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !report ? (
        <IdleEmptyState />
      ) : report.regressions.length === 0 ? (
        <ZeroRegressionState report={report} />
      ) : grouped ? (
        <Findings grouped={grouped} selectedKey={selectedKey} onSelectRegression={onSelectRegression} />
      ) : null}
    </article>
  );
}
