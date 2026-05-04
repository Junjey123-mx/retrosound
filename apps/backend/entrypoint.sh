#!/bin/sh
set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-proy2}"
DB_PASSWORD="${DB_PASSWORD:-secret}"
DB_NAME="${DB_NAME:-retrosound}"
SQL_DIR="${SQL_DIR:-/app/db}"
DDL_FILE="${SQL_DIR}/retrosound_ddl.sql"
SEED_FILE="${SQL_DIR}/retrosound_seed.sql"

run_psql() {
  PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    "$@"
}

run_psql_value() {
  PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 -tAc "$1" \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME"
}

echo ">>> [1/4] Waiting for PostgreSQL..."
until PGPASSWORD="$DB_PASSWORD" pg_isready \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" >/dev/null 2>&1; do
  sleep 2
done

echo ">>> [2/4] Checking database state..."
CATEGORIA_EXISTS=$(run_psql_value "SELECT to_regclass('public.categoria') IS NOT NULL;")

if [ "$CATEGORIA_EXISTS" = "t" ]; then
  CATEGORIA_COUNT=$(run_psql_value "SELECT COUNT(*) FROM categoria;")
else
  CATEGORIA_COUNT=0
fi

if [ "$CATEGORIA_COUNT" = "0" ]; then
  if [ ! -f "$DDL_FILE" ]; then
    echo ">>> ERROR: DDL file not found: $DDL_FILE"
    exit 1
  fi

  if [ ! -f "$SEED_FILE" ]; then
    echo ">>> ERROR: seed file not found: $SEED_FILE"
    exit 1
  fi

  echo ">>> [3/4] Applying official SQL DDL..."
  run_psql -f "$DDL_FILE"

  echo ">>> [4/4] Applying official SQL seed..."
  run_psql -f "$SEED_FILE"
else
  echo ">>> [3/4] Database already has data; skipping official SQL DDL."
  echo ">>> [4/4] Database already has data; skipping official SQL seed."
fi

echo ">>> Starting NestJS server..."
exec node dist/main.js
