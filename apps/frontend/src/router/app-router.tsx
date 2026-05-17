import { Link, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';

import { ClienteShell } from '@/components/layout/cliente-shell';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProveedorShell } from '@/components/layout/proveedor-shell';
import { ROLES, type Role } from '@/lib/auth/roles';
import { AccessDeniedPage } from '@/pages/public/AccessDeniedPage';
import { CartPage } from '@/pages/cliente/CartPage';
import { CheckoutConfirmationPage } from '@/pages/cliente/CheckoutConfirmationPage';
import { CheckoutPage } from '@/pages/cliente/CheckoutPage';
import { CustomerProfilePage } from '@/pages/cliente/CustomerProfilePage';
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { MyOrdersPage } from '@/pages/cliente/MyOrdersPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { OrderDetailPage } from '@/pages/cliente/OrderDetailPage';
import { ProductDetailPage } from '@/pages/cliente/ProductDetailPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { StorePage } from '@/pages/cliente/StorePage';
import { SystemStatesPage } from '@/pages/public/SystemStatesPage';
import { ProtectedRoute } from './protected-route';
import { ROUTE_PATHS } from './route-paths';

const CLIENTE_ROLES: Role[] = [ROLES.CLIENTE];
const STAFF_ROLES: Role[] = [ROLES.ADMIN, ROLES.EMPLEADO_VENTAS, ROLES.EMPLEADO_INVENTARIO];
const SALES_ROLES: Role[] = [ROLES.ADMIN, ROLES.EMPLEADO_VENTAS];
const INVENTORY_ROLES: Role[] = [ROLES.ADMIN, ROLES.EMPLEADO_INVENTARIO];
const ADMIN_ROLES: Role[] = [ROLES.ADMIN];
const PROVEEDOR_ROLES: Role[] = [ROLES.PROVEEDOR];

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="min-h-[50vh] bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-sm font-medium text-muted-foreground">React Router shell activo</p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <nav className="flex flex-wrap gap-3 text-sm text-brand">
          <Link to={ROUTE_PATHS.PUBLIC.HOME}>Inicio</Link>
          <Link to={ROUTE_PATHS.PUBLIC.LOGIN}>Login</Link>
          <Link to={ROUTE_PATHS.PUBLIC.REGISTER}>Registro</Link>
          <Link to={ROUTE_PATHS.PUBLIC.ACCESS_DENIED}>403</Link>
          <Link to={ROUTE_PATHS.CLIENTE.STORE}>Tienda</Link>
          <Link to={ROUTE_PATHS.DASHBOARD.HOME}>Dashboard</Link>
          <Link to={ROUTE_PATHS.PROVEEDOR.HOME}>Proveedor</Link>
        </nav>
      </div>
    </section>
  );
}

function protectedElement(
  title: string,
  allowedRoles: Role[],
  shell: 'cliente' | 'dashboard' | 'proveedor',
) {
  const page = <PlaceholderPage title={title} />;
  const content = shell === 'cliente'
    ? <ClienteShell>{page}</ClienteShell>
    : shell === 'proveedor'
      ? <ProveedorShell>{page}</ProveedorShell>
      : <DashboardShell>{page}</DashboardShell>;

  return <ProtectedRoute allowedRoles={allowedRoles}>{content}</ProtectedRoute>;
}

function clientElement(page: ReactNode) {
  return (
    <ProtectedRoute allowedRoles={CLIENTE_ROLES}>
      <ClienteShell>{page}</ClienteShell>
    </ProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.PUBLIC.HOME} element={<LandingPage />} />
      <Route path={ROUTE_PATHS.PUBLIC.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.PUBLIC.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTE_PATHS.PUBLIC.ACCESS_DENIED} element={<AccessDeniedPage />} />
      <Route path={ROUTE_PATHS.PUBLIC.STATES} element={<SystemStatesPage />} />

      <Route path={ROUTE_PATHS.CLIENTE.STORE} element={clientElement(<StorePage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.PRODUCT_DETAIL} element={clientElement(<ProductDetailPage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.CART} element={clientElement(<CartPage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.CHECKOUT} element={clientElement(<CheckoutPage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.CHECKOUT_CONFIRMATION} element={clientElement(<CheckoutConfirmationPage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.ORDERS} element={clientElement(<MyOrdersPage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.ORDER_DETAIL} element={clientElement(<OrderDetailPage />)} />
      <Route path={ROUTE_PATHS.CLIENTE.PROFILE} element={clientElement(<CustomerProfilePage />)} />

      <Route path={ROUTE_PATHS.DASHBOARD.HOME} element={protectedElement('Dashboard placeholder', STAFF_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.PRODUCTS} element={protectedElement('Productos placeholder', STAFF_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.PROVIDERS} element={protectedElement('Proveedores placeholder', STAFF_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.SALES} element={protectedElement('Ventas placeholder', SALES_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.NEW_SALE} element={protectedElement('Nueva venta placeholder', SALES_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.SALE_DETAIL} element={protectedElement('Detalle de venta placeholder', SALES_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.CUSTOMERS} element={protectedElement('Clientes placeholder', SALES_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.USERS} element={protectedElement('Usuarios placeholder', ADMIN_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.EMPLOYEES} element={protectedElement('Empleados placeholder', ADMIN_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.INVENTORY} element={protectedElement('Inventario placeholder', INVENTORY_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.RECEPTIONS} element={protectedElement('Recepciones placeholder', INVENTORY_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.CRITICAL_STOCK} element={protectedElement('Stock crítico placeholder', INVENTORY_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.REPORTS} element={protectedElement('Reportes placeholder', STAFF_ROLES, 'dashboard')} />
      <Route path={ROUTE_PATHS.DASHBOARD.PROFILE} element={protectedElement('Perfil dashboard placeholder', STAFF_ROLES, 'dashboard')} />

      <Route path={ROUTE_PATHS.PROVEEDOR.HOME} element={protectedElement('Portal proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.PRODUCTS} element={protectedElement('Productos proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.DELIVERIES} element={protectedElement('Entregas proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.NEW_DELIVERY} element={protectedElement('Nueva entrega placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.PROFILE} element={protectedElement('Perfil proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
