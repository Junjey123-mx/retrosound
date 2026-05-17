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
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50 transition ${error ? 'border-danger' : ''} ${className}`}
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
