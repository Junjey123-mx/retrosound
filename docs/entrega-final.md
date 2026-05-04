# RetroSound Store — Documentación académica final

Proyecto 2 · Bases de Datos 1 (cc3088) · Universidad del Valle de Guatemala · Ciclo 1 2026

---

## 1. Descripción del sistema

RetroSound Store es una tienda especializada en la venta de música en formatos físicos (vinilos, CDs y casetes). El sistema gestiona productos, proveedores, clientes, empleados, ventas con transacciones explícitas, compras a proveedores, carrito de compras y reportes SQL avanzados.

Stack tecnológico final:

- Backend: NestJS 11 + TypeScript + pg/node-postgres (sin ORM)
- Frontend: Next.js 16 + React 19 + Tailwind CSS
- Base de datos: PostgreSQL 17
- Infraestructura: Docker Compose

---

## 2. Entidades del modelo de datos

### Catálogos

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Categoría | `categoria` | Agrupa productos (ej. Rock, Jazz, Clásica) |
| Formato | `formato` | Tipo físico de producto: Vinilo, CD, Casete |
| Género musical | `genero_musical` | Etiqueta musical del producto |
| Artista | `artista` | Ejecutante(s) del álbum |

### Personas / terceros

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Cliente | `cliente` | Persona que realiza compras; puede tener cuenta de usuario |
| Empleado | `empleado` | Personal de la tienda; puede tener cuenta de usuario |
| Proveedor | `proveedor` | Empresa que abastece productos a la tienda |

### Producto

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Producto | `producto` | Álbum físico con SKU, precio, stock, categoría y formato |
| Producto–Artista | `producto_artista` | Tabla asociativa N:M entre Producto y Artista |
| Producto–Género | `producto_genero` | Tabla asociativa N:M entre Producto y Género musical |

### Autenticación

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Usuario | `usuario` | Cuenta de acceso; vincula a cliente, empleado o proveedor |

### Operaciones de venta

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Venta | `venta` | Cabecera de una venta; id_empleado puede ser NULL (venta online) |
| Detalle de venta | `detalle_venta` | Línea de producto dentro de una venta (precio snapshot) |

### Operaciones de compra

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Compra a proveedor | `compra_proveedor` | Orden de compra a un proveedor, gestionada por un empleado |
| Detalle de compra | `detalle_compra_proveedor` | Línea de producto dentro de una compra |

### Carrito / e-commerce

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| Carrito | `carrito` | Carrito de compras asociado a un cliente; un solo activo por cliente |
| Ítem del carrito | `carrito_item` | Producto y cantidad dentro de un carrito (precio snapshot al agregar) |

---

## 3. Modelo relacional (notación simplificada)

