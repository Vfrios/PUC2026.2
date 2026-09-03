#!/bin/sh
set -eu

mkdir -p /app/db
if [ ! -f /app/db/reviva.db ]; then
  cp /app/db-seed/reviva.db /app/db/reviva.db
fi

exec java -jar /app/app.jar
