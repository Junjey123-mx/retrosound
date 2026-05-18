# RetroSound Store

**cc3062 · Sistemas y Tecnologías Web — Proyecto 2**  
Universidad del Valle de Guatemala · Ciclo 1, 2026

RetroSound Store es una tienda especializada en la venta de música en formatos físicos: vinilos, CDs y casetes. La aplicación gestiona productos, categorías, proveedores, clientes, empleados, ventas, inventario y genera reportes con exportación a CSV.

> **Rama de evaluación:** `proyecto-3`

---

## Producción

| Servicio | URL |
|----------|-----|
| **Frontend** | https://super-marshmallow-8abd8e.netlify.app/ |
| **Backend API** | https://retrosound-bcdz.vercel.app |

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS 11 · TypeScript · Prisma ORM · Passport JWT · bcrypt · class-validator |
| **Frontend** | React 19 · Vite · TypeScript · Tailwind CSS · TanStack Query · Radix UI |
| **Base de datos** | PostgreSQL 17 |
| **Infraestructura** | Docker Compose · pgAdmin 4 · Nginx · Node.js 22 Alpine |

---

## Levantar desde cero

### Requisitos previos

- Docker Engine + Docker Compose v2 (o Docker Desktop)
- Puertos libres: `3002` (frontend), `3003` (backend), `5433` (Postgres), `5051` (pgAdmin)

### 1 · Clonar el repositorio

```bash
git clone https://github.com/Junjey123-mx/retrosound.git
cd retrosound
git checkout proyecto-3
```

### 2 · Crear el archivo de entorno

```bash
cp .env.example .env
```

El `.env.example` incluido usa exactamente las credenciales requeridas por la rúbrica:

```env
# Base de datos (credenciales fijas de evaluación)
DB_USER=proy2
DB_PASSWORD=secret
DB_NAME=retrosound
DB_PORT=5433

# Puertos
BACKEND_PORT=3003
FRONTEND_PORT=3002
PGADMIN_PORT=5051

# JWT
JWT_SECRET=change-me-in-production

# URLs
VITE_API_URL=http://localhost:3003
```

### 3 · Levantar todo

```bash
docker compose up
```

> Un solo comando levanta PostgreSQL, el backend NestJS, el frontend React (servido por Nginx) y pgAdmin. No se requiere ningún paso adicional.

### 4 · Acceder

| Servicio | URL local |
|----------|-----------|
| Frontend | http://localhost:3002 |
| Backend API | http://localhost:3003 |
| pgAdmin | http://localhost:5051 (admin@retrosound.dev / admin) |
| PostgreSQL | localhost:5433 (proy2 / secret) |

### Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| admin | admin@retrosound.com | admin123 |
| empleado_ventas | ventas@retrosound.com | ventas123 |
| empleado_inventario | inventario@retrosound.com | inv123 |
| proveedor | proveedor@sony.com | prov123 |
| cliente | cliente@mail.com | cliente123 |

---

## Arquitectura

```
Navegador (React + Vite)  →  puerto 3002, servido por Nginx
        │
        │ API REST / JSON
        ▼
  NestJS 11  →  puerto 3001 interno (3003 host)
        │
        │ Prisma ORM / pg.Pool
        ▼
  PostgreSQL 17  →  puerto 5432 interno (5433 host)
```

- El frontend **nunca** accede directamente a la base de datos.
- Toda comunicación es exclusivamente vía API REST con respuestas en JSON.
- Las transacciones explícitas (`BEGIN / COMMIT / ROLLBACK`) se manejan en el backend con `DatabaseService.getClient()`.

---

## I · Arquitectura y API REST

### Endpoints documentados por módulo

#### Auth
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registro de nuevo cliente | Pública |
| POST | `/auth/login` | Login — devuelve JWT | Pública |
| GET | `/auth/me` | Perfil del usuario autenticado | JWT |

