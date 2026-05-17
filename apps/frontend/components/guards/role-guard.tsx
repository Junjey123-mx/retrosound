'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUser, isSessionValid } from '@/lib/auth/session';
import type { Role } from '@/lib/auth/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  allowed: Role[];
}

export function RoleGuard({ children, allowed }: RoleGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSessionValid()) {
      router.push('/login');
      return;
    }
    const user = getSessionUser();
    if (!user || !allowed.includes(user.rol as Role)) {
      router.push('/403');
      return;
    }
    setReady(true);
  }, [router, allowed]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#F97316' }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
