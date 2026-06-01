'use client';

import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/session-context';
import { authService } from '@/lib/services/auth';

// Returns { correo, rol } for the authenticated user, or null while loading / unauthenticated.
export function useCurrentUser() {
  const { user, hydrated } = useSession();
  if (!hydrated) return null;
  return user ? { correo: user.correo, rol: user.rol } : null;
}

// Returns a logout function that notifies the backend then clears session and redirects to /login.
export function useLogout() {
  const navigate = useNavigate();
  const { logout: sessionLogout } = useSession();
  return async function logout() {
    try {
      await authService.logout();
    } catch {
      // local logout continues even if backend call fails
    }
    sessionLogout();
    navigate('/login');
  };
}
