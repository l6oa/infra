resource "aws_sfn_state_machine" "main" {
  name       = "${var.name}-${var.environment}"
  role_arn   = aws_iam_role.sfn.arn
  definition = file("../workflow.asl.json")
}

resource "aws_iam_role" "sfn" {
  name = "sfn.${var.name}-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "states.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "sfn_policy" {
  role = aws_iam_role.sfn.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      }
    ]
  })
}
