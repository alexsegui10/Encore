#!/bin/sh
# wait-for-it.sh - Esperar a que un servicio esté disponible

set -e

host="$1"
shift
cmd="$@"

until nc -z -v -w30 ${host%:*} ${host#*:}; do
  echo "Esperando a $host..."
  sleep 2
done

echo "$host está disponible - ejecutando comando"
exec $cmd
