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

Todos los reportes se acceden desde **Reportes** en la barra de navegación. Cada pestaña ejecuta una consulta SQL en tiempo real contra PostgreSQL a través de los endpoints listados abajo.

---

### 1. Vista SQL con cálculo de IVA 12% — `vista_resumen_ventas`

**Endpoint:** `GET /reportes/resumen-ventas?estado=completada`  
**Técnica:** VIEW definido en migración SQL, consultado con `SELECT * FROM vista_resumen_ventas`

La vista fue creada mediante `CREATE OR REPLACE VIEW` en la migración `20260501080000_update_vista_resumen_ventas`:

```sql
CREATE OR REPLACE VIEW vista_resumen_ventas AS
SELECT
  v.id_venta,
  v.fecha_venta,
  v.metodo_pago,
  v.estado_venta,
  v.descuento_venta,
  (c.nombre_cliente || ' ' || c.apellido_cliente)             AS cliente,
  c.correo_cliente,
  (e.nombre_empleado || ' ' || e.apellido_empleado)           AS empleado,
  COUNT(dv.id_detalle_venta)::INT                             AS total_items,
  COALESCE(SUM(
    dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
  ), 0)                                                       AS total_bruto,
  ROUND(
    COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta, 2
  )                                                           AS total_neto,
  ROUND(
    (COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta) * 0.12, 2
  )                                                           AS iva_12,
  ROUND(
    (COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta) * 1.12, 2
  )                                                           AS total
FROM venta v
JOIN cliente  c ON c.id_cliente  = v.id_cliente
JOIN empleado e ON e.id_empleado = v.id_empleado
LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
GROUP BY
  v.id_venta, v.fecha_venta, v.metodo_pago, v.estado_venta, v.descuento_venta,
  c.nombre_cliente, c.apellido_cliente, c.correo_cliente,
  e.nombre_empleado, e.apellido_empleado;
```

El backend la consume con: `SELECT * FROM vista_resumen_ventas [WHERE estado_venta = $1]`

---

### 2. JOIN múltiple entre 4 tablas — Ventas Detalle

**Endpoint:** `GET /reportes/ventas-detalle`  
**Técnica:** JOIN en cadena entre `venta`, `cliente`, `empleado`, `detalle_venta` y `producto`

```sql
SELECT
  v.id_venta,
  v.fecha_venta,
  v.metodo_pago,
  v.estado_venta,
  v.descuento_venta,
  (c.nombre_cliente || ' ' || c.apellido_cliente)   AS cliente,
  c.correo_cliente,
  (e.nombre_empleado || ' ' || e.apellido_empleado) AS empleado,
  p.titulo_producto,
  p.codigo_sku,
  dv.cantidad_vendida,
  dv.precio_unitario_venta,
  dv.descuento_detalle,
  (dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle) AS subtotal
FROM venta v
JOIN cliente       c  ON c.id_cliente  = v.id_cliente
JOIN empleado      e  ON e.id_empleado = v.id_empleado
JOIN detalle_venta dv ON dv.id_venta   = v.id_venta
JOIN producto      p  ON p.id_producto = dv.id_producto
ORDER BY v.fecha_venta DESC, v.id_venta;
```

---

### 3. JOIN múltiple con STRING_AGG — Catálogo

**Endpoint:** `GET /reportes/productos-catalogo`  
**Técnica:** 6 JOINs (4 INNER + 2 LEFT) con `STRING_AGG(DISTINCT ...)` para agregar artistas y géneros

```sql
SELECT
  p.id_producto,
  p.titulo_producto,
  p.codigo_sku,
  p.precio_venta,
  p.stock_actual,
  p.stock_minimo,
  p.estado_producto,
  cat.nombre_categoria,
  fmt.nombre_formato,
  STRING_AGG(DISTINCT a.nombre_artista,          ', ') AS artistas,
  STRING_AGG(DISTINCT g.nombre_genero_musical,   ', ') AS generos
FROM producto p
JOIN categoria    cat ON cat.id_categoria = p.id_categoria
JOIN formato      fmt ON fmt.id_formato   = p.id_formato
LEFT JOIN producto_artista pa ON pa.id_producto        = p.id_producto
LEFT JOIN artista           a  ON a.id_artista          = pa.id_artista
LEFT JOIN producto_genero  pg ON pg.id_producto        = p.id_producto
LEFT JOIN genero_musical    g  ON g.id_genero_musical  = pg.id_genero_musical
WHERE p.estado_producto != 'descontinuado'
GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
ORDER BY p.titulo_producto;
```

