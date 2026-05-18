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
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-foreground">
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
          className={`w-full rounded-xl border border-slate-300 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rs-primary focus:outline-none focus:ring-2 focus:ring-rs-primary/25 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 transition ${leftIcon ? 'pl-9' : 'px-3.5'} ${rightIcon ? 'pr-9' : ''} ${error ? 'border-rs-error focus:ring-rs-error/25' : ''} ${className}`}
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
