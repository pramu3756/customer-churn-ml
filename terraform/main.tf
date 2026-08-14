terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

resource "aws_ecr_repository" "churn_api" {
  name                 = "churn-prediction-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_s3_bucket" "data_bucket" {
  bucket = "churn-ml-platform-data-prod"
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/churn-prediction-api"
  retention_in_days = 30
}
