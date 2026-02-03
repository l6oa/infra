variable "project" {
  type = string
}

variable "name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_block" {
  type = number
}

variable "cpu" {
  type = string
}

variable "memory" {
  type = string
}

variable "environment_variables" {
  type = map(string)
}

variable "certificate_arn" {
  type = string
}
