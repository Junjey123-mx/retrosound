'use client';

interface Tab {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface FilterTabsProps {
  tabs: Tab[];
  value?: string;
  active?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, value, active, onChange, className = '' }: FilterTabsProps) {
  const current = value ?? active ?? '';

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = current === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={`inline-flex h-9 items-center justify-center rounded-full border px-5 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
              isActive ? 'rs-store-pill-active' : 'rs-store-pill'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 rounded-full border px-1.5 py-0.5 text-xs ${
                  isActive ? 'border-white/20 bg-white/15 text-inherit' : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
