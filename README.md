# RetroSound Store

Proyecto 2 — Bases de Datos 1 (cc3088) · Universidad del Valle de Guatemala · Ciclo 1 2026

RetroSound Store es una tienda especializada en la venta de música en formatos físicos: vinilos, CDs y casetes. Permite gestionar productos, proveedores, ventas con transacciones explícitas y generar reportes SQL avanzados.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 11 + TypeScript + Prisma 6 |
| Frontend | Next.js 16 (App Router) + TypeScript + shadcn/ui |
| Base de datos | PostgreSQL 17 (Alpine) |
| Contenedores | Docker + Docker Compose |

---

## Levantar desde cero (evaluación)

### Requisitos

- Docker Desktop o Docker Engine + Docker Compose v2
- Puertos libres: `3002` (frontend), `3003` (backend), `5433` (Postgres), `5051` (pgAdmin)

### 1. Copiar variables de entorno

```bash
cp .env.example .env
```

El `.env.example` ya contiene los valores correctos para evaluación. No es necesario editar nada.

### 2. Levantar todos los servicios

```bash
docker compose up --build
```

El backend ejecuta automáticamente `prisma migrate deploy` y `prisma db seed` en el primer arranque. Cuando veas la línea:

```
backend-1  | Backend corriendo en http://localhost:3001
```

los servicios están listos.

### 3. Inicio limpio (si ya existía un volumen anterior)

```bash
docker compose down -v
docker compose up --build
```

---

## Variables de entorno

Todas están en `.env.example` con valores por defecto funcionales:

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `DB_USER` | `proy2` | Usuario PostgreSQL (obligatorio para rúbrica) |
| `DB_PASSWORD` | `secret` | Contraseña PostgreSQL (obligatorio para rúbrica) |
| `DB_NAME` | `retrosound` | Nombre de la base de datos |
| `DB_PORT` | `5433` | Puerto expuesto de Postgres en el host |
| `BACKEND_PORT` | `3003` | Puerto del backend en el host |
| `FRONTEND_PORT` | `3002` | Puerto del frontend en el host |
| `JWT_SECRET` | `change-me-in-production` | Secreto para firmar JWT |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3003` | URL del backend que usa el frontend |
| `PGADMIN_EMAIL` | `admin@retrosound.dev` | Correo de acceso a pgAdmin |
| `PGADMIN_PASSWORD` | `admin` | Contraseña de pgAdmin |

---

## Accesos

| Servicio | URL | Credenciales |
|---------|-----|-------------|
| **Frontend** | http://localhost:3002 | Ver usuarios de prueba abajo |
| **Backend API** | http://localhost:3003 | — |
| **pgAdmin** | http://localhost:5051 | `admin@retrosound.dev` / `admin` |
| **PostgreSQL** | `localhost:5433` | `proy2` / `secret` / db `retrosound` |

---

## Usuarios de prueba (seed)

Todos los usuarios usan la misma contraseña: **`retro2025`**

| Correo | Rol |
|--------|-----|
| `admin@retrosound.com` | admin |
| `angel.sanabria@retrosound.com` | empleado |
| `saul.castillo@retrosound.com` | empleado |
| `paola.hernandez@retrosound.com` | empleado |
| `carlos.mendoza@retrosound.com` | empleado |
| `andrea.garcia@email.com` | cliente |
| `mario.lopez@email.com` | cliente |
| `sofia.ramirez@email.com` | cliente |

---

## Funcionalidades implementadas

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | Autenticación | Login JWT, logout, guard de rutas, badge de rol en navbar |
| 2 | Dashboard | 6 métricas en tiempo real + alertas de stock crítico + compras pendientes + ventas recientes |
| 3 | Productos | CRUD completo: crear, editar, desactivar, filtrar por categoría/formato |
| 4 | Proveedores | CRUD completo: crear, editar, desactivar (muestra activos e inactivos) |
| 5 | Ventas | Registro de venta con múltiples productos, descuento, IVA 12% y recibo |
| 6 | Reportes | 8 reportes SQL con 5 tipos distintos de consultas avanzadas |

---

## Reportes SQL implementados

Todos los reportes están en **Reportes** en la barra de navegación.

| Pestaña | Endpoint | Tipo SQL | Criterio cubierto |
|---------|----------|----------|-------------------|
| Ventas detalle | `GET /reportes/ventas-detalle` | JOIN múltiple | venta → cliente, empleado, detalle → producto |
| Catálogo productos | `GET /reportes/productos-catalogo` | JOIN múltiple | producto → categoría, formato, artistas, géneros |
| Compras proveedor | `GET /reportes/compras-proveedor` | JOIN múltiple | compra → proveedor, empleado, detalle → producto |
| Stock bajo | `GET /reportes/productos-bajo-stock` | SUBQUERY escalar | stock_actual ≤ promedio general (subconsulta en FROM) |
| Clientes frecuentes | `GET /reportes/clientes-frecuentes` | EXISTS + subquery correlacionado | clientes con ≥1 venta completada |
| Más vendidos | `GET /reportes/productos-mas-vendidos?min=N` | GROUP BY + HAVING + SUM/COUNT/AVG | ventas agrupadas con filtro por mínimo |
| Ranking ingresos | `GET /reportes/ranking-ingresos` | CTE (WITH) + DENSE_RANK() | ranking de productos por ingresos totales |
| Resumen ventas | `GET /reportes/resumen-ventas?estado=completada` | VIEW | usa `vista_resumen_ventas` con IVA 12% |

---

## Cómo probar el CRUD de productos

1. Ingresar a http://localhost:3002 y autenticarse con `admin@retrosound.com` / `retro2025`.
2. Ir a **Productos** en la barra de navegación.
3. **Crear:** clic en **+ Nuevo Producto**, llenar SKU, título, categoría, formato, precio, stock mínimo y actual.
4. **Editar:** clic en **Editar** en la fila del producto → modificar campos → **Guardar**.
5. **Desactivar:** clic en **Desactivar** → el estado cambia a `inactivo` y se refleja con badge rojo.

Lo mismo aplica para **Proveedores** (enlace en la barra de navegación).

---

## Cómo probar una venta (transacción explícita)

La venta usa una transacción PostgreSQL explícita (`BEGIN / COMMIT / ROLLBACK`) implementada con `prisma.$transaction`.

### Desde la UI

1. Ir a **Ventas** en la barra de navegación.
2. Seleccionar cliente y empleado.
3. Añadir uno o más productos con cantidad.
4. Opcional: ingresar porcentaje de descuento.
5. Clic en **Registrar Venta** → se muestra el recibo con subtotal, descuento, IVA 12% y total.

### Desde la API (curl)

```bash
# 1. Obtener token
TOKEN=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@retrosound.com","contrasena":"retro2025"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 2. Registrar venta
curl -s -X POST http://localhost:3003/ventas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idCliente": 1,
    "idEmpleado": 1,
    "descuentoPorcentaje": 10,
    "detalles": [
      { "idProducto": 1, "cantidadVendida": 1, "precioUnitario": 350.00 }
    ]
  }'
