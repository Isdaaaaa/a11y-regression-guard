'use client';

import { useEffect, useState } from 'react';
import { createPrCommentMarkdown } from '@/lib/pr-comment-markdown';
import type { ScanReport } from '@/types/scan';

type ExportBarProps = {
  report: ScanReport | null;
  baselineUrl: string;
  candidateUrl: string;
};

export function ExportBar({ report, baselineUrl, candidateUrl }: ExportBarProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyStatus === 'idle') {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const canExport = Boolean(report) && baselineUrl.trim().length > 0 && candidateUrl.trim().length > 0;

  async function handleCopyMarkdown() {
    if (!report) {
      return;
    }

    try {
      const markdown = createPrCommentMarkdown({
        report,
        baselineUrl: baselineUrl.trim(),
        candidateUrl: candidateUrl.trim(),
      });
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <article className="card border-[var(--primary)]/15 bg-gradient-to-r from-[var(--primary)]/6 to-[var(--accent)]/6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title">Export for Pull Request</h2>
          <p className="mt-1 text-sm text-slate-600">
            Copy a ready-to-paste markdown summary for your PR comment, including severity and suggested fixes.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-[var(--primary)]/25 bg-white px-3.5 py-2 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!canExport}
          onClick={handleCopyMarkdown}
        >
          {copyStatus === 'copied'
            ? 'Markdown copied'
            : copyStatus === 'error'
              ? 'Copy failed'
              : 'Copy PR comment markdown'}
        </button>
      </div>
    </article>
  );
}
