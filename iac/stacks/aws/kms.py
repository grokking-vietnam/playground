import pulumi_aws as aws

hcloud_token = aws.kms.Key("hcloud_token",
  description="Symmetric encryption KMS key for hcloud_token",
  enable_key_rotation=True,
  deletion_window_in_days=20,
  tags={
    "service": "sops",
  }
)

hcloud_token_alias = aws.kms.Alias("hcloud_token_a",
  name="alias/hcloud_token",
  target_key_id=hcloud_token.key_id
)