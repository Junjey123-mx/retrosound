import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from './protected-route';

type MockSession = {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: { sub: number; correo: string; rol: string } | null;
};

let mockSession: MockSession;

vi.mock('@/contexts/session-context', () => ({
  useSession: () => ({
    token: mockSession.isAuthenticated ? 'token' : null,
    loginWithToken: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    clearSession: vi.fn(),
    ...mockSession,
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname}</p>;
}

function renderProtected(allowedRoles?: string[]) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={allowedRoles as never}>
              <p>Contenido protegido</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LocationProbe />} />
        <Route path="/403" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockSession = {
      hydrated: true,
      isAuthenticated: true,
      user: { sub: 1, correo: 'admin@retrosound.test', rol: 'admin' },
    };
  });

  it('renderiza children cuando hay sesión válida y rol permitido', () => {
    renderProtected(['admin']);

    expect(screen.getByText('Contenido protegido')).toBeTruthy();
  });

  it('redirige a login cuando no hay sesión autenticada', () => {
    mockSession = { hydrated: true, isAuthenticated: false, user: null };

    renderProtected(['admin']);

    expect(screen.queryByText('Contenido protegido')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/login');
  });

  it('redirige a 403 cuando el rol no está permitido', () => {
    mockSession = {
      hydrated: true,
      isAuthenticated: true,
      user: { sub: 2, correo: 'cliente@retrosound.test', rol: 'cliente' },
    };

    renderProtected(['admin']);

    expect(screen.queryByText('Contenido protegido')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/403');
  });
});