---

### 4. JOIN múltiple en cadena — Compras Proveedor

**Endpoint:** `GET /reportes/compras-proveedor`  
**Técnica:** 4 JOINs encadenados: `compra_proveedor` → `proveedor`, `empleado`, `detalle_compra_proveedor` → `producto`

```sql
SELECT
  cp.id_compra_proveedor,
  cp.fecha_compra_proveedor,
  cp.estado_compra,
  pr.nombre_proveedor,
  pr.correo_proveedor,
  (e.nombre_empleado || ' ' || e.apellido_empleado) AS empleado_responsable,
  p.titulo_producto,
  p.codigo_sku,
  dcp.cantidad_comprada,
  dcp.costo_unitario_compra,
  (dcp.cantidad_comprada * dcp.costo_unitario_compra) AS costo_total
FROM compra_proveedor cp
JOIN proveedor                pr  ON pr.id_proveedor         = cp.id_proveedor
JOIN empleado                 e   ON e.id_empleado           = cp.id_empleado
JOIN detalle_compra_proveedor dcp ON dcp.id_compra_proveedor = cp.id_compra_proveedor
JOIN producto                 p   ON p.id_producto           = dcp.id_producto
ORDER BY cp.fecha_compra_proveedor DESC, cp.id_compra_proveedor;
```

---

### 5. Subquery escalar en cláusula FROM — Stock Bajo

**Endpoint:** `GET /reportes/productos-bajo-stock`  
**Técnica:** Subquery escalar `(SELECT AVG(stock_actual) FROM producto)` integrado como tabla derivada en el `FROM` mediante `JOIN ... ON TRUE`

```sql
SELECT
  p.id_producto,
  p.titulo_producto,
  p.codigo_sku,
  p.stock_actual,
  p.stock_minimo,
  p.estado_producto,
  cat.nombre_categoria,
  fmt.nombre_formato,
  ROUND(stock_prom.promedio, 2) AS promedio_stock_general
FROM producto p
JOIN categoria cat ON cat.id_categoria = p.id_categoria
JOIN formato   fmt ON fmt.id_formato   = p.id_formato
JOIN (
  SELECT AVG(stock_actual) AS promedio FROM producto
) stock_prom ON TRUE
WHERE p.stock_actual <= stock_prom.promedio
  AND p.estado_producto != 'descontinuado'
ORDER BY p.stock_actual ASC;
```

El subquery calcula el promedio global de stock una vez y se cruza con cada fila del producto para comparar.

---

### 6. Subquery EXISTS + subquery correlacionado — Clientes Frecuentes

**Endpoint:** `GET /reportes/clientes-frecuentes`  
**Técnica:** `WHERE EXISTS (SELECT 1 ...)` para filtrar clientes con ventas completadas, y subquery correlacionado `(SELECT COUNT(*) FROM venta v2 WHERE v2.id_cliente = c.id_cliente ...)` para contar cuántas

```sql
SELECT
  c.id_cliente,
  (c.nombre_cliente || ' ' || c.apellido_cliente) AS cliente,
  c.correo_cliente,
  c.telefono_cliente,
  c.direccion_cliente,
  c.fecha_registro_cliente,
  (
    SELECT COUNT(*)
    FROM venta v2
    WHERE v2.id_cliente   = c.id_cliente
      AND v2.estado_venta = 'completada'
  )::INT AS ventas_completadas
FROM cliente c
WHERE EXISTS (
  SELECT 1
  FROM venta v
  WHERE v.id_cliente   = c.id_cliente
    AND v.estado_venta = 'completada'
)
  AND c.estado_cliente = 'activo'
ORDER BY ventas_completadas DESC, c.nombre_cliente;
```

---

### 7. GROUP BY + HAVING + funciones de agregación — Más Vendidos

**Endpoint:** `GET /reportes/productos-mas-vendidos?min=N`  
**Técnica:** `GROUP BY` con `HAVING SUM(cantidad_vendida) >= N` (N configurable desde la UI) y funciones de agregación `SUM`, `COUNT`, `AVG`

