'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { runA11yComparison } from '@/lib/mock-scan-runner';
import { ScanStatusCard } from '@/components/scan-status-card';
import { SnapshotUpload } from '@/components/snapshot-upload';
import { UrlField } from '@/components/url-field';
import type { FormErrors, ScanReport, ScanStatus, SnapshotSelection } from '@/types/scan';

const SCAN_STEPS = [
  'Capturing baseline snapshot',
  'Analyzing candidate page semantics',
  'Diffing accessibility nodes',
  'Finalizing regression report',
];

const MAX_SNAPSHOT_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_SNAPSHOT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatImpactLabel(impact: string | null) {
  if (!impact) {
    return 'unknown';
  }
  return impact;
}

export default function Home() {
  const [baselineUrl, setBaselineUrl] = useState('');
  const [candidateUrl, setCandidateUrl] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [snapshot, setSnapshot] = useState<SnapshotSelection | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [status, setStatus] = useState<ScanStatus>({
    stage: 'idle',
    stepLabel: 'Ready to scan',
    progress: 0,
    elapsedMs: 0,
  });

  const startedAtRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canRunScan = useMemo(
    () => baselineUrl.trim().length > 0 && candidateUrl.trim().length > 0,
    [baselineUrl, candidateUrl],
  );

  useEffect(() => {
    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, []);

  function resetErrors() {
    setErrors({});
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!baselineUrl.trim()) {
      nextErrors.baselineUrl = 'Baseline URL is required.';
    } else if (!isValidHttpUrl(baselineUrl)) {
      nextErrors.baselineUrl = 'Use a valid http/https URL.';
    }

    if (!candidateUrl.trim()) {
      nextErrors.candidateUrl = 'Candidate URL is required.';
    } else if (!isValidHttpUrl(candidateUrl)) {
      nextErrors.candidateUrl = 'Use a valid http/https URL.';
    } else if (candidateUrl.trim() === baselineUrl.trim()) {
      nextErrors.candidateUrl = 'Candidate URL should differ from baseline.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSnapshotSelect(file: File | null) {
    if (!file) {
      setSnapshot(null);
      setErrors((current) => ({ ...current, snapshot: undefined }));
      return;
    }

    if (!ACCEPTED_SNAPSHOT_TYPES.has(file.type)) {
      setSnapshot(null);
      setErrors((current) => ({
        ...current,
        snapshot: 'Unsupported file type. Use PNG, JPEG, or WebP.',
      }));
      return;
    }

    if (file.size > MAX_SNAPSHOT_SIZE_BYTES) {
      setSnapshot(null);
      setErrors((current) => ({
        ...current,
        snapshot: 'Snapshot must be 5MB or smaller.',
      }));
      return;
    }

    setSnapshot({
      name: file.name,
      sizeInBytes: file.size,
      type: file.type,
    });
    setErrors((current) => ({ ...current, snapshot: undefined }));
  }

  function handleClearSnapshot() {
    setSnapshot(null);
    setErrors((current) => ({ ...current, snapshot: undefined }));
  }

  async function handleRunScan() {
    resetErrors();
    if (!validateForm()) {
      return;
    }

    setReport(null);
    startedAtRef.current = Date.now();

    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }

    setStatus({
      stage: 'running',
      stepLabel: SCAN_STEPS[0],
      progress: 5,
      elapsedMs: 0,
    });

    elapsedTimerRef.current = setInterval(() => {
      const startedAt = startedAtRef.current;
      if (!startedAt) {
        return;
      }
      setStatus((current) => {
        if (current.stage !== 'running') {
          return current;
        }
        return {
          ...current,
          elapsedMs: Date.now() - startedAt,
        };
      });
    }, 250);

    for (let index = 0; index < SCAN_STEPS.length - 1; index += 1) {
      await sleep(400);
      const stepProgress = Math.round(((index + 1) / SCAN_STEPS.length) * 100);
      setStatus((current) => ({
        ...current,
        stage: 'running',
        stepLabel: SCAN_STEPS[index],
        progress: stepProgress,
      }));
    }

    const nextReport = await runA11yComparison({
      baselineUrl: baselineUrl.trim(),
      candidateUrl: candidateUrl.trim(),
    });

    setStatus((current) => ({
      ...current,
      stage: 'running',
      stepLabel: SCAN_STEPS[3],
      progress: 95,
    }));

    await sleep(250);

    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }

    const elapsedMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;

    setReport(nextReport);
    setStatus({
      stage: 'complete',
      stepLabel: 'Completed',
      progress: 100,
      elapsedMs,
    });
  }

  function handleLoadSampleData() {
    setBaselineUrl('https://baseline.example.com/checkout');
    setCandidateUrl('https://candidate.example.com/checkout');
    setStatus({
      stage: 'idle',
      stepLabel: 'Ready to scan',
      progress: 0,
      elapsedMs: 0,
    });
    setReport(null);
    setErrors({});
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-[var(--font-mono)] text-xs text-slate-500">a11y-regression-guard</p>
            <h1 className="text-xl font-semibold text-[var(--primary)]">Regression Scanner</h1>
          </div>
          <button
            type="button"
            onClick={handleRunScan}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 shadow transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRunScan || status.stage === 'running'}
          >
            {status.stage === 'running' ? 'Scanning…' : 'Run Scan'}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_1.4fr]">
        <section className="space-y-6">
          <article className="card">
            <h2 className="section-title">Comparison Inputs</h2>
            <div className="mt-4 space-y-4">
              <UrlField
                id="baseline-url"
                label="Baseline URL"
                placeholder="https://baseline.example.com"
                value={baselineUrl}
                error={errors.baselineUrl}
                onChange={setBaselineUrl}
              />

              <UrlField
                id="candidate-url"
                label="Candidate URL"
                placeholder="https://candidate.example.com"
                value={candidateUrl}
                error={errors.candidateUrl}
                onChange={setCandidateUrl}
              />

              <SnapshotUpload
                selected={snapshot}
                error={errors.snapshot}
                onSelect={handleSnapshotSelect}
                onClear={handleClearSnapshot}
              />
            </div>
          </article>

          <ScanStatusCard status={status} />
        </section>

        <section className="space-y-6">
          <article className="card">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Findings</h2>
              {report ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {report.summary.regressionCount} regressions
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Empty until first scan
                </span>
              )}
            </div>

            {!report ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">No regressions to display yet</p>
                <p className="mt-2">
                  Run a baseline vs candidate scan to generate grouped findings, severity pills, and
                  fix suggestions.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
                  <li>Add both URLs on the left panel.</li>
                  <li>Optionally upload a snapshot to compare visual context.</li>
                  <li>
                    Click <span className="font-semibold text-[var(--primary)]">Run Scan</span>.
                  </li>
                </ul>
              </div>
            ) : report.regressions.length === 0 ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                <p className="font-semibold">No new accessibility regressions detected.</p>
                <p className="mt-2 text-emerald-800">
                  Baseline nodes: {report.summary.baselineViolationCount} • Candidate nodes:{' '}
                  {report.summary.candidateViolationCount}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {report.regressions.map((regression) => (
                  <article
                    key={regression.key}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{regression.ruleId}</p>
                      <span className="rounded-full bg-[var(--warning)]/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                        {formatImpactLabel(regression.impact)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{regression.help}</p>
                    <p className="mt-2 font-[var(--font-mono)] text-xs text-slate-600">
                      Target: {regression.target}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="card">
            <h2 className="section-title">Detail Drawer</h2>
            {report ? (
              <p className="mt-3 text-sm text-slate-600">
                Select a finding in the next slice to view WCAG references and remediation text.
                Current scan includes {report.regressions.length} regression entries.
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Select a finding after a completed scan to inspect WCAG references, locators, and
                suggested remediation text.
              </p>
            )}
          </article>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-[var(--surface)] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-4 px-6 text-sm text-slate-600">
          <a
            href="https://www.w3.org/WAI/standards-guidelines/wcag/"
            className="hover:text-[var(--primary)]"
          >
            WCAG References
          </a>
          <span>•</span>
          <button
            type="button"
            className="font-medium text-[var(--primary)]"
            onClick={handleLoadSampleData}
          >
            Load Sample URLs
          </button>
        </div>
      </footer>
    </div>
  );
}
