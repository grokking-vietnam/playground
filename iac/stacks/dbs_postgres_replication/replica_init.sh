#!/bin/bash
set -e

echo "Waiting for primary..."
until pg_isready -h postgres-primary -p 5432 -U "$POSTGRES_USER"; do
  sleep 1
done

echo "Setting up logical replication publication on primary..."
# Create publication if it doesn't exist
PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres-primary -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tc "SELECT 1 FROM pg_publication WHERE pubname = 'my_pub';" | grep -q 1 || \
PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres-primary -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE PUBLICATION my_pub FOR ALL TABLES;"

echo "Cleaning up any old replication slot on primary..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres-primary -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT pg_drop_replication_slot('my_sub') FROM pg_replication_slots WHERE slot_name = 'my_sub';" || true

echo "Setting up logical replication subscription on replica..."
echo "Copying schema from primary..."
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h postgres-primary -U "$POSTGRES_USER" -s "$POSTGRES_DB" | psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"

# Create subscription
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SUBSCRIPTION my_sub
    CONNECTION 'host=postgres-primary port=5432 user=$POSTGRES_USER password=$POSTGRES_PASSWORD dbname=$POSTGRES_DB'
    PUBLICATION my_pub;
EOSQL