```

**Rollback automático:** si el cliente no existe, el empleado está inactivo, o el producto no tiene stock suficiente, la transacción hace ROLLBACK y devuelve un error descriptivo. El stock no se modifica.

---

## Cómo exportar CSV

En la pantalla de **Reportes**, cada pestaña muestra una tabla con todos los datos. Para exportar:

1. Seleccionar toda la tabla (Ctrl+A dentro de la tabla).
2. Copiar y pegar en una hoja de cálculo (Excel / Google Sheets), o bien:
3. Usar la API directamente y guardar el JSON:

```bash
curl -s http://localhost:3003/reportes/ventas-detalle \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool > ventas_detalle.json
```

---

## Estructura del proyecto

```
retrosound/
├── apps/
│   ├── backend/          ← NestJS + Prisma
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── productos/
│   │   │   ├── proveedores/
│   │   │   ├── ventas/
│   │   │   └── reportes/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── Dockerfile
│   └── frontend/         ← Next.js 16 App Router
│       ├── app/
│       │   └── dashboard/
│       │       ├── productos/
│       │       ├── proveedores/
│       │       ├── ventas/
│       │       └── reportes/
│       ├── components/
│       ├── hooks/
│       └── Dockerfile
├── db/
│   └── retrosound_ddl.sql
├── .env.example
└── docker-compose.yml
```

---

## Solución a errores comunes

### `port is already allocated`

Algún servicio local usa el puerto 3002, 3003, 5433 o 5051. Opciones:

```bash
# Ver qué proceso usa el puerto (ejemplo con 3003)
sudo lsof -i :3003

# O cambiar los puertos en .env antes de levantar
BACKEND_PORT=3004
FRONTEND_PORT=3005
```

### El backend arranca pero el seed falla

```bash
# Limpiar volumen y reiniciar desde cero
docker compose down -v
docker compose up --build
```

### `prisma migrate deploy` falla con "relation already exists"

El volumen de Postgres tiene datos de una versión anterior del esquema. Solución:

```bash
docker compose down -v && docker compose up --build
```

### El frontend muestra error de red / no carga datos

Verificar que `NEXT_PUBLIC_API_URL` en `.env` apunte al backend correcto:

```
NEXT_PUBLIC_API_URL=http://localhost:3003
```

Si cambió el `BACKEND_PORT`, actualizar esta variable también y reconstruir:

```bash
docker compose build frontend
docker compose up -d frontend
```

### Token expirado / redirige al login automáticamente

Es comportamiento esperado. El JWT tiene expiración configurada. Volver a hacer login con las credenciales de prueba.

---

## Desarrollo local (apps fuera de Docker)

```bash
# Solo BD y pgAdmin en Docker
docker compose up postgres pgadmin

# Backend (nueva terminal)
cd apps/backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend (nueva terminal)
cd apps/frontend
npm install
npm run dev
```

En desarrollo local: frontend en `http://localhost:3000`, backend en `http://localhost:3001`.
