'use client';

import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchInput({ containerClassName = '', className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        className={`w-full rounded-lg border border-border bg-input-bg py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 ${className}`}
        {...props}
      />
    </div>
  );
}
