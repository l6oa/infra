data "archive_file" "main" {
  type        = "zip"
  source_dir  = var.build_path
  output_path = "${path.module}/build.zip"
}

resource "aws_s3_bucket" "main" {
  bucket        = var.build_bucket_raw_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket                  = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "main" {
  bucket       = aws_s3_bucket.main.id
  key          = "build.zip"
  source       = data.archive_file.main.output_path
  etag         = data.archive_file.main.output_md5
  content_type = "application/zip"
}

resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.main.arn}/${aws_s3_object.main.key}"
      }
    ]
  })
}
