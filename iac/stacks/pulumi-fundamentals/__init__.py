
import pulumi
import pulumi_docker as docker

# get configuration values
config = pulumi.Config()
frontend_port = config.require_int("frontendPort")
backend_port = config.require_int("backendPort")
mongo_port = config.require_int("mongoPort")

mongo_host = config.require("mongoHost") # Note that strings are the default, so it's not `config.require_str`, just `config.require`.
database = config.require("database")
node_environment = config.require("nodeEnvironment")
protocol = config.require("protocol")

# which stack we’re operating against, and populate the stack variable for later use
stack = pulumi.get_stack()

# pull the backend image
backend_image_name = "backend"
backend = docker.RemoteImage(
    f"{backend_image_name}_image",
    name="pulumi/tutorial-pulumi-fundamentals-backend:latest",
)

# pull the frontend image
frontend_image_name = "frontend"
frontend = docker.RemoteImage(
    f"{frontend_image_name}_image",
    name="pulumi/tutorial-pulumi-fundamentals-frontend:latest",
)

# pull the MongoDB image
mongo_image = docker.RemoteImage(
    "mongo_image", name="pulumi/tutorial-pulumi-fundamentals-database:latest"
)

# create a Docker network
network = docker.Network("network", name=f"services_{stack}")

# create the MongoDB container
mongo_container = docker.Container(
    "mongo_container",
    image=mongo_image.repo_digest,
    name=f"mongo-{stack}",
    ports=[docker.ContainerPortArgs(internal=mongo_port, external=mongo_port)],
    networks_advanced=[
        docker.ContainerNetworksAdvancedArgs(name=network.name, aliases=["mongo"])
    ],
)

# create the backend container
backend_container = docker.Container(
    "backend_container",
    name=f"backend-{stack}",
    image=backend.repo_digest,
    ports=[docker.ContainerPortArgs(internal=backend_port, external=backend_port)],
    envs=[
        f"DATABASE_HOST={mongo_host}",
        f"DATABASE_NAME={database}",
        f"NODE_ENV={node_environment}",
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(name=network.name)],
    opts=pulumi.ResourceOptions(depends_on=[mongo_container]),
)

# create the frontend container
frontend_container = docker.Container(
    "frontend_container",
    image=frontend.repo_digest,
    name=f"frontend-{stack}",
    ports=[docker.ContainerPortArgs(internal=frontend_port, external=frontend_port)],
    envs=[
        f"PORT={frontend_port}",
        f"HTTP_PROXY=backend-{stack}:{backend_port}",
        f"PROXY_PROTOCOL={protocol}",
    ],
    networks_advanced=[docker.ContainerNetworksAdvancedArgs(name=network.name)],
)