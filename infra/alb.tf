# =============================================================================
# ALB — Application Load Balancer
# Ponto de entrada público para o backend. Distribui tráfego entre as tasks ECS.
# =============================================================================

resource "aws_lb" "backend" {
  name               = "${var.project_name}-alb"
  internal           = false # público
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  # Protege contra deleção acidental via terraform destroy
  enable_deletion_protection = false # mude para true em produção real

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# --- Target Group ---
# Define como o ALB se comunica com as tasks ECS e verifica a saúde delas

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-tg-backend"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # obrigatório para ECS Fargate

  health_check {
    enabled             = true
    path                = "/api/health" # endpoint do AppController
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg-backend"
  }
}

# --- Listener HTTP (porta 80) ---
# Redireciona todo tráfego HTTP para HTTPS se um domínio estiver configurado,
# ou encaminha direto para o target group caso contrário.

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.domain_name != "" ? "redirect" : "forward"

    # Usado quando domain_name está vazio — encaminha direto ao backend
    dynamic "forward" {
      for_each = var.domain_name == "" ? [1] : []
      content {
        target_group {
          arn = aws_lb_target_group.backend.arn
        }
      }
    }

    # Usado quando domain_name está configurado — redireciona HTTP → HTTPS
    dynamic "redirect" {
      for_each = var.domain_name != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}
