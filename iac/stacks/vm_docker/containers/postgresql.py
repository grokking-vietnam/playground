import pulumi_docker as docker

from stacks.vm_docker.images.registry import postgres

seed_database = docker.Container(
    "seed-database",
    image=postgres.name,
    name="seed-database",
    ports=[
        docker.ContainerPortArgs(
            internal=5432,
            external=5432,
        )
    ],
    envs=[
        "POSTGRES_PASSWORD=postges",
        "POSTGRES_USER=postgres",
        "POSTGRES_DB=postgres"
    ],
)