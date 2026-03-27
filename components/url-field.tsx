type UrlFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function UrlField({ id, label, placeholder, value, error, onChange }: UrlFieldProps) {
  return (
    <label htmlFor={id} className="field">
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        {error ? (
          <span id={`${id}-error`} role="alert" className="text-xs font-medium text-[var(--critical)]">
            {error}
          </span>
        ) : null}
      </div>
      <input
        id={id}
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </label>
  );
}
