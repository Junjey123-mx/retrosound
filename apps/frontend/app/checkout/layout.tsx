import { RoleNavbar } from '@/components/layout/role-navbar';
import { RoleGuard } from '@/components/guards/role-guard';
import { ROLES } from '@/lib/auth/roles';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <RoleNavbar />
      <RoleGuard allowed={[ROLES.CLIENTE]}>{children}</RoleGuard>
    </div>
  );
}
