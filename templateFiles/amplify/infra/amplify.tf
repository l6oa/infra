resource "aws_amplify_app" "main" {
  name                 = "${var.name}-${var.environment}"
  iam_service_role_arn = aws_iam_role.main.arn
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = "main"

  enable_auto_build = false
  framework         = "Web"
  stage             = "PRODUCTION"
}

resource "aws_amplify_domain_association" "main" {
  app_id      = aws_amplify_app.main.id
  domain_name = var.domain

  certificate_settings {
    type                   = "CUSTOM"
    custom_certificate_arn  = var.certificate_arn
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = var.subdomain
  }
}

resource "null_resource" "main" {
  triggers = {
    zip_etag = aws_s3_object.main.etag
  }

  provisioner "local-exec" {
    command = <<EOF
    set -e
    aws amplify start-deployment \
      --app-id ${aws_amplify_app.main.id} \
      --branch-name ${aws_amplify_branch.main.branch_name} \
      --source-url s3://${aws_s3_bucket.main.id}/${aws_s3_object.main.key} \
      --source-url-type ZIP
    EOF
  }
}
