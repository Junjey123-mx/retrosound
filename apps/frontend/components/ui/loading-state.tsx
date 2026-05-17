interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<LoadingStateProps['size']>, string> = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-16 w-16 border-4',
};

export function LoadingState({ message, size = 'md' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className={`animate-spin rounded-full border-brand/30 border-t-brand ${sizeMap[size]}`}
        role="status"
        aria-label="Cargando"
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
