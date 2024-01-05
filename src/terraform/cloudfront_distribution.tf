resource "aws_cloudfront_origin_access_identity" "main" {
  comment = local.name_prefix
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  default_root_object = "index.html"

  # S3/FE origin
  origin {
    origin_id   = aws_s3_bucket.frontend.bucket
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  # APIGW / BE origin
  origin {
    origin_id   = module.api_gateway.apigatewayv2_api_id
    domain_name = trimprefix(module.api_gateway.apigatewayv2_api_api_endpoint, "https://")

    custom_header {
      name = "Content-Type"
      value = "application/json"
    }

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  ordered_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    path_pattern     = "api/*"
    target_origin_id = module.api_gateway.apigatewayv2_api_id

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "none"
      }
    }

    compress    = true
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    viewer_protocol_policy = "https-only"
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.frontend.bucket

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
