import pulumi
import pulumi_aws as aws

from .iam.permission_sets import *
from .iam.groups import *
from .iam.users import *
from .iam.assignments import *
from .iam.group_memberships import *
from .iam.managed_policy_attachment import *

from .kms import *

config = pulumi.Config()
current = aws.get_caller_identity()

