'use client';

import type { ReactNode } from 'react';

import type { Role } from '@/lib/auth/roles';
import { ProtectedRoute } from '@/router/protected-route';

interface RoleGuardProps {
  children: ReactNode;
  allowed: Role[];
}

export function RoleGuard({ children, allowed }: RoleGuardProps) {
  return <ProtectedRoute allowedRoles={allowed}>{children}</ProtectedRoute>;
}
