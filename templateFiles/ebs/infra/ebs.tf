resource "aws_ebs_volume" "main" {
  availability_zone = var.availability_zone
  size              = var.storage
  type              = "gp3"

  tags = {
    Name = "${var.name}-${var.environment}"
  }
}
