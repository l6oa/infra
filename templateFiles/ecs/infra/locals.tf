locals {
  availability_zones = [
    "eu-west-3a",
    "eu-west-3b",
  ]
  block_cidr = cidrsubnet("10.0.0.0/16", 8, var.vpc_block)
  ecr_url = "${data.aws_caller_identity.main.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
}
