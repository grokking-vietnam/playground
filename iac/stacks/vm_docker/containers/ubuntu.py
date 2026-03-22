import pulumi_docker as docker

from stacks.vm_docker.images.registry import ubuntu

foo = docker.Container(
    "foo",
    image=ubuntu.name,
    name="foo",
    stdin_open=True,
    tty=True,
)