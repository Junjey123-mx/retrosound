import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        /* ── Shadcn tokens ─────────────────────────────────────────────────── */
        background: 'hsl(var(--background))',
        'background-soft': 'hsl(var(--background-soft))',
        foreground: 'hsl(var(--foreground))',
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border:   'hsl(var(--border))',
        input:    'hsl(var(--input))',
        ring:     'hsl(var(--ring))',

        /* ── Tokens RetroSound ─────────────────────────────────────────────── */
        surface:         'hsl(var(--surface))',
        brand:           'hsl(var(--brand))',
        'brand-hover':   'hsl(var(--brand-hover))',
        'brand-soft':    'var(--brand-soft)',
        'brand-foreground': 'hsl(var(--brand-foreground))',
        action:          'hsl(var(--action-alt))',
        'action-hover':  'hsl(var(--action-alt-hover))',
        'action-soft':   'hsl(var(--action-alt) / 0.12)',
        'action-alt':    'hsl(var(--action-alt))',
        'action-alt-hover': 'hsl(var(--action-alt-hover))',
        'surface-elevated': 'hsl(var(--surface-elevated))',
        'input-bg':      'hsl(var(--input-bg))',
        'text-primary':   'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted':     'hsl(var(--text-muted))',
        success:         'hsl(var(--success))',
        info:            'hsl(var(--info))',
        warning:         'hsl(var(--warning))',
        danger:          'hsl(var(--danger))',
      },
    },
  },
  plugins: [],
};

export default config;
