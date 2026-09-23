# NutriLife — Documentação Completa

## Visão Geral

NutriLife é uma aplicação web full-stack de rastreamento nutricional e saúde. Permite que usuários registrem refeições diárias, monitorem calorias e macronutrientes, acompanhem o peso corporal, controlem a ingestão de água e participem de um sistema de gamificação que recompensa hábitos saudáveis.

---

## Sumário

1. [Tecnologias Utilizadas](#1-tecnologias-utilizadas)
2. [Estrutura do Projeto](#2-estrutura-do-projeto)
3. [Configuração e Instalação](#3-configuração-e-instalação)
4. [Backend — Arquitetura e Módulos](#4-backend--arquitetura-e-módulos)
5. [API — Endpoints](#5-api--endpoints)
6. [Frontend — Páginas e Componentes](#6-frontend--páginas-e-componentes)
7. [Fluxo de Autenticação](#7-fluxo-de-autenticação)
8. [Sistema de Gamificação](#8-sistema-de-gamificação)
9. [Banco de Dados — Coleções e Schemas](#9-banco-de-dados--coleções-e-schemas)
10. [Scripts e Seeds](#10-scripts-e-seeds)
11. [Variáveis de Ambiente](#11-variáveis-de-ambiente)
12. [Docker](#12-docker)

---

## 1. Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| NestJS | 11.0.1 | Framework principal |
| MongoDB + Mongoose | 9.1.3 / 11.0.4 | Banco de dados |
| Passport.js + JWT | — | Autenticação |
| class-validator | 0.14.3 | Validação de DTOs |
| Swagger/OpenAPI | 11.2.5 | Documentação da API |
| bcrypt | 6.0.0 | Hash de senhas |
| @nestjs/throttler | 6.5.0 | Rate limiting |
| TypeScript | 5.7.3 | Linguagem |

### Frontend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Next.js | 16.1.1 | Framework React |
| React | 19.2.3 | UI |
| Tailwind CSS | 4 | Estilização |
| TanStack React Query | 5.90.21 | Gerenciamento de estado/cache |
| Recharts | 3.8.0 | Gráficos |
| react-icons | 5.5.0 | Ícones |
| Vitest | 4.1.2 | Testes |

---

## 2. Estrutura do Projeto

```
/
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── admin/            # Módulo administrativo
│   │   ├── auth/             # Autenticação JWT
│   │   ├── common/           # Utilitários compartilhados
│   │   ├── daily-tracking/   # Registro diário de refeições
│   │   ├── favorite-meal/    # Refeições favoritas
│   │   ├── food/             # Banco de alimentos
│   │   ├── gamification/     # Sistema de pontos e ranking
│   │   ├── profile/          # Perfil e metas do usuário
│   │   ├── report/           # Relatórios nutricionais
│   │   ├── scripts/          # Scripts utilitários
│   │   ├── user/             # Cadastro e gerenciamento de usuários
│   │   ├── water/            # Controle de hidratação
│   │   ├── weight/           # Histórico de peso
│   │   ├── app.module.ts     # Módulo raiz
│   │   └── main.ts           # Bootstrap da aplicação
│   ├── dockerfile
│   └── package.json
│
└── frontend/                 # Aplicação Next.js
    ├── src/
    │   ├── app/              # Rotas (App Router)
    │   ├── components/       # Componentes reutilizáveis
    │   ├── contexts/         # Contextos React
    │   ├── services/         # Camada de comunicação com a API
    │   └── assets/           # Imagens e SVGs
    └── package.json
```

---

## 3. Configuração e Instalação

### Pré-requisitos
- Node.js 20+
- MongoDB (local ou Atlas)
- npm ou yarn

### Backend

```bash
cd backend
npm install

# Configurar variáveis de ambiente (ver seção 11)
cp .env.example .env

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

O servidor inicia na porta definida em `PORT` (padrão: `21165`).  
A documentação Swagger fica disponível em: `http://localhost:21165/api-docs`

### Frontend

```bash
cd frontend
npm install

# Desenvolvimento
npm run dev

# Produção
npm run build
npm run start
```

O frontend inicia em `http://localhost:3000` por padrão.

### Seed de Alimentos

```bash
# Desenvolvimento
cd backend
npm run seed:foods

# Produção
npm run seed:foods:prod
```

---

## 4. Backend — Arquitetura e Módulos

O backend segue a arquitetura modular do NestJS. Cada funcionalidade é encapsulada em um módulo com seu próprio controller, service e schema.

### Módulo de Usuário (`/user`)

Responsável pelo ciclo de vida do usuário.

**Funcionalidades:**
- Cadastro com validação de e-mail único
- Hash de senha com bcrypt (salt 10)
- Pergunta e resposta secreta para recuperação de conta
- Atualização de dados cadastrais
- Exclusão de conta
- Listagem de usuários (admin)

**Roles disponíveis:** `user`, `admin`

**Recuperação de senha** (`/recovery`):
- Verificação de e-mail existente
- Validação da resposta secreta
- Redefinição de senha

---

### Módulo de Autenticação (`/auth`)

Utiliza JWT com Passport.js.

**Fluxo:**
1. `POST /auth/login` — valida credenciais, gera token JWT
2. Token inclui: `sub` (userId), `email`, `username`, `role`
3. Expiração configurável via variável de ambiente
4. Ao fazer login, o sistema automaticamente concede 50 pontos de gamificação

**Guards:**
- `JwtAuthGuard` — protege rotas autenticadas
- `RolesGuard` — controle de acesso por papel (role)

---

### Módulo de Perfil (`/profile`)

Armazena dados de saúde e metas nutricionais do usuário.

**Campos do perfil:**
| Campo | Tipo | Descrição |
|---|---|---|
| birthDate | Date | Data de nascimento |
| height | number | Altura em cm (1–300) |
| weight | number | Peso em kg (1–300) |
| gender | string | `Feminino` ou `Masculino` |
| physicalActivity | string | Nível de atividade física |
| goal | string | Objetivo nutricional |
| foodRestrictions | string[] | Restrições alimentares |
| dailyCalorieGoal | number | Meta calórica diária (mín. 1200) |
| proteinGoal | number | Meta de proteína (g) |
| carbsGoal | number | Meta de carboidratos (g) |
| fatGoal | number | Meta de gordura (g) |
| dailyWaterGoal | number | Meta de água (ml) |
| lgpdConsent | boolean | Consentimento LGPD |

**Níveis de atividade física:**
- Sedentário
- Pouco ativo
- Ativo
- Muito Ativo
- Extremamente Ativo

**Objetivos:**
- Perda de peso
- Ganho de massa
- Manter saúde

**Cálculo automático de metas:**
- TMB (Taxa Metabólica Basal) via fórmula de Harris-Benedict
- TDEE (Gasto Energético Total) com multiplicador de atividade
- Meta calórica ajustada pelo objetivo
- Distribuição de macros: proteína 30–35%, carboidratos 40–45%, gordura 20–25%
- Meta de água: `peso × 35 + bônus de atividade` (ml)

---

### Módulo de Alimentos (`/food`)

Banco de dados de alimentos com busca inteligente.

**Schema:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| name | string | Sim |
| caloriesPer100g | number | Sim |
| protein | number | Não |
| carbs | number | Não |
| fat | number | Não |
| foodRestrictions | string[] | Não |

**Restrições alimentares suportadas:**
- Sem restrições
- Celíaco
- Vegano
- Vegetariano
- Colesterol alto

**Busca:**
- Mínimo de 3 caracteres
- Case-insensitive
- Ordenação por posição de correspondência (início > meio > fim)

---

### Módulo de Rastreamento Diário (`/daily-tracking`)

Registro de alimentos consumidos por sessão de refeição.

**Sessões de refeição:**
| Enum | Descrição |
|---|---|
| `cafe_da_manha` | Café da manhã |
| `lanche_manha` | Lanche da manhã |
| `almoco` | Almoço |
| `lanche_tarde` | Lanche da tarde |
| `jantar` | Jantar |
| `ceia` | Ceia |

**Unidades de medida:**
| Unidade | Conversão para gramas |
|---|---|
| g | × 1 |
| kg | × 1000 |
| ml | × 1 |
| L | × 1000 |
| mg | ÷ 1000 |
| mcg | ÷ 1.000.000 |

**Cálculo de calorias:**
```
calorias = (caloriesPer100g / 100) × quantidadeEmGramas
```

**Exemplo:** Frango grelhado (165 kcal/100g) + 150g = **247,5 kcal**

---

### Módulo de Água (`/water`)

Controle de ingestão hídrica diária.

- Registro acumulativo por dia (soma ao valor existente)
- Valores negativos são zerados automaticamente
- Ao registrar água pela primeira vez no dia, concede 100 pontos de gamificação

---

### Módulo de Peso (`/weight`)

Histórico de registros de peso corporal.

- Cada registro atualiza automaticamente o peso no perfil do usuário
- Ao registrar peso, concede 200 pontos de gamificação (limite mensal)
- Suporte a exclusão de registros individuais

---

### Módulo de Relatórios (`/report`)

Geração de relatórios nutricionais por período.

**Dados retornados:**
- Total de calorias consumidas no período
- Total esperado (meta × dias)
- Número de refeições registradas
- Detalhamento por dia com paginação

---

### Módulo de Refeições Favoritas (`/favorite-meals`)

Permite salvar combinações de alimentos para reutilização.

**Schema:**
- `title` — nome da refeição favorita
- `mealSession` — sessão de refeição padrão
- `foods[]` — lista de alimentos com quantidade, unidade e calorias

**Operações:**
- Criar, listar e excluir refeições favoritas
- Aplicar refeição favorita ao rastreamento diário (`POST /favorite-meals/:id/apply`)

---

### Módulo de Gamificação (`/gamification`)

Sistema de pontos e ranking entre usuários.

Detalhado na [seção 8](#8-sistema-de-gamificação).

---

### Módulo Administrativo (`/admin`)

Funcionalidades exclusivas para usuários com role `admin`.

- Listagem de todos os usuários
- Gerenciamento de contas

**Usuário sysadmin padrão:**  
Criado automaticamente na inicialização do backend caso não exista:
- E-mail: `sysadmin@qacoders.com`
- Senha: `1234@Test`

---

## 5. API — Endpoints

Todos os endpoints (exceto login e cadastro) requerem o header:
```
Authorization: Bearer <jwt_token>
```

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login e geração de token |

### Usuários
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/user/register` | Cadastro de novo usuário |
| GET | `/api/user` | Dados do usuário autenticado |
| PUT | `/api/user` | Atualizar dados do usuário |
| DELETE | `/api/user` | Excluir conta |
| POST | `/api/recovery/checkEmail` | Verificar e-mail para recuperação |
| POST | `/api/recovery/resetPassword` | Redefinir senha |

### Perfil
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/profile/form` | Criar ou atualizar perfil |
| GET | `/api/profile/formList` | Obter perfil do usuário |
| GET | `/api/profile/recommended-foods` | Alimentos recomendados por restrição |

### Alimentos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/food` | Listar todos os alimentos |
| GET | `/api/food/search?query=...` | Buscar alimentos (mín. 3 chars) |
| POST | `/api/food` | Cadastrar novo alimento |

### Rastreamento Diário
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/daily-tracking` | Adicionar alimento ao dia |
| GET | `/api/daily-tracking?date=YYYY-MM-DD` | Obter rastreamento do dia |
| DELETE | `/api/daily-tracking/:id` | Remover entrada |

### Água
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/water` | Registrar consumo de água |
| GET | `/api/water?date=YYYY-MM-DD` | Obter consumo do dia |

### Peso
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/weight` | Registrar peso |
| GET | `/api/weight` | Listar histórico de peso |
| DELETE | `/api/weight/:id` | Excluir registro de peso |

### Gamificação
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/gamification/summary` | Resumo dos últimos 30 dias |
| GET | `/api/gamification/calendar` | Pontos por dia (30 dias) |
| GET | `/api/gamification/ranking?period=...` | Ranking de usuários |
| GET | `/api/gamification/points` | Histórico de pontos paginado |
| GET | `/api/gamification/scoring-rules` | Regras de pontuação |

### Relatórios
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/report?startDate=...&endDate=...` | Gerar relatório por período |

### Refeições Favoritas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/favorite-meals` | Listar refeições favoritas |
| POST | `/api/favorite-meals` | Criar refeição favorita |
| DELETE | `/api/favorite-meals/:id` | Excluir refeição favorita |
| POST | `/api/favorite-meals/:id/apply` | Aplicar ao rastreamento diário |

### Admin
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/users` | Listar todos os usuários |
| DELETE | `/api/admin/users/:id` | Excluir usuário |

---

### Códigos de Resposta

| Código | Descrição |
|---|---|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Removido com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado (token inválido ou expirado) |
| 403 | Acesso negado (permissão insuficiente) |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: e-mail já cadastrado) |
| 429 | Muitas requisições (rate limit) |
| 500 | Erro interno do servidor |

---

## 6. Frontend — Páginas e Componentes

### Rotas

| Rota | Descrição |
|---|---|
| `/` | Landing page com apresentação do produto |
| `/(auth)/anamnese` | Questionário de saúde em 5 etapas |
| `/(dashboard)/dashboard` | Dashboard principal de rastreamento diário |
| `/(dashboard)/peso` | Rastreamento de peso com gráfico e IMC |
| `/(dashboard)/gamificacao` | Hub de gamificação |
| `/(dashboard)/gamificacao/pontos` | Histórico de pontos |
| `/(dashboard)/gamificacao/ranking` | Ranking de usuários |
| `/(dashboard)/perfil` | Gerenciamento do perfil |
| `/report` | Relatórios nutricionais com gráficos |
| `/termos` | Termos de uso |
| `/politicas` | Política de privacidade |

---

### Componentes Principais

#### Landing Page
- `LandingHeader` — cabeçalho com navegação e botões de login/cadastro
- `HeroSection` — seção principal com chamada para ação
- `PersonalizationSection` — apresentação da personalização de metas
- `MealRegistrationSection` — demonstração do registro de refeições
- `ReportsSection` — apresentação dos relatórios
- `WeightAndGamificationSection` — apresentação do peso e gamificação
- `CTASection` — chamada final para cadastro

#### Dashboard
- `Sidebar` — menu lateral de navegação
- `Header` — cabeçalho com data e seletor de data
- `MealCard` — card de sessão de refeição com acordeão
- `SearchFoodModal` — modal de busca e adição de alimentos
- `ConfirmModal` — modal de confirmação de exclusão
- `DatePicker` — seletor de data para navegação entre dias
- `LogoutModal` — modal de confirmação de logout
- `DarkModeButton` — alternância de tema claro/escuro
- `IMCGauge` — medidor visual do IMC
- `Footer` — rodapé do dashboard

#### Gamificação
- `SummaryBar` — barra de resumo com pontos, refeições e água
- `ContributionCalendar` — calendário de contribuição estilo GitHub (365 dias)
- `RankingScreen` — tabela de ranking paginada

#### Autenticação
- `AuthModals` — modais de login e cadastro
- `Register` — formulário de cadastro
- `AuthGuard` — proteção de rotas autenticadas

---

### Serviço de API (`src/services/api.ts`)

Camada centralizada de comunicação com o backend. Todas as chamadas HTTP passam por esta camada.

**Comportamento padrão:**
- URL base configurada via `NEXT_PUBLIC_API_URL`
- Fallback para `https://api-bridgerton.qacoders.dev.br/api/`
- Respostas 401 limpam o token e redirecionam para `/`
- Erros retornam mensagens legíveis ao usuário

**Funções exportadas:**
- `loginRequest(data)` — autenticação
- `registerRequest(data)` — cadastro
- `recoverEmailRequest(data)` — verificação de e-mail
- `resetPasswordRequest(data)` — redefinição de senha
- `getProfileRequest(token)` — obter perfil
- `createProfileRequest(data, token)` — criar/atualizar perfil
- `getDailyTrackingRequest(token, date)` — rastreamento do dia
- `addFoodEntryRequest(data, token)` — adicionar alimento
- `removeFoodEntryRequest(id, token)` — remover alimento
- `getWaterRequest(token, date)` — consumo de água
- `addWaterRequest(data, token)` — registrar água
- `getWeightEntries(token)` — histórico de peso
- `createWeightEntry(data, token)` — registrar peso
- `deleteWeightEntry(id, token)` — excluir peso
- `getReportRequest(token, start, end, page, limit)` — relatório
- `getGamificationSummary(token)` — resumo de gamificação
- `getGamificationCalendar(token)` — calendário de pontos
- `getRankingRequest(token, period, page, limit)` — ranking
- `getPointsHistory(token, page, limit)` — histórico de pontos

---

### Gerenciamento de Tema

O contexto `ThemeContext` gerencia o tema claro/escuro da aplicação. O estado é persistido e aplicado via variáveis CSS em `globals.css`.

---

## 7. Fluxo de Autenticação

```
1. Usuário acessa a landing page (/)
2. Clica em "Entrar" ou "Cadastrar"
3. Modal de login/cadastro é exibido

Cadastro:
  → POST /api/user/register
  → Redireciona para /auth/anamnese (questionário de saúde)
  → 5 etapas: dados pessoais → atividade → objetivo → restrições → metas
  → POST /api/profile/form
  → Redireciona para /dashboard

Login:
  → POST /api/auth/login
  → Token JWT salvo em localStorage ou sessionStorage
  → 50 pontos de gamificação concedidos automaticamente
  → Redireciona para /dashboard

Logout:
  → Token removido do storage
  → Redireciona para /

Recuperação de senha:
  → POST /api/recovery/checkEmail (verifica e-mail)
  → POST /api/recovery/resetPassword (nova senha com resposta secreta)
```

**Proteção de rotas:**  
O componente `AuthGuard` verifica a presença do token antes de renderizar páginas protegidas. Caso não haja token, redireciona para `/`.

---

## 8. Sistema de Gamificação

O sistema recompensa o usuário por ações saudáveis com pontos, que são usados para gerar um ranking entre todos os usuários.

### Regras de Pontuação

| Ação | Pontos | Limite |
|---|---|---|
| Login diário | 50 | 1× por dia |
| Registrar água | 100 | 1× por dia |
| Registrar peso | 200 | 1× por mês |
| Café da manhã | 200 | 1× por dia |
| Almoço | 200 | 1× por dia |
| Jantar | 200 | 1× por dia |
| Lanche | 200 | 1× por dia |

### Funcionalidades

**Resumo (últimos 30 dias):**
- Posição no ranking
- Total de pontos acumulados
- Número de refeições registradas
- Litros de água consumidos

**Calendário de contribuição:**
- Visualização de 365 dias (estilo GitHub)
- Intensidade de cor baseada nos pontos do dia

**Ranking:**
- Períodos: semanal, mensal, todos os tempos
- Paginação configurável
- Exibe nome do usuário e pontuação

**Histórico de pontos:**
- Lista paginada de todas as ações pontuadas
- Data, tipo de ação e pontos ganhos

---

## 9. Banco de Dados — Coleções e Schemas

### `users`
```
fullName: string
email: string (único)
password: string (hash bcrypt)
secretQuestion: string
secretAnswer: string (hash bcrypt)
role: 'user' | 'admin'
```

### `profiles`
```
userId: ObjectId → users
birthDate: Date
height: number
weight: number
gender: 'Feminino' | 'Masculino'
physicalActivity: string
goal: string
foodRestrictions: string[]
otherFoods: string[]
dailyCalorieGoal: number
proteinGoal: number
carbsGoal: number
fatGoal: number
dailyWaterGoal: number
lgpdConsent: boolean
```

### `foods`
```
name: string (índice de texto)
caloriesPer100g: number
protein: number
carbs: number
fat: number
foodRestrictions: string[]
```

### `daily-tracking`
```
userId: ObjectId → users
foodId: ObjectId → foods
foodName: string
calories: number
protein: number
carbs: number
fat: number
quantity: number (1–9999)
unit: 'g' | 'kg' | 'ml' | 'L' | 'mg' | 'mcg'
mealSession: enum (6 sessões)
date: Date
```

### `water_tracking`
```
userId: ObjectId → users
date: string (YYYY-MM-DD)
consumedMl: number
```

### `weight_entries`
```
userId: ObjectId → users
weight: number
recordedAt: Date
```

### `points_records`
```
userId: ObjectId → users
actionType: string
points: number
date: string (YYYY-MM-DD)
```

### `favorite_meals`
```
userId: ObjectId → users
title: string
mealSession: string
foods: [{
  foodId: ObjectId
  name: string
  quantity: number
  unit: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
}]
```

---

## 10. Scripts e Seeds

### Seed de Alimentos

Popula o banco com alimentos de exemplo. Usa `upsert` para evitar duplicatas.

```bash
# Desenvolvimento
npm run seed:foods

# Produção (após build)
npm run seed:foods:prod
```

### Criar Administrador

```bash
cd backend
npx ts-node src/scripts/create-admin.ts
```

> O usuário sysadmin também é criado automaticamente na inicialização do backend caso não exista.

---

## 11. Variáveis de Ambiente

### Backend (`.env`)

```env
PORT=21165
DATABASE_URL=mongodb://localhost:27017/nutrilife
TOKEN_SECRET=sua_chave_secreta_jwt
```

### Frontend (`.env.development`)

```env
NEXT_PUBLIC_API_URL=http://localhost:21165/api/
```

Para produção, criar `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://sua-api.dominio.com/api/
```

---

## 12. Docker

O backend possui um `dockerfile` para containerização.

```bash
# Build da imagem
docker build -t nutrilife-backend ./backend

# Executar container
docker run -p 21165:21165 \
  -e DATABASE_URL=mongodb://host:27017/nutrilife \
  -e TOKEN_SECRET=sua_chave \
  -e PORT=21165 \
  nutrilife-backend
```

---

## Rate Limiting

O backend aplica rate limiting global via `@nestjs/throttler`:
- Janela de tempo: 6000ms
- Limite: 100 requisições por janela

Requisições que excedem o limite recebem resposta `429 Too Many Requests`.

---

## Documentação Interativa da API (Swagger)

Com o backend em execução, acesse:

```
http://localhost:21165/api-docs
```

A interface Swagger permite testar todos os endpoints diretamente no navegador, com suporte a autenticação Bearer JWT.
