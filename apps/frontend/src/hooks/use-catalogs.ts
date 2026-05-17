import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Categoria, Formato } from '@/types';

export function useCatalogos() {
  return useQuery({
    queryKey: ['catalogos'],
    queryFn: async () => {
      const [categorias, formatos] = await Promise.all([
        apiClient.get<Categoria[]>('/catalogs/categorias'),
        apiClient.get<Formato[]>('/catalogs/formatos'),
      ]);
      return { categorias, formatos };
    },
    staleTime: 5 * 60 * 1000,
  });
}
