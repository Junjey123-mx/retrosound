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
            className={`rounded-xl border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rs-primary/30 disabled:cursor-not-allowed disabled:border-rs-border disabled:bg-rs-bg-soft disabled:text-slate-400 ${
              isActive
                ? 'border-orange-300 bg-rs-primary-soft text-orange-700 shadow-sm'
                : 'border-rs-border bg-white text-rs-text hover:border-orange-300 hover:bg-orange-50 hover:text-rs-primary-hover'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 rounded-full border px-1.5 py-0.5 text-xs ${
                  isActive ? 'border-orange-200 bg-white text-orange-700' : 'border-rs-border bg-rs-bg-soft text-rs-muted'
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
