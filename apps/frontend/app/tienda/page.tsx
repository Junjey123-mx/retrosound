'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ListOrdered,
  Music2,
  Search,
} from 'lucide-react';
import { useClienteProductos } from '@/hooks/use-productos';
import { ProductCard } from '@/components/cliente/product-card';
import type { Producto } from '@/types';

type FilterKey = 'todos' | 'vinilo' | 'cd' | 'casete' | 'disponibles' | 'precio-bajo';
type SortKey   = 'recientes' | 'antiguos';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos',       label: 'Todos'       },
  { key: 'vinilo',      label: 'Vinilos'     },
  { key: 'cd',          label: 'CDs'         },
  { key: 'casete',      label: 'Casetes'     },
  { key: 'disponibles', label: 'Disponibles' },
  { key: 'precio-bajo', label: 'Precio bajo' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recientes', label: 'Más recientes' },
  { key: 'antiguos',  label: 'Más antiguos'  },
];

function normalize(value?: string) {
  return value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isVisibleProduct(producto: Producto) {
  return producto.estado !== 'inactivo' && producto.estado !== 'descontinuado';
}

function isAvailable(producto: Producto) {
  return producto.estado === 'activo' && producto.stockActual > 0;
}

function matchesFormat(producto: Producto, format: FilterKey) {
  const nombre = normalize(producto.formato?.nombre) ?? '';
  if (format === 'vinilo') return nombre.includes('vinilo');
  if (format === 'cd')     return nombre.includes('cd');
  if (format === 'casete') return nombre.includes('casete') || nombre.includes('cassette');
  return true;
}

function SkeletonCard() {
  return (
    <div className="rs-store-card min-h-[410px] rounded-[18px] border p-5">
      <div className="mb-4 h-9 w-24 animate-pulse rounded-full bg-muted" />
      <div className="h-52 animate-pulse rounded-2xl bg-muted" />
      <div className="mt-5 h-6 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-8 flex justify-between">
        <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-11 animate-pulse rounded-full bg-muted" />
        <div className="h-11 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

function StoreDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-brand">
      <svg
        aria-hidden="true"
        className="absolute -left-36 top-8 h-80 w-[520px] opacity-[0.10] dark:opacity-[0.14]"
        viewBox="0 0 520 320"
        fill="none"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${64 + i * 16} C 124 ${20 + i * 10}, 206 ${270 - i * 10}, 520 ${190 - i * 12}`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>
      <svg
        aria-hidden="true"
        className="absolute -right-40 top-28 h-80 w-[560px] opacity-[0.10] dark:opacity-[0.16]"
        viewBox="0 0 560 320"
        fill="none"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M20 ${250 - i * 16} C 160 ${120 + i * 4}, 330 ${210 - i * 18}, 560 ${42 + i * 14}`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>
      <Music2 className="absolute right-[11%] top-16 h-16 w-16 rotate-12 opacity-[0.10]" />
      <Music2 className="absolute right-[18%] top-28 h-8 w-8 -rotate-6 opacity-[0.10]" />
      <div className="absolute -left-24 bottom-40 h-52 w-52 rounded-full border-[28px] border-current opacity-[0.05]" />
      <div className="absolute -right-20 bottom-24 h-52 w-52 rounded-full border-[24px] border-current opacity-[0.07]" />
    </div>
  );
}

export default function TiendaPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todos');
  const [sortKey, setSortKey] = useState<SortKey>('recientes');
  const [sortOpen, setSortOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const { data: productos, isLoading, isError, refetch } = useClienteProductos();

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleProducts = useMemo(
    () => (productos ?? []).filter(isVisibleProduct),
    [productos],
  );

  const filteredProducts = useMemo(() => {
    const query = normalize(search) ?? '';
    const filtered = visibleProducts.filter((producto) => {
      const formatFilter =
        activeFilter === 'vinilo' || activeFilter === 'cd' || activeFilter === 'casete';
      const matchesActiveFormat = !formatFilter || matchesFormat(producto, activeFilter);
      const matchesAvailability = activeFilter !== 'disponibles' || isAvailable(producto);

      const searchable = [
        producto.titulo,
        producto.formato?.nombre,
        producto.categoria?.nombre,
        producto.artistas?.map((item) => item.artista.nombre).join(' '),
        producto.generos?.map((item) => item.generoMusical.nombre).join(' '),
      ]
        .filter(Boolean)
        .join(' ');

      return matchesActiveFormat && matchesAvailability && normalize(searchable)?.includes(query);
    });

    return [...filtered].sort((a, b) => {
      if (activeFilter === 'precio-bajo') return Number(a.precioVenta) - Number(b.precioVenta);
      const ya = a.anioLanzamiento ?? (sortKey === 'antiguos' ? 9999 : 0);
      const yb = b.anioLanzamiento ?? (sortKey === 'antiguos' ? 9999 : 0);
      return sortKey === 'antiguos' ? ya - yb : yb - ya;
    });
  }, [activeFilter, sortKey, search, visibleProducts]);

  const hasProducts = visibleProducts.length > 0;
  const hasFilterResults = filteredProducts.length > 0;

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden font-sans">
      <StoreDecor />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
        <section className="grid items-center gap-8 lg:grid-cols-[1fr_520px]">
          <div>
            <h1 className="max-w-3xl text-3xl font-extrabold tracking-normal text-foreground sm:text-4xl">
              Explora música física
            </h1>
            <p className="mt-3 text-base font-medium leading-7 text-muted-foreground">
              Vinilos, CDs y casetes seleccionados para coleccionistas.
            </p>
          </div>

          <div className="rs-store-surface rounded-[18px] border px-6 py-6 sm:px-7">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <Music2 className="h-9 w-9" />
              </div>
              <div>
                <p className="text-4xl font-extrabold leading-none text-brand">500+</p>
                <p className="mt-2 text-base font-extrabold text-foreground">productos en catálogo</p>
                <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-muted-foreground">
                  Ediciones originales, limitadas y clásicas para verdaderos coleccionistas.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar álbum, artista o formato..."
                className="rs-store-control h-14 w-full rounded-[14px] border pl-14 pr-24 text-sm font-semibold text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
                  Ctrl
                </kbd>
                <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
                  K
                </kbd>
              </div>
            </div>

            <div ref={sortRef} className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((prev) => !prev)}
                className="rs-store-control inline-flex h-14 w-full items-center justify-between rounded-[16px] border px-5 text-sm font-extrabold text-foreground transition hover:border-brand/40 hover:bg-brand/5"
              >
                {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortOpen && (
                <div className="rs-store-surface absolute right-0 top-[calc(100%+6px)] z-30 min-w-full overflow-hidden rounded-[14px] border py-1 shadow-lg">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => { setSortKey(option.key); setSortOpen(false); }}
                      className={`w-full px-5 py-2.5 text-left text-sm font-semibold transition hover:bg-brand/5 ${
                        sortKey === option.key ? 'text-brand' : 'text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {FILTERS.map((filter, index) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-extrabold transition ${
                  activeFilter === filter.key
                    ? 'rs-store-pill-active'
                    : 'rs-store-pill'
                }`}
              >
                {filter.label}
                {filter.key === 'precio-bajo' && <ChevronDown className="h-4 w-4" />}
                {index === 3 && <span className="ml-2 hidden h-7 w-px bg-border sm:inline-block" />}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4">
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {isError && (
            <div className="rs-store-surface rounded-[16px] border p-10 text-center">
              <Music2 className="mx-auto h-10 w-10 text-brand" />
              <p className="mt-4 text-lg font-extrabold text-foreground">No se pudo cargar el catálogo.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover dark:text-primary-foreground"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && !hasProducts && (
            <div className="rs-store-surface rounded-[16px] border p-12 text-center">
              <Music2 className="mx-auto h-12 w-12 text-brand" />
              <p className="mt-4 text-lg font-extrabold text-foreground">No hay productos disponibles</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Vuelve más tarde para descubrir nuevas colecciones.
              </p>
            </div>
          )}

          {!isLoading && !isError && hasProducts && !hasFilterResults && (
            <div className="rs-store-surface rounded-[16px] border p-10 text-center">
              <ListOrdered className="mx-auto h-10 w-10 text-brand" />
              <p className="mt-4 text-lg font-extrabold text-foreground">
                No encontramos productos con estos filtros.
              </p>
            </div>
          )}

          {!isLoading && !isError && hasFilterResults && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
