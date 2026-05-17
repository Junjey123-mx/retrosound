import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-xl border border-border bg-input-bg py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50 transition ${leftIcon ? 'pl-9' : 'px-3.5'} ${rightIcon ? 'pr-9' : ''} ${error ? 'border-danger focus:ring-danger/25' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
      {!error && helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
    </div>
  )
);
Input.displayName = 'Input';
