interface JwtPayload {
  sub:    number;
  correo: string;
  rol:    string;
  exp:    number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getSessionUser(): { sub: number; correo: string; rol: string } | null {
  const token = getSessionToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || payload.exp <= Date.now() / 1000) return null;
  return { sub: payload.sub, correo: payload.correo, rol: payload.rol };
}

export function isSessionValid(): boolean {
  const token = getSessionToken();
  if (!token) return false;
  const payload = decodeJwt(token);
  return !!payload && payload.exp > Date.now() / 1000;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}
