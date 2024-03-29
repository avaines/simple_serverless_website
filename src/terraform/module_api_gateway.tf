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
    allow_methods  = ["*"]
    allow_origins  = ["*"]
    expose_headers = ["x-total-count"]
  }

  create_api_domain_name           = false
  create_vpc_link                  = false
  create_default_stage_api_mapping = false

  authorizers = {
    "cognito" = {
      authorizer_type  = "JWT"
      identity_sources = "$request.header.Authorization"
      name             = "${aws_cognito_user_pool.main.name}-authorizer"
      audience         = [aws_cognito_user_pool_client.main.id]
      issuer           = "https://${aws_cognito_user_pool.main.endpoint}"
    }
  }

  # Routes and integrations
  integrations = {
    "ANY /api/posts" = {
      lambda_arn             = aws_lambda_function.api_any_posts.arn
      payload_format_version = "2.0"
      authorization_type     = "JWT"
      authorizer_key         = "cognito"
      throttling_rate_limit  = 80
      throttling_burst_limit = 40
    }

    "ANY /api/posts/{proxy+}" = {
      lambda_arn             = aws_lambda_function.api_any_posts.arn
      payload_format_version = "2.0"
      authorization_type     = "JWT"
      authorizer_key         = "cognito"
      throttling_rate_limit  = 80
      throttling_burst_limit = 40
    }

    "GET /api/users" = {
      lambda_arn             = aws_lambda_function.api_any_users.arn
      payload_format_version = "2.0"
      authorization_type     = "JWT"
      authorizer_key         = "cognito"
      throttling_rate_limit  = 80
      throttling_burst_limit = 40
    }

    "ANY /api/users/{proxy+}" = {
      lambda_arn             = aws_lambda_function.api_any_users.arn
      payload_format_version = "2.0"
      authorization_type     = "JWT"
      authorizer_key         = "cognito"
      throttling_rate_limit  = 80
      throttling_burst_limit = 40
    }
  }
}
