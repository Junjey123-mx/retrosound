import { RoleGuard } from '@/components/guards/role-guard';
import { ROLES } from '@/lib/auth/roles';

export default function ProveedorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <RoleGuard allowed={[ROLES.PROVEEDOR]}>{children}</RoleGuard>
    </div>
  );
}
