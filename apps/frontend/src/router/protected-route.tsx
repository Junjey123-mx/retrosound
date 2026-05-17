import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useSession } from '@/contexts/session-context';
import type { Role } from '@/lib/auth/roles';
import { ROUTE_PATHS } from './route-paths';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Role[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { hydrated, isAuthenticated, user } = useSession();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background text-foreground">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#F97316' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.PUBLIC.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.rol as Role))) {
    return <Navigate to={ROUTE_PATHS.PUBLIC.ACCESS_DENIED} replace />;
  }

  return <>{children}</>;
}
