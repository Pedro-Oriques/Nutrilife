variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Nome do ambiente (prod, staging)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Nome do projeto, usado como prefixo nos recursos"
  type        = string
  default     = "nutrilife"
}

# --- Rede ---

variable "vpc_cidr" {
  description = "CIDR block da VPC principal"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas (uma por AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs das subnets privadas (uma por AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "Zonas de disponibilidade utilizadas"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# --- ECS / Backend ---

variable "backend_image_tag" {
  description = "Tag da imagem Docker do backend no ECR"
  type        = string
  default     = "latest"
}

variable "backend_cpu" {
  description = "CPU alocada para a task do backend (unidades ECS: 256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memória alocada para a task do backend em MB"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Número de tasks do backend rodando simultaneamente"
  type        = number
  default     = 1
}

variable "backend_port" {
  description = "Porta interna que o backend NestJS escuta"
  type        = number
  default     = 3000
}

# --- Domínio / Certificado ---

variable "domain_name" {
  description = "Domínio principal da aplicação (ex: nutrilife.com.br). Deixe vazio para usar só o DNS do ALB."
  type        = string
  default     = ""
}
