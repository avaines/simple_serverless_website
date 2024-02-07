data "archive_file" "any_posts" {
  type        = "zip"
  source_dir  = "${path.module}/../aws/lambda/anyPosts/"
  output_path = "${path.module}/lambda/anyPosts.zip"
}

data "aws_iam_policy_document" "allow_lambda_any_posts_dynamodb" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
      "dynamodb:Scan",
    ]

    resources = [
      aws_dynamodb_table.posts.arn
    ]
  }

  # statement {
  #   effect = "Allow"
  #   actions = [
  #     "dynamodb:Query"
  #   ]

  #   resources = [
  #     "${aws_dynamodb_table.posts.arn}/*/index/*"
  #   ]
  # }

  # statement {
  #   effect = "Allow"
  #   actions = [
  #     "dynamodb:GetItem",
  #     "dynamodb:Query",
  #   ]

  #   resources = [
  #     "${aws_dynamodb_table.posts.arn}/*"
  #   ]
  # }
}

resource "aws_iam_role" "lambda_any_posts" {
  name               = "${local.name_prefix}-lambda-any-posts"
  assume_role_policy = data.aws_iam_policy_document.assume_role_lambda.json

  inline_policy {
    name   = "lambda_any_posts_dynamodb"
    policy = data.aws_iam_policy_document.allow_lambda_any_posts_dynamodb.json
  }
}

resource "aws_lambda_function" "api_any_posts" {
  function_name = "${local.name_prefix}-api-any-posts"
  filename      = data.archive_file.any_posts.output_path
  role          = aws_iam_role.lambda_any_posts.arn

  source_code_hash = data.archive_file.any_posts.output_base64sha256

  handler = "main.handler"
  runtime = "nodejs20.x"

  # logging_config {
  #   log_format = "JSON"
  #   system_log_level = "WARN"
  # }

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_permission" "allow_apigw_any_posts_invoke" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_any_posts.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.apigatewayv2_api_execution_arn}/**"
}

resource "aws_cloudwatch_log_group" "api_any_posts" {
  name              = "/aws/lambda/${aws_lambda_function.api_any_posts.function_name}"
  retention_in_days = 1
}
