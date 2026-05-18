'use client';

import { Outlet } from 'react-router-dom';
import { RoleNavbar } from './role-navbar';

function MusicDecorations() {
  const brand = 'hsl(var(--brand))';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">

      {/* ── Ondas de sonido — arriba derecha ── */}
      <svg
        className="absolute -right-16 -top-8 w-[520px] opacity-[0.08]"
        viewBox="0 0 520 240"
        fill="none"
      >
        {[0, 20, 40, 60, 80].map((dy) => (
          <path
            key={dy}
            d={`M-20,${120 + dy} C70,${45 + dy} 150,${195 + dy} 230,${120 + dy} C310,${45 + dy} 390,${195 + dy} 470,${120 + dy} C505,${82 + dy} 520,${105 + dy} 540,${120 + dy}`}
            stroke={brand}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* ── Nota musical simple — izquierda media ── */}
      <svg
        className="absolute left-[4%] top-[22%] opacity-[0.10]"
        width="40" height="48" viewBox="0 0 40 48" fill={brand}
      >
        {/* cabeza */}
        <ellipse cx="10" cy="40" rx="10" ry="7" transform="rotate(-12 10 40)" />
        {/* palo */}
        <rect x="19" y="0" width="2.5" height="40" />
        {/* bandera */}
        <path d="M19.5,0 C28,3 36,8 36,15 C36,20 28,19 19.5,14 Z" />
      </svg>

      {/* ── Doble corchea — derecha baja ── */}
      <svg
        className="absolute right-[6%] bottom-[28%] opacity-[0.09]"
        width="68" height="48" viewBox="0 0 68 48" fill={brand}
      >
        {/* nota 1 */}
        <ellipse cx="10" cy="40" rx="10" ry="7" transform="rotate(-12 10 40)" />
        <rect x="19" y="4" width="2.5" height="36" />
        {/* nota 2 */}
        <ellipse cx="36" cy="40" rx="10" ry="7" transform="rotate(-12 36 40)" />
        <rect x="45" y="4" width="2.5" height="36" />
        {/* barras que unen */}
        <rect x="19" y="4" width="28.5" height="3" />
        <rect x="19" y="12" width="28.5" height="3" />
      </svg>

      {/* ── Anillos de sonido (vinilo/ondas) — abajo izquierda ── */}
      <svg
        className="absolute -bottom-8 -left-8 w-[260px] opacity-[0.07]"
        viewBox="0 0 260 260"
        fill="none"
      >
        <circle cx="130" cy="130" r="30"  stroke={brand} strokeWidth="1.5" />
        <circle cx="130" cy="130" r="60"  stroke={brand} strokeWidth="1.5" />
        <circle cx="130" cy="130" r="90"  stroke={brand} strokeWidth="1.5" />
        <circle cx="130" cy="130" r="120" stroke={brand} strokeWidth="1.5" />
        <circle cx="130" cy="130" r="5"   fill={brand} />
      </svg>

      {/* ── Ondas de sonido — abajo izquierda ── */}
      <svg
        className="absolute -bottom-4 left-[15%] w-[380px] opacity-[0.06]"
        viewBox="0 0 380 140"
        fill="none"
      >
        {[0, 16, 32].map((dy) => (
          <path
            key={dy}
            d={`M-20,${70 + dy} C60,${20 + dy} 130,${120 + dy} 200,${70 + dy} C270,${20 + dy} 340,${90 + dy} 400,${70 + dy}`}
            stroke={brand}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* ── Nota al centro derecha — decorativa ── */}
      <svg
        className="absolute right-[3%] top-[45%] opacity-[0.07]"
        width="26" height="32" viewBox="0 0 26 32" fill={brand}
      >
        <ellipse cx="8" cy="27" rx="8" ry="5.5" transform="rotate(-12 8 27)" />
        <rect x="15" y="0" width="2" height="27" />
        <path d="M15,0 C20,2 24,5 24,10 C24,14 20,13 15,10 Z" />
      </svg>

    </div>
  );
}

export function ClienteShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rs-store-bg relative flex min-h-screen flex-col overflow-hidden">
      <MusicDecorations />
      <RoleNavbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
