# API Endpoints - Módulo de Alimentos e Acompanhamento Diário

## Autenticação
Todos os endpoints requerem um token JWT no header `Authorization: Bearer <token>`

---

## 📌 Endpoints de Alimentos (Food)

### 1. Listar todos os alimentos
```
GET /food
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Frango Grelhado",
    "caloriesPer100g": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "createdAt": "2025-02-13T10:00:00Z",
    "updatedAt": "2025-02-13T10:00:00Z"
  }
]
```

---

### 2. Buscar alimentos por nome
```
GET /food/search?query=frango
```
**Query Parameters:**
- `query` (string, obrigatório): Termo de busca (mínimo 3 caracteres)

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Frango Grelhado",
    "caloriesPer100g": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6
  }
]
```

**Comportamento:**
- Busca case-insensitive
- Inicia a busca a partir do 3º caractere
- Ordena resultados por posição de correspondência (início da palavra > meio > fim)

---

### 3. Cadastrar novo alimento
```
POST /food
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Frango Grelhado",
  "caloriesPer100g": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Frango Grelhado",
  "caloriesPer100g": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "createdAt": "2025-02-13T10:00:00Z",
  "updatedAt": "2025-02-13T10:00:00Z"
}
```

---

## 📌 Endpoints de Acompanhamento Diário (Daily Tracking)

### 1. Adicionar alimento ao acompanhamento diário
```
POST /daily-tracking
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "foodId": "507f1f77bcf86cd799439011",
  "quantity": 150,
  "unit": "g",
  "mealSession": "almoco",
  "date": "2025-02-13T12:00:00Z"
}
```

**Campos obrigatórios:**
- `foodId` (string): ID do alimento (MongoDB ObjectId)
- `quantity` (number): Quantidade (1-9999)
- `unit` (string): Unidade de medida
  - `g` (gramas)
  - `kg` (quilogramas)
  - `ml` (mililitros)
  - `L` (litros)
  - `mg` (miligramas)
  - `mcg` (microgramas)
- `mealSession` (string): Sessão da refeição
  - `cafe_da_manha`
  - `lanche_manha`
  - `almoco`
  - `lanche_tarde`
  - `jantar`
  - `ceia`

**Campos opcionais:**
- `date` (string, ISO 8601): Data/hora da refeição. Se não informado, usa a data/hora atual.

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439001",
  "foodId": "507f1f77bcf86cd799439011",
  "foodName": "Frango Grelhado",
  "calories": 247.5,
  "quantity": 150,
  "unit": "g",
  "mealSession": "almoco",
  "date": "2025-02-13T12:00:00Z",
  "createdAt": "2025-02-13T11:30:00Z",
  "updatedAt": "2025-02-13T11:30:00Z"
}
```

**Cálculo de Calorias:**
- O backend calcula automaticamente baseado em:
  - `caloriesPer100g` do alimento
  - `quantity` e `unit` fornecidos
- Fórmula: `(caloriesPer100g / 100) * quantidadeEmGramas`
- Conversões:
  - `g` → direto
  - `kg` → × 1000
  - `ml` → × 1
  - `L` → × 1000
  - `mg` → ÷ 1000
  - `mcg` → ÷ 1.000.000

---

### 2. Obter acompanhamento diário
```
GET /daily-tracking?date=2025-02-13
```

**Query Parameters:**
- `date` (string, opcional): Data em formato YYYY-MM-DD. Se não informado, usa a data atual.

**Response (200):**
```json
{
  "date": "2025-02-13",
  "totalCalories": 2450.75,
  "meals": {
    "cafe_da_manha": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "foodName": "Ovo cozido",
        "calories": 155,
        "quantity": 1,
        "unit": "g",
        "mealSession": "cafe_da_manha"
      }
    ],
    "lanche_manha": [],
    "almoco": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "foodName": "Frango Grelhado",
        "calories": 247.5,
        "quantity": 150,
        "unit": "g",
        "mealSession": "almoco"
      }
    ],
    "lanche_tarde": [],
    "jantar": [],
    "ceia": []
  }
}
```

---

### 3. Remover entrada do acompanhamento diário
```
DELETE /daily-tracking/:id
```

**Path Parameters:**
- `id` (string): ID da entrada a ser removida

**Response (204):**
```
No Content
```

---

## ✅ Fluxo Típico de Uso

1. **Usuário busca alimento:**
   ```
   GET /food/search?query=frango
   ```

2. **Usuário seleciona alimento e adiciona quantidade:**
   ```
   POST /daily-tracking
   Body: {
     "foodId": "507f1f77bcf86cd799439011",
     "quantity": 150,
     "unit": "g",
     "mealSession": "almoco"
   }
   ```

3. **Backend calcula calorias automaticamente e salva**

4. **Usuário visualiza acompanhamento do dia:**
   ```
   GET /daily-tracking?date=2025-02-13
   ```

5. **Se necessário, remove entrada:**
   ```
   DELETE /daily-tracking/507f1f77bcf86cd799439012
   ```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 201 | Criado com sucesso |
| 204 | Removido com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado (token inválido/expirado) |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 🧪 Exemplos com cURL

### Buscar alimentos
```bash
curl -X GET \
  'http://localhost:3000/food/search?query=frango' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Adicionar alimento ao acompanhamento
```bash
curl -X POST \
  'http://localhost:3000/daily-tracking' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -H 'Content-Type: application/json' \
  -d '{
    "foodId": "507f1f77bcf86cd799439011",
    "quantity": 150,
    "unit": "g",
    "mealSession": "almoco"
  }'
```

### Obter acompanhamento do dia
```bash
curl -X GET \
  'http://localhost:3000/daily-tracking?date=2025-02-13' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

---

## 📚 Documentação Swagger
Acesse `http://localhost:3000/api-docs` para visualizar a documentação interativa da API.