```sql
SELECT
  p.id_producto,
  p.titulo_producto,
  p.codigo_sku,
  p.precio_venta,
  cat.nombre_categoria,
  fmt.nombre_formato,
  SUM(dv.cantidad_vendida)::INT                              AS total_unidades,
  COUNT(DISTINCT dv.id_venta)::INT                          AS en_ventas,
  SUM(dv.cantidad_vendida * dv.precio_unitario_venta
      - dv.descuento_detalle)                               AS ingresos_generados,
  ROUND(AVG(dv.precio_unitario_venta)::NUMERIC, 2)          AS precio_promedio_venta
FROM detalle_venta dv
JOIN producto  p   ON p.id_producto   = dv.id_producto
JOIN categoria cat ON cat.id_categoria = p.id_categoria
JOIN formato   fmt ON fmt.id_formato   = p.id_formato
GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
HAVING SUM(dv.cantidad_vendida) >= <min>
ORDER BY total_unidades DESC, ingresos_generados DESC;
```

El parámetro `min` se pasa de forma segura (sin interpolación directa) usando el tagged template de Prisma.

---

### 8. CTE (WITH) + función de ventana DENSE_RANK() — Ranking Ingresos

**Endpoint:** `GET /reportes/ranking-ingresos`  
**Técnica:** CTE nombrado `ingresos_producto` que precalcula ingresos por producto, luego `DENSE_RANK() OVER (ORDER BY ingresos_totales DESC)` como función de ventana

```sql
WITH ingresos_producto AS (
  SELECT
    p.id_producto,
    p.titulo_producto,
    p.codigo_sku,
    p.precio_venta,
    cat.nombre_categoria,
    fmt.nombre_formato,
    COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0)                              AS ingresos_totales,
    COALESCE(SUM(dv.cantidad_vendida), 0)::INT AS unidades_vendidas
  FROM producto p
  JOIN categoria    cat ON cat.id_categoria = p.id_categoria
  JOIN formato      fmt ON fmt.id_formato   = p.id_formato
  LEFT JOIN detalle_venta dv ON dv.id_producto = p.id_producto
  GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
)
SELECT
  DENSE_RANK() OVER (ORDER BY ingresos_totales DESC)::INT AS ranking,
  id_producto,
  titulo_producto,
  codigo_sku,
  nombre_categoria,
  nombre_formato,
  precio_venta,
  ingresos_totales,
  unidades_vendidas
FROM ingresos_producto
ORDER BY ranking, titulo_producto;
```

`DENSE_RANK()` asigna el mismo número a empates sin saltarse posiciones (a diferencia de `RANK()`).

---

## Lógica de alertas del dashboard

### Stock crítico

El panel **Stock crítico** muestra todos los productos cuyo stock actual está por debajo o igual al mínimo definido para ese producto. La consulta que lo alimenta es:

```sql
SELECT p.id_producto, p.titulo_producto, p.codigo_sku,
       p.stock_actual, p.stock_minimo,
       c.nombre_categoria, f.nombre_formato
FROM   producto p
JOIN   categoria c USING (id_categoria)
JOIN   formato   f USING (id_formato)
WHERE  p.stock_actual <= p.stock_minimo
  AND  p.estado = 'activo'
ORDER  BY (p.stock_actual::float / NULLIF(p.stock_minimo, 0)) ASC;
```

Cada fila del panel muestra el par `stock_actual / stock_minimo` para que el responsable sepa cuántas unidades faltan reponer. Cuando todos los productos tienen stock suficiente, el panel indica ✓.

### Compras pendientes

El panel **Compras pendientes** lista las órdenes de compra a proveedores cuyo estado aún es `pendiente` (es decir, aún no han sido recibidas en el almacén). La consulta que lo alimenta es:

```sql
SELECT cp.id_compra_proveedor, cp.fecha_compra_proveedor,
       pr.nombre_proveedor,
       u.nombre || ' ' || u.apellido AS empleado,
       COUNT(dcp.id_producto) AS num_productos
FROM   compra_proveedor  cp
JOIN   proveedor         pr  USING (id_proveedor)
JOIN   usuario           u   ON u.id_usuario = cp.id_empleado
JOIN   detalle_compra_proveedor dcp USING (id_compra_proveedor)
WHERE  cp.estado_compra = 'pendiente'
GROUP  BY cp.id_compra_proveedor, pr.nombre_proveedor, u.nombre, u.apellido,
          cp.fecha_compra_proveedor
ORDER  BY cp.fecha_compra_proveedor ASC;
```

Una compra pasa a `completada` cuando el empleado registra la recepción. Mientras esté `pendiente`, el stock de los productos involucrados **no** ha sido incrementado.

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
