provider "aws" {
 default_tags {
   tags = {
      Name        = local.name_prefix
      Environment = var.environment
      Type        = var.env_type
      Project     = "Simple Serverless Website"
   }
 }
}
