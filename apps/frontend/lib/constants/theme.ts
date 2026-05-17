export const BRAND = {
  orange:       '#F97316',
  orangeHover:  '#EA580C',
  orangeSoft:   'rgba(249,115,22,0.08)',
  orangeRing:   'rgba(249,115,22,0.30)',

  green:        '#00E676',
  greenHover:   '#00C853',
  greenSoft:    'rgba(0,230,118,0.08)',
  greenRing:    'rgba(0,230,118,0.30)',

  bgLight:      '#F6F8FB',
  bgDark:       '#08111F',

  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',

  borderLight:   '#E8EDF4',
  borderDark:    'rgba(255,255,255,0.06)',

  success:  '#16A34A',
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
