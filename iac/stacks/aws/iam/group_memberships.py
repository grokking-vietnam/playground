import pulumi_aws as aws

from .sso import sso_identity_store_id
from .groups import sso_group_admins
from .users import v2kk

group_membership = aws.identitystore.GroupMembership("administrator",
  identity_store_id=sso_identity_store_id,
  group_id=sso_group_admins.group_id,
  member_id=v2kk.user_id
)