import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import {
  useProveedorProductos,
  useRegistrarProveedorEntrega,
} from '@/hooks/use-proveedor-portal';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { NotifyModal } from '@/components/ui/notify-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ROUTES } from '@/lib/constants/routes';

interface FormState {
  idProducto: string;
  cantidadReportada: string;
  costoUnitario: string;
}

interface FormErrors {
  idProducto?: string;
  cantidadReportada?: string;
  costoUnitario?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.idProducto) {
    errors.idProducto = 'Selecciona un producto.';
  }

  const cantidad = Number(form.cantidadReportada);
  if (!form.cantidadReportada || isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad < 1) {
    errors.cantidadReportada = 'La cantidad debe ser un entero mayor a 0.';
  }

  const costo = Number(form.costoUnitario);
  if (form.costoUnitario === '' || isNaN(costo) || costo < 0) {
    errors.costoUnitario = 'El costo unitario debe ser un número mayor o igual a 0.';
  }

  return errors;
}

function NuevaEntregaContent() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    idProducto: '',
    cantidadReportada: '',
    costoUnitario: '',
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [notify, setNotify]   = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const { data: productosData, isLoading: loadingProductos, error: errorProductos } =
    useProveedorProductos({ page: 1, limit: 100 });

  const registrar = useRegistrarProveedorEntrega();

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    registrar.mutate(
      {
        idProducto:        Number(form.idProducto),
        cantidadReportada: Number(form.cantidadReportada),
        costoUnitario:     Number(form.costoUnitario),
      },
      {
        onSuccess: (result) => {
          setNotify({
            type: 'success',
            title: 'Entrega registrada',
            message: `Entrega #${result.idCompra} creada con estado "${result.estado}".`,
          });
        },
        onError: (err) => {
          setNotify({
            type: 'error',
            title: 'Error al registrar',
            message: err instanceof Error ? err.message : 'Error inesperado.',
          });
        },
      },
    );
  }

  if (loadingProductos) {
    return (
      <main className="p-6 sm:p-8">
        <PageHeader
          title="Registrar entrega"
          description="Registra una nueva entrega de producto"
          icon={<ClipboardList className="h-5 w-5" />}
          backHref={ROUTES.proveedor.entregas as any}
        />
        <LoadingState variant="page" label="Cargando productos…" />
      </main>
    );
  }

  if (errorProductos) {
    return (
      <main className="p-6 sm:p-8">
        <PageHeader
          title="Registrar entrega"
          description="Registra una nueva entrega de producto"
          icon={<ClipboardList className="h-5 w-5" />}
          backHref={ROUTES.proveedor.entregas as any}
        />
        <ErrorState title="Error al cargar productos" error={errorProductos} />
      </main>
    );
  }

  const productos = productosData?.data ?? [];

  return (
    <main className="p-6 sm:p-8">
      <PageHeader
        title="Registrar entrega"
        description="Registra una nueva entrega de producto"
        icon={<ClipboardList className="h-5 w-5" />}
        backHref={ROUTES.proveedor.entregas as any}
      />

      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                id="idProducto"
                label="Producto *"
                value={form.idProducto}
                onChange={(e) => handleChange('idProducto', e.target.value)}
                placeholder="Selecciona un producto…"
                error={errors.idProducto}
              >
                {productos.map((p) => (
                  <option key={p.idProducto} value={String(p.idProducto)}>
                    {p.tituloProducto} — SKU: {p.codigoSku}
                  </option>
                ))}
              </Select>

              <Input
                id="cantidadReportada"
                label="Cantidad reportada *"
                type="number"
                min={1}
                step={1}
                value={form.cantidadReportada}
                onChange={(e) => handleChange('cantidadReportada', e.target.value)}
                placeholder="Ej. 50"
                error={errors.cantidadReportada}
              />

              <Input
                id="costoUnitario"
                label="Costo unitario (Q) *"
                type="number"
                min={0}
                step="0.01"
                value={form.costoUnitario}
                onChange={(e) => handleChange('costoUnitario', e.target.value)}
                placeholder="Ej. 125.00"
                error={errors.costoUnitario}
              />

              {form.idProducto && form.cantidadReportada && form.costoUnitario && (
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                  <p className="text-muted-foreground">Total estimado</p>
                  <p className="mt-0.5 text-lg font-semibold text-foreground">
                    Q{(Number(form.cantidadReportada) * Number(form.costoUnitario)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(ROUTES.proveedor.entregas as any)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={registrar.isPending}
                  disabled={registrar.isPending}
                >
                  Registrar entrega
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {notify && (
        <NotifyModal
          type={notify.type}
          title={notify.title}
          message={notify.message}
          onClose={() => {
            setNotify(null);
            if (notify.type === 'success') {
              navigate(ROUTES.proveedor.entregas as any);
            }
          }}
        />
      )}
    </main>
  );
}

export function NewProviderDeliveryPage() {
  return <NuevaEntregaContent />;
}
