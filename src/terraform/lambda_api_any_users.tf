data "archive_file" "any_users" {
  type        = "zip"
  source_dir = "${path.module}/../aws/lambda/anyUsers/"
  output_path = "${path.module}/lambda/anyUsers.zip"
}

data "aws_iam_policy_document" "allow_lambda_any_users_dynamodb" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:Query"
    ]

    resources = [
      "${aws_dynamodb_table.users.arn}/*/index/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:BatchanyItem",
      "dynamodb:anyItem",
      "dynamodb:Query",
    ]

    resources = [
      "${aws_dynamodb_table.users.arn}/*"
    ]
  }
}

resource "aws_iam_role" "lambda_any_users" {
  name = "${local.name_prefix}-lambda-any-users"
  assume_role_policy = data.aws_iam_policy_document.assume_role_lambda.json

  inline_policy {
    name   = "lambda_any_users_dynamodb"
    policy = data.aws_iam_policy_document.allow_lambda_any_users_dynamodb.json
  }
}

resource "aws_lambda_function" "api_any_users" {
  function_name = "${local.name_prefix}-api-any-users"
  filename      = data.archive_file.any_users.output_path
  role          = aws_iam_role.lambda_any_users.arn

  source_code_hash = data.archive_file.any_users.output_base64sha256

  handler = "main.handler"
  runtime = "nodejs20.x"

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_permission" "allow_apigw_any_users_invoke" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_any_users.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.apigatewayv2_api_execution_arn}/**"
}
