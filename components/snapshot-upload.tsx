import { useRef } from 'react';
import type { SnapshotSelection } from '@/types/scan';

type SnapshotUploadProps = {
  selected: SnapshotSelection | null;
  error?: string;
  onSelect: (file: File | null) => void;
  onClear: () => void;
};

export function SnapshotUpload({ selected, error, onSelect, onClear }: SnapshotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className="field" htmlFor="snapshot-upload">
      <div className="flex items-center justify-between gap-2">
        <span>Snapshot Upload (Optional)</span>
        {error ? <span className="text-xs font-medium text-[var(--critical)]">{error}</span> : null}
      </div>
      <input
        ref={inputRef}
        id="snapshot-upload"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className={`input ${error ? 'input-error' : ''} file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-slate-700`}
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
        aria-invalid={Boolean(error)}
      />
      <p className="text-xs text-slate-500">Accepted formats: PNG, JPEG, WebP up to 5MB.</p>
      {selected ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <p className="font-semibold text-slate-800">{selected.name}</p>
          <p>
            {(selected.sizeInBytes / (1024 * 1024)).toFixed(2)} MB • {selected.type}
          </p>
          <button
            type="button"
            className="mt-2 font-medium text-[var(--primary)] hover:underline"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              onClear();
            }}
          >
            Remove snapshot
          </button>
        </div>
      ) : null}
    </label>
  );
}
