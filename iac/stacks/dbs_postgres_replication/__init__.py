import pulumi
import pulumi_docker as docker

from registry.images import img_postgres_18_3

network = docker.Network("postgres-replication-network",
    name="postgres-replication-network",
    driver="bridge"
)

# Postgres Primary Container
primary = docker.Container("postgres-primary",
    name="postgres-primary",
    image=img_postgres_18_3.name,
    ports=[docker.ContainerPortArgs(
        internal=5432,
        external=15432,
    )],
    command=[
        "bash", "-c",
        "apt-get update && apt-get install -y postgresql-18-wal2json && exec docker-entrypoint.sh postgres -c wal_level=logical"
    ],
    envs=[
        "POSTGRES_USER=my_user",
        "POSTGRES_PASSWORD=my_password",
        "POSTGRES_DB=my_database",
        "PGDATA=/db/postgresql/data",
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    volumes=[
        docker.ContainerVolumeArgs(
            host_path="/data/labs/postgres/primary/data",
            container_path="/db/postgresql/data",
        ),
        docker.ContainerVolumeArgs(
            host_path=f"{__import__('os').path.abspath(__import__('os').path.dirname(__file__))}/primary_init.sh",
            container_path="/docker-entrypoint-initdb.d/primary_init.sh",
            read_only=True
        )
    ]
)

# Postgres Physical Standby Container
standby = docker.Container("postgres-standby",
    name="postgres-standby",
    image=img_postgres_18_3.name,
    ports=[docker.ContainerPortArgs(
        internal=5432,
        external=25432,
    )],
    command=[
        "bash", "-c",
        "if [ ! -s /db/postgresql/data/PG_VERSION ]; then "
        "echo 'Waiting for primary...' && "
        "until pg_isready -h postgres-primary -p 5432 -U my_user; do sleep 1; done && "
        "echo 'Running pg_basebackup...' && "
        "PGPASSWORD=repl_password pg_basebackup -h postgres-primary -p 5432 -U repl_user -D /db/postgresql/data -Fp -Xs -R; "
        "fi; "
        "exec docker-entrypoint.sh postgres -c wal_level=logical"
    ],
    envs=[
        "POSTGRES_USER=my_user",
        "POSTGRES_PASSWORD=my_password",
        "PGDATA=/db/postgresql/data",
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    volumes=[docker.ContainerVolumeArgs(
        host_path="/data/labs/postgres/standby/data",
        container_path="/db/postgresql/data",
    )],
    opts=pulumi.ResourceOptions(depends_on=[primary])
)

# Postgres Logical Replica Container
logical_replica = docker.Container("postgres-logical-replica",
    name="postgres-logical-replica",
    image=img_postgres_18_3.name,
    ports=[docker.ContainerPortArgs(
        internal=5432,
        external=35432,
    )],
    envs=[
        "POSTGRES_USER=my_user",
        "POSTGRES_PASSWORD=my_password",
        "POSTGRES_DB=my_database",
        "PGDATA=/db/postgresql/data",
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    volumes=[
        docker.ContainerVolumeArgs(
            host_path="/data/labs/postgres/replica/data",
            container_path="/db/postgresql/data",
        ),
        docker.ContainerVolumeArgs(
            host_path=f"{__import__('os').path.abspath(__import__('os').path.dirname(__file__))}/replica_init.sh",
            container_path="/docker-entrypoint-initdb.d/replica_init.sh",
            read_only=True
        )
    ],
    command=["postgres", "-c", "wal_level=logical"],
    opts=pulumi.ResourceOptions(depends_on=[primary])
)

# HTTP Receiver Container to Log CDC Events
http_receiver = docker.Container("http-receiver",
    name="http-receiver",
    image="mendhak/http-https-echo:33",
    ports=[docker.ContainerPortArgs(
        internal=8080,
        external=8081,
    )],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )]
)

# Debezium Standalone Replica Container
debezium_replica = docker.Container("debezium-replica",
    name="debezium-replica",
    image="quay.io/debezium/server:latest",
    envs=[
        "DEBEZIUM_SINK_TYPE=http",
        "DEBEZIUM_SINK_HTTP_URL=http://http-receiver:8080/",
        "DEBEZIUM_FORMAT_VALUE=json",
        "DEBEZIUM_FORMAT_KEY=json",
        "DEBEZIUM_SOURCE_CONNECTOR_CLASS=io.debezium.connector.postgresql.PostgresConnector",
        "DEBEZIUM_SOURCE_DATABASE_HOSTNAME=postgres-primary",
        "DEBEZIUM_SOURCE_DATABASE_PORT=5432",
        "DEBEZIUM_SOURCE_DATABASE_USER=my_user",
        "DEBEZIUM_SOURCE_DATABASE_PASSWORD=my_password",
        "DEBEZIUM_SOURCE_DATABASE_DBNAME=my_database",
        "DEBEZIUM_SOURCE_TOPIC_PREFIX=postgres-primary-server",
        "DEBEZIUM_SOURCE_DATABASE_SERVER_NAME=postgres-primary-server",
        "DEBEZIUM_SOURCE_PLUGIN_NAME=pgoutput",
        "DEBEZIUM_SOURCE_OFFSET_STORAGE_FILE_FILENAME=/debezium/data/offsets.dat",
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    opts=pulumi.ResourceOptions(depends_on=[primary, http_receiver])
)
