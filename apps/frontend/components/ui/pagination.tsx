interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 py-3 text-sm text-muted-foreground">
      <span>
        {total} resultado{total !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          ←
        </button>
        <span className="px-2 font-medium text-foreground">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  );
}
