const severity = [
  { label: 'Critical', color: 'bg-[var(--critical)] text-white' },
  { label: 'Warning', color: 'bg-[var(--warning)] text-[var(--bg)]' },
  { label: 'Actionable', color: 'bg-[var(--accent)] text-[var(--bg)]' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-[var(--font-mono)] text-xs text-slate-500">a11y-regression-guard</p>
            <h1 className="text-xl font-semibold text-[var(--primary)]">Regression Scanner</h1>
          </div>
          <button className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 shadow transition hover:brightness-95">
            Run Scan
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_1.4fr]">
        <section className="space-y-6">
          <article className="card">
            <h2 className="section-title">Inputs</h2>
            <div className="mt-4 space-y-4">
              <label className="field">
                <span>Target URL</span>
                <input type="url" placeholder="https://example.com" className="input" />
              </label>
              <label className="field">
                <span>Snapshot Upload</span>
                <input
                  type="file"
                  className="input file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1"
                />
              </label>
            </div>
          </article>

          <article className="card">
            <h2 className="section-title">Scan Status</h2>
            <p className="mt-3 text-sm text-slate-600">
              No scan in progress. Run a scan to detect regressions and suggested fixes.
            </p>
          </article>
        </section>

        <section className="space-y-6">
          <article className="card">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Findings</h2>
              <div className="flex flex-wrap gap-2">
                {severity.map((item) => (
                  <span
                    key={item.label}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Button contrast below WCAG AA in checkout sidebar.</li>
              <li>Missing form labels on newsletter block.</li>
              <li>Heading order mismatch in hero section.</li>
            </ul>
          </article>

          <article className="card">
            <h2 className="section-title">Detail Drawer (Placeholder)</h2>
            <p className="mt-3 text-sm text-slate-600">
              Select a finding to view rule details, locator, WCAG references, and suggested fix
              text.
            </p>
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
          <button className="font-medium text-[var(--primary)]">Load Sample Data</button>
        </div>
      </footer>
    </div>
  );
}
