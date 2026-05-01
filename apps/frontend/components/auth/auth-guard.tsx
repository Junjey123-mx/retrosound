'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface JwtPayload { exp: number; }

function tokenIsValid(token: string): boolean {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part)) as JwtPayload;
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

// Protege todas las rutas del dashboard.
// Redirige a /login si no hay token o si está expirado.
// No renderiza hijos hasta confirmar la sesión (evita flash de contenido).
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !tokenIsValid(token)) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
