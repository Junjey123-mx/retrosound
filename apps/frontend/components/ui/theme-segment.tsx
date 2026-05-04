'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeSegment() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10 w-44" />;

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        borderColor: isDark ? '#00E676' : '#F97316',
        backgroundColor: isDark ? '#08111F' : '#ffffff',
      }}
      className="flex items-center rounded-full border-2 overflow-hidden transition-colors duration-300"
    >
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          isDark ? 'text-[#00E676]' : 'text-neutral-400 hover:text-neutral-600'
        }`}
      >
        <Moon className="h-3.5 w-3.5" /> Oscuro
      </button>

      <div style={{ backgroundColor: isDark ? 'rgba(0,230,118,0.3)' : 'rgba(249,115,22,0.3)' }} className="w-px h-5" />

      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          !isDark ? 'text-[#F97316]' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <Sun className="h-3.5 w-3.5" /> Luz
      </button>
    </div>
  );
}
