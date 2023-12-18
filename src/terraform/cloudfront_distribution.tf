resource "aws_cloudfront_origin_access_identity" "main" {
  comment = local.name_prefix
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    origin_id                = aws_s3_bucket.frontend.bucket
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }

    # custom_origin_config {
    #   http_port              = 80
    #   https_port             = 443
    #   origin_protocol_policy = "http-only"
    #   origin_ssl_protocols   = ["TLSv1"]
    # }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"] #["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.frontend.bucket
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    compress    = true
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  # TODO
  # aliases = [
  #   aws_s3_bucket.frontend.bucket
  # ]

  viewer_certificate {
    cloudfront_default_certificate = true
    # TODO
    # acm_certificate_arn      = aws_acm_certificate_validation.main.certificate_arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }
}
