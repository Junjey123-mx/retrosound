'use client';

interface Tab {
  value: string;
  label: string;
  count?: number;
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
            onClick={() => onChange(tab.value)}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand text-white shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? 'bg-white/20' : 'bg-muted text-muted-foreground'
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
