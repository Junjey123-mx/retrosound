'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionValid } from '@/lib/auth/session';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSessionValid()) {
      router.push('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
