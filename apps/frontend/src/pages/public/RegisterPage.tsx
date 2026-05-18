'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/lib/services/auth';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeSegment } from '@/components/ui/theme-segment';
import {
  Disc3, AlertCircle, ArrowLeft,
  Music2, Radio, ShoppingCart, Star,
} from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [nombre,     setNombre]     = useState('');
  const [apellido,   setApellido]   = useState('');
  const [correo,     setCorreo]     = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const d = mounted ? theme === 'dark' : false;

  const brand         = d ? '#00E676' : '#F97316';
  const titleColor    = d ? '#FFFFFF' : '#0F172A';
  const subtitleColor = d ? 'rgba(255,255,255,0.50)' : '#64748B';
  const checkColor    = d ? '#00E676' : '#F97316';
  const glowA         = d ? 'rgba(0,230,118,0.10)' : 'rgba(249,115,22,0.06)';
  const glowB         = d ? 'rgba(139,92,246,0.10)' : 'rgba(99,102,241,0.06)';

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.register({ nombre, apellido, correo, contrasena });
      localStorage.setItem('token', data.access_token);
      navigate('/tienda');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  }

  const PERKS = [
    { icon: <ShoppingCart className="h-4 w-4" />, text: 'Explora vinilos, CDs y casetes de colección' },
    { icon: <Star         className="h-4 w-4" />, text: 'Agrega productos a tu carrito y realiza compras' },
    { icon: <Music2       className="h-4 w-4" />, text: 'Consulta el estado de tus órdenes en tiempo real' },
    { icon: <Radio        className="h-4 w-4" />, text: 'Descubre ediciones limitadas y clásicos imperdibles' },
  ];

  return (
    <main className="flex min-h-screen">

      {/* ── Panel izquierdo visual ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: d
            ? 'linear-gradient(150deg, #080F1A 0%, #031508 35%, #05111A 65%, #080F1A 100%)'
            : 'linear-gradient(150deg, #FFFFFF 0%, #F0FBF5 40%, #EFF6FF 75%, #F8FAFC 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: glowB }} />
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: glowA }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border-2"
            style={{ borderColor: brand, backgroundColor: d ? 'rgba(0,230,118,0.10)' : 'rgba(249,115,22,0.12)' }}
          >
            <Disc3 className="h-5 w-5" style={{ color: brand }} />
          </div>
          <span className="text-lg font-bold" style={{ color: titleColor }}>RetroSound</span>
        </div>

        {/* Contenido central */}
        <div className="relative space-y-6">
          {/* Badges decorativos */}
          <div className="flex gap-3">
            {[
              { icon: <Disc3  className="h-5 w-5" />, color: brand, bg: d ? 'rgba(0,230,118,0.12)' : 'rgba(249,115,22,0.14)' },
              { icon: <Music2 className="h-5 w-5" />, color: '#a78bfa', bg: 'rgba(139,92,246,0.14)' },
              { icon: <Radio  className="h-5 w-5" />, color: '#60a5fa', bg: 'rgba(59,130,246,0.14)' },
            ].map((b, i) => (
              <div key={i} className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: b.bg, border: `1px solid ${b.color}35` }}>
                <span style={{ color: b.color }}>{b.icon}</span>
              </div>
            ))}
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight" style={{ color: titleColor }}>Música física,</h1>
            <h1 className="text-4xl font-bold leading-tight" style={{ color: brand }}>para coleccionistas.</h1>
          </div>

          <p className="text-base leading-relaxed max-w-sm" style={{ color: subtitleColor }}>
            Crea tu cuenta y empieza a explorar nuestro catálogo de vinilos, CDs y casetes.
          </p>

          <ul className="space-y-3 pt-2">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-sm" style={{ color: subtitleColor }}>
                <span className="mt-0.5 shrink-0" style={{ color: checkColor }}>{p.icon}</span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-4">
          <ThemeSegment />
          <p className="text-xs" style={{ color: d ? 'rgba(255,255,255,0.30)' : '#94A3B8' }}>RetroSound · BD1</p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <Link to="/" className="rs-back-btn group inline-flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Volver
          </Link>

          {/* Logo móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <Disc3 className="rs-logo-mark h-5 w-5" />
            <span className="font-bold text-foreground">RetroSound</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground">Completa los campos para registrarte.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Juan"
              />
              <Input
                label="Apellido"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                placeholder="García"
              />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="juan@email.com"
            />

            <PasswordInput
              label="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
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
              className="w-full py-3 text-sm font-semibold rs-btn-primary"
            >
              {!isLoading && 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-brand transition-colors hover:text-brand-hover">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

    </main>
  );
}
