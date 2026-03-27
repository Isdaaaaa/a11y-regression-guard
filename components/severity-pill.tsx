import type { AxeImpact } from '@/types/scan';
import type { SeverityKey } from '@/lib/regression-report';

type SeverityPillProps = {
  severity: AxeImpact | null;
  className?: string;
};

const SEVERITY_STYLES: Record<SeverityKey, string> = {
  critical: 'bg-[var(--critical)]/15 text-[var(--critical)] border-[var(--critical)]/30',
  serious: 'bg-[var(--primary)]/12 text-[var(--primary)] border-[var(--primary)]/25',
  moderate: 'bg-[var(--warning)]/15 text-[#9B5F00] border-[var(--warning)]/35',
  minor: 'bg-[var(--accent)]/15 text-[#0C6B54] border-[var(--accent)]/35',
  unknown: 'bg-slate-100 text-slate-700 border-slate-200',
};

function toSeverityKey(severity: AxeImpact | null): SeverityKey {
  return severity ?? 'unknown';
}

function toSeverityLabel(severity: AxeImpact | null) {
  const normalized = toSeverityKey(severity);
  return normalized;
}

export function SeverityPill({ severity, className = '' }: SeverityPillProps) {
  const key = toSeverityKey(severity);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_STYLES[key]} ${className}`}
    >
      {toSeverityLabel(severity)}
    </span>
  );
}