```
CATEGORIA(id_categoria PK, nombre_categoria, descripcion_categoria, estado_categoria)

FORMATO(id_formato PK, nombre_formato, descripcion_formato, estado_formato)

GENERO_MUSICAL(id_genero_musical PK, nombre_genero_musical, descripcion_genero_musical, estado_genero_musical)

ARTISTA(id_artista PK, nombre_artista, pais_origen_artista, anio_inicio_artista, estado_artista)

CLIENTE(
  id_cliente PK,
  nombre_cliente, apellido_cliente, telefono_cliente, correo_cliente,
  direccion_cliente, fecha_registro_cliente, estado_cliente, fecha_inactivacion
)

EMPLEADO(
  id_empleado PK,
  nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado,
  fecha_contratacion, estado_empleado, fecha_inactivacion
)

PROVEEDOR(
  id_proveedor PK,
  nombre_proveedor, correo_proveedor, telefono_proveedor,
  direccion_proveedor, estado_proveedor
)

PRODUCTO(
  id_producto PK,
  titulo_producto, codigo_sku UNIQUE,
  precio_venta, stock_actual, stock_minimo,
  anio_lanzamiento, descripcion_producto, estado_producto,
  id_categoria FK → CATEGORIA,
  id_formato   FK → FORMATO
)

PRODUCTO_ARTISTA(
  id_producto FK → PRODUCTO,
  id_artista  FK → ARTISTA,
  PK(id_producto, id_artista)
)

PRODUCTO_GENERO(
  id_producto       FK → PRODUCTO,
  id_genero_musical FK → GENERO_MUSICAL,
  PK(id_producto, id_genero_musical)
)

USUARIO(
  id_usuario PK,
  correo_usuario UNIQUE,
  contrasena_hash,
  rol_usuario,
  estado_usuario,
  fecha_inactivacion,
  id_cliente   FK → CLIENTE   NULL,
  id_empleado  FK → EMPLEADO  NULL,
  id_proveedor FK → PROVEEDOR NULL
)

VENTA(
  id_venta PK,
  fecha_venta, descuento_venta, metodo_pago, estado_venta,
  id_cliente  FK → CLIENTE  NOT NULL,
  id_empleado FK → EMPLEADO NULL   ← NULL para ventas online (checkout)
)

DETALLE_VENTA(
  id_detalle_venta PK,
  cantidad_vendida, precio_unitario_venta, descuento_detalle,
  id_venta    FK → VENTA,
  id_producto FK → PRODUCTO,
  UNIQUE(id_venta, id_producto)
)

COMPRA_PROVEEDOR(
  id_compra_proveedor PK,
  fecha_compra_proveedor, estado_compra,
  id_proveedor FK → PROVEEDOR,
  id_empleado  FK → EMPLEADO
)

DETALLE_COMPRA_PROVEEDOR(
  id_detalle_compra_proveedor PK,
  cantidad_comprada, costo_unitario_compra,
  id_compra_proveedor FK → COMPRA_PROVEEDOR,
  id_producto         FK → PRODUCTO
)

CARRITO(
  id_carrito PK,
  estado_carrito, fecha_creacion, fecha_actualizacion,
  id_cliente FK → CLIENTE NOT NULL
)

CARRITO_ITEM(
  id_carrito_item PK,
  cantidad, precio_unitario_snapshot, fecha_agregado,
  id_carrito  FK → CARRITO  (ON DELETE CASCADE),
  id_producto FK → PRODUCTO,
  UNIQUE(id_carrito, id_producto)
)
```

---

## 4. Relaciones y cardinalidades

| Relación | Cardinalidad | Descripción |
|----------|-------------|-------------|
| Producto → Categoría | N:1 | Cada producto pertenece a una categoría |
| Producto → Formato | N:1 | Cada producto tiene un formato físico |
| Producto ↔ Artista | N:M | Via `producto_artista` |
| Producto ↔ Género musical | N:M | Via `producto_genero` |
| Cliente → Venta | 1:N | Un cliente puede tener muchas ventas |
| Empleado → Venta | 0/1:N | Un empleado gestiona ventas (puede ser NULL en venta online) |
| Venta → Detalle venta | 1:N | Una venta tiene uno o más ítems |
| Producto → Detalle venta | 1:N | Un producto puede aparecer en muchos detalles |
| Proveedor → Compra proveedor | 1:N | Un proveedor puede tener muchas compras |
| Empleado → Compra proveedor | 1:N | Un empleado gestiona compras a proveedores |
| Compra proveedor → Detalle compra | 1:N | Una compra tiene uno o más productos |
| Cliente → Carrito | 1:N | Un cliente puede tener múltiples carritos (uno activo a la vez) |
| Carrito → Carrito ítem | 1:N | Un carrito tiene uno o más ítems |
| Producto → Carrito ítem | 1:N | Un producto puede estar en muchos carritos |
| Usuario ↔ Cliente | 0/1:1 | Un usuario puede ser cliente (o no) |
| Usuario ↔ Empleado | 0/1:1 | Un usuario puede ser empleado (o no) |
| Usuario ↔ Proveedor | 0/1:1 | Un usuario puede ser proveedor (o no) |

