type Variant = 'page' | 'table' | 'cards' | 'inline';

interface LoadingStateProps {
  variant?: Variant;
  label?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const spinnerSize = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-16 w-16 border-4',
};

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={`animate-spin rounded-full border-brand/30 border-t-brand ${spinnerSize[size]}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <SkeletonBlock className="h-4 w-1/4" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-border px-4 py-3 last:border-0">
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-7 w-28" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingState({ variant = 'page', label, message, size = 'md' }: LoadingStateProps) {
  const text = label ?? message;

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" />
        {text}
      </span>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-2">
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
        <TableSkeleton />
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="space-y-4">
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
        <CardsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
