import pulumi
import pulumi_aws as aws

config = pulumi.Config()
# TODO: can not find any docs related to create IdentityStore programatically, created via AWS console
sso_identity_store_id = config.require("sso_identity_store_id")

sso_instance = aws.ssoadmin.get_instances()