---

## 5. Dependencias funcionales

### categoria

```
id_categoria → nombre_categoria, descripcion_categoria, estado_categoria
```

### formato, genero_musical, artista

Misma estructura: la PK determina todos los atributos descriptivos y estado.

### cliente

```
id_cliente → nombre_cliente, apellido_cliente, telefono_cliente, correo_cliente,
             direccion_cliente, fecha_registro_cliente, estado_cliente, fecha_inactivacion
```

### empleado

```
id_empleado → nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado,
              fecha_contratacion, estado_empleado, fecha_inactivacion
```

### proveedor

```
id_proveedor → nombre_proveedor, correo_proveedor, telefono_proveedor,
               direccion_proveedor, estado_proveedor
```

### producto

```
id_producto → titulo_producto, codigo_sku, precio_venta, stock_actual, stock_minimo,
              anio_lanzamiento, descripcion_producto, estado_producto,
              id_categoria, id_formato
codigo_sku  → id_producto  (UNIQUE implica dependencia funcional inversa)
```

### producto_artista / producto_genero

```
(id_producto, id_artista)       → (no hay atributos adicionales — solo clave compuesta)
(id_producto, id_genero_musical) → (no hay atributos adicionales)
```

### usuario

```
id_usuario    → correo_usuario, contrasena_hash, rol_usuario, estado_usuario,
                fecha_inactivacion, id_cliente, id_empleado, id_proveedor
correo_usuario → id_usuario  (UNIQUE)
```

### venta

```
id_venta → fecha_venta, descuento_venta, metodo_pago, estado_venta,
           id_cliente, id_empleado
```

> `id_empleado` puede ser NULL para ventas generadas por checkout (venta online).

### detalle_venta

```
id_detalle_venta     → id_venta, id_producto, cantidad_vendida,
                        precio_unitario_venta, descuento_detalle
(id_venta, id_producto) → id_detalle_venta  (UNIQUE)
```

> `precio_unitario_venta` y `descuento_detalle` son snapshots del momento de la venta.

### compra_proveedor

```
id_compra_proveedor → fecha_compra_proveedor, estado_compra, id_proveedor, id_empleado
```

### detalle_compra_proveedor

```
id_detalle_compra_proveedor → id_compra_proveedor, id_producto,
                               cantidad_comprada, costo_unitario_compra
```

### carrito

```
id_carrito → id_cliente, estado_carrito, fecha_creacion, fecha_actualizacion
```

> El índice único parcial `uq_carrito_activo_por_cliente` garantiza que solo puede existir un carrito con `estado_carrito = 'activo'` por cliente a la vez.

### carrito_item

```
id_carrito_item        → id_carrito, id_producto, cantidad, precio_unitario_snapshot, fecha_agregado
(id_carrito, id_producto) → id_carrito_item  (UNIQUE)
```

> `precio_unitario_snapshot` es el precio del producto en el momento en que fue agregado al carrito.

---

## 6. Normalización — justificación hasta 3FN

### Primera Forma Normal (1FN)

- Todos los atributos son atómicos: no hay columnas multivaluadas ni listas.
- Las relaciones N:M (producto–artista, producto–género) se resuelven mediante tablas asociativas con clave compuesta.
- Cada tabla tiene una clave primaria definida.

### Segunda Forma Normal (2FN)

- No existen dependencias parciales en las tablas con clave compuesta. `producto_artista` y `producto_genero` solo tienen la clave compuesta; no hay atributos no clave que dependan solo de parte de ella.
- En las tablas con PK simple (SERIAL), todos los atributos dependen completamente de la PK.

### Tercera Forma Normal (3FN)

