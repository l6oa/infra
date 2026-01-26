locals {
  availability_zones = [
    "eu-west-3a",
    "eu-west-3b",
  ]
  block_cidr = cidrsubnet("10.0.0.0/16", 8, var.vpc_block)
}
