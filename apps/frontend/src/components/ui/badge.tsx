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
  default:   'bg-rs-primary-soft text-orange-700 border-orange-200',
  success:   'bg-rs-success-soft text-emerald-700 border-emerald-200',
  warning:   'bg-rs-warning-soft text-amber-700 border-amber-200',
  danger:    'bg-rs-error-soft text-red-700 border-red-200',
  info:      'bg-rs-info-soft text-blue-700 border-blue-200',
  muted:     'bg-rs-bg-soft text-rs-muted border-rs-border',
  secondary: 'bg-rs-secondary-soft text-violet-700 border-violet-200',
  outline:   'bg-white text-rs-text border-rs-border',
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
