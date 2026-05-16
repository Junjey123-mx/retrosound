# RetroSound — Base de Datos Proyecto 3

## 1. Objetivo de este directorio

Esta carpeta contiene los scripts complementarios del **Proyecto 3** del curso Base de Datos 1 (cc3088), Universidad del Valle de Guatemala, Ciclo 1 2026.

Los scripts de `db/project3/` **no reemplazan** los scripts base. Se ejecutan encima de `db/retrosound_ddl.sql` y `db/retrosound_seed.sql` y añaden los requisitos de seguridad, procedimientos y ORM exigidos por la rúbrica.

---

## 2. Orden de ejecución

Ejecutar en este orden estricto:

```bash
# Scripts base (Proyecto 2 — deben aplicarse primero)
psql -d retrosound -f db/retrosound_ddl.sql
psql -d retrosound -f db/retrosound_seed.sql

# Scripts de Proyecto 3
psql -d retrosound -f db/project3/01_schema_project3.sql
psql -d retrosound -f db/project3/02_seed_project3.sql
psql -d retrosound -f db/project3/03_roles_project3.sql
psql -d retrosound -f db/project3/04_procedures_project3.sql
psql -d retrosound -f db/project3/05_views_project3.sql
psql -d retrosound -f db/project3/06_indexes_project3.sql
psql -d retrosound -f db/project3/07_permissions_project3.sql
```

> `06_indexes_project3.sql` está reservado para índices de optimización (actualmente vacío).  
> `07_permissions_project3.sql` debe ejecutarse último: revoca todos los permisos públicos y los reotorga de forma granular por rol.

| Archivo                       | Propósito                                                          |
|-------------------------------|--------------------------------------------------------------------|
| `01_schema_project3.sql`      | ALTER TABLE + migración de constraint `chk_usuario_rol`            |
| `02_seed_project3.sql`        | Usuarios demo (uno por rol funcional)                              |
| `03_roles_project3.sql`       | Creación de los 5 roles DBMS y del usuario `proy3`                 |
| `04_procedures_project3.sql`  | 5 stored procedures obligatorios de la rúbrica                     |
| `05_views_project3.sql`       | Vistas SQL adicionales con control de acceso por rol               |
| `06_indexes_project3.sql`     | Reservado para índices de optimización                             |
| `07_permissions_project3.sql` | GRANT / REVOKE granulares por rol DBMS                             |

---

## 3. Credenciales obligatorias

| Parámetro            | Valor                                                          |
|----------------------|----------------------------------------------------------------|
| `POSTGRES_USER`      | `proy3`                                                        |
| `POSTGRES_PASSWORD`  | `secret`                                                       |
| `POSTGRES_DB`        | `retrosound`                                                   |
| `DATABASE_URL`       | `postgresql://proy3:secret@db:5432/retrosound?schema=public`   |

`proy3` es el **usuario técnico de conexión** del ORM y Docker. No es un rol funcional de la aplicación. Hereda los 5 roles DBMS mediante `GRANT <rol> TO proy3`, y el backend usa `SET ROLE` para operar con el rol correcto por request.

---

## 4. Roles funcionales de aplicación

Valores válidos de la columna `usuario.rol_usuario`:

| Rol funcional         | Descripción                                    |
|-----------------------|------------------------------------------------|
| `admin`               | Administrador con acceso total                 |
| `empleado_ventas`     | Gestión de ventas y atención al cliente        |
| `empleado_inventario` | Control de stock, recepciones y proveedores    |
| `cliente`             | Compra en tienda y portal web                  |
| `proveedor`           | Registro de entregas y actualización de imagen |

---

## 5. Roles reales del DBMS

Los 5 roles de la rúbrica, creados con `CREATE ROLE` en `03_roles_project3.sql`. No tienen LOGIN; solo `proy3` lo tiene.

| Rol DBMS                   | Rol funcional mapeado  |
|----------------------------|------------------------|
| `rs_admin`                 | `admin`                |
| `rs_empleado_ventas`       | `empleado_ventas`      |
| `rs_empleado_inventario`   | `empleado_inventario`  |
| `rs_cliente`               | `cliente`              |
| `rs_proveedor`             | `proveedor`            |

---