- No existen dependencias transitivas: ningún atributo no clave depende de otro atributo no clave.
- Los totales de venta (subtotal, total bruto, IVA, total final) **no se almacenan** en la base de datos; se calculan en tiempo real en la vista `vista_resumen_ventas` y en las consultas de reportes.
- `precio_unitario_venta` en `detalle_venta` y `precio_unitario_snapshot` en `carrito_item` son snapshots explícitos de negocio (precio vigente al momento de la operación), no atributos calculados ni derivados; su almacenamiento es una decisión de diseño, no una violación de 3FN.

---

## 7. Valores permitidos (CHECK constraints)

| Tabla | Columna | Valores permitidos |
|-------|---------|-------------------|
| `categoria` | `estado_categoria` | `activo`, `inactivo` |
| `formato` | `estado_formato` | `activo`, `inactivo` |
| `genero_musical` | `estado_genero_musical` | `activo`, `inactivo` |
| `artista` | `estado_artista` | `activo`, `inactivo` |
| `cliente` | `estado_cliente` | `activo`, `inactivo` |
| `empleado` | `estado_empleado` | `activo`, `inactivo` |
| `proveedor` | `estado_proveedor` | `activo`, `inactivo` |
| `producto` | `estado_producto` | `activo`, `inactivo`, `agotado`, `descontinuado` |
| `producto` | `precio_venta` | `>= 0` |
| `producto` | `stock_actual` | `>= 0` |
| `producto` | `stock_minimo` | `>= 0` |
| `usuario` | `rol_usuario` | `admin`, `empleado`, `cliente`, `proveedor` |
| `usuario` | `estado_usuario` | `activo`, `bloqueado`, `inactivo` |
| `venta` | `estado_venta` | `pendiente`, `completada`, `cancelada` |
| `venta` | `descuento_venta` | `>= 0` |
| `detalle_venta` | `cantidad_vendida` | `> 0` |
| `detalle_venta` | `precio_unitario_venta` | `>= 0` |
| `detalle_venta` | `descuento_detalle` | `>= 0` |
| `compra_proveedor` | `estado_compra` | `pendiente`, `recibida`, `cancelada` |
| `detalle_compra_proveedor` | `cantidad_comprada` | `> 0` |
| `detalle_compra_proveedor` | `costo_unitario_compra` | `>= 0` |
| `carrito` | `estado_carrito` | `activo`, `convertido`, `abandonado`, `cancelado` |
| `carrito_item` | `cantidad` | `> 0` |
| `carrito_item` | `precio_unitario_snapshot` | `>= 0` |

---

## 8. Índices explícitos

| Índice | Tabla / Columna(s) | Tipo | Justificación |
|--------|--------------------|------|---------------|
| `idx_producto_titulo` | `producto(titulo_producto)` | B-tree | Búsquedas frecuentes de productos por título |
| `idx_venta_fecha` | `venta(fecha_venta)` | B-tree | Reportes y ordenamientos cronológicos de ventas |
| `idx_cliente_correo` | `cliente(correo_cliente)` | B-tree | Lookup de cliente por correo en login y reportes |
| `idx_carrito_cliente_estado` | `carrito(id_cliente, estado_carrito)` | B-tree | Acceso rápido al carrito activo de un cliente |
| `uq_carrito_activo_por_cliente` | `carrito(id_cliente) WHERE estado_carrito = 'activo'` | Unique parcial | Garantiza exactamente un carrito activo por cliente; rechaza duplicados en INSERT |

---

## 9. Vista: `vista_resumen_ventas`

Definida en `db/retrosound_ddl.sql`. Es consultada por:

- `GET /reportes/resumen-ventas` — resumen de todas las ventas con filtro por estado
- `GET /reportes/dashboard` — KPI `total_vendido_mes`

Columnas que calcula:

| Columna | Cálculo |
|---------|---------|
| `total_items` | `COUNT(dv.id_detalle_venta)` |
| `total_bruto` | `SUM(cantidad_vendida × precio_unitario_venta − descuento_detalle)` |
| `total_neto` | `total_bruto − descuento_venta` |
| `iva_12` | `total_neto × 0.12` |
| `total` | `total_neto × 1.12` |
| `empleado` | `COALESCE(nombre || ' ' || apellido, 'Venta Online')` — maneja ventas sin empleado |

