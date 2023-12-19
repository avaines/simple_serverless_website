module "api_gateway" {
  source = "terraform-aws-modules/apigateway-v2/aws"

  name          = local.name_prefix
  description   = "API for CloudFront backend"
  protocol_type = "HTTP"

  cors_configuration = {
    allow_headers = [
        "authorization",
        "content-type",
        "x-amz-date",
        "x-amz-user-agent",
    ]

    allow_methods = ["*"]
    allow_origins = ["*"]
  }

  create_api_domain_name           = false
  create_vpc_link                  = false
  create_default_stage_api_mapping  = false

  # Custom domain
  # domain_name                 = "terraform-aws-modules.modules.tf"
  # domain_name_certificate_arn = "arn:aws:acm:eu-west-1:052235179155:certificate/2b3a7ed9-05e1-4f9e-952b-27744ba06da6"

  # Routes and integrations
  integrations = {
    "GET /api/read" = {
        lambda_arn             = aws_lambda_function.api_get_data.arn
        payload_format_version = "2.0"
        authorization_type     = "JWT"
        authorizer_key         = "cognito"
        #   authorization_scopes   = "tf/something.relevant.read,tf/something.relevant.write" # Should comply with the resource server configuration part of the cognito user pool
        throttling_rate_limit  = 80
        throttling_burst_limit = 40
    }

    "POST /api/create" = {
        lambda_arn             = aws_lambda_function.api_get_data.arn
        payload_format_version = "2.0"
        authorization_type     = "JWT"
        authorizer_key         = "cognito"
        throttling_rate_limit  = 80
        throttling_burst_limit = 40
    }

    "PUT /api/update" = {
        lambda_arn             = aws_lambda_function.api_get_data.arn
        payload_format_version = "2.0"
        authorization_type     = "JWT"
        authorizer_key         = "cognito"
        throttling_rate_limit  = 80
        throttling_burst_limit = 40
    }

    "DELETE /api/delete" = {
        lambda_arn             = aws_lambda_function.api_get_data.arn
        payload_format_version = "2.0"
        authorization_type     = "JWT"
        authorizer_key         = "cognito"
        throttling_rate_limit  = 80
        throttling_burst_limit = 40
    }
  }

  authorizers = {
    "cognito" = {
      authorizer_type  = "JWT"
      identity_sources = "$request.header.Authorization"
      name             = "${aws_cognito_user_pool.main.name}-authorizer"
      audience         = [aws_cognito_user_pool_client.main.id]
      issuer           = "https://${aws_cognito_user_pool.main.endpoint}"
    }
  }

  tags = {
    Name = local.name_prefix
  }
}
