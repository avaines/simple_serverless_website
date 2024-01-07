terraform {
  backend "s3" {
    bucket = "terraform-804221019544-state"
    region = "us-east-1"
    key    = "dev/main"
  }
}