## 6. Usuarios demo

Un usuario de prueba por cada rol funcional, insertados en `02_seed_project3.sql`. Todos usan el mismo hash bcrypt heredado del seed base. `admin@retrosound.com` ya existía en `db/retrosound_seed.sql`.

| Correo                        | Rol funcional          | FK enlazada         |
|-------------------------------|------------------------|---------------------|
| `admin@retrosound.com`        | `admin`                | `id_empleado = 1`   |
| `ventas@retrosound.com`       | `empleado_ventas`      | `id_empleado = 11`  |
| `inventario@retrosound.com`   | `empleado_inventario`  | `id_empleado = 12`  |
| `cliente@retrosound.com`      | `cliente`              | `id_cliente = 14`   |
| `proveedor@retrosound.com`    | `proveedor`            | `id_proveedor = 3`  |

---

## 7. Tablas nuevas o modificadas

### `producto` — columnas nuevas (`01_schema_project3.sql`)

| Columna            | Tipo           | Descripción                          |
|--------------------|----------------|--------------------------------------|
| `imagen_url`       | `TEXT`         | URL pública del asset en Cloudinary  |
| `imagen_public_id` | `VARCHAR(255)` | Identificador de asset en Cloudinary |

### `detalle_compra_proveedor` — columna nueva

| Columna              | Tipo      | Descripción                                            |
|----------------------|-----------|--------------------------------------------------------|
| `cantidad_recibida`  | `INTEGER` | NULL hasta confirmar recepción; ≤ `cantidad_comprada` |

### `compra_proveedor` — cambios

- `id_empleado` pasa a ser **nullable**: las entregas de proveedor llegan sin empleado asignado hasta que inventario confirma.
- Estado `parcial` añadido al CHECK: `('pendiente', 'recibida', 'parcial', 'cancelada')`.

### `producto_proveedor` — tabla nueva

Registra la relación de propiedad entre productos y proveedores. Se semilla desde el historial de compras existente.

| Columna                  | Tipo      | Descripción                                        |
|--------------------------|-----------|----------------------------------------------------|
| `id_producto`            | `INTEGER` | FK a `producto` (parte de PK compuesta)            |
| `id_proveedor`           | `INTEGER` | FK a `proveedor` (parte de PK compuesta)           |
| `es_proveedor_principal` | `BOOLEAN` | `TRUE` si es el proveedor principal del producto   |

---

## 8. Vistas SQL

`vista_resumen_ventas` ya existía en el DDL base. Las tres siguientes se crean en `05_views_project3.sql`.

| Vista                          | Propósito                                                              | Acceso                          |
|--------------------------------|------------------------------------------------------------------------|---------------------------------|
| `vista_resumen_ventas`         | Resumen de ventas con totales, IVA y descuentos por venta              | `rs_empleado_ventas`, `rs_admin`|
| `vista_recepciones_pendientes` | Entregas de proveedor en estado `pendiente` con detalle de producto    | `rs_empleado_inventario`        |
| `vista_productos_proveedor`    | Productos asociados a cada proveedor con datos completos de catálogo   | `rs_proveedor`                  |
| `vista_stock_critico`          | Productos cuyo `stock_actual ≤ stock_minimo`                           | `rs_empleado_inventario`        |

---

## 9. Stored procedures

Definidos en `04_procedures_project3.sql`. Todos usan `LANGUAGE plpgsql` con `EXCEPTION WHEN OTHERS THEN RAISE`.

### `sp_registrar_entrega_proveedor`
- **Propósito:** crea una orden de compra en estado `pendiente` cuando un proveedor reporta una entrega.
- **IN:** `p_id_proveedor`, `p_id_producto`, `p_cantidad_reportada`, `p_costo_unitario`
- **OUT:** `p_id_compra_generada`
- **Validaciones:** cantidad > 0, costo ≥ 0, relación `producto_proveedor` existente.
- **Modifica:** `compra_proveedor`, `detalle_compra_proveedor`.
- **Roles:** `rs_proveedor`, `rs_admin`

