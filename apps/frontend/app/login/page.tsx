'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  ArrowLeft, Disc3, Music2, Radio,
  ShoppingBag, BarChart2, DollarSign,
  Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle,
} from 'lucide-react';
import { useLogin } from '@/hooks/use-login';
import { ThemeSegment } from '@/components/ui/theme-segment';

/* ── Ecualizador de puntos animado ───────────────────────────────────────── */
function DotEqualizer({ color, light }: { color: string; light: boolean }) {
  const COLS = 14;
  const ROWS = 12;
  const heights = [3, 6, 9, 5, 11, 7, 12, 8, 4, 10, 6, 9, 5, 7];
  const delays  = [0, .15, .30, .08, .45, .22, .38, .14, .52, .06, .28, .42, .18, .34];

  return (
    <div className="flex items-end gap-1.5" style={{ height: ROWS * 12 }}>
      {Array.from({ length: COLS }, (_, col) => (
        <div key={col} className="flex flex-col-reverse gap-1">
          {Array.from({ length: ROWS }, (_, row) => {
            const lit = row < heights[col];
            return (
              <div
                key={row}
                className="h-2 w-2 rounded-sm"
                style={{
                  backgroundColor: color,
                  opacity: lit ? (light ? 0.20 + row * 0.05 : 0.15 + row * 0.05) : (light ? 0.05 : 0.04),
                  animation: lit ? `dot-pulse 1.8s ease-in-out infinite alternate` : 'none',
                  animationDelay: `${delays[col] + row * 0.04}s`,
                  transformOrigin: 'bottom',
                }}
              />
            );
          })}
        </div>
      ))}
      <style>{`
        @keyframes dot-pulse {
          0%   { transform: scaleY(0.4); opacity: 0.10; }
          100% { transform: scaleY(1);   opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const [correo,    setCorreo]    = useState('');
  const [contrasena,setContrasena]= useState('');
  const [showPass,  setShowPass]  = useState(false);

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const d = mounted ? theme === 'dark' : false;

  /* tokens */
  const brand      = d ? '#00E676' : '#F97316';
  const brandHov   = d ? '#00C853' : '#EA580C';
  const pageBg     = d ? '#080F1A' : '#F6F8FB';
  const rightBg    = d ? '#080F1A' : '#F6F8FB';
  const cardBg     = d ? '#0D1A2A'                 : '#FFFFFF';
  const cardBorder = d ? 'rgba(0,230,118,0.12)'    : '#E2E8F0';
  const titleColor = d ? '#FFFFFF'                 : '#0F172A';
  const subtitleColor = d ? 'rgba(255,255,255,0.50)' : '#64748B';
  const labelColor = d ? 'rgba(255,255,255,0.80)'  : '#374151';
  const inputBg    = d ? 'rgba(0,230,118,0.04)'    : '#FFFFFF';
  const inputBorder= d ? 'rgba(0,230,118,0.20)'    : '#D1D5DB';
  const iconColor  = d ? 'rgba(0,230,118,0.50)'    : '#9CA3AF';
  const statBg     = d ? 'rgba(255,255,255,0.04)'  : '#FFFFFF';
  const statBorder = d ? `rgba(${d?'0,230,118':'249,115,22'},0.20)` : 'rgba(249,115,22,0.18)';
  const glowA      = d ? 'rgba(0,230,118,0.12)'    : 'rgba(249,115,22,0.06)';
  const glowB      = d ? 'rgba(0,230,118,0.06)'    : 'rgba(99,102,241,0.06)';
  const btnGradient= d
    ? 'linear-gradient(135deg,#00E676 0%,#00B85A 100%)'
    : 'linear-gradient(135deg,#F97316 0%,#EA580C 100%)';
  const btnColor   = d ? '#08111F' : '#FFFFFF';
  const btnShadow  = d ? 'rgba(0,230,118,0.30)' : 'rgba(249,115,22,0.35)';

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const ok = await login({ correo, contrasena });
    if (!ok) return;
    try {
      const token = localStorage.getItem('token') ?? '';
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { rol } = JSON.parse(atob(part)) as { rol: string };
      router.push((rol === 'cliente' ? '/tienda' : '/dashboard') as any);
    } catch {
      router.push('/dashboard');
    }
  }

  return (
    <main className="flex min-h-screen" style={{ backgroundColor: pageBg }}>

      {/* ── Panel izquierdo ────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: d
            ? 'linear-gradient(150deg, #080F1A 0%, #031508 35%, #05111A 65%, #080F1A 100%)'
            : 'linear-gradient(150deg, #FFFFFF 0%, #F0FBF5 40%, #EFF6FF 75%, #F8FAFC 100%)',
        }}
      >
        {/* Glows */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: glowA }} />
        <div className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full blur-3xl"  style={{ backgroundColor: d ? 'rgba(0,150,80,0.07)' : 'rgba(99,102,241,0.06)' }} />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: glowB }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border-2"
            style={{ borderColor: brand, backgroundColor: d ? 'rgba(0,230,118,0.10)' : 'rgba(249,115,22,0.08)' }}
          >
            <Disc3 className="h-5 w-5" style={{ color: brand }} />
          </div>
          <span className="text-lg font-bold" style={{ color: titleColor }}>RetroSound</span>
        </div>

        {/* Centro */}
        <div className="relative space-y-8">

          {/* Badges */}
          <div className="flex gap-3">
            {[
              { icon: <Disc3  className="h-5 w-5" />, bg: d ? 'rgba(0,230,118,0.12)' : 'rgba(249,115,22,0.10)', border: d ? 'rgba(0,230,118,0.22)'  : 'rgba(249,115,22,0.22)',  color: brand },
              { icon: <Music2 className="h-5 w-5" />, bg: d ? 'rgba(139,92,246,0.15)': 'rgba(139,92,246,0.10)', border: d ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.22)', color: d ? '#a78bfa' : '#8B5CF6' },
              { icon: <Radio  className="h-5 w-5" />, bg: d ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', border: d ? 'rgba(59,130,246,0.24)'  : 'rgba(59,130,246,0.20)',  color: d ? '#60a5fa' : '#3B82F6' },
            ].map((b, i) => (
              <div key={i} className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: b.bg, border: `1px solid ${b.border}` }}>
                <span style={{ color: b.color }}>{b.icon}</span>
              </div>
            ))}
          </div>

          {/* Título */}
          <div>
            <h1 className="text-5xl font-extrabold leading-tight" style={{ color: titleColor }}>Bienvenido</h1>
            <h1 className="text-5xl font-extrabold leading-tight" style={{ color: brand }}>de nuevo</h1>
          </div>

          <p className="text-base leading-relaxed max-w-sm" style={{ color: subtitleColor }}>
            Consulta inventario, ventas y reportes SQL desde un solo lugar. Tu tienda musical, en control.
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <ShoppingBag className="h-5 w-5" />, num: '500+', label: 'Productos' },
              { icon: <BarChart2   className="h-5 w-5" />, num: '8',    label: 'Reportes SQL' },
              { icon: <DollarSign  className="h-5 w-5" />, num: 'Q0',   label: 'Costo' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: statBg, border: `1px solid ${statBorder}`, boxShadow: d ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <span style={{ color: brand }}>{s.icon}</span>
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: titleColor }}>{s.num}</p>
                  <p className="mt-0.5 text-xs" style={{ color: subtitleColor }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ecualizador */}
          <DotEqualizer color={brand} light={!d} />
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-4">
          <ThemeSegment />
          <span className="text-xs" style={{ color: d ? 'rgba(255,255,255,0.30)' : '#94A3B8' }}>
            Tema de gestión musical
          </span>
        </div>
      </div>

      {/* ── Panel derecho — formulario ──────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12" style={{ backgroundColor: rightBg }}>
        <div
          className="w-full max-w-md rounded-3xl p-10 space-y-8"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, boxShadow: d ? 'none' : '0 4px 24px rgba(0,0,0,0.07)' }}
        >

          {/* Volver */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: brand }}
            onMouseEnter={(e) => (e.currentTarget.style.color = brandHov)}
            onMouseLeave={(e) => (e.currentTarget.style.color = brand)}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          {/* Logo móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2" style={{ borderColor: brand }}>
              <Disc3 className="h-4 w-4" style={{ color: brand }} />
            </div>
            <span className="font-bold" style={{ color: titleColor }}>RetroSound</span>
          </div>

          {/* Encabezado */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold" style={{ color: titleColor }}>Iniciar sesión</h1>
            <p className="text-sm" style={{ color: subtitleColor }}>Accede con tu correo y contraseña.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Correo */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: labelColor }}>Correo electrónico</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: iconColor }} />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  placeholder="admin@retrosound.com"
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: titleColor }}
                  onFocus={(e) => { e.currentTarget.style.border = `1.5px solid ${brand}`; e.currentTarget.style.boxShadow = `0 0 0 3px ${d?'rgba(0,230,118,0.12)':'rgba(249,115,22,0.12)'}`; }}
                  onBlur={(e)  => { e.currentTarget.style.border = `1px solid ${inputBorder}`;  e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: labelColor }}>Contraseña</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: iconColor }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-11 pr-12 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: titleColor }}
                  onFocus={(e) => { e.currentTarget.style.border = `1.5px solid ${brand}`; e.currentTarget.style.boxShadow = `0 0 0 3px ${d?'rgba(0,230,118,0.12)':'rgba(249,115,22,0.12)'}`; }}
                  onBlur={(e)  => { e.currentTarget.style.border = `1px solid ${inputBorder}`;  e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: iconColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = brand)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ border: '1px solid rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.10)', color: '#f87171' }}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{ background: btnGradient, color: btnColor, boxShadow: `0 4px 20px ${btnShadow}` }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 26px ${d?'rgba(0,230,118,0.45)':'rgba(249,115,22,0.50)'}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${btnShadow}`; }}
            >
              {isLoading ? 'Entrando…' : <><span>Iniciar sesión</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: subtitleColor }}>
            ¿No tienes cuenta?{' '}
            <Link
              href="/registro"
              className="font-semibold transition-colors"
              style={{ color: brand }}
              onMouseEnter={(e) => (e.currentTarget.style.color = brandHov)}
              onMouseLeave={(e) => (e.currentTarget.style.color = brand)}
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>

    </main>
  );
}