#### Productos
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/productos` | Listar productos (filtros, paginación) | Pública |
| GET | `/productos/:id` | Detalle de producto | Pública |
| POST | `/productos` | Crear producto | admin, empleado_inventario |
| PATCH | `/productos/:id` | Actualizar producto | admin, empleado_inventario |
| PATCH | `/productos/:id/imagen` | Actualizar imagen | admin, empleado_inventario |
| DELETE | `/productos/:id` | Eliminar producto | admin, empleado_inventario |

#### Clientes
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/clientes/me` | Perfil propio | cliente |
| PATCH | `/clientes/me` | Actualizar perfil propio | cliente |
| GET | `/clientes` | Listar clientes | admin, empleado_ventas |
| GET | `/clientes/:id` | Detalle de cliente | admin, empleado_ventas |
| POST | `/clientes` | Crear cliente | admin, empleado_ventas |
| PATCH | `/clientes/:id` | Actualizar cliente | admin, empleado_ventas |
| DELETE | `/clientes/:id` | Eliminar cliente | admin, empleado_ventas |

#### Proveedores
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/proveedores` | Listar proveedores | admin, empleado_inventario |
| GET | `/proveedores/:id` | Detalle | admin, empleado_inventario |
| POST | `/proveedores` | Crear | admin, empleado_inventario |
| PATCH | `/proveedores/:id` | Actualizar | admin, empleado_inventario |
| DELETE | `/proveedores/:id` | Eliminar | admin, empleado_inventario |

#### Empleados
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/empleados` | Listar empleados | admin |
| GET | `/empleados/:id` | Detalle | admin |
| POST | `/empleados` | Crear | admin |
| PATCH | `/empleados/:id` | Actualizar | admin |
| DELETE | `/empleados/:id` | Eliminar | admin |

#### Usuarios
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/usuarios` | Listar usuarios | admin |
| GET | `/usuarios/:id` | Detalle | admin |
| POST | `/usuarios` | Crear | admin |
| PATCH | `/usuarios/:id` | Actualizar | admin |
| DELETE | `/usuarios/:id` | Eliminar | admin |

#### Ventas
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/ventas` | Listar ventas | admin, empleado_ventas |
| GET | `/ventas/:id` | Detalle de venta | admin, empleado_ventas |
| POST | `/ventas` | Registrar venta | admin, empleado_ventas |

#### Carrito
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/carrito` | Obtener carrito activo | cliente |
| POST | `/carrito/items` | Agregar ítem | cliente |
| PATCH | `/carrito/items/:id` | Cambiar cantidad | cliente |
| DELETE | `/carrito/items/:id` | Quitar ítem | cliente |
| DELETE | `/carrito` | Cancelar carrito | cliente |
| POST | `/checkout` | Procesar compra | cliente |

#### Mis Órdenes (cliente)
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/mis-ordenes` | Historial de órdenes | cliente |
| GET | `/mis-ordenes/:id` | Detalle de orden | cliente |

#### Inventario
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/inventario/recepciones` | Listar recepciones | admin, empleado_inventario |
| GET | `/inventario/recepciones/:id` | Detalle | admin, empleado_inventario |
| PATCH | `/inventario/recepciones/:id/confirmar` | Confirmar recepción | admin, empleado_inventario |
| GET | `/inventario/stock-critico` | Productos en stock crítico | admin, empleado_inventario |
| GET | `/inventario/stock-resumen` | Resumen de stock | admin, empleado_inventario |

#### Proveedor Portal
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/proveedor/me/dashboard` | Dashboard proveedor | proveedor |
| GET | `/proveedor/me/productos` | Mis productos | proveedor |
| PATCH | `/proveedor/me/productos/:id` | Actualizar producto | proveedor |
| GET | `/proveedor/me/entregas` | Mis entregas | proveedor |
| POST | `/proveedor/me/entregas` | Registrar entrega | proveedor |
| GET | `/proveedor/me/perfil` | Ver perfil | proveedor |
| PATCH | `/proveedor/me/perfil` | Actualizar perfil | proveedor |

