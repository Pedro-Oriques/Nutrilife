# =============================================================================
# Secrets Manager — Variáveis sensíveis do backend
# As tasks ECS lêem esses valores na inicialização via task execution role
# =============================================================================

resource "aws_secretsmanager_secret" "backend_env" {
  name        = "${var.project_name}/${var.environment}/backend"
  description = "Variaveis de ambiente sensiveis do backend NestJS"

  # Aguarda 7 dias antes de deletar permanentemente (proteção contra exclusão acidental)
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-backend-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "backend_env" {
  secret_id = aws_secretsmanager_secret.backend_env.id

  # Os valores reais são passados via terraform.tfvars (nunca commitado)
  # ou via variáveis de ambiente no CI/CD.
  # Substitua os placeholders antes de executar o apply.
  secret_string = jsonencode({
    TOKEN_SECRET     = "SUBSTITUA_POR_UM_SEGREDO_FORTE"
    TOKEN_EXPIRATION = "24h"
    DATABASE_URL     = "mongodb+srv://usuario:senha@cluster.mongodb.net/nutrilife?retryWrites=true&w=majority"
    ALLOWED_ORIGINS  = "https://seu-app.vercel.app"
    NODE_ENV         = "production"
  })

  lifecycle {
    # Evita que o Terraform sobrescreva segredos editados manualmente no console AWS
    ignore_changes = [secret_string]
  }
}
