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
import { CriticalStockPage } from '@/pages/dashboard/CriticalStockPage';
import { CustomersPage } from '@/pages/dashboard/CustomersPage';
import { CustomerProfilePage } from '@/pages/cliente/CustomerProfilePage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { DashboardProfilePage } from '@/pages/dashboard/DashboardProfilePage';
import { EmployeesPage } from '@/pages/dashboard/EmployeesPage';
import { InventoryPage } from '@/pages/dashboard/InventoryPage';
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { MyOrdersPage } from '@/pages/cliente/MyOrdersPage';
import { NewSalePage } from '@/pages/dashboard/NewSalePage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { OrderDetailPage } from '@/pages/cliente/OrderDetailPage';
import { ProductDetailPage } from '@/pages/cliente/ProductDetailPage';
import { ProductsPage } from '@/pages/dashboard/ProductsPage';
import { ProvidersPage } from '@/pages/dashboard/ProvidersPage';
import { ReceptionsPage } from '@/pages/dashboard/ReceptionsPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ReportsPage } from '@/pages/dashboard/ReportsPage';
import { SaleDetailPage } from '@/pages/dashboard/SaleDetailPage';
import { SalesPage } from '@/pages/dashboard/SalesPage';
import { StorePage } from '@/pages/cliente/StorePage';
import { SystemStatesPage } from '@/pages/public/SystemStatesPage';
import { UsersPage } from '@/pages/dashboard/UsersPage';
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

function dashboardElement(page: ReactNode, allowedRoles: Role[]) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardShell>{page}</DashboardShell>
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

      <Route path={ROUTE_PATHS.DASHBOARD.HOME} element={dashboardElement(<DashboardPage />, STAFF_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.PRODUCTS} element={dashboardElement(<ProductsPage />, INVENTORY_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.PROVIDERS} element={dashboardElement(<ProvidersPage />, INVENTORY_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.SALES} element={dashboardElement(<SalesPage />, SALES_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.NEW_SALE} element={dashboardElement(<NewSalePage />, SALES_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.SALE_DETAIL} element={dashboardElement(<SaleDetailPage />, SALES_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.CUSTOMERS} element={dashboardElement(<CustomersPage />, SALES_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.USERS} element={dashboardElement(<UsersPage />, ADMIN_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.EMPLOYEES} element={dashboardElement(<EmployeesPage />, ADMIN_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.INVENTORY} element={dashboardElement(<InventoryPage />, INVENTORY_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.RECEPTIONS} element={dashboardElement(<ReceptionsPage />, INVENTORY_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.CRITICAL_STOCK} element={dashboardElement(<CriticalStockPage />, INVENTORY_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.REPORTS} element={dashboardElement(<ReportsPage />, STAFF_ROLES)} />
      <Route path={ROUTE_PATHS.DASHBOARD.PROFILE} element={dashboardElement(<DashboardProfilePage />, STAFF_ROLES)} />

      <Route path={ROUTE_PATHS.PROVEEDOR.HOME} element={protectedElement('Portal proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.PRODUCTS} element={protectedElement('Productos proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.DELIVERIES} element={protectedElement('Entregas proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.NEW_DELIVERY} element={protectedElement('Nueva entrega placeholder', PROVEEDOR_ROLES, 'proveedor')} />
      <Route path={ROUTE_PATHS.PROVEEDOR.PROFILE} element={protectedElement('Perfil proveedor placeholder', PROVEEDOR_ROLES, 'proveedor')} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
