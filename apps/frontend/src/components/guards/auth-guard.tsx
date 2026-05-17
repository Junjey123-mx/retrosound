'use client';

import type { ReactNode } from 'react';

import { ProtectedRoute } from '@/router/protected-route';

export function AuthGuard({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
