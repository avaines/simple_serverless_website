output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "frontend_cdn" {
  value = {
    "cname": aws_cloudfront_distribution.main.domain_name,
    "id": aws_cloudfront_distribution.main.id,
  }
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.main.id
}

output "dynamodb_table_names" {
  value = {
    "posts": aws_dynamodb_table.posts.name,
    "users": aws_dynamodb_table.users.name,
  }
}