#### Reportes (endpoint de agregación)
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/reportes/resumen-ventas` | Totales de ventas | admin, empleado_ventas |
| GET | `/reportes/ventas-detalle` | Ventas detalladas | admin, empleado_ventas |
| GET | `/reportes/catalogo` | Catálogo con stock | admin, empleado_inventario |
| GET | `/reportes/compras` | Compras a proveedores | admin, empleado_inventario |
| GET | `/reportes/stock-bajo` | Productos con bajo stock | admin, empleado_inventario |
| GET | `/reportes/clientes-frecuentes` | Clientes top | admin, empleado_ventas |
| GET | `/reportes/mas-vendidos` | Productos más vendidos | admin, staff |
| GET | `/reportes/ranking-ingresos` | Ranking de ingresos | admin, empleado_ventas |
| **GET** | **`/reportes/export/csv`** | **Exportar reporte a CSV** | admin, staff |
| GET | `/reportes/dashboard` | Datos resumen para dashboard | admin, staff |

#### Dashboard (datos agregados por rol)
| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/dashboard/admin` | admin |
| GET | `/dashboard/ventas` | admin, empleado_ventas |
| GET | `/dashboard/inventario` | admin, empleado_inventario |
| GET | `/dashboard/proveedor` | proveedor |

#### Catálogos
| Método | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/catalogs/categorias` | Pública / admin, empleado_inventario |
| GET/POST | `/catalogs/formatos` | Pública / admin, empleado_inventario |
| GET/POST | `/catalogs/generos` | Pública / admin, empleado_inventario |
| GET/POST | `/catalogs/artistas` | Pública / admin, empleado_inventario |

### Manejo de errores en la API

Todos los endpoints devuelven códigos HTTP correctos con cuerpo JSON:

```json
{ "statusCode": 404, "message": "Producto no encontrado", "error": "Not Found" }
{ "statusCode": 401, "message": "Token inválido o expirado" }
{ "statusCode": 400, "message": ["nombre must not be empty"], "error": "Bad Request" }
```

- `400` — validación fallida (class-validator)
- `401` — token ausente o expirado
- `403` — rol insuficiente (RolesGuard)
- `404` — recurso no encontrado
- `409` — conflicto (ej. stock insuficiente al hacer checkout)
- `500` — error interno con mensaje descriptivo

### Endpoint de agregación

`GET /reportes/dashboard` y `GET /dashboard/admin` agregan en una sola llamada: total de ventas del día, semana y mes, stock crítico, productos más vendidos, clientes recientes y resumen de ingresos.

---

## II · Frontend — React

### Rutas (React Router — 30+ rutas)

```
/                        Landing page pública
/login                   Inicio de sesión
/register                Registro de cliente
/access-denied           Acceso denegado
/system-states           Estados del sistema

# Portal cliente (ProtectedRoute rol=cliente)
/store                   Catálogo de productos con filtros
/product/:id             Detalle de producto
/cart                    Carrito de compras
/checkout                Proceso de compra
/checkout/confirmation   Confirmación de compra
/my-orders               Historial de órdenes
/orders/:id              Detalle de orden
/profile                 Perfil del cliente

# Dashboard staff (ProtectedRoute roles=[admin, empleado_*])
/dashboard               Dashboard con métricas por rol
/dashboard/products      CRUD de productos
/dashboard/providers     CRUD de proveedores
/dashboard/sales         Lista de ventas
/dashboard/new-sale      Crear venta nueva
/dashboard/sale/:id      Detalle de venta
/dashboard/customers     CRUD de clientes
/dashboard/users         CRUD de usuarios (admin)
/dashboard/employees     CRUD de empleados (admin)
/dashboard/inventory     Resumen de inventario
/dashboard/receptions    Recepciones de stock
/dashboard/critical-stock Stock en nivel crítico
/dashboard/reports       Reportes + exportar CSV
/dashboard/profile       Perfil del empleado

# Portal proveedor (ProtectedRoute rol=proveedor)
/proveedor               Dashboard de proveedor
/proveedor/products      Mis productos
/proveedor/deliveries    Mis entregas
/proveedor/new-delivery  Registrar entrega
/proveedor/profile       Perfil
```

### React Context (estado global)

**`SessionContext`** (`src/contexts/session-context.tsx`):
- Almacena `token`, `user` y `isAuthenticated`
- Expone `loginWithToken()`, `logout()`, `refreshSession()`, `clearSession()`
- Persiste la sesión en `localStorage` y la restaura al recargar
- Consumido por `ProtectedRoute` para guard de rutas y en toda la UI para mostrar/ocultar controles según rol

**`ThemeProvider`** (`src/hooks/use-theme.tsx`):
- Maneja modo claro/oscuro en toda la aplicación

### Hooks

#### `useState` y `useEffect`
Utilizados extensamente en todas las páginas para: datos de formularios, estado de carga, paginación, filtros, modales y sincronización con la API.

#### `useCallback` y `useMemo`
Presentes en al menos 15 componentes/páginas, incluyendo:
- `StorePage` — `useMemo` para filtrar y ordenar el catálogo sin re-procesar
- `ReportsPage` — `useCallback` para `exportToCSV` y cambios de reporte
- `NewSalePage` — `useCallback` para acciones del carrito de venta
- `CustomersPage`, `ProductsPage`, `ProvidersPage` — `useCallback` para handlers de modal y búsqueda
- `SessionContext` — `useCallback` para `loginWithToken`, `logout`, `refreshSession`

#### `useReducer` (flujo de estado complejo)
**`NewSalePage`** (`src/pages/dashboard/NewSalePage.tsx`):

```typescript
type SaleAction =
  | { type: 'SET_CLIENT'; payload: Cliente }
  | { type: 'ADD_ITEM'; payload: Producto }
  | { type: 'UPDATE_QTY'; id: number; qty: number }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'CLEAR' };

const [saleState, dispatch] = useReducer(saleReducer, initialSaleState);
```

Gestiona: cliente seleccionado, ítems de la venta, cantidades, total calculado y estado de confirmación.

### Formularios controlados con validación

Todos los formularios CRUD son controlados (`value` + `onChange`) con validación cliente antes de enviar:

- **Productos:** nombre requerido, precio > 0, stock ≥ 0, formato y categoría requeridos
- **Clientes / Empleados / Usuarios:** email con formato válido, contraseña ≥ 8 caracteres, campos requeridos
- **Proveedores:** nombre, email, teléfono requeridos
- **Ventas / Checkout:** stock suficiente verificado en frontend antes de confirmar
- **Registro:** confirmación de contraseña, email único

Los errores se muestran inline bajo cada campo.

### Reportes visibles en la UI

La página `/dashboard/reports` muestra datos reales en tablas interactivas:

| Reporte | Datos mostrados |
|---------|----------------|
| Resumen de ventas | Total ventas, ingresos por período |
| Ventas detalladas | Cada venta con cliente, empleado, productos |
| Catálogo con stock | Todos los productos con stock actual |
| Compras a proveedores | Recepciones confirmadas |
| Stock bajo | Productos bajo umbral crítico |
| Clientes frecuentes | Top clientes por volumen de compra |
| Más vendidos | Ranking de productos por unidades |
| Ranking de ingresos | Productos por ingreso total |

Adicionalmente, el **Dashboard principal** (`/dashboard`) muestra tarjetas con métricas en tiempo real: ventas del día, ingresos de la semana, productos en stock crítico, y gráficas de resumen.

### Manejo visible de errores

- Mensajes de validación inline en formularios (campo a campo)
- Toast/notificaciones para operaciones exitosas y fallidas
- Página `/access-denied` para rutas sin permiso
- Página `/system-states` con estado de conectividad
- Página `*` (404) para rutas inexistentes
- Estados de carga (`skeleton` / spinner) mientras se obtienen datos
- Mensajes descriptivos cuando una lista está vacía

---

## III · Calidad de código

### ESLint

```bash
cd apps/frontend
npm run lint       # sin errores

