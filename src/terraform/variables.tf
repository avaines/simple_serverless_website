# variable "sub_domain" {
#   default = "ssw"
# }

# variable "domain_name" {
#   default = "dev.vaines.org"
# }

# variable "route53_zone_id" {
#   default = "Z10187831CW9K705Y18AO"
# }

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
