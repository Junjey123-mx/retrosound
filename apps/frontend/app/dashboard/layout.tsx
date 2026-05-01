import { TopNav } from '@/components/layout/top-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {children}
    </div>
  );
}
