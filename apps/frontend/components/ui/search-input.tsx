'use client';

import { Search, X } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  onClear?: () => void;
  shortcut?: string;
}

export function SearchInput({
  containerClassName = '',
  className = '',
  onClear,
  shortcut,
  value,
  ...props
}: SearchInputProps) {
  const hasValue = value !== undefined && value !== '';

  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={value}
        className={`w-full rounded-xl border border-border bg-input-bg py-2.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition ${hasValue && onClear ? 'pr-8' : shortcut ? 'pr-16' : 'pr-3.5'} ${className}`}
        {...props}
      />
      {hasValue && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      ) : shortcut && !hasValue ? (
        <span className="pointer-events-none absolute right-3 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {shortcut}
        </span>
      ) : null}
    </div>
  );
}
