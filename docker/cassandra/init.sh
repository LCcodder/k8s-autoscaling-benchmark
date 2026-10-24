#!/bin/sh
set -e

# после первого запуска админ уже с новым паролем, до этого с дефолтным
if cqlsh cassandra -u cassandra -p "$CASSANDRA_ADMIN_PASSWORD" -e "SELECT key FROM system.local" >/dev/null 2>&1; then
  AUTH="-u cassandra -p $CASSANDRA_ADMIN_PASSWORD"
else
  until cqlsh cassandra -u cassandra -p cassandra -e "SELECT key FROM system.local" >/dev/null 2>&1; do
    echo "waiting for cassandra auth..."; sleep 5
  done
  AUTH="-u cassandra -p cassandra"
fi

cqlsh cassandra $AUTH -f /init.cql
cqlsh cassandra $AUTH -e "CREATE ROLE IF NOT EXISTS ${APP_USER} WITH PASSWORD = '${APP_PASSWORD}' AND LOGIN = true;"
cqlsh cassandra $AUTH -e "GRANT ALL ON KEYSPACE miniurl TO ${APP_USER};"
cqlsh cassandra $AUTH -e "ALTER ROLE cassandra WITH PASSWORD = '${CASSANDRA_ADMIN_PASSWORD}';"