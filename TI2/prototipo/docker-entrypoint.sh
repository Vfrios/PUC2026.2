#!/bin/sh
set -eu

DB_PATH="${REVIVA_DB_PATH:-/data/reviva.db}"
mkdir -p "$(dirname "$DB_PATH")"
if [ ! -f "$DB_PATH" ]; then
  cp /app/db-seed/reviva.db "$DB_PATH"
fi

exec java -jar /app/app.jar
