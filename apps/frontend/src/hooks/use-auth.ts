'use client';

import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/session-context';

// Returns { correo, rol } for the authenticated user, or null while loading / unauthenticated.
export function useCurrentUser() {
  const { user, hydrated } = useSession();
  if (!hydrated) return null;
  return user ? { correo: user.correo, rol: user.rol } : null;
}

// Returns a logout function that clears session and redirects to /login.
export function useLogout() {
  const navigate = useNavigate();
  const { logout: sessionLogout } = useSession();
  return function logout() {
    sessionLogout();
    navigate('/login');
  };
}
