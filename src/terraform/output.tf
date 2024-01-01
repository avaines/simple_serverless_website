output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "frontend_cdn_cname" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.main.id
}
