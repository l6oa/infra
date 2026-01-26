resource "aws_db_instance" "main" {
  identifier              = "${var.name}-${var.environment}"
  allocated_storage       = var.storage
  db_name                 = var.database_name
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = var.instance_type
  username                = var.username
  password                = var.password
  availability_zone       = local.availability_zones[0]
  db_subnet_group_name    = aws_db_subnet_group.main.id
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = true
  publicly_accessible     = true
  apply_immediately       = true
  backup_retention_period = 2
  backup_window           = "01:00-01:30"
  maintenance_window      = "Sun:05:00-Sun:05:30"
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.name}-${var.environment}"
  subnet_ids = values(aws_subnet.main)[*].id
}

resource "aws_security_group" "rds" {
  vpc_id = var.vpc_id

  ingress {
    protocol         = "tcp"
    from_port        = 3306
    to_port          = 3306
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
