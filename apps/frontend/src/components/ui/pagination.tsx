interface PaginationProps {
  page: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
  className?: string;
}

function getPageButtons(page: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (page >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', page - 1, page, page + 1, '...', total];
}

export function Pagination({
  page,
  totalPages: totalPagesProp,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  label,
  className = '',
}: PaginationProps) {
  const totalPages =
    totalPagesProp ??
    (total != null && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1);

  if (totalPages <= 1 && !onPageSizeChange) return null;

  const pageButtons = getPageButtons(page, totalPages);

  const autoLabel =
    total != null && pageSize != null
      ? `Mostrando ${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} de ${total}`
      : `Página ${page} de ${totalPages}`;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 py-3 text-sm ${className}`}>
      <span className="text-muted-foreground">{label ?? autoLabel}</span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label="Página anterior"
        >
          ←
        </button>

        {pageButtons.map((p, i) =>
          p === '...' ? (
            <span key={`el-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`min-w-8 rounded-lg px-2 py-1.5 font-medium transition-colors ${
                p === page
                  ? 'border border-orange-300 bg-rs-primary-soft text-orange-700'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>

      {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-rs-primary focus:outline-none focus:ring-2 focus:ring-rs-primary/25 dark:border-border dark:bg-input-bg dark:text-foreground"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>{s} / página</option>
          ))}
        </select>
      )}
    </div>
  );
}
