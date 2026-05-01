'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface JwtPayload {
  sub:    number;
  correo: string;
  rol:    string;
  exp:    number;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part)) as JwtPayload;
  } catch {
    return null;
  }
}

// Devuelve el usuario actual decodificando el JWT almacenado en localStorage.
// Retorna null si no hay sesión o si el token está expirado.
export function useCurrentUser() {
  const [user, setUser] = useState<{ correo: string; rol: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = decodeToken(token);
    if (payload && payload.exp > Date.now() / 1000) {
      setUser({ correo: payload.correo, rol: payload.rol });
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  return user;
}

// Hook de logout: limpia el token y redirige a /login.
export function useLogout() {
  const router = useRouter();
  return function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  };
}
