terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend remoto: armazena o state no S3 com lock via DynamoDB
  # Descomente e configure após criar o bucket e a tabela manualmente (bootstrap)
  # backend "s3" {
  #   bucket         = "nutrilife-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "nutrilife-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "nutrilife"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
