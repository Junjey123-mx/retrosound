'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/hooks/use-login';
import { PasswordInput } from '@/components/ui/password-input';
import { Disc3, Music2, Radio, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const ok = await login({ correo, contrasena });
    if (ok) router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen">

      {/* ── Panel izquierdo visual ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0F172A] p-12 text-white relative overflow-hidden">

        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-green-400/5 blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <Disc3 className="h-6 w-6 text-green-400" />
          <span className="text-lg font-bold">RetroSound</span>
        </div>

        {/* Contenido central */}
        <div className="relative space-y-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <Disc3 className="h-5 w-5" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <Music2 className="h-5 w-5" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Radio className="h-5 w-5" />
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Bienvenido<br />de nuevo
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-sm">
            Consulta inventario, ventas y reportes SQL desde un solo lugar. Tu tienda musical, en control.
          </p>

          {/* Stats visuales */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { num: '500+', label: 'Productos' },
              { num: '8', label: 'Reportes SQL' },
              { num: 'Q0', label: 'Costo' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-xl font-bold text-green-400">{s.num}</p>
                <p className="text-xs text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer del panel */}
        <p className="relative text-xs text-white/30">
          RetroSound Store · Plataforma de gestión musical
        </p>
      </div>

      {/* ── Panel derecho — formulario ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <Disc3 className="h-5 w-5 text-green-500" />
            <span className="font-bold text-foreground">RetroSound</span>
          </div>

          {/* Encabezado */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Accede con tu correo y contraseña.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="admin@retrosound.com"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <PasswordInput
              label="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#0F172A] py-3 text-sm font-semibold text-white hover:bg-[#1e293b] active:scale-[0.98] transition disabled:opacity-50 dark:bg-white dark:text-[#0F172A] dark:hover:bg-white/90"
            >
              {isLoading ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-medium text-green-600 hover:text-green-500 transition-colors">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
