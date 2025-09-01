import pulumi_aws as aws

from .sso import sso_instance
from .permission_sets import administrator_permission_set

managed_policy_attachment = aws.ssoadmin.ManagedPolicyAttachment("administrator",
  instance_arn=sso_instance.arns[0],
  managed_policy_arn="arn:aws:iam::aws:policy/AdministratorAccess",
  permission_set_arn=administrator_permission_set.arn
)