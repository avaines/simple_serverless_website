output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "frontend_cdn_cname" {
  value = aws_cloudfront_distribution.main.domain_name
}