### `sp_confirmar_recepcion_stock`
- **Propósito:** confirma la recepción física de mercadería e incrementa `stock_actual`.
- **IN:** `p_id_detalle_compra`, `p_cantidad_recibida`, `p_id_empleado`
- **OUT:** `p_nuevo_stock`, `p_estado_compra`
- **Validaciones:** cantidad > 0, empleado existente, recepción no confirmada previamente, compra no cancelada, cantidad ≤ comprada.
- **Modifica stock:** sí. Usa `FOR UPDATE` para serializar confirmaciones concurrentes. Cualquier excepción revierte el incremento y el cambio de estado.
- **Roles:** `rs_empleado_inventario`, `rs_admin`

### `sp_crear_venta`
- **Propósito:** registra una venta con múltiples ítems (JSONB) desde el panel de empleado.
- **IN:** `p_id_cliente`, `p_id_empleado`, `p_metodo_pago`, `p_descuento_venta`, `p_items`
- **OUT:** `p_id_venta_generada`
- **Validaciones:** cliente y empleado existentes, items no vacíos, stock suficiente por producto.
- **Modifica stock:** sí. Marca `estado_producto = 'agotado'` si el stock llega a 0.
- **Roles:** `rs_empleado_ventas`, `rs_admin`

### `sp_checkout_carrito`
- **Propósito:** convierte el carrito activo de un cliente en una venta completada (flujo online).
- **IN:** `p_id_cliente`, `p_metodo_pago`
- **OUT:** `p_id_venta_generada`
- **Validaciones:** cliente existente, carrito activo con al menos un ítem, stock suficiente por producto.
- **Modifica stock:** sí. Marca `carrito.estado_carrito = 'convertido'` al finalizar.
- **Roles:** `rs_cliente`, `rs_empleado_ventas`, `rs_admin`

### `sp_actualizar_imagen_producto`
- **Propósito:** actualiza exclusivamente `imagen_url` e `imagen_public_id` de un producto.
- **IN:** `p_id_producto`, `p_imagen_url`, `p_imagen_public_id`, `p_id_proveedor`
- **OUT:** `p_actualizado`
- **Validaciones:** producto existente, URL y public_id no vacíos. Si `p_id_proveedor` no es NULL, verifica existencia del proveedor y ownership en `producto_proveedor`. Si es NULL, permite la operación (uso por admin o inventario).
- **No modifica:** precio, stock, SKU, estado del producto.
- **Roles:** `rs_proveedor`, `rs_empleado_inventario`, `rs_admin`

---

## 10. Permisos por rol

Definidos en `07_permissions_project3.sql`. El archivo revoca todos los permisos públicos al inicio y los reotorga de forma granular.

### `rs_admin`
Control total: `SELECT, INSERT, UPDATE, DELETE` sobre todas las tablas y secuencias del esquema `public`. Puede ejecutar todos los stored procedures.

### `rs_empleado_ventas`
| Objeto                              | Permiso               |
|-------------------------------------|-----------------------|
| `cliente`                           | SELECT, INSERT, UPDATE|
| `venta`                             | SELECT, INSERT, UPDATE|
| `detalle_venta`                     | SELECT, INSERT        |
| `carrito`, `carrito_item`           | SELECT                |
| Catálogo (productos, categorías...) | SELECT                |
| `vista_resumen_ventas`              | SELECT                |
| `sp_crear_venta`, `sp_checkout_carrito` | EXECUTE           |

### `rs_empleado_inventario`
| Objeto                                          | Permiso               |
|-------------------------------------------------|-----------------------|
| `producto`, `proveedor`, `producto_proveedor`   | SELECT, INSERT, UPDATE|
| `compra_proveedor`, `detalle_compra_proveedor`  | SELECT, INSERT, UPDATE|
| Catálogo                                        | SELECT                |
| `vista_recepciones_pendientes`, `vista_stock_critico` | SELECT          |
| `sp_confirmar_recepcion_stock`, `sp_actualizar_imagen_producto` | EXECUTE |

### `rs_cliente`
| Objeto                                    | Permiso                        |
|-------------------------------------------|-------------------------------|
| Catálogo (productos, categorías...)       | SELECT                        |
| `cliente`                                 | SELECT, UPDATE                |
| `carrito`, `carrito_item`                 | SELECT, INSERT, UPDATE, DELETE|
| `venta`, `detalle_venta`                  | SELECT (filtrado por backend) |
| `sp_checkout_carrito`                     | EXECUTE                       |

### `rs_proveedor`
| Objeto                          | Permiso                                                          |
|---------------------------------|------------------------------------------------------------------|
| `producto`, `producto_proveedor`| SELECT                                                           |
| `proveedor`                     | SELECT, UPDATE                                                   |
| `compra_proveedor`, `detalle_compra_proveedor` | SELECT, INSERT                                  |
| `vista_productos_proveedor`     | SELECT                                                           |
| `producto` (columnas)           | UPDATE en `descripcion_producto`, `imagen_url`, `imagen_public_id` |
| `sp_registrar_entrega_proveedor`, `sp_actualizar_imagen_producto` | EXECUTE |

### `proy3` (usuario técnico de conexión)
Hereda todos los roles funcionales:
```sql
GRANT rs_admin, rs_empleado_ventas, rs_empleado_inventario, rs_cliente, rs_proveedor TO proy3;
```
**No cuenta como rol funcional adicional.** El backend usa `SET ROLE` por request para operar con el rol correcto.

---

## 11. Prisma ORM

Schema en: `apps/backend/prisma/schema.prisma`

- Usa `url = env("DATABASE_URL")` con las credenciales `proy3 / secret`.
- Mapea las 18 tablas de RetroSound con `@map` (campos camelCase → snake_case) y `@@map` (modelo → tabla).
- Usa `String` en todos los campos de estado y rol: el DDL usa `VARCHAR + CHECK`, no tipos `ENUM` nativos de PostgreSQL.
- Incluye las columnas nuevas de Proyecto 3: `imagenUrl`, `imagenPublicId`, `cantidadRecibida`, `esProveedorPrincipal`.
- **No genera migraciones**: describe la base existente, no la recrea.
- Las vistas SQL se consultarán con `$queryRaw` cuando sea necesario.
- Los stored procedures se invocarán con `$executeRaw` o `$queryRaw` desde el backend.

---

## 12. Índices

`06_indexes_project3.sql` está actualmente vacío, reservado para índices de optimización.

Candidatos identificados:

| Índice propuesto                                     | Justificación                                      |
|------------------------------------------------------|----------------------------------------------------|
| `producto_proveedor(id_proveedor)`                   | Filtrado de productos por proveedor en portal      |
| `compra_proveedor(id_proveedor, estado_compra)`      | Consultas de entregas pendientes por proveedor     |
| `detalle_compra_proveedor(id_compra_proveedor)`      | JOIN en confirmación de recepciones                |
| `producto(stock_actual, stock_minimo)`               | Vista `vista_stock_critico` y alertas de reorden   |

---

## 13. Checklist de cumplimiento de rúbrica

- [x] 5 roles DBMS creados con `CREATE ROLE` (`03_roles_project3.sql`)
- [x] Permisos granulares definidos con `GRANT` / `REVOKE` (`07_permissions_project3.sql`)
- [x] Usuario demo por cada rol funcional (`02_seed_project3.sql`)
- [x] 5 stored procedures definidos (`04_procedures_project3.sql`)
- [x] Procedures con parámetros `IN` / `OUT` y bloque `EXCEPTION`
- [x] Procedure crítico de stock con rollback por excepción (`sp_confirmar_recepcion_stock`)
- [x] Prisma schema preparado y mapeado (`apps/backend/prisma/schema.prisma`)
- [x] Credenciales `proy3` / `secret` documentadas y usadas en `03_roles_project3.sql`

---

## 14. Pendientes técnicos

| Pendiente                                                              | Prioridad |
|------------------------------------------------------------------------|-----------|
| Instalar `prisma` y `@prisma/client` en `apps/backend/`               | Alta      |
| Ejecutar `npx prisma validate` para verificar el schema                | Alta      |
| Actualizar `docker-compose` / `.env` si aún usa credenciales de `proy2`| Alta      |
| Implementar invocación de stored procedures desde backend              | Media     |
| Usar Prisma en al menos 3 operaciones CRUD reales                      | Media     |
| Implementar `SET ROLE` por request en el backend                       | Media     |
| Definir índices en `06_indexes_project3.sql`                           | Baja      |
