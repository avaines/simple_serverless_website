resource "aws_dynamodb_table" "posts" {
  name         = "${local.name_prefix}-posts"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"
  range_key = "userId"

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "userId"
    type = "N"
  }
}