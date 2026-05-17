'use client';

import { useRouter } from 'next/navigation';
import { Disc3, ShieldOff } from 'lucide-react';
import { clearSession } from '@/lib/auth/session';

export default function ForbiddenPage() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F6F8FB] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8EDF4] bg-white p-10 text-center shadow-sm">

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4ED] border-2 border-[rgba(249,115,22,0.25)]">
            <ShieldOff className="h-8 w-8 text-[#F97316]" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Acceso denegado</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#475569]">
          No tienes permiso para acceder a esta sección.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#F97316' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EA580C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; }}
          >
            Volver al inicio
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-[#E8EDF4] py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F6F8FB]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-[#94A3B8]">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(249,115,22,0.3)] bg-[rgba(249,115,22,0.06)]">
          <Disc3 className="h-3 w-3 text-[#F97316]" />
        </div>
        <span className="font-semibold tracking-widest uppercase text-xs">RetroSound Store</span>
      </div>
    </main>
  );
}
