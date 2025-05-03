Steps:
1. Create new Hetzner account at: https://console.hetzner.cloud/
2. Create new project at: https://console.hetzner.cloud/projects
3. Under new project security panel, create new API token for Pulumi
4. Export `HCLOUD_TOKEN=token`
5. Play with your first vm-hcloud stack, do not forget to run `pulumi destroy`