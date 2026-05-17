type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const toneClasses: Record<Tone, string> = {
  default:   'bg-brand/10 text-brand',
  success:   'bg-success/10 text-success',
  warning:   'bg-warning/10 text-warning',
  danger:    'bg-danger/10 text-danger',
  info:      'bg-info/10 text-info',
  secondary: 'bg-action/10 text-action',
};

interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: string;
  tone?: Tone;
  className?: string;
}

export function StatCard({
  title,
  label,
  value,
  description,
  icon,
  trend,
  tone = 'default',
  className = '',
}: StatCardProps) {
  const heading = title ?? label ?? '';

  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{heading}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
          {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
