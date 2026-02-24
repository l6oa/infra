resource "aws_dynamodb_table" "main" {
  name         = "${var.name}-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.hash_key

  attribute {
    name = var.hash_key
    type = "S"
  }
}
