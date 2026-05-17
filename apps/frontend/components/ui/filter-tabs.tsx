'use client';

interface Tab {
  value: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, active, onChange, className = '' }: FilterTabsProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            active === tab.value
              ? 'bg-brand text-white'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
