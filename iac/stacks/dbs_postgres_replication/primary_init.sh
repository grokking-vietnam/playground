#!/bin/bash
set -e

# Create the replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE repl_user WITH REPLICATION LOGIN PASSWORD 'repl_password';
EOSQL

# Allow the replication user to connect from anywhere in the container network
echo "host replication repl_user all md5" >> "$PGDATA/pg_hba.conf"
echo "host all all all md5" >> "$PGDATA/pg_hba.conf"
