import pulumi_aws as aws

from .sso import sso_identity_store_id

sso_group_admins = aws.identitystore.Group(
  'admins',
  display_name='Admins',
  identity_store_id=sso_identity_store_id
)

sso_group_editors = aws.identitystore.Group(
    'editors',
    display_name='Editors',
    identity_store_id=sso_identity_store_id
)