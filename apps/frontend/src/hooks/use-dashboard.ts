import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/services/dashboard';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardService.getAdminDashboard(),
    staleTime: 60_000,
    retry: 1,
  });
}
