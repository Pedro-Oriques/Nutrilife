# =============================================================================
# Outputs — Valores exportados após o terraform apply
# Úteis para configurar o CI/CD e o frontend
# =============================================================================

output "alb_dns_name" {
  description = "DNS público do Application Load Balancer. Use como NEXT_PUBLIC_API_URL no Vercel (ex: http://<valor>/api/)."
  value       = aws_lb.backend.dns_name
}

output "ecr_repository_url" {
  description = "URL do repositório ECR. Use no CI/CD para fazer push das imagens Docker."
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS. Necessário no comando de deploy do GitHub Actions."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Nome do service ECS. Necessário no comando de deploy do GitHub Actions."
  value       = aws_ecs_service.backend.name
}

output "ecs_task_definition_family" {
  description = "Family da task definition. Usada para registrar novas revisões no CI/CD."
  value       = aws_ecs_task_definition.backend.family
}

output "github_actions_role_arn" {
  description = "ARN da role IAM para o GitHub Actions. Configure como secret AWS_ROLE_ARN no repositório."
  value       = aws_iam_role.github_actions.arn
}

output "backend_secrets_arn" {
  description = "ARN do secret no Secrets Manager. Atualize os valores sensíveis diretamente no console AWS."
  value       = aws_secretsmanager_secret.backend_env.arn
}

output "vpc_id" {
  description = "ID da VPC criada."
  value       = aws_vpc.main.id
}
