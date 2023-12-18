locals {
  name_prefix        = "${var.env_type}-${var.environment}"
  global_name_prefix = "${var.aws_account_id}-${var.aws_region}-${var.env_type}-${var.environment}"
}
