'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  ArrowLeft, Disc3, Music2, Radio,
  ShoppingBag, BarChart2, DollarSign,
  Mail, ArrowRight, AlertCircle,
} from 'lucide-react';
import { useLogin } from '@/hooks/use-login';
import { getDefaultRedirect } from '@/lib/auth/redirects';
import { useSession } from '@/contexts/session-context';
import { ThemeSegment } from '@/components/ui/theme-segment';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';

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

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const { loginWithToken } = useSession();
  const [correo,     setCorreo]     = useState('');
  const [contrasena, setContrasena] = useState('');

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const d = mounted ? theme === 'dark' : false;

  const brand         = d ? '#00E676' : '#F97316';
  const titleColor    = d ? '#FFFFFF' : '#0F172A';
  const subtitleColor = d ? 'rgba(255,255,255,0.50)' : '#64748B';
  const statBg        = d ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const statBorder    = d ? 'rgba(0,230,118,0.20)' : 'rgba(249,115,22,0.18)';
  const glowA         = d ? 'rgba(0,230,118,0.12)' : 'rgba(249,115,22,0.06)';
  const glowB         = d ? 'rgba(0,230,118,0.06)' : 'rgba(99,102,241,0.06)';

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const ok = await login({ correo, contrasena });
    if (!ok) return;
    try {
      const token = localStorage.getItem('token') ?? '';
      loginWithToken(token);
      const part  = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { rol } = JSON.parse(atob(part)) as { rol: string };
      router.push(getDefaultRedirect(rol) as any);
    } catch {
      router.push('/dashboard');
    }
  }

  return (
    <main className="flex min-h-screen bg-background">

      {/* ── Panel izquierdo ────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: d
            ? 'linear-gradient(150deg, #080F1A 0%, #031508 35%, #05111A 65%, #080F1A 100%)'
            : 'linear-gradient(150deg, #FFFFFF 0%, #F0FBF5 40%, #EFF6FF 75%, #F8FAFC 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: glowA }} />
        <div className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: d ? 'rgba(0,150,80,0.07)' : 'rgba(99,102,241,0.06)' }} />
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
          <div className="flex gap-3">
            {[
              { icon: <Disc3  className="h-5 w-5" />, bg: d ? 'rgba(0,230,118,0.12)' : 'rgba(249,115,22,0.10)', border: d ? 'rgba(0,230,118,0.22)' : 'rgba(249,115,22,0.22)', color: brand },
              { icon: <Music2 className="h-5 w-5" />, bg: d ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.10)', border: d ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.22)', color: d ? '#a78bfa' : '#8B5CF6' },
              { icon: <Radio  className="h-5 w-5" />, bg: d ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', border: d ? 'rgba(59,130,246,0.24)' : 'rgba(59,130,246,0.20)', color: d ? '#60a5fa' : '#3B82F6' },
            ].map((b, i) => (
              <div key={i} className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: b.bg, border: `1px solid ${b.border}` }}>
                <span style={{ color: b.color }}>{b.icon}</span>
              </div>
            ))}
          </div>

          <div>
            <h1 className="text-5xl font-extrabold leading-tight" style={{ color: titleColor }}>Bienvenido</h1>
            <h1 className="text-5xl font-extrabold leading-tight" style={{ color: brand }}>de nuevo</h1>
          </div>

          <p className="text-base leading-relaxed max-w-sm" style={{ color: subtitleColor }}>
            Consulta inventario, ventas y reportes SQL desde un solo lugar. Tu tienda musical, en control.
          </p>

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

          <DotEqualizer color={brand} light={!d} />
        </div>

        <div className="relative flex items-center gap-4">
          <ThemeSegment />
          <span className="text-xs" style={{ color: d ? 'rgba(255,255,255,0.30)' : '#94A3B8' }}>
            Tema de gestión musical
          </span>
        </div>
      </div>

      {/* ── Panel derecho — formulario ──────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-sm space-y-8">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          {/* Logo móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand">
              <Disc3 className="h-4 w-4 text-brand" />
            </div>
            <span className="font-bold text-foreground">RetroSound</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Accede con tu correo y contraseña.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="admin@retrosound.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <PasswordInput
              label="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full py-3.5 text-sm font-semibold"
            >
              {!isLoading && (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-semibold text-brand transition-colors hover:text-brand-hover">
              Registrarse
            </Link>
          </p>
        </div>
      </div>

    </main>
  );
}