cd apps/backend
npm run lint       # sin errores
```

Configuración en `apps/frontend/eslint.config.mjs` con reglas para React, TypeScript y hooks.

### Pruebas

#### Frontend (Vitest)
```bash
cd apps/frontend
npm test
```

| Archivo | Qué prueba |
|---------|-----------|
| `src/router/route-paths.spec.ts` | Constantes de rutas correctas |
| `src/router/protected-route.spec.tsx` | Guard redirige según autenticación y rol |
| `src/components/ui/badge.spec.tsx` | Renderizado de variantes del componente Badge |
| `src/lib/auth/roles.spec.ts` | Lógica de permisos por rol |
| `src/lib/auth/redirects.spec.ts` | Redirecciones correctas por rol después de login |

#### Backend (Jest)
```bash
cd apps/backend
npm test
```

| Archivo | Qué prueba |
|---------|-----------|
| `src/auth/auth.service.spec.ts` | Login, registro, validación de JWT |
| `src/productos/productos.service.spec.ts` | CRUD de productos, validaciones |
| `src/proveedores/proveedores.service.spec.ts` | CRUD de proveedores |
| `src/checkout/checkout.service.spec.ts` | Flujo de compra, stock insuficiente |
| `src/mis-ordenes/mis-ordenes.service.spec.ts` | Historial de órdenes del cliente |

---

## IV · Despliegue y entrega

### Docker Compose

El proyecto levanta completamente con un solo comando:

```bash
docker compose up
```

Servicios definidos en `docker-compose.yml` (raíz) + `apps/backend/docker-compose.yml`:

| Servicio | Imagen | Puerto host |
|----------|--------|-------------|
| `postgres` | postgres:17-alpine | 5433 |
| `backend` | Build desde `apps/backend/Dockerfile` | 3003 |
| `frontend` | Build desde `apps/frontend/Dockerfile` | 3002 |
| `pgadmin` | dpage/pgadmin4 | 5051 |

La base de datos se inicializa automáticamente con el schema y seed vía `db/init_all.sh` montado en `/docker-entrypoint-initdb.d/`.

---

## V · Avanzado

### Autenticación con login/logout y Context

- JWT emitido en `POST /auth/login`, almacenado en `localStorage`
- `SessionContext` provee `isAuthenticated`, `user` y `logout()` a toda la app
- `ProtectedRoute` consume el contexto y redirige a `/login` si no hay sesión, o a `/access-denied` si el rol no coincide
- El navbar muestra el nombre del usuario y un botón de logout en todas las vistas protegidas
- Al hacer logout se limpia el contexto y `localStorage` y se redirige a `/login`

### Exportar reporte a CSV

Desde `/dashboard/reports`, cualquier reporte puede descargarse como CSV:

1. El usuario selecciona el tipo de reporte y aplica filtros opcionales
2. Hace clic en **Exportar CSV**
3. El frontend llama a `GET /reportes/export/csv?tipo=...`
4. El backend genera el CSV con los datos del reporte y lo devuelve
5. El frontend lo descarga automáticamente con el nombre `retrosound_<tipo>_<fecha>.csv`

### Diseño responsivo

La interfaz es completamente responsiva con Tailwind CSS:

- **Móvil:** navbar colapsable con menú hamburguesa, cards en columna única, tablas con scroll horizontal
- **Tablet:** grid de 2 columnas para productos y reportes
- **Escritorio:** sidebar lateral fijo, grids de 3-4 columnas, tablas completas

---

## Estructura del repositorio

```
retrosound/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── productos/
│   │   │   ├── clientes/
│   │   │   ├── empleados/
│   │   │   ├── proveedores/
│   │   │   ├── ventas/
│   │   │   ├── carrito/
│   │   │   ├── checkout/
│   │   │   ├── mis-ordenes/
│   │   │   ├── inventario/
│   │   │   ├── proveedor-portal/
│   │   │   ├── reportes/
│   │   │   ├── dashboard/
│   │   │   ├── catalogs/
│   │   │   └── database/
│   │   ├── prisma/
│   │   └── Dockerfile
│   └── frontend/         # React + Vite
│       ├── src/
│       │   ├── contexts/
│       │   ├── pages/
│       │   │   ├── public/
│       │   │   ├── cliente/
│       │   │   ├── dashboard/
│       │   │   └── proveedor/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── router/
│       │   └── lib/
│       └── Dockerfile
├── db/
│   ├── project2/         # Schema y seed Proyecto 2
│   ├── project3/         # Scripts Proyecto 3
│   └── init_all.sh       # Inicialización automática
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Comandos útiles

```bash
# Levantar en background
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend

# Reconstruir tras cambios
docker compose up --build

# Parar todo
docker compose down

# Parar y borrar volúmenes (reset DB)
docker compose down -v

# Correr tests
cd apps/frontend && npm test
cd apps/backend && npm test

# Lint
cd apps/frontend && npm run lint
cd apps/backend && npm run lint
```
