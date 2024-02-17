resource "aws_cognito_user_pool" "main" {
  name = local.name_prefix
  # Add other user pool properties as needed
}

resource "aws_cognito_user_pool_client" "main" {
  name         = local.name_prefix
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  precedence   = 10
}

resource "aws_cognito_user_group" "user" {
  name         = "user"
  user_pool_id = aws_cognito_user_pool.main.id
  precedence   = 50
}
