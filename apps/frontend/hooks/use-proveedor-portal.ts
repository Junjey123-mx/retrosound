'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  proveedorPortalService,
  type ProductosQuery,
  type EntregasQuery,
} from '@/lib/services/proveedor-portal';
import type {
  UpdateProveedorProductoDto,
  UpdateProveedorProductoImagenDto,
  RegistrarEntregaProveedorDto,
  UpdateProveedorPerfilDto,
} from '@/types';

export function useProveedorMe() {
  return useQuery({
    queryKey: ['proveedor', 'me'],
    queryFn: proveedorPortalService.getMe,
    staleTime: 60_000,
  });
}

export function useProveedorDashboard() {
  return useQuery({
    queryKey: ['proveedor', 'dashboard'],
    queryFn: proveedorPortalService.getDashboard,
    staleTime: 30_000,
  });
}

export function useProveedorProductos(query: ProductosQuery = {}) {
  return useQuery({
    queryKey: ['proveedor', 'productos', query],
    queryFn: () => proveedorPortalService.getProductos(query),
    staleTime: 30_000,
  });
}

export function useProveedorProducto(id: number) {
  return useQuery({
    queryKey: ['proveedor', 'productos', id],
    queryFn: () => proveedorPortalService.getProductoById(id),
    enabled: id > 0,
    staleTime: 30_000,
  });
}

export function useUpdateProveedorProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProveedorProductoDto }) =>
      proveedorPortalService.updateProducto(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedor', 'productos'] });
    },
  });
}

export function useUpdateProveedorProductoImagen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProveedorProductoImagenDto }) =>
      proveedorPortalService.updateProductoImagen(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedor', 'productos'] });
    },
  });
}

export function useProveedorEntregas(query: EntregasQuery = {}) {
  return useQuery({
    queryKey: ['proveedor', 'entregas', query],
    queryFn: () => proveedorPortalService.getEntregas(query),
    staleTime: 30_000,
  });
}

export function useProveedorEntrega(id: number) {
  return useQuery({
    queryKey: ['proveedor', 'entregas', id],
    queryFn: () => proveedorPortalService.getEntregaById(id),
    enabled: id > 0,
    staleTime: 30_000,
  });
}

export function useRegistrarProveedorEntrega() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarEntregaProveedorDto) =>
      proveedorPortalService.registrarEntrega(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedor', 'entregas'] });
      queryClient.invalidateQueries({ queryKey: ['proveedor', 'dashboard'] });
    },
  });
}

export function useProveedorPerfil() {
  return useQuery({
    queryKey: ['proveedor', 'perfil'],
    queryFn: proveedorPortalService.getPerfil,
    staleTime: 60_000,
  });
}

export function useUpdateProveedorPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProveedorPerfilDto) =>
      proveedorPortalService.updatePerfil(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedor', 'perfil'] });
      queryClient.invalidateQueries({ queryKey: ['proveedor', 'me'] });
    },
  });
}
