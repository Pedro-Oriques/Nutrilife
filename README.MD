# NutriLife

Aplicação web full-stack de rastreamento nutricional. Registre refeições, monitore calorias e macros, acompanhe o peso, controle a ingestão de água e compete com outros usuários por um sistema de gamificação.

![Backend](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?logo=nestjs)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=nextdotjs)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![AWS](https://img.shields.io/badge/Cloud-AWS-FF9900?logo=amazonaws)
![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)

---

## Visão Geral

| Camada | Tecnologia | Descrição |
|---|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind 4 | App Router, tema claro/escuro, gráficos com Recharts |
| Backend | NestJS 11 + TypeScript | API REST, JWT, Swagger, rate limiting, gamificação |
| Banco | MongoDB + Mongoose 9 | 8 coleções, seed de alimentos, criação automática de admin |
| Infra | Terraform + AWS | VPC, ECS Fargate, ECR, ALB, Secrets Manager (IaC) |
| CI/CD | GitHub Actions | Quality gate com testes + deploy automático no ECS |

---

## Funcionalidades

- **Rastreamento diário** — registre alimentos por sessão de refeição (6 sessões), cálculo automático de calorias com suporte a 6 unidades de medida
- **Banco de alimentos** — busca inteligente com ordenação por relevância e filtro por restrições alimentares
- **Controle de água** — registro acumulativo diário com meta personalizada
- **Histórico de peso** — gráfico de evolução com cálculo de IMC
- **Refeições favoritas** — salve combinações para reutilizar com um clique
- **Relatórios** — visão nutricional por período com paginação
- **Gamificação** — pontos por ações saudáveis, calendário de contribuição (estilo GitHub) e ranking global
- **Perfil personalizado** — metas calculadas automaticamente via TMB + TDEE (Harris-Benedict)
- **Recuperação de conta** — pergunta/resposta secreta sem e-mail externo

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Usuário (Browser)                 │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│          Frontend — Next.js (CloudFront/S3)         │
│         NEXT_PUBLIC_API_URL → ALB URL               │
└────────────────────────┬────────────────────────────┘
                         │ REST / JSON
┌────────────────────────▼────────────────────────────┐
│          ALB — Application Load Balancer            │
│        health check em /api/health                  │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│         Backend — ECS Fargate (NestJS)              │
│    /api/auth  /api/food  /api/daily-tracking        │
│    /api/water /api/weight /api/gamification  etc.   │
│         Swagger UI em /api-docs                     │
└────────────────────────┬────────────────────────────┘
                         │ Mongoose
┌────────────────────────▼────────────────────────────┐
│              MongoDB Atlas (externo)                │
└─────────────────────────────────────────────────────┘
```

### Infraestrutura AWS (Terraform — ver `/infra`)

```
GitHub Actions (OIDC — sem chaves estáticas)
  └── push main → build Docker → push ECR → rolling deploy ECS

AWS
  ├── VPC
  │   ├── Subnets públicas  (ALB)
  │   ├── Subnets privadas  (tasks ECS — sem IP público)
  │   ├── Internet Gateway
  │   └── NAT Gateway       (tasks acessam internet para MongoDB Atlas)
  ├── ECR    — registry Docker com lifecycle policy
  ├── ECS Fargate — cluster, task definition, service com circuit breaker
  ├── ALB    — load balancer público, health check em /api/health
  ├── Secrets Manager — TOKEN_SECRET, DATABASE_URL, etc. (injetados em runtime)
  └── IAM    — execution role, task role e role do GitHub Actions (least privilege)
```

---

## Rodando Localmente

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- MongoDB (local ou Atlas)

### Com Docker Compose (recomendado)

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/Nutrilife.git
cd Nutrilife

# Configure as variáveis do backend
cp backend/.env.example backend/.env
# edite backend/.env com suas configurações

# Suba o backend + MongoDB
docker compose up -d

# O backend estará disponível em http://localhost:21165
# Swagger em http://localhost:21165/api-docs
```

### Manualmente

```bash
# Backend
cd backend
npm install
cp .env.example .env    # configure as variáveis
npm run start:dev       # http://localhost:21165

# Frontend (outro terminal)
cd frontend
npm install
# configure NEXT_PUBLIC_API_URL em .env.development
npm run dev             # http://localhost:3000
```

### Seed de Alimentos

```bash
cd backend
npm run seed:foods      # popula o banco com alimentos de exemplo
```

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor | `21165` |
| `DATABASE_URL` | Connection string do MongoDB | `mongodb://localhost:27017/nutrilife` |
| `TOKEN_SECRET` | Segredo para assinar JWTs | string aleatória longa |
| `TOKEN_EXPIRATION` | Expiração do token | `24h` |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (separadas por vírgula) | `https://app.example.com` |

Veja o template completo em [`backend/.env.example`](backend/.env.example).

### Frontend (`frontend/.env.development`)

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL do ALB gerada pelo `terraform output alb_dns_name` |

Veja o template em [`frontend/.env.example`](frontend/.env.example).

---

## CI/CD

O repositório tem dois pipelines no GitHub Actions:

### Backend (`.github/workflows/backend-deploy.yml`)

Disparado por push em `main` com mudanças em `backend/**`.

```
quality:
  ├── npm ci
  ├── Docker: sobe MongoDB (docker-compose.ci.yml)
  ├── nest build   ← valida TypeScript
  └── jest         ← testes unitários

deploy (após quality passar):
  └── GitHub Actions assume role AWS via OIDC
      ├── docker build + push → ECR
      ├── registra nova task definition no ECS
      └── ECS rolling deploy (circuit breaker ativo)
```

### Frontend (`.github/workflows/frontend-deploy.yml`)

Disparado por push em `main` com mudanças em `frontend/**`.

```
quality:
  ├── npm ci
  └── next build   ← valida o build completo

deploy (após quality passar):
  └── build com NEXT_PUBLIC_API_URL → ALB URL
      └── deploy no serviço de hospedagem configurado
```

### Secrets necessários no GitHub

| Secret | Descrição |
|---|---|
| `AWS_ROLE_ARN` | ARN da role IAM para OIDC (gerado pelo `terraform output github_actions_role_arn`) |
| `AWS_REGION` | Região AWS (ex: `us-east-1`) |
| `ECR_REPOSITORY` | URL do repositório ECR (gerado pelo `terraform output ecr_repository_url`) |
| `ECS_CLUSTER` | Nome do cluster ECS (gerado pelo `terraform output ecs_cluster_name`) |
| `ECS_SERVICE` | Nome do service ECS (gerado pelo `terraform output ecs_service_name`) |

---

## Infraestrutura como Código (Terraform)

Os arquivos em `/infra` definem toda a infraestrutura AWS necessária para escalar o projeto:

| Arquivo | Recursos |
|---|---|
| `vpc.tf` | VPC, subnets públicas/privadas, Internet Gateway, NAT Gateway, route tables, security groups |
| `ecr.tf` | Repositório Docker com lifecycle policy (limpa imagens antigas automaticamente) |
| `ecs.tf` | Cluster ECS Fargate, task definition com secrets injetados, service com circuit breaker |
| `alb.tf` | Application Load Balancer, target group com health check em `/api/health` |
| `iam.tf` | Execution role, task role e role do GitHub Actions via OIDC (sem chaves estáticas) |
| `secrets.tf` | Secrets Manager para variáveis sensíveis do backend |

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# preencha terraform.tfvars com seus valores

terraform init
terraform plan
terraform apply

# Após o apply, use os outputs para configurar o CI/CD
terraform output github_actions_role_arn   # → secret AWS_ROLE_ARN
terraform output ecr_repository_url        # → secret ECR_REPOSITORY
terraform output ecs_cluster_name          # → secret ECS_CLUSTER
terraform output ecs_service_name          # → secret ECS_SERVICE
terraform output alb_dns_name             # → NEXT_PUBLIC_API_URL do frontend
```

---

## Documentação

| Documento | Descrição |
|---|---|
| [`DOCUMENTACAO.md`](DOCUMENTACAO.md) | Documentação técnica completa: módulos, endpoints, schemas, gamificação |
| [`backend/API_ENDPOINTS.md`](backend/API_ENDPOINTS.md) | Referência detalhada dos endpoints com exemplos cURL |
| `http://localhost:21165/api-docs` | Swagger UI interativo (com o backend rodando) |

---

## Estrutura do Repositório

```
Nutrilife/
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── auth/             # JWT, guards, estratégias
│   │   ├── user/             # Cadastro, perfil, recuperação de senha
│   │   ├── food/             # Banco de alimentos + busca
│   │   ├── daily-tracking/   # Registro de refeições
│   │   ├── water/            # Controle de hidratação
│   │   ├── weight/           # Histórico de peso
│   │   ├── gamification/     # Pontos e ranking
│   │   ├── favorite-meal/    # Refeições favoritas
│   │   ├── report/           # Relatórios nutricionais
│   │   └── admin/            # Administração
│   └── dockerfile
│
├── frontend/                 # Next.js App
│   └── src/
│       ├── app/              # Rotas (App Router)
│       ├── components/       # Componentes reutilizáveis
│       ├── services/api.ts   # Camada de comunicação com o backend
│       └── contexts/         # Auth e tema
│
├── infra/                    # Terraform (AWS)
│   ├── vpc.tf
│   ├── ecr.tf
│   ├── ecs.tf
│   ├── alb.tf
│   ├── iam.tf
│   └── secrets.tf
│
├── .github/workflows/        # CI/CD
│   ├── backend-deploy.yml    # quality gate + deploy ECS via OIDC
│   └── frontend-deploy.yml   # quality gate + deploy do frontend
│
└── docker-compose.yml        # Ambiente local completo
```
