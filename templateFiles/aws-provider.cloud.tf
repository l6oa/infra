provider "aws" {
  default_tags {
    tags = {
      project = "${var.project}-${var.environment}"
    }
  }
}
