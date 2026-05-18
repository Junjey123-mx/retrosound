import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, children, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-foreground">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-rs-primary focus:outline-none focus:ring-2 focus:ring-rs-primary/25 disabled:cursor-not-allowed disabled:bg-rs-bg-soft disabled:text-slate-400 dark:border-border dark:bg-input-bg dark:text-foreground transition ${error ? 'border-rs-error' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
      {!error && helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </div>
  )
);
Select.displayName = 'Select';
