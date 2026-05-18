'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { LogOut, Mail, Save, Shield, User } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useClienteMe, useUpdateClienteMe } from '@/hooks/use-clientes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { NotifyModal } from '@/components/ui/notify-modal';

const ROLE_LABELS: Record<string, string> = {
  admin:               'Administrador',
  empleado_ventas:     'Emp. Ventas',
  empleado_inventario: 'Emp. Inventario',
  empleado:            'Empleado',
  cliente:             'Cliente',
  proveedor:           'Proveedor',
};

export function CustomerProfilePage() {
  const user = useCurrentUser();
  const logout = useLogout();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: cliente, isLoading, isError, refetch } = useClienteMe();
  const update = useUpdateClienteMe();

  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', direccion: '' });
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre ?? '',
        apellido: cliente.apellido ?? '',
        telefono: cliente.telefono ?? '',
        direccion: cliente.direccion ?? '',
      });
    }
  }, [cliente]);

  const isDark = mounted ? theme === 'dark' : false;
  const brandColor = isDark ? '#00DC82' : '#F97316';
  const brandBg = isDark ? 'rgba(0,220,130,0.12)' : 'rgba(249,115,22,0.12)';

  const roleLabel = ROLE_LABELS[user?.rol ?? ''] ?? user?.rol ?? '';
  const initials = cliente
    ? `${(cliente.nombre[0] ?? '').toUpperCase()}${(cliente.apellido[0] ?? '').toUpperCase()}`
    : (user?.correo?.[0] ?? '?').toUpperCase();

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!dirty) return;
    try {
      await update.mutateAsync({
        nombre: form.nombre.trim() || undefined,
        apellido: form.apellido.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      });
      setDirty(false);
      setNotify({ type: 'success', title: 'Perfil actualizado', message: 'Tus datos se guardaron correctamente.' });
    } catch (err: unknown) {
      setNotify({
        type: 'error',
        title: 'No se pudo actualizar',
        message: (err as Error).message ?? 'Intenta de nuevo en unos segundos.',
      });
    }
  };

  return (
    <main className="rs-store-bg relative min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Mi perfil</h1>
          <p className="mt-2 text-base font-semibold text-muted-foreground">
            Administra la información de tu cuenta en RetroSound.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.38fr_1fr]">
          {/* Tarjeta lateral */}
          <Card className="h-fit bg-white dark:bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div
                  style={{ backgroundColor: brandColor }}
                  className="flex h-20 w-20 select-none items-center justify-center rounded-full text-2xl font-extrabold text-white"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                {cliente && (
                  <p className="mt-4 text-lg font-extrabold text-foreground">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                )}
                {user && (
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{user.correo}</p>
                )}
                {roleLabel && (
                  <span
                    style={{ backgroundColor: brandBg, color: brandColor }}
                    className="mt-3 inline-flex rounded-full border border-transparent px-3 py-0.5 text-xs font-semibold"
                  >
                    {roleLabel}
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6">
                {user && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{user.correo}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>{roleLabel}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rs-btn-outline-danger"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Formulario principal */}
          <div className="space-y-6">
            {isLoading && <LoadingState label="Cargando perfil..." />}

            {isError && (
              <ErrorState
                title="No se pudo cargar el perfil"
                description="Verifica tu conexión e intenta de nuevo."
                action={
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Reintentar
                  </Button>
                }
              />
            )}

            {!isLoading && !isError && (
              <Card className="bg-white dark:bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                    <User className="h-5 w-5 text-brand" />
                    Datos personales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="nombre"
                      label="Nombre"
                      value={form.nombre}
                      onChange={(e) => setField('nombre', e.target.value)}
                      placeholder="Tu nombre"
                    />
                    <Input
                      id="apellido"
                      label="Apellido"
                      value={form.apellido}
                      onChange={(e) => setField('apellido', e.target.value)}
                      placeholder="Tu apellido"
                    />
                    <Input
                      id="telefono"
                      label="Teléfono"
                      value={form.telefono}
                      onChange={(e) => setField('telefono', e.target.value)}
                      placeholder="+502 5678 9012"
                    />
                    <Input
                      id="direccion"
                      label="Dirección"
                      value={form.direccion}
                      onChange={(e) => setField('direccion', e.target.value)}
                      placeholder="Tu dirección de entrega"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !isError && (
              <Card className="bg-white dark:bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                    <Mail className="h-5 w-5 text-brand" />
                    Cuenta (solo lectura)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Correo electrónico"
                      value={user?.correo ?? ''}
                      readOnly
                      className="bg-muted/40"
                    />
                    <Input
                      label="Rol"
                      value={roleLabel}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !isError && (
              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={update.isPending}
                  loading={update.isPending}
                  onClick={handleSave}
                  className="rs-btn-primary"
                >
                  {!update.isPending && <Save className="h-4 w-4" />}
                  Guardar cambios
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {notify && (
        <NotifyModal
          type={notify.type}
          title={notify.title}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}
    </main>
  );
}
