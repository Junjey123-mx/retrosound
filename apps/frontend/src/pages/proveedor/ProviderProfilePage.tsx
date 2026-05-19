import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useProveedorPerfil, useUpdateProveedorPerfil } from '@/hooks/use-proveedor-portal';
import type { UpdateProveedorPerfilDto } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotifyModal } from '@/components/ui/notify-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

interface FormState {
  nombreProveedor: string;
  telefonoProveedor: string;
  correoProveedor: string;
  direccionProveedor: string;
  nombreContacto: string;
}

function toForm(data: {
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  nombreContacto: string | null;
}): FormState {
  return {
    nombreProveedor:    data.nombre ?? '',
    telefonoProveedor:  data.telefono ?? '',
    correoProveedor:    data.correo ?? '',
    direccionProveedor: data.direccion ?? '',
    nombreContacto:     data.nombreContacto ?? '',
  };
}

function isDirty(original: FormState, current: FormState): boolean {
  return (Object.keys(original) as (keyof FormState)[]).some(
    (k) => original[k] !== current[k],
  );
}

function buildDto(original: FormState, current: FormState): UpdateProveedorPerfilDto {
  const dto: UpdateProveedorPerfilDto = {};
  if (current.nombreProveedor !== original.nombreProveedor)
    dto.nombreProveedor = current.nombreProveedor;
  if (current.telefonoProveedor !== original.telefonoProveedor)
    dto.telefonoProveedor = current.telefonoProveedor;
  if (current.correoProveedor !== original.correoProveedor)
    dto.correoProveedor = current.correoProveedor;
  if (current.direccionProveedor !== original.direccionProveedor)
    dto.direccionProveedor = current.direccionProveedor;
  if (current.nombreContacto !== original.nombreContacto)
    dto.nombreContacto = current.nombreContacto;
  return dto;
}

function PerfilContent() {
  const { data, isLoading, error } = useProveedorPerfil();
  const updatePerfil = useUpdateProveedorPerfil();

  const [original, setOriginal]   = useState<FormState | null>(null);
  const [form, setForm]           = useState<FormState | null>(null);
  const [notify, setNotify]       = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (data && !original) {
      const f = toForm(data);
      setOriginal(f);
      setForm(f);
    }
  }, [data, original]);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !original || !isDirty(original, form)) return;
    const dto = buildDto(original, form);
    updatePerfil.mutate(dto, {
      onSuccess: (result) => {
        const updated = toForm(result);
        setOriginal(updated);
        setForm(updated);
        setNotify({ type: 'success', title: 'Perfil actualizado', message: result.mensaje ?? 'Cambios guardados correctamente.' });
      },
      onError: (err) => {
        setNotify({ type: 'error', title: 'Error al guardar', message: err instanceof Error ? err.message : 'Error inesperado.' });
      },
    });
  }

  if (isLoading) {
    return (
      <main className="space-y-6 p-6 sm:p-8">
        <PageHeader
          title="Mi perfil"
          description="Revisa y actualiza la información de tu cuenta proveedor"
          icon={<User className="h-5 w-5" />}
          backHref="/proveedor"
        />
        <LoadingState variant="cards" label="Cargando perfil…" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="p-6 sm:p-8">
        <PageHeader
          title="Mi perfil"
          description="Revisa y actualiza la información de tu cuenta proveedor"
          icon={<User className="h-5 w-5" />}
          backHref="/proveedor"
        />
        <ErrorState title="Error al cargar el perfil" error={error} />
      </main>
    );
  }

  const dirty    = form && original ? isDirty(original, form) : false;
  const disabled = updatePerfil.isPending;

  return (
    <main className="space-y-6 p-6 sm:p-8">
      <PageHeader
        title="Mi perfil"
        description="Revisa y actualiza la información de tu cuenta proveedor"
        icon={<User className="h-5 w-5" />}
        backHref="/proveedor"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* card lateral resumen */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{data.nombre}</p>
              <p className="text-sm text-muted-foreground">{data.correo ?? '—'}</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">ID proveedor</p>
              <p className="font-mono text-foreground">{data.idProveedor}</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Estado</p>
              <Badge variant={data.estado === 'activo' ? 'success' : 'muted'}>
                {data.estado}
              </Badge>
            </div>
            {data.telefono && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Teléfono</p>
                <p className="text-foreground">{data.telefono}</p>
              </div>
            )}
            {data.nombreContacto && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Contacto</p>
                <p className="text-foreground">{data.nombreContacto}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* formulario edición */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar información</CardTitle>
          </CardHeader>
          <CardContent>
            {form && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="nombreProveedor"
                  label="Nombre proveedor"
                  value={form.nombreProveedor}
                  onChange={(e) => handleChange('nombreProveedor', e.target.value)}
                  placeholder="Nombre del proveedor"
                />
                <Input
                  id="nombreContacto"
                  label="Nombre de contacto"
                  value={form.nombreContacto}
                  onChange={(e) => handleChange('nombreContacto', e.target.value)}
                  placeholder="Nombre de la persona de contacto"
                />
                <Input
                  id="correoProveedor"
                  label="Correo electrónico"
                  type="email"
                  value={form.correoProveedor}
                  onChange={(e) => handleChange('correoProveedor', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                <Input
                  id="telefonoProveedor"
                  label="Teléfono"
                  type="tel"
                  value={form.telefonoProveedor}
                  onChange={(e) => handleChange('telefonoProveedor', e.target.value)}
                  placeholder="+502 1234-5678"
                />
                <Input
                  id="direccionProveedor"
                  label="Dirección"
                  value={form.direccionProveedor}
                  onChange={(e) => handleChange('direccionProveedor', e.target.value)}
                  placeholder="Dirección del proveedor"
                />

                <p className="text-xs text-muted-foreground">
                  Los campos como estado e ID proveedor son administrados por el sistema y no son editables aquí.
                </p>

                <Button
                  type="submit"
                  loading={updatePerfil.isPending}
                  disabled={disabled}
                  className="w-full py-3 text-sm font-semibold rs-btn-primary"
                >
                  {dirty ? 'Guardar cambios' : 'Sin cambios'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
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

export function ProviderProfilePage() {
  return <PerfilContent />;
}
