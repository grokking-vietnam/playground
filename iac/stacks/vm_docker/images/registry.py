import pulumi
import pulumi_docker as docker

ubuntu = docker.RemoteImage("ubuntu", name="ubuntu:latest", opts=pulumi.ResourceOptions(retain_on_delete=True))
postgres = docker.RemoteImage("postgres", name="postgres:18.3", opts=pulumi.ResourceOptions(retain_on_delete=True))