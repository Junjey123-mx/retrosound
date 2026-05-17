import { apiClient } from '../api/client';

interface LoginPayload { correo: string; contrasena: string; }
interface RegisterPayload { correo: string; contrasena: string; nombre: string; apellido: string; }
interface AuthResponse { access_token: string; }

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload),
};
