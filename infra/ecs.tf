# =============================================================================
# ECS — Elastic Container Service (Fargate)
# Orquestra os containers do backend sem necessidade de gerenciar servidores
# =============================================================================

# --- CloudWatch Log Group ---
# Centraliza os logs de todas as tasks do backend

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}/backend"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-logs-backend"
  }
}

# --- ECS Cluster ---

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  # Habilita Container Insights para métricas detalhadas no CloudWatch
  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# --- Task Definition ---
# Define o "blueprint" do container: imagem, CPU, memória, variáveis, logs

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc" # obrigatório no Fargate
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = var.backend_port
          hostPort      = var.backend_port
          protocol      = "tcp"
        }
      ]

      # Variáveis não sensíveis — injetadas diretamente
      environment = [
        {
          name  = "PORT"
          value = tostring(var.backend_port)
        }
      ]

      # Variáveis sensíveis — lidas do Secrets Manager em tempo de inicialização
      # O ECS injeta cada chave do JSON como uma variável de ambiente separada
      secrets = [
        {
          name      = "TOKEN_SECRET"
          valueFrom = "${aws_secretsmanager_secret.backend_env.arn}:TOKEN_SECRET::"
        },
        {
          name      = "TOKEN_EXPIRATION"
          valueFrom = "${aws_secretsmanager_secret.backend_env.arn}:TOKEN_EXPIRATION::"
        },
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.backend_env.arn}:DATABASE_URL::"
        },
        {
          name      = "ALLOWED_ORIGINS"
          valueFrom = "${aws_secretsmanager_secret.backend_env.arn}:ALLOWED_ORIGINS::"
        },
        {
          name      = "NODE_ENV"
          valueFrom = "${aws_secretsmanager_secret.backend_env.arn}:NODE_ENV::"
        }
      ]

      # Configuração de logs para CloudWatch
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      # Health check interno do container (complementa o health check do ALB)
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.backend_port}/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60 # aguarda 60s antes de iniciar os checks (tempo de boot do Node)
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-task-backend"
  }
}

# --- ECS Service ---
# Mantém o número desejado de tasks rodando e integra com o ALB

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  # Garante que o ALB valide a saúde da nova task antes de desligar a antiga
  health_check_grace_period_seconds = 60

  network_configuration {
    subnets          = aws_subnet.private[*].id # tasks ficam em subnets privadas
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = false # sem IP público — acesso apenas via ALB
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = var.backend_port
  }

  # Estratégia de deploy: substitui gradualmente as tasks antigas pelas novas
  deployment_circuit_breaker {
    enable   = true  # para o deploy automaticamente se as tasks falharem
    rollback = true  # reverte para a versão anterior em caso de falha
  }

  deployment_controller {
    type = "ECS" # deploy rolling padrão
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_task_execution_managed
  ]

  tags = {
    Name = "${var.project_name}-backend-service"
  }

  lifecycle {
    # Impede que o Terraform reverta mudanças de imagem feitas pelo CI/CD
    ignore_changes = [task_definition]
  }
}
