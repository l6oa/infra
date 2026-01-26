data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = [var.vpc]
  }
}

data "aws_internet_gateway" "main" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.main.id]
  }
}

resource "aws_subnet" "main" {
  for_each = toset(local.availability_zones)

  vpc_id            = data.aws_vpc.main.id
  cidr_block        = cidrsubnet(local.block_cidr, 4, index(local.availability_zones, each.value))
  availability_zone = each.value

  tags = {
    Name = "${var.name}-rds-${substr(each.value, -2, 2)}-${var.environment}"
  }
}

resource "aws_route_table" "main" {
  vpc_id = data.aws_vpc.main.id
}

resource "aws_route" "main" {
  route_table_id         = aws_route_table.main.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = data.aws_internet_gateway.main.id
}

resource "aws_route_table_association" "main" {
  for_each       = aws_subnet.main
  subnet_id      = each.value.id
  route_table_id = aws_route_table.main.id
}
