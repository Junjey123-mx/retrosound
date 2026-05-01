import { TopNav } from '@/components/layout/top-nav';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
