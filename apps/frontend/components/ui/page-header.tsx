import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon,
  action,
  backHref,
  backLabel = 'Volver',
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-1">
      {backHref && (
        <Link
          href={backHref as any}
          className="rs-back-btn mb-2 inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="mt-3 sm:mt-0">{action}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
