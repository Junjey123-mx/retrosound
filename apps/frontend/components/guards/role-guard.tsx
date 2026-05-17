'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import type { Role } from '@/lib/auth/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  allowed: Role[];
  fallback?: string;
}

export function RoleGuard({ children, allowed, fallback = '/dashboard' }: RoleGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || !allowed.includes(user.rol as Role)) {
      router.push(fallback);
      return;
    }
    setReady(true);
  }, [router, allowed, fallback]);

  if (!ready) return null;
  return <>{children}</>;
}
