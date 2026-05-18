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
  default:   'bg-brand/10 text-brand border-brand/20',
  success:   'bg-success/10 text-success border-success/20',
  warning:   'bg-warning/10 text-warning border-warning/20',
  danger:    'bg-danger/10 text-danger border-danger/20',
  info:      'bg-info/10 text-info border-info/20',
  muted:     'bg-muted text-muted-foreground border-transparent',
  secondary: 'bg-action/10 text-action border-action/20',
  outline:   'bg-transparent text-foreground border-border',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
