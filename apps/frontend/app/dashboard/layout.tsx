import { RoleNavbar } from '@/components/layout/role-navbar';
import { RoleGuard } from '@/components/guards/role-guard';
import { ROLES } from '@/lib/auth/roles';

const STAFF_ROLES = [ROLES.ADMIN, ROLES.EMPLEADO_VENTAS, ROLES.EMPLEADO_INVENTARIO];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <RoleNavbar />
      <RoleGuard allowed={STAFF_ROLES}>{children}</RoleGuard>
    </div>
  );
}
