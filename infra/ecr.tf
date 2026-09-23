# =============================================================================
# ECR — Elastic Container Registry
# Armazena as imagens Docker do backend
# =============================================================================

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}/backend"
  image_tag_mutability = "MUTABLE" # permite sobrescrever a tag "latest"

  # Habilita scan automático de vulnerabilidades a cada push
  image_scanning_configuration {
    scan_on_push = true
  }

  # Criptografia em repouso usando chave gerenciada pela AWS
  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "${var.project_name}-ecr-backend"
  }
}

# --- Lifecycle Policy: mantém apenas as 10 imagens mais recentes ---
# Evita acúmulo de imagens antigas e reduz custos de armazenamento

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Manter apenas as 10 imagens tagged mais recentes"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "latest"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remover imagens sem tag após 7 dias"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
