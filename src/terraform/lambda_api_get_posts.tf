data "archive_file" "get_posts" {
  type        = "zip"
  source_dir = "${path.module}/../aws/lambda/getPosts/"
  output_path = "${path.module}/lambda/getPosts.zip"
}

resource "aws_iam_role" "lambda_get_posts" {
  name = "${local.name_prefix}-lambda-get-posts"
  assume_role_policy = data.aws_iam_policy_document.assume_role_lambda.json
}

resource "aws_lambda_function" "api_get_posts" {
  function_name = "${local.name_prefix}-api-get-posts"
  filename      = data.archive_file.get_posts.output_path
  role          = aws_iam_role.lambda_get_posts.arn

  source_code_hash = data.archive_file.get_posts.output_base64sha256

  handler = "main.handler"
  runtime = "nodejs20.x"

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "todo"
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_get_posts" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_get_posts.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.apigatewayv2_api_execution_arn}/**"
}
