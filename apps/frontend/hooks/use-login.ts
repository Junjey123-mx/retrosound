'use client';

import { useState } from 'react';
import { authService } from '@/lib/services/auth';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function login(payload: { correo: string; contrasena: string }) {
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.login(payload);
      localStorage.setItem('token', data.access_token);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
