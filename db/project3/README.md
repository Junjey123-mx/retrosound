# RetroSound — Scripts de Base de Datos para Proyecto 3

## Propósito

Esta carpeta contiene los scripts SQL de Proyecto 3 del curso **Base de Datos 1 (cc3088)** de la Universidad del Valle de Guatemala, Ciclo 1 2026.

**Estos scripts NO reemplazan los scripts originales.** Los archivos `db/retrosound_ddl.sql` y `db/retrosound_seed.sql` siguen siendo la base de Proyecto 2 y deben ejecutarse primero.

Los scripts de esta carpeta extienden esa base con los requisitos específicos de Proyecto 3: seguridad a nivel de base de datos, roles DBMS, permisos granulares, stored procedures y ORM.

---

## Orden de ejecución

Ejecutar en este orden estricto, después de haber aplicado los scripts base:

```
# Paso previo (scripts de Proyecto 2, ya deben estar aplicados)
psql -d retrosound -f db/retrosound_ddl.sql
psql -d retrosound -f db/retrosound_seed.sql

# Scripts de Proyecto 3 (esta carpeta)
psql -d retrosound -f db/project3/01_schema_project3.sql
psql -d retrosound -f db/project3/02_seed_project3.sql
psql -d retrosound -f db/project3/03_roles_project3.sql
psql -d retrosound -f db/project3/04_procedures_project3.sql
psql -d retrosound -f db/project3/05_views_project3.sql
psql -d retrosound -f db/project3/06_indexes_project3.sql
psql -d retrosound -f db/project3/07_permissions_project3.sql
```

---

## Roles DBMS (5 obligatorios)

| Rol DBMS                   | Descripción                                              |
|----------------------------|----------------------------------------------------------|
| `rs_admin`                 | Acceso completo, propietario de todos los objetos        |
| `rs_empleado_ventas`       | Gestión de ventas, clientes y consulta de productos      |
| `rs_empleado_inventario`   | Gestión de productos, proveedores y compras              |
| `rs_cliente`               | Consulta de productos, carrito propio y ventas propias   |
| `rs_proveedor`             | Consulta de productos y sus propias compras              |

---

## Roles funcionales de aplicación

Estos roles viven en la columna `usuario.rol_usuario` de la base de datos y se mapean a los roles DBMS anteriores:

| Rol funcional         | Rol DBMS mapeado           |
|-----------------------|----------------------------|
| `admin`               | `rs_admin`                 |
| `empleado_ventas`     | `rs_empleado_ventas`       |
| `empleado_inventario` | `rs_empleado_inventario`   |
| `cliente`             | `rs_cliente`               |
| `proveedor`           | `rs_proveedor`             |

---

## Credenciales obligatorias

El ORM (Prisma) se conectará a la base de datos con las siguientes credenciales de Proyecto 3:

| Campo    | Valor    |
|----------|----------|
| Usuario  | `proy3`  |
| Password | `secret` |

---

## Integración con Prisma / ORM

La integración del ORM (Prisma) se implementará en un paso posterior. Este commit solo establece la estructura de scripts SQL. El archivo `schema.prisma` para Proyecto 3 se creará separadamente una vez que los scripts SQL estén completos y validados.

---

## Notas de migración

### 01_schema_project3.sql — migración de datos incluida

El seed base (`db/retrosound_seed.sql`) inserta 9 usuarios con `rol_usuario = 'empleado'`. Este valor ya no es válido en Proyecto 3. Por esa razón, `01_schema_project3.sql` ejecuta un `UPDATE` de migración **antes** de reemplazar la constraint `chk_usuario_rol`:

1. Migra todos los `'empleado'` → `'empleado_ventas'` (valor por defecto).
2. Elimina la constraint anterior (`DROP CONSTRAINT IF EXISTS chk_usuario_rol`).
3. Crea la nueva constraint con los 5 roles de Proyecto 3.

El archivo `02_seed_project3.sql` se encargará de reclasificar algunos de esos usuarios a `'empleado_inventario'` según su función real dentro de la tienda.

---

## Descripción de cada archivo

| Archivo                      | Propósito                                                        |
|------------------------------|------------------------------------------------------------------|
| `01_schema_project3.sql`     | Migración de constraint + ALTER TABLE para los 5 roles funcionales |
| `02_seed_project3.sql`       | Datos de prueba adicionales para los 5 roles funcionales         |
| `03_roles_project3.sql`      | Creación de los 5 roles DBMS en PostgreSQL                       |
| `04_procedures_project3.sql` | Stored procedures obligatorios de la rúbrica                     |
| `05_views_project3.sql`      | Vistas adicionales con control de acceso por rol                 |
| `06_indexes_project3.sql`    | Índices complementarios para optimizar consultas de Proyecto 3   |
| `07_permissions_project3.sql`| GRANT / REVOKE granulares por rol DBMS (último en ejecutarse)    |
