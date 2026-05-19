import type { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'secondary'
  | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-rs-primary-soft text-orange-700 border-orange-200 dark:bg-brand/15 dark:text-brand dark:border-brand/30',
  success:   'bg-rs-success-soft text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  warning:   'bg-rs-warning-soft text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  danger:    'bg-rs-error-soft text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
  info:      'bg-rs-info-soft text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  muted:     'bg-rs-bg-soft text-rs-muted border-rs-border dark:bg-muted/60 dark:text-muted-foreground dark:border-border',
  secondary: 'bg-rs-secondary-soft text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  outline:   'bg-white text-rs-text border-rs-border dark:bg-transparent dark:text-foreground dark:border-border',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
