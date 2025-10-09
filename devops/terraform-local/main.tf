provider "aws" {
  access_key = "test"
  secret_key = "test"
  region     = "us-east-1"
}


data "template_file" "config_json" {
  template = "${file("${path.module}/config_json.tpl")}"
  vars = {
    foo = "bar"
  }
}

resource "local_file" "config_json" {
  content  = "${data.template_file.config_json.rendered}"
  filename = "${path.module}/lambda/config.json"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/lambda_function.zip"
  source_dir = "${path.module}/lambda"

  # It is important to this process.
  depends_on = [
    "local_file.config_json" 
  ]
}

resource "aws_lambda_function" "lambda" {
  filename         = "${path.module}/lambda_function.zip"
  function_name    = "lambda_function"
  role             = "${aws_iam_role.lambda.arn}"
  handler          = "index.handler"
  runtime          = "nodejs20.x"
}


