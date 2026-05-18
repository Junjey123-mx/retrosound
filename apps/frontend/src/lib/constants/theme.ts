export const BRAND = {
  orange:       '#F97316',
  orangeHover:  '#EA580C',
  orangeSoft:   '#FFEDD5',
  orangeRing:   'rgba(249,115,22,0.30)',

  green:        '#00E676',
  greenHover:   '#00C853',
  greenSoft:    'rgba(0,230,118,0.08)',
  greenRing:    'rgba(0,230,118,0.30)',

  bgLight:      '#FAF7F0',
  bgDark:       '#08111F',

  textPrimary:   '#1F2937',
  textSecondary: '#64748B',
  textMuted:     '#94A3B8',

  borderLight:   '#E5E7EB',
  borderDark:    'rgba(255,255,255,0.06)',

  success:  '#10B981',
  warning:  '#F59E0B',
  danger:   '#EF4444',
  info:     '#3B82F6',
} as const;

export function brandColor(isDark: boolean) {
  return isDark ? BRAND.green : BRAND.orange;
}

export function brandHover(isDark: boolean) {
  return isDark ? BRAND.greenHover : BRAND.orangeHover;
}
