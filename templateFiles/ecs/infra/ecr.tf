resource "aws_ecr_repository" "main" {
  name         = "${var.name}-${var.environment}"
  force_delete = true
}

resource "docker_registry_image" "main" {
  name          = docker_image.main.name
  keep_remotely = true
}

resource "docker_image" "main" {
  name = "${aws_ecr_repository.main.repository_url}:${random_id.docker_image.hex}"

  build {
    context = ".."
  }
}

resource "random_id" "docker_image" {
  byte_length = 4
}
