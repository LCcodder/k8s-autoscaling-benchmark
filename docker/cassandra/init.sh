#!/bin/sh
set -e

PASS="$CASSANDRA_ADMIN_PASSWORD"

# если пароль уже сменён, используем его, иначе ждём дефолтный
if cqlsh cassandra -u cassandra -p "$PASS" -e "SELECT key FROM system.local" >/dev/null 2>&1; then
  CUR="$PASS"
else
  until cqlsh cassandra -u cassandra -p cassandra -e "SELECT key FROM system.local" >/dev/null 2>&1; do
    echo "waiting for cassandra auth..."; sleep 5
  done
  CUR="cassandra"
fi

cqlsh cassandra -u cassandra -p "$CUR" -f /init.cql
cqlsh cassandra -u cassandra -p "$CUR" -e "ALTER ROLE cassandra WITH PASSWORD = '$PASS';"
echo "init done"