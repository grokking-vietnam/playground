import pulumi
import pulumi_docker as docker

img_postgres_18_3   = docker.RemoteImage("img-postgres", name="postgres:18.3", opts=pulumi.ResourceOptions(retain_on_delete=True))
img_postgres        = img_postgres_18_3
img_postgres_bitnami_16 = docker.RemoteImage("img-postgres-bitnami", name="bitnami/postgresql:latest", opts=pulumi.ResourceOptions(retain_on_delete=True))