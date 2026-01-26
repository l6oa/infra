resource "aws_ssm_parameter" "main" {
  for_each = var.values

  type  = "String"
  name  = "/${var.name}/${var.environment}/${each.key}"
  value = each.value
}
