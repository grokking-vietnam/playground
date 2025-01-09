import pulumi
import pulumi_hcloud as hcloud

config = pulumi.Config()
network_ip_range = config.require("network_ip_range")
network_subnet_dmz_ip_range = config.require("network_subnet_dmz_ip_range")

network = hcloud.Network("network",
  name="network", 
  ip_range=network_ip_range,
)

network_subnet = hcloud.NetworkSubnet("network-subnet-dmz",
  type="cloud",
  network_id=network.id,
  network_zone="ap-southeast",
  ip_range=network_subnet_dmz_ip_range
)

server = hcloud.Server("server",
  name="server",
  server_type="cpx11",
  image="ubuntu-24.04",
  location="sin",
  networks=[{
      "network_id": network.id,
      "ip": "10.0.1.5",
      "alias_ips": [
          "10.0.1.6",
          "10.0.1.7",
      ],
  }],
  opts = pulumi.ResourceOptions(depends_on=[network_subnet])
)