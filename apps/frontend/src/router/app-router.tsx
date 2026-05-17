import { Route, Routes } from 'react-router-dom';
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
import { NewProviderDeliveryPage } from '@/pages/proveedor/NewProviderDeliveryPage';
import { ProductsPage } from '@/pages/dashboard/ProductsPage';
import { ProviderDashboardPage } from '@/pages/proveedor/ProviderDashboardPage';
import { ProviderDeliveriesPage } from '@/pages/proveedor/ProviderDeliveriesPage';
import { ProviderProductsPage } from '@/pages/proveedor/ProviderProductsPage';
import { ProviderProfilePage } from '@/pages/proveedor/ProviderProfilePage';
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

function proveedorElement(page: ReactNode) {
  return (
    <ProtectedRoute allowedRoles={PROVEEDOR_ROLES}>
      <ProveedorShell>{page}</ProveedorShell>
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

      <Route path={ROUTE_PATHS.PROVEEDOR.HOME} element={proveedorElement(<ProviderDashboardPage />)} />
      <Route path={ROUTE_PATHS.PROVEEDOR.PRODUCTS} element={proveedorElement(<ProviderProductsPage />)} />
      <Route path={ROUTE_PATHS.PROVEEDOR.DELIVERIES} element={proveedorElement(<ProviderDeliveriesPage />)} />
      <Route path={ROUTE_PATHS.PROVEEDOR.NEW_DELIVERY} element={proveedorElement(<NewProviderDeliveryPage />)} />
      <Route path={ROUTE_PATHS.PROVEEDOR.PROFILE} element={proveedorElement(<ProviderProfilePage />)} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
