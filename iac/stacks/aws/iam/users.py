import pulumi_aws as aws

from .sso import sso_identity_store_id

v2kk = aws.identitystore.User("v2kk",
  identity_store_id=sso_identity_store_id,
  display_name="Quyen Dang",
  user_name="v2kk",
  name={
    "given_name": "Quyen",
    "family_name": "Dang",
  },
  emails={
    "primary": True,
    "value": "23162082@student.hcmute.edu.vn",
  }
)