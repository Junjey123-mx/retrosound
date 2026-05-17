'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, ShoppingCart, Receipt } from 'lucide-react';
import { RoleGuard } from '@/components/guards/role-guard';
import { useProductos }   from '@/hooks/use-productos';
import { useClientes }    from '@/hooks/use-clientes';
import { useCreateVenta } from '@/hooks/use-ventas';
import { Button }       from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SearchInput }  from '@/components/ui/search-input';
import { NotifyModal }  from '@/components/ui/notify-modal';

// ─── types ─────────────────────────────────────────────────────────────────────

type CartItem = {
  idProducto:     number;
  titulo:         string;
  precioUnitario: number;
  stockActual:    number;
  cantidadVendida: number;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const METODOS = ['efectivo', 'tarjeta', 'transferencia', 'cheque'];

function today() {
  return new Date().toISOString().split('T')[0];
}

function formatQ(n: number) {
  return `Q${n.toFixed(2)}`;
}

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

// ─── page ─────────────────────────────────────────────────────────────────────

function NuevaVentaContent() {
  const router = useRouter();
  const { data: productos }  = useProductos();
  const { data: clientes }   = useClientes();
  const createVenta          = useCreateVenta();

  // form state
  const [idCliente,   setIdCliente]   = useState<number | ''>('');
  const [metodoPago,  setMetodoPago]  = useState('efectivo');
  const [fechaVenta,  setFechaVenta]  = useState(today);
  const [descuento,   setDescuento]   = useState(0);

  // cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // product search / add panel
  const [productoSearch,    setProductoSearch]    = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [cantidadInput,     setCantidadInput]     = useState(1);

  // feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [notify,    setNotify]    = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  // ── computed ─────────────────────────────────────────────────────────────────

  const productosFiltrados = useMemo(() => {
    if (!productoSearch.trim()) return productos ?? [];
    const q = productoSearch.toLowerCase();
    return (productos ?? []).filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.codigoSku.toLowerCase().includes(q),
    );
  }, [productos, productoSearch]);

  const selectedProduct = useMemo(
    () => (productos ?? []).find((p) => p.id === selectedProductId) ?? null,
    [productos, selectedProductId],
  );

  const subtotal  = cartItems.reduce((s, i) => s + i.precioUnitario * i.cantidadVendida, 0);
  const descMonto = subtotal * (descuento / 100);
  const total     = subtotal - descMonto;

  // ── cart handlers ─────────────────────────────────────────────────────────────

  function addToCart() {
    if (!selectedProduct) { setFormError('Selecciona un producto.'); return; }
    if (cantidadInput < 1) { setFormError('La cantidad debe ser mayor a 0.'); return; }
    setFormError(null);

    setCartItems((prev) => {
      const existing = prev.find((i) => i.idProducto === selectedProduct.id);
      if (existing) {
        return prev.map((i) =>
          i.idProducto === selectedProduct.id
            ? { ...i, cantidadVendida: i.cantidadVendida + cantidadInput }
            : i,
        );
      }
      return [
        ...prev,
        {
          idProducto:      selectedProduct.id,
          titulo:          selectedProduct.titulo,
          precioUnitario:  Number(selectedProduct.precioVenta),
          stockActual:     selectedProduct.stockActual,
          cantidadVendida: cantidadInput,
        },
      ];
    });
    setSelectedProductId('');
    setProductoSearch('');
    setCantidadInput(1);
  }

  function updateQty(id: number, qty: number) {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.idProducto === id ? { ...i, cantidadVendida: qty } : i)),
    );
  }

  function removeItem(id: number) {
    setCartItems((prev) => prev.filter((i) => i.idProducto !== id));
  }

  // ── submit ────────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setFormError(null);

    if (!idCliente) { setFormError('Selecciona un cliente.'); return; }
    if (cartItems.length === 0) { setFormError('Agrega al menos un producto.'); return; }
    if (cartItems.some((i) => i.cantidadVendida < 1)) {
      setFormError('Todas las cantidades deben ser mayores a 0.');
      return;
    }

    const payload = {
      fechaVenta: String(fechaVenta),
      descuento:  descuento > 0 ? descuento : undefined,
      metodoPago,
      idCliente:  Number(idCliente),
      detalles: cartItems.map((i) => ({
        idProducto:      i.idProducto,
        cantidadVendida: i.cantidadVendida,
        precioUnitario:  i.precioUnitario,
      })),
    };

    try {
      const venta = await createVenta.mutateAsync(payload);
      setNotify({
        type: 'success',
        title: 'Venta registrada',
        message: `La venta #${venta.id} se creó correctamente.`,
      });
      setTimeout(() => {
        router.push(`/dashboard/ventas/${venta.id}` as any);
      }, 2000);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? 'Error al registrar la venta.';
      setFormError(msg);
    }
  }

  const isSaving = createVenta.isPending;

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-6 sm:p-8">

      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-3 gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href={"/dashboard/ventas" as any}>
            <ArrowLeft className="h-4 w-4" />
            Volver a ventas
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Nueva venta</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Registra una venta manual en RetroSound
            </p>
          </div>
        </div>
      </div>

      {/* Error global */}
      {formError && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Columna principal ─────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Cliente y método */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente y método de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Cliente <span className="text-danger">*</span>
                  </label>
                  <select
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value ? Number(e.target.value) : '')}
                    className={FIELD}
                  >
                    <option value="">Seleccionar cliente…</option>
                    {(clientes ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Método de pago <span className="text-danger">*</span>
                  </label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className={FIELD}
                  >
                    {METODOS.map((m) => (
                      <option key={m} value={m} className="capitalize">{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Fecha de venta
                  </label>
                  <input
                    type="date"
                    value={fechaVenta}
                    onChange={(e) => setFechaVenta(e.target.value)}
                    className={FIELD}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={descuento}
                    onChange={(e) => setDescuento(Number(e.target.value))}
                    className={FIELD}
                  />
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Agregar productos */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Producto
                  </label>
                  <SearchInput
                    placeholder="Buscar por título o SKU…"
                    value={productoSearch}
                    onChange={(e) => {
                      setProductoSearch(e.target.value);
                      setSelectedProductId('');
                    }}
                    onClear={() => { setProductoSearch(''); setSelectedProductId(''); }}
                  />
                  {productoSearch.trim() && productosFiltrados.length > 0 && !selectedProduct && (
                    <div className="mt-1 max-h-44 overflow-y-auto rounded-xl border border-border bg-card shadow-md">
                      {productosFiltrados.slice(0, 10).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setProductoSearch(p.titulo);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-muted/60"
                        >
                          <span className="font-medium text-foreground">{p.titulo}</span>
                          <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                            {formatQ(Number(p.precioVenta))} · Stock: {p.stockActual}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedProduct && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatQ(Number(selectedProduct.precioVenta))} · Stock disponible: {selectedProduct.stockActual}
                      {selectedProduct.stockActual === 0 && (
                        <span className="ml-1 font-medium text-danger">(Sin stock)</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="w-28">
                  <label className="mb-1 block text-sm font-medium text-foreground">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadInput}
                    onChange={(e) => setCantidadInput(Number(e.target.value))}
                    className={FIELD}
                  />
                </div>

                <Button onClick={addToCart} className="gap-1.5 sm:mb-0">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carrito */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Carrito de venta</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    El carrito está vacío. Agrega productos arriba.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {['Producto', 'Precio unit.', 'Cantidad', 'Subtotal', ''].map((h, i) => (
                          <th
                            key={i}
                            className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i === 0 ? '' : 'text-right'}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => {
                        const linea   = item.precioUnitario * item.cantidadVendida;
                        const overQty = item.cantidadVendida > item.stockActual && item.stockActual > 0;
                        return (
                          <tr key={item.idProducto} className="border-b border-border last:border-0">
                            <td className="px-3 py-3">
                              <p className="font-medium text-foreground">{item.titulo}</p>
                              {overQty && (
                                <p className="text-xs text-warning">
                                  Cantidad supera el stock disponible ({item.stockActual})
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">
                              {formatQ(item.precioUnitario)}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <input
                                type="number"
                                min="1"
                                value={item.cantidadVendida}
                                onChange={(e) => updateQty(item.idProducto, Number(e.target.value))}
                                className="w-20 rounded-lg border border-border bg-input-bg px-2 py-1 text-right text-sm tabular-nums focus:border-brand focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-3 text-right font-medium text-foreground tabular-nums">
                              {formatQ(linea)}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem(item.idProducto)}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* ── Resumen sticky ────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatQ(subtotal)}</span>
                  </div>
                  {descuento > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Descuento ({descuento}%)</span>
                      <span className="tabular-nums text-danger">−{formatQ(descMonto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span className="tabular-nums">{formatQ(total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    loading={isSaving}
                    disabled={isSaving || cartItems.length === 0 || !idCliente}
                  >
                    {isSaving ? 'Registrando…' : 'Confirmar venta'}
                  </Button>
                  <Button variant="outline" className="w-full" asChild disabled={isSaving}>
                    <Link href={"/dashboard/ventas" as any}>Cancelar</Link>
                  </Button>
                </div>

                {cartItems.length === 0 && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Agrega productos para habilitar la confirmación.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

    </main>
  );
}

export default function NuevaVentaPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_ventas']}>
      <NuevaVentaContent />
    </RoleGuard>
  );
}
