import { buildFixTemplate } from '@/lib/fix-templates';
import type { ScanReport } from '@/types/scan';

type MarkdownInput = {
  report: ScanReport;
  baselineUrl: string;
  candidateUrl: string;
};

const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor', 'unknown'] as const;

function severityLabel(value: string | null) {
  return value ? value.toUpperCase() : 'UNKNOWN';
}

export function createPrCommentMarkdown({ report, baselineUrl, candidateUrl }: MarkdownInput): string {
  const severityCounts: Record<(typeof SEVERITY_ORDER)[number], number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
  };

  for (const regression of report.regressions) {
    const severity = regression.impact ?? 'unknown';
    severityCounts[severity] += 1;
  }

  const sortedRegressions = [...report.regressions].sort((a, b) => {
    const severityRank = SEVERITY_ORDER.indexOf((a.impact ?? 'unknown') as (typeof SEVERITY_ORDER)[number]);
    const nextRank = SEVERITY_ORDER.indexOf((b.impact ?? 'unknown') as (typeof SEVERITY_ORDER)[number]);
    if (severityRank !== nextRank) {
      return severityRank - nextRank;
    }

    if (a.ruleId !== b.ruleId) {
      return a.ruleId.localeCompare(b.ruleId);
    }

    return a.target.localeCompare(b.target);
  });

  const lines: string[] = [];
  lines.push('## ♿ Accessibility Regression Guard Report');
  lines.push('');
  lines.push(`- **Baseline:** ${baselineUrl}`);
  lines.push(`- **Candidate:** ${candidateUrl}`);
  lines.push(`- **New regressions:** ${report.summary.regressionCount}`);
  lines.push(`- **Node counts:** baseline ${report.summary.baselineViolationCount} → candidate ${report.summary.candidateViolationCount}`);
  lines.push('');
  lines.push('### Severity summary');
  lines.push(
    `- Critical: ${severityCounts.critical} · Serious: ${severityCounts.serious} · Moderate: ${severityCounts.moderate} · Minor: ${severityCounts.minor} · Unknown: ${severityCounts.unknown}`,
  );
  lines.push('');

  if (sortedRegressions.length === 0) {
    lines.push('✅ No new accessibility regressions detected in this comparison.');
    return lines.join('\n');
  }

  lines.push('### New regressions');

  for (const regression of sortedRegressions) {
    const suggestedFix = buildFixTemplate(regression.ruleId).suggestedFix;
    lines.push(
      `- **[${severityLabel(regression.impact)}]** \`${regression.ruleId}\` — ${regression.help}`,
    );
    lines.push(`  - Target: \`${regression.target}\``);
    lines.push(`  - Guidance: ${regression.helpUrl}`);
    if (suggestedFix) {
      lines.push(`  - Suggested fix: ${suggestedFix}`);
    }
  }

  return lines.join('\n');
}
