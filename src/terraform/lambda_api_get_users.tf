data "archive_file" "get_users" {
  type        = "zip"
  source_dir = "${path.module}/../aws/lambda/getUsers/"
  output_path = "${path.module}/lambda/getUsers.zip"
}

resource "aws_iam_role" "lambda_get_users" {
  name = "${local.name_prefix}-lambda-get-users"
  assume_role_policy = data.aws_iam_policy_document.assume_role_lambda.json
}

resource "aws_lambda_function" "api_get_users" {
  function_name = "${local.name_prefix}-api-get-users"
  filename      = data.archive_file.get_users.output_path
  role          = aws_iam_role.lambda_get_users.arn

  source_code_hash = data.archive_file.get_users.output_base64sha256

  handler = "main.handler"
  runtime = "nodejs20.x"

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "todo"
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_get_users" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_get_users.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.apigatewayv2_api_execution_arn}/**"
}
