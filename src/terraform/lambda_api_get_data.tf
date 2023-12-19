data "archive_file" "get_data" {
  type        = "zip"
  source_dir = "${path.module}/../aws/lambda/getData/"
  output_path = "${path.module}/lambda/getData.zip"
}

resource "aws_iam_role" "lambda_get_data" {
  name = "${local.name_prefix}-lambda-get-data"
  assume_role_policy = data.aws_iam_policy_document.assume_role_lambda.json
}

resource "aws_lambda_function" "api_get_data" {
  function_name = "${local.name_prefix}-api-get-data"
  filename      = data.archive_file.get_data.output_path
  role          = aws_iam_role.lambda_get_data.arn

  source_code_hash = data.archive_file.get_data.output_base64sha256

  handler = "main.handler"
  runtime = "nodejs20.x"

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "todo"
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_get_data.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.apigatewayv2_api_execution_arn}/**"
}
