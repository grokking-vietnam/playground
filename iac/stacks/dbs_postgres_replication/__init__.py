import pulumi
import pulumi_docker as docker

from registry.images import img_postgres_bitnami_16

network = docker.Network("postgres-replication-net",
    name="postgres-replication-net",
    driver="bridge"
)

# Postgres Primary Container
primary = docker.Container("postgres-primary",
    name="postgres-primary",
    image=img_postgres_bitnami_16.name,
    ports=[docker.ContainerPortArgs(
        internal=5432,
        external=15432,
    )],
    envs=[
        "POSTGRESQL_REPLICATION_MODE=master",
        "POSTGRESQL_REPLICATION_USER=repl_user",
        "POSTGRESQL_REPLICATION_PASSWORD=repl_password",
        "POSTGRESQL_USERNAME=my_user",
        "POSTGRESQL_PASSWORD=my_password",
        "POSTGRESQL_DATABASE=my_database",
        "POSTGRESQL_POSTGRES_PASSWORD=my_password",
        "POSTGRESQL_EXTRA_FLAGS=-c wal_level=logical"
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    volumes=[docker.ContainerVolumeArgs(
        host_path="/tmp/data/primary",
        container_path="/bitnami/postgresql",
    )]
)

# Postgres Physical Standby Container
standby = docker.Container("postgres-standby",
    name="postgres-standby",
    image=img_postgres_bitnami_16.name,
    ports=[docker.ContainerPortArgs(
        internal=5432,
        external=25432,
    )],
    envs=[
        "POSTGRESQL_REPLICATION_MODE=slave",
        "POSTGRESQL_REPLICATION_USER=repl_user",
        "POSTGRESQL_REPLICATION_PASSWORD=repl_password",
        "POSTGRESQL_MASTER_HOST=postgres-primary",
        "POSTGRESQL_MASTER_PORT_NUMBER=5432",
        "POSTGRESQL_PASSWORD=my_password",
        "POSTGRESQL_POSTGRES_PASSWORD=my_password",
        "POSTGRESQL_EXTRA_FLAGS=-c wal_level=logical" # Physical standby replicates master's params
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    volumes=[docker.ContainerVolumeArgs(
        host_path="/tmp/data/replica",
        container_path="/bitnami/postgresql",
    )],
    opts=pulumi.ResourceOptions(depends_on=[primary])
)

# Postgres Logical Replica Container
logical_replica = docker.Container("postgres-logical-replica",
    name="postgres-logical-replica",
    image=img_postgres_bitnami_16.name,
    ports=[docker.ContainerPortArgs(
        internal=5432,
        external=35432,
    )],
    envs=[
        "POSTGRESQL_USERNAME=my_user",
        "POSTGRESQL_PASSWORD=my_password",
        "POSTGRESQL_DATABASE=my_database",
        "POSTGRESQL_POSTGRES_PASSWORD=my_password"
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(
        name=network.name
    )],
    volumes=[docker.ContainerVolumeArgs(
        host_path="/tmp/data/logical_replica",
        container_path="/bitnami/postgresql",
    )]
)
