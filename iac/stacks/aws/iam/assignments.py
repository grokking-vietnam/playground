import pulumi
import pulumi_aws as aws

from .sso import sso_instance
from .permission_sets import administrator_permission_set
from .groups import sso_group_admins

config = pulumi.Config()
account_id = config.require("account_id")

account_assignment = aws.ssoadmin.AccountAssignment("account_assignment",
  instance_arn=sso_instance.arns[0],
  permission_set_arn=administrator_permission_set.arn,
  principal_id=sso_group_admins.group_id,
  principal_type="GROUP",
  target_id=account_id,
  target_type="AWS_ACCOUNT"
)