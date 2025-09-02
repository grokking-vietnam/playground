import pulumi_aws as aws

from .sso import sso_instance

administrator_permission_set = aws.ssoadmin.PermissionSet("administrator",
  name="administrator",
  instance_arn=sso_instance.arns[0]
)