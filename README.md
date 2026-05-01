# RetroSound Store

Proyecto 2 — Bases de Datos 1 · Universidad del Valle de Guatemala

RetroSound Store es una tienda especializada en la venta de música en formatos físicos: vinilos, CDs y casetes.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 11 + TypeScript + Prisma 6 |
| Frontend | Next.js 16 (App Router) + TypeScript + shadcn/ui |
| Base de datos | PostgreSQL 17 (Alpine) |
| Contenedores | Docker + Docker Compose |
| Testing | Vitest |

## Credenciales de base de datos

| Variable | Valor |
|---------|-------|
| Usuario | `proy2` |
| Contraseña | `secret` |
| Base de datos | `retrosound` |

## Estructura

```
retrosound/
├── apps/
│   ├── backend/   ← NestJS + Prisma
│   └── frontend/  ← Next.js + shadcn/ui
├── db/
│   └── retrosound_ddl.sql
├── docs/
│   └── RetroSound.pdf
├── .env.example
└── docker-compose.yml
```

## Inicio rápido (evaluación)

```bash
# 1. Configurar entorno
cp .env.example .env

# 2. Levantar todos los servicios
docker compose up --build
```

El backend ejecuta automáticamente las migraciones y carga datos de prueba en el primer arranque.

> **Inicio limpio (si ya existía volumen anterior):**
> ```bash
> docker compose down -v   # elimina volúmenes
> docker compose up --build
> ```

## Accesos

| Servicio | URL | Notas |
|---------|-----|-------|
| Frontend | http://localhost:3002 | Interfaz principal |
| Backend API | http://localhost:3003 | REST API |
| pgAdmin | http://localhost:5051 | `admin@retrosound.dev` / `admin` |

## Usuario demo

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| `admin@retrosound.dev` | `retro2025` | admin |

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

En desarrollo local el frontend corre en `http://localhost:3000` y el backend en `http://localhost:3001`.

## Scripts Backend

```bash
npm run start:dev        # desarrollo con hot-reload
npm run build            # compilar TS
npm run test             # Vitest
npm run prisma:migrate   # nueva migración
npm run prisma:seed      # datos iniciales
npm run prisma:studio    # Prisma Studio GUI
```

## Scripts Frontend

```bash
npm run dev    # desarrollo Next.js
npm run build  # build de producción
npm run test   # Vitest
```
