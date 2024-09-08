"""A Python Pulumi program"""

import pulumi

# get current selected stack
stackName = pulumi.get_stack()

# import stack resource using python module
moduleName = "stacks." + stackName
__import__(moduleName)