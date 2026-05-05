import { AuthGuard } from '@/components/auth/auth-guard';
import { ClientNavbar } from '@/components/cliente/client-navbar';

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar />
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
