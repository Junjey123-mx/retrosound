# ── Stage 1: dependencias ────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && cp -R node_modules /tmp/prod_modules
RUN npm install

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build && npx tsc -p tsconfig.build.json --incremental false

# ── Stage 3: producción ──────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

RUN apk add --no-cache postgresql-client

RUN addgroup -g 1001 -S nestjs && \
    adduser  -u 1001 -S nestjs -G nestjs

COPY --from=build --chown=nestjs:nestjs /app/dist        ./dist
COPY --from=build --chown=nestjs:nestjs /app/package*.json ./
COPY --from=build --chown=nestjs:nestjs /tmp/prod_modules ./node_modules

# Entrypoint: SQL oficial condicional + arranque
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nestjs
EXPOSE 3001

CMD ["sh", "entrypoint.sh"]
