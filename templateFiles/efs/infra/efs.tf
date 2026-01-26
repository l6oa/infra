resource "aws_efs_file_system" "main" {
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"

  tags = {
    Name = "${var.name}-${var.environment}"
  }
}

resource "aws_efs_access_point" "main" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    uid = var.user_uid
    gid = var.user_gid
  }

  root_directory {
    path = var.directory_path

    creation_info {
      owner_uid   = var.user_uid
      owner_gid   = var.user_gid
      permissions = "0755"
    }
  }
}

resource "aws_efs_mount_target" "main" {
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = data.aws_subnet.main.id
  security_groups = [aws_security_group.main.id]
}

resource "aws_security_group" "main" {
  vpc_id = data.aws_subnet.main.vpc_id

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
