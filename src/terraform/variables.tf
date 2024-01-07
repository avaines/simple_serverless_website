variable "aws_account_id" {
  type = string
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "env_type" {
  type    = string
  default = "dev"
}

variable "environment" {
  type    = string
  default = "main"
}