---

## 10. Reportes SQL implementados

| # | Reporte | Endpoint | Técnicas SQL | UI |
|---|---------|----------|-------------|-----|
| 1 | Resumen de ventas | `GET /reportes/resumen-ventas` | VIEW, LEFT JOIN, COALESCE, IVA 12% | ✓ |
| 2 | Dashboard | `GET /reportes/dashboard` | Subqueries escalares, JOINs, vista | ✓ |
| 3 | Ventas detalle | `GET /reportes/ventas-detalle` | JOIN múltiple (5 tablas: venta, cliente, empleado, detalle_venta, producto) | ✓ |
| 4 | Catálogo de productos | `GET /reportes/productos-catalogo` | 6 JOINs, STRING_AGG(DISTINCT …) para artistas y géneros | ✓ |
| 5 | Compras a proveedor | `GET /reportes/compras-proveedor` | JOIN en cadena (4 tablas: compra_proveedor, proveedor, empleado, detalle_compra_proveedor, producto) | ✓ |
| 6 | Productos bajo stock | `GET /reportes/productos-bajo-stock` | Subquery escalar en FROM (`SELECT AVG(…) FROM producto`) | ✓ |
| 7 | Clientes frecuentes | `GET /reportes/clientes-frecuentes` | `WHERE EXISTS (SELECT 1 …)` + subquery correlacionado para conteo | ✓ |
| 8 | Productos más vendidos | `GET /reportes/productos-mas-vendidos?min=N` | `GROUP BY` + `HAVING SUM(…) >= $1` + `SUM`, `COUNT`, `AVG` | ✓ |
| 9 | Ranking ingresos | `GET /reportes/ranking-ingresos` | CTE `WITH ingresos_producto AS (…)` + `DENSE_RANK() OVER (ORDER BY …)` | ✓ |

---

## 11. Transacciones explícitas

El proyecto implementa transacciones PostgreSQL explícitas con `BEGIN / COMMIT / ROLLBACK` usando `pg.PoolClient` directamente en tres endpoints:

### `POST /ventas`

Flujo:

1. `BEGIN`
2. Validar cliente activo (`SELECT … WHERE estado_cliente = 'activo'`)
3. Validar empleado activo si se provee (`SELECT … WHERE estado_empleado = 'activo'`)
4. Por cada producto: `SELECT … FOR UPDATE` — bloquea la fila mientras dura la transacción
5. Validar `estado_producto = 'activo'` y `stock_actual >= cantidad`
6. `INSERT INTO venta`
7. `INSERT INTO detalle_venta` (precio snapshot del momento)
8. `UPDATE producto SET stock_actual = stock_actual - cantidad` por cada ítem
9. `COMMIT`

`ROLLBACK` automático si alguna validación falla o si ocurre cualquier error SQL. El stock no se modifica parcialmente.

### `POST /checkout`

1. `BEGIN`
2. `SELECT carrito WHERE id_cliente = ? AND estado_carrito = 'activo'`
3. `SELECT carrito_item WHERE id_carrito = ?`
4. Por cada ítem: `SELECT producto WHERE id_producto = ? FOR UPDATE`
5. Validar `stock_actual >= cantidad`
6. `INSERT INTO venta (…, id_empleado = NULL)` — venta online
7. `INSERT INTO detalle_venta (…)` por cada ítem
8. `UPDATE producto SET stock_actual = stock_actual - cantidad`
9. `UPDATE carrito SET estado_carrito = 'convertido'`
10. `COMMIT`

### `POST /auth/register`

1. `BEGIN`
2. `INSERT INTO cliente (nombre, apellido, …)`
3. `INSERT INTO usuario (correo, hash, rol = 'cliente', id_cliente = ?)`
4. `COMMIT`

