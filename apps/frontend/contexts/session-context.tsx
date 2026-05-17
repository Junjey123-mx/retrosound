'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSessionUser, clearSession as storageClear } from '@/lib/auth/session';

// ─── types ─────────────────────────────────────────────────────────────────────

interface SessionUser {
  sub: number;
  correo: string;
  rol: string;
}

interface SessionState {
  token: string | null;
  user: SessionUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

interface SessionContextValue extends SessionState {
  loginWithToken: (token: string) => void;
  logout: () => void;
  refreshSession: () => void;
  clearSession: () => void;
}

// ─── context ───────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null);

// Reads current token + decoded user from localStorage (client-only).
function readStorage(): Pick<SessionState, 'token' | 'user' | 'isAuthenticated'> {
  const token = localStorage.getItem('token') ?? null;
  const user  = token ? getSessionUser() : null;
  return { token, user, isAuthenticated: !!user };
}

// ─── provider ──────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    token: null,
    user: null,
    isAuthenticated: false,
    hydrated: false,
  });

  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    setState({ ...readStorage(), hydrated: true });
  }, []);

  const loginWithToken = useCallback((token: string) => {
    localStorage.setItem('token', token);
    const user = getSessionUser();
    setState({ token, user, isAuthenticated: !!user, hydrated: true });
  }, []);

  const logout = useCallback(() => {
    storageClear();
    setState({ token: null, user: null, isAuthenticated: false, hydrated: true });
  }, []);

  const refreshSession = useCallback(() => {
    setState((prev) => ({ ...readStorage(), hydrated: prev.hydrated }));
  }, []);

  const clearSession = useCallback(() => {
    storageClear();
    setState({ token: null, user: null, isAuthenticated: false, hydrated: true });
  }, []);

  return (
    <SessionContext.Provider
      value={{ ...state, loginWithToken, logout, refreshSession, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

// ─── hook ──────────────────────────────────────────────────────────────────────

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
