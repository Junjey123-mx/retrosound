'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/auth';
import { PasswordInput } from '@/components/ui/password-input';
import { Disc3, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const [nombre,    setNombre]    = useState('');
  const [apellido,  setApellido]  = useState('');
  const [correo,    setCorreo]    = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.register({ nombre, apellido, correo, contrasena });
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  }

  const PERKS = [
    'Gestión de productos (vinilos, CDs, casetes)',
    'Registro de ventas con transacciones SQL explícitas',
    'Reportes avanzados: JOINs, CTEs, HAVING',
    'Control de proveedores e inventario',
  ];

  return (
    <main className="flex min-h-screen">

      {/* ── Panel izquierdo visual ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0F172A] p-12 text-white relative overflow-hidden">

        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <Disc3 className="rs-logo-mark h-6 w-6" />
          <span className="text-lg font-bold">RetroSound</span>
        </div>

        {/* Contenido central */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Tu tienda musical,<br />en un solo lugar
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-sm">
            Crea tu cuenta y accede a la plataforma completa de gestión de RetroSound Store.
          </p>

          <ul className="space-y-3 pt-2">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/70">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-brand" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/30">
          RetroSound Store · Proyecto 2 — Bases de Datos 1
        </p>
      </div>

      {/* ── Panel derecho — formulario ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <Disc3 className="rs-logo-mark h-5 w-5" />
            <span className="font-bold text-foreground">RetroSound</span>
          </div>

          {/* Encabezado */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground">Completa los campos para registrarte.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Juan"
                  className="w-full rounded-xl border border-input bg-input-bg px-4 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                  placeholder="García"
                  className="w-full rounded-xl border border-input bg-input-bg px-4 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="juan@email.com"
                className="w-full rounded-xl border border-input bg-input-bg px-4 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition"
              />
            </div>

            <PasswordInput
              label="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
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
              className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-brand transition-colors hover:text-brand-hover">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