`ROLLBACK` automático si el correo ya existe en `usuario` (violación de UNIQUE).

---

## 12. DDL y DML oficiales

### DDL — `db/retrosound_ddl.sql`

Contiene:

- `DROP TABLE IF EXISTS … CASCADE` para ejecución limpia desde cero
- `CREATE TABLE` para las 17 tablas del modelo
- Constraints: `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `CHECK`, `UNIQUE`
- `CREATE INDEX` (5 índices explícitos, uno de ellos parcial)
- `CREATE OR REPLACE VIEW vista_resumen_ventas`

### Seed — `db/retrosound_seed.sql`

Contiene 25 registros por tabla en las 17 tablas del modelo:

| Tabla | Filas |
|-------|-------|
| `categoria` | 25 |
| `formato` | 25 |
| `genero_musical` | 25 |
| `artista` | 25 |
| `cliente` | 25 |
| `empleado` | 25 |
| `proveedor` | 25 |
| `producto` | 25 |
| `producto_artista` | 25 |
| `producto_genero` | 25 |
| `usuario` | 25 |
| `venta` | 25 |
| `detalle_venta` | 25 |
| `compra_proveedor` | 25 |
| `detalle_compra_proveedor` | 25 |
| `carrito` | 25 |
| `carrito_item` | 25 |

Los usuarios demo tienen hash bcrypt real para la contraseña `retro2025`.

Los scripts son aplicados automáticamente por `apps/backend/entrypoint.sh` cuando la base de datos está vacía:

```bash
psql -f /app/db/retrosound_ddl.sql
psql -f /app/db/retrosound_seed.sql
```

---

## 13. Stack de acceso a datos

La versión final utiliza **pg/node-postgres** y SQL explícito. No se utiliza ORM en runtime.

Todo acceso a la base de datos ocurre a través de `DatabaseService` (módulo global `@Global()`), que encapsula un `pg.Pool` con reconexión automática. Los servicios inyectan `DatabaseService` y ejecutan SQL directamente:

```typescript
// Patrón estándar en todos los módulos
const result = await this.db.query<RowType>('SELECT ... FROM ... WHERE id = $1', [id]);
return result.rows;
```

Para transacciones, se obtiene un cliente dedicado del pool:

```typescript
const client = await this.db.getClient();
await client.query('BEGIN');
// ... operaciones ...
await client.query('COMMIT');
```

Las fuentes oficiales de la base de datos son:

- `db/retrosound_ddl.sql` — DDL completo aplicado por el entrypoint
- `db/retrosound_seed.sql` — datos de prueba aplicados por el entrypoint

---

## 14. Usuarios de prueba

Todos los usuarios tienen contraseña `retro2025` (hash bcrypt almacenado en la DB).

| Correo | Rol | Descripción |
|--------|-----|-------------|
| `admin@retrosound.com` | admin | Acceso total a todos los módulos |
| `angel.sanabria@retrosound.com` | empleado | Puede gestionar ventas y compras |
| `saul.castillo@retrosound.com` | empleado | — |
| `paola.hernandez@retrosound.com` | empleado | — |
| `carlos.mendoza@retrosound.com` | empleado | — |
| `andrea.garcia@email.com` | cliente | Puede usar carrito y checkout |
| `mario.lopez@email.com` | cliente | — |
| `sofia.ramirez@email.com` | cliente | — |
| `proveedor1@retrosound.com` | proveedor | Acceso básico |

---

## 15. Credenciales obligatorias (rúbrica)

| Variable | Valor |
|----------|-------|
| `POSTGRES_USER` | `proy2` |
| `POSTGRES_PASSWORD` | `secret` |
| `POSTGRES_DB` | `retrosound` |

Estas credenciales son las requeridas por la rúbrica del Proyecto 2. El archivo `.env.example` las define con estos valores exactos.
