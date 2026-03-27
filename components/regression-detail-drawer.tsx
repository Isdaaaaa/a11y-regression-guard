'use client';

import { useEffect, useState } from 'react';
import { SeverityPill } from '@/components/severity-pill';
import { buildDetailGuide } from '@/lib/fix-templates';
import type { NormalizedNodeViolation } from '@/types/scan';

type RegressionDetailDrawerProps = {
  selectedRegression: NormalizedNodeViolation | null;
  hasReport: boolean;
};

function EmptyReportState() {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">No report available yet</p>
      <p className="mt-2">
        Run a scan to generate regression findings. This panel will then show guided remediation with
        code snippets tailored per rule.
      </p>
    </div>
  );
}

function PromptState() {
  return (
    <div className="mt-4 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-5 text-sm text-slate-700">
      <p className="font-semibold text-[var(--primary)]">Select a regression finding</p>
      <p className="mt-2">
        Pick any issue from the report to inspect rule details, target selector, WCAG guidance, and a
        practical fix template.
      </p>
    </div>
  );
}

export function RegressionDetailDrawer({ selectedRegression, hasReport }: RegressionDetailDrawerProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyStatus !== 'idle') {
      const timeout = window.setTimeout(() => setCopyStatus('idle'), 1500);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [copyStatus]);

  if (!hasReport) {
    return (
      <article className="card">
        <h2 className="section-title">Detail Drawer</h2>
        <EmptyReportState />
      </article>
    );
  }

  if (!selectedRegression) {
    return (
      <article className="card">
        <h2 className="section-title">Detail Drawer</h2>
        <PromptState />
      </article>
    );
  }

  const guide = buildDetailGuide(selectedRegression);

  async function handleCopySnippet() {
    try {
      await navigator.clipboard.writeText(guide.snippet);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <article className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">Detail Drawer</h2>
          <p className="mt-1 text-sm text-slate-600">{guide.ruleLabel}</p>
        </div>
        <SeverityPill severity={selectedRegression.impact} />
      </div>

      <div className="mt-4 space-y-4 text-sm">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rule</p>
          <p className="mt-1 font-semibold text-slate-900">{selectedRegression.ruleId}</p>
          <p className="mt-2 text-slate-700">{selectedRegression.help}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selector target</p>
          <p className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 font-[var(--font-mono)] text-xs text-slate-700">
            {selectedRegression.target}
          </p>
          {selectedRegression.failureSummary ? (
            <p className="mt-3 rounded-md border border-[var(--warning)]/25 bg-[var(--warning)]/10 px-2.5 py-2 text-xs text-[#875100]">
              {selectedRegression.failureSummary}
            </p>
          ) : null}
          <a
            href={selectedRegression.helpUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-xs font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
          >
            Open WCAG / rule guidance ↗
          </a>
        </section>

        <section className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Why this matters</p>
          <p className="mt-2 text-slate-700">{guide.whyThisMatters}</p>
        </section>

        <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/8 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0B634F]">Suggested fix</p>
          <p className="mt-2 text-slate-700">{guide.suggestedFix}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Code template</p>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy snippet'}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-5 text-slate-100">
            <code className="font-[var(--font-mono)]">{guide.snippet}</code>
          </pre>
        </section>
      </div>
    </article>
  );
}
