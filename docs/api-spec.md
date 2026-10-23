# Especificação da API REST & Modelo de Dados PostgreSQL

## Sistema de Gestão de Fidelidade e Cashback

Este documento especifica a interface de comunicação REST e a modelagem do banco de dados relacional **PostgreSQL** para o sistema "Gestão de Fidelidade". O frontend foi arquitetado segundo o **Repository Pattern** (`src/services/api.ts` e `IDataService`), permitindo alternar de dados mockados locais para a API REST apenas apontando `ACTIVE_DATA_DRIVER = 'rest'` e definindo a variável `VITE_API_URL`.

---

## 1. Padrões e Convenções Gerais

- **Protocolo & Formato**: HTTP/1.1 ou HTTP/2 sobre HTTPS. Todos os corpos de requisição e resposta utilizam `Content-Type: application/json; charset=utf-8`.
- **Autenticação**:
  - Cabeçalho: `Authorization: Bearer <token_jwt>`
  - Para chamadas de webhook/ERP integrador, aceitar opcionalmente `X-API-Key: <chave_secreta>`
- **Formato de Moeda e Valores Numéricos**:
  - Números decimais com precisão monetária (ponto flutuante na serialização JSON, ex: `848.8` ou `848.80`).
  - No banco de dados PostgreSQL, armazenar com tipo `NUMERIC(12, 2)`.
- **Formato de Datas**:
  - Padrão **ISO 8601 UTC** com sufixo `Z` (exemplo: `2026-07-21T21:51:00.000Z`).
- **Convenção de Métodos de Pagamento**:
  - Valores padronizados no enum/coluna:
    - `dinheiro`
    - `pix`
    - `cartao_credito`
    - `cartao_debito`
    - `voucher`
    - `vale`
- **Convenção de Status de Venda**:
  - `pending` (aguardando conferência/liberação)
  - `approved` (venda confirmada e cashback liberado)
  - `canceled` (cancelada/estornada)
- **Convenção de Status de Cashback**:
  - `pending` (gerado, porém aguardando liberação de prazo ou conferência)
  - `released` (disponível para resgate ou desconto)
  - `used` (já consumido em resgate)
  - `expired` (expirado após validade)
- **Padrão de Erro Unificado (HTTP 4xx / 5xx)**:

```json
{
  "error": {
    "code": "TRANSACTION_DUPLICATE",
    "message": "A venda com o transactionId 'SALE-003' já foi registrada.",
    "details": {}
  }
}
```

---

## 2. Endpoints da API REST

### 2.0. Autenticação e Dados Públicos da Landing

#### 2.0.1. Login por Identificador Flexível (E-mail, CPF ou Telefone)

Permite autenticar o cliente informando e-mail, CPF (apenas dígitos ou formatado) ou telefone celular/fixo (com DDD, sem código do país 55).

- **Método**: `POST`
- **Path**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Rate Limit**: Bloqueio de 30 segundos após 5 tentativas consecutivas incorretas (HTTP 429).

**Corpo da Requisição**:

```json
{
  "identifier": {
    "type": "cpf",
    "value": "12345678900"
  },
  "password": "MinhaSenhaSegura"
}
```

_Ou com e-mail:_

```json
{
  "identifier": {
    "type": "email",
    "value": "diegomiler@live.com"
  },
  "password": "MinhaSenhaSegura"
}
```

_Ou com telefone:_

```json
{
  "identifier": {
    "type": "phone",
    "value": "11987654321"
  },
  "password": "MinhaSenhaSegura"
}
```

**Respostas**:

- **200 OK**:

```json
{
  "user": {
    "id": "usr_diego",
    "name": "Diego Miler",
    "email": "diegomiler@live.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "status": true,
    "created": "2026-01-15T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

- **401 Unauthorized**:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Dados de acesso inválidos"
  }
}
```

- **429 Too Many Requests**:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Muitas tentativas incorretas. Tente novamente em 30s.",
    "details": { "retryAfter": 30 }
  }
}
```

---

#### 2.0.2. Cadastro de Cliente (Register)

Cadastra um novo cliente com os três identificadores obrigatórios (nome, e-mail, CPF, telefone) e senha (mínimo 8 caracteres). Garante unicidade e vincula automaticamente vendas pré-importadas com o mesmo CPF.

- **Método**: `POST`
- **Path**: `/api/auth/register`
- **Headers**: `Content-Type: application/json`

**Corpo da Requisição**:

```json
{
  "name": "Maria Silva Santos",
  "email": "maria.silva@exemplo.com",
  "cpf": "123.456.789-00",
  "phone": "(11) 98765-4321",
  "password": "MinhaSenhaForte123"
}
```

**Respostas**:

- **201 Created**:

```json
{
  "user": {
    "id": "usr_1710000000",
    "name": "Maria Silva Santos",
    "email": "maria.silva@exemplo.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "status": true,
    "created": "2026-07-22T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

- **422 Unprocessable Entity** (Erros por campo):

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Erros de validação no cadastro",
    "data": {
      "cpf": "CPF já cadastrado",
      "email": "E-mail já cadastrado"
    }
  }
}
```

---

#### 2.0.3. Dados Públicos da Landing (getPublicLandingData)

Retorna em uma única chamada pública os dados da página inicial: regras do programa (`settings`), prêmios em destaque (3 a 4), banners ativos, postos parceiros ativos, canais de contato e dados da empresa, sem exigir token de autenticação. Cada bloco é independente: se uma fonte falhar, o campo vem `null`/lista vazia e apenas a seção correspondente é ocultada.

- **Método**: `GET`
- **Path**: `/api/landing`

**Resposta de Sucesso (200 OK)**:

```json
{
  "settings": {
    "store_percent": 8,
    "fuel_percent": 2,
    "min_purchase_amount": 100,
    "min_purchase_usage": 500,
    "min_redemption_amount": 50
  },
  "featuredPrizes": [
    {
      "id": "prz_001",
      "name": "Vale Compras R$ 50",
      "required_amount": 50,
      "stock": 25,
      "image": "https://img.usecurling.com/p/400/300?q=gift%20card&color=blue"
    }
  ],
  "activeBanners": [
    {
      "id": "ban_001",
      "title": "Especial Semana de Ofertas",
      "image": "https://img.usecurling.com/p/800/300?q=shopping&color=purple"
    }
  ],
  "stations": [
    { "id": "pt_001", "name": "Posto Avenida Centro", "city": "São Paulo", "state": "SP" }
  ],
  "contact": {
    "phone": "(11) 3214-5500",
    "whatsapp": "(11) 98765-4321",
    "email": "atendimento@gestaofidelidade.com.br"
  },
  "company": { "name": "Gestão de Fidelidade", "cnpj": "12.345.678/0001-90" }
}
```

---

### 2.1. Importação de Venda Unitária

Processa e cria uma venda individual vinda de ERP/PDV, calcula automaticamente os percentuais de cashback vigentes de acordo com a regra configurada (`settings`), associa ou cria o cliente com base no CPF e registra os itens e formas de pagamento.

- **Método**: `POST`
- **Path**: `/api/sales`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` ou `X-API-Key: <token>`
- **Idempotência**: `transactionId` único. Se já existir, retorna código HTTP **409 Conflict**.

#### Corpo da Requisição (Exemplo Realista):

```json
{
  "event": "sale_created",
  "timestamp": "2026-07-21T21:51:00.000Z",
  "data": {
    "transactionId": "SALE-003",
    "customerName": "Diego Miler",
    "customerCpf": "123.456.789-00",
    "totalAmount": 848.8,
    "status": "pending",
    "payments": [
      {
        "method": "cartao_credito",
        "amount": 424.4
      },
      {
        "method": "dinheiro",
        "amount": 424.4
      }
    ],
    "items": [
      {
        "codigo": "PRD-001",
        "descricao": "Item de Exemplo",
        "quantidade": 2,
        "preço unitario": 424.4,
        "preço total": 848.8
      }
    ]
  }
}
```

#### Respostas:

- **201 Created**:

```json
{
  "success": true,
  "id": "pur_01j7xyz9876abc12345",
  "transactionId": "SALE-003",
  "message": "Venda importada com sucesso!",
  "cashback": {
    "store": {
      "amount": 67.9,
      "status": "pending"
    },
    "fuel": {
      "amount": 16.98,
      "status": "pending"
    }
  }
}
```

- **409 Conflict**:

```json
{
  "error": {
    "code": "SALE_ALREADY_EXISTS",
    "message": "Venda com transactionId 'SALE-003' já foi importada anteriormente."
  }
}
```

- **400 Bad Request**:

```json
{
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "A soma dos pagamentos (400.0) diverge do valor total da venda (848.8)."
  }
}
```

---

### 2.2. Importação em Lote (Batch Sales)

Permite enviar múltiplos registros de vendas em uma única requisição HTTP (suporta arrays de 10 a 500 vendas de uma vez).

- **Método**: `POST`
- **Path**: `/api/sales/batch`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

#### Corpo da Requisição:

```json
{
  "sales": [
    {
      "transactionId": "SALE-003",
      "customerName": "Diego Miler",
      "customerCpf": "123.456.789-00",
      "totalAmount": 848.8,
      "status": "pending",
      "payments": [
        { "method": "cartao_credito", "amount": 424.4 },
        { "method": "dinheiro", "amount": 424.4 }
      ],
      "items": [
        {
          "codigo": "PRD-001",
          "descricao": "Item de Exemplo",
          "quantidade": 2,
          "preço unitario": 424.4,
          "preço total": 848.8
        }
      ]
    },
    {
      "transactionId": "SALE-004",
      "customerName": "Maria Oliveira",
      "customerCpf": "234.567.890-11",
      "totalAmount": 250.0,
      "status": "pending",
      "payments": [{ "method": "pix", "amount": 250.0 }],
      "items": [
        {
          "codigo": "LUB-5W30",
          "descricao": "Óleo 5W30 Sintético",
          "quantidade": 4,
          "preço unitario": 62.5,
          "preço total": 250.0
        }
      ]
    }
  ]
}
```

#### Respostas:

- **207 Multi-Status** ou **200 OK**:

```json
{
  "total": 2,
  "createdCount": 1,
  "duplicateCount": 1,
  "errorCount": 0,
  "results": [
    {
      "transactionId": "SALE-003",
      "status": "duplicate",
      "message": "Venda já existente no banco de dados."
    },
    {
      "transactionId": "SALE-004",
      "status": "created",
      "id": "pur_01j7xyz9876abc12346",
      "message": "Venda SALE-004 importada com sucesso!"
    }
  ]
}
```

---

### 2.3. Listagem de Vendas com Filtros e Paginação

- **Método**: `GET`
- **Path**: `/api/sales`
- **Query Parameters**:
  - `page`: Número da página (padrão: 1)
  - `limit`: Itens por página (padrão: 20, máx: 100)
  - `status`: Filtro por status (`pending`, `approved`, `canceled`)
  - `cpf`: Filtro por CPF do cliente (ex: `123.456.789-00` ou apenas números)
  - `startDate`: Data inicial ISO (`2026-07-01`)
  - `endDate`: Data final ISO (`2026-07-31`)
  - `search`: Busca textual em transactionId ou nome do cliente
  - `sort`: Campo para ordenação (`date`, `-date`, `total_amount`, `-total_amount`)

#### Resposta de Sucesso (**200 OK**):

```json
{
  "sales": [
    {
      "id": "pur_01j7xyz9876abc12345",
      "api_sale_id": "SALE-003",
      "date": "2026-07-21T21:51:00.000Z",
      "client_name": "Diego Miler",
      "client_cpf": "123.456.789-00",
      "total_amount": 848.8,
      "cb_store": 67.9,
      "cb_fuel": 16.98,
      "status": "pending",
      "cashback_records": [
        {
          "id": "cb_001_store",
          "type": "loja",
          "status": "pending",
          "amount_generated": 67.9
        },
        {
          "id": "cb_001_fuel",
          "type": "combustivel",
          "status": "pending",
          "amount_generated": 16.98
        }
      ],
      "items": [
        {
          "id": "item_001",
          "product_code": "PRD-001",
          "name": "Item de Exemplo",
          "quantity": 2,
          "unit_price": 424.4,
          "total_price": 848.8
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 2.4. Detalhes de uma Venda

- **Método**: `GET`
- **Path**: `/api/sales/{transactionId}` (aceita tanto o ID interno quanto o `transactionId`/`api_sale_id`)

#### Resposta de Sucesso (**200 OK**):

```json
{
  "id": "pur_01j7xyz9876abc12345",
  "api_sale_id": "SALE-003",
  "purchase_date": "2026-07-21T21:51:00.000Z",
  "total_amount": 848.8,
  "status": "approved",
  "origin_channel": "Loja Matriz",
  "client": {
    "id": "usr_diego",
    "name": "Diego Miler",
    "cpf": "123.456.789-00",
    "email": "diegomiler@live.com"
  },
  "items": [
    {
      "id": "item_001",
      "product_code": "PRD-001",
      "name": "Item de Exemplo",
      "quantity": 2,
      "unit_price": 424.4,
      "total_price": 848.8
    }
  ],
  "payments": [
    {
      "id": "pay_001",
      "method": "cartao_credito",
      "amount": 424.4
    },
    {
      "id": "pay_002",
      "method": "dinheiro",
      "amount": 424.4
    }
  ]
}
```

---

### 2.5. Meios de Pagamento da Venda

- **Método**: `GET`
- **Path**: `/api/sales/{transactionId}/payments`

#### Resposta de Sucesso (**200 OK**):

```json
{
  "transactionId": "SALE-003",
  "totalAmount": 848.8,
  "payments": [
    {
      "id": "pay_001",
      "method": "cartao_credito",
      "amount": 424.4,
      "created": "2026-07-21T21:51:00.000Z"
    },
    {
      "id": "pay_002",
      "method": "dinheiro",
      "amount": 424.4,
      "created": "2026-07-21T21:51:00.000Z"
    }
  ]
}
```

---

### 2.6. Cashback Gerado pela Venda

- **Método**: `GET`
- **Path**: `/api/sales/{transactionId}/cashback`

#### Resposta de Sucesso (**200 OK**):

```json
{
  "transactionId": "SALE-003",
  "cashback": [
    {
      "id": "cb_001_store",
      "type": "loja",
      "amount_generated": 67.9,
      "amount_available": 67.9,
      "amount_used": 0,
      "status": "released",
      "released_at": "2026-07-21T22:00:00.000Z"
    },
    {
      "id": "cb_001_fuel",
      "type": "combustivel",
      "amount_generated": 16.98,
      "amount_available": 16.98,
      "amount_used": 0,
      "status": "released",
      "released_at": "2026-07-21T22:00:00.000Z"
    }
  ]
}
```

---

### 2.7. Liberação de Cashback (Release)

Utilizado na tela administrativa pelo botão "Liberar" unitário e pelo botão "Liberar Selecionados". Só deve alterar o status de registros que estejam atualmente como `pending`.

- **Método**: `POST`
- **Path**: `/api/cashback/release`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token_admin>`

#### Corpo da Requisição:

```json
{
  "cashback_ids": ["cb_001_store", "cb_001_fuel", "cb_002_store"]
}
```

#### Respostas:

- **200 OK**:

```json
{
  "success": true,
  "released": ["cb_001_store", "cb_001_fuel"],
  "skipped": [
    {
      "id": "cb_002_store",
      "reason": "Registro não se encontra no estado 'pending'."
    }
  ]
}
```

---

### 2.8. Saldo de Cashback do Cliente

- **Método**: `GET`
- **Path**: `/api/customers/{cpf}/cashback` (aceita CPF formatado ou sem pontuação)

#### Resposta de Sucesso (**200 OK**):

```json
{
  "customer": {
    "cpf": "123.456.789-00",
    "name": "Diego Miler"
  },
  "balance": {
    "store": 87.9,
    "fuel": 21.98,
    "pendingStore": 45.0,
    "pendingFuel": 10.0,
    "totalAvailable": 109.88,
    "totalPending": 55.0
  }
}
```

---

### 2.9. Parâmetros e Regras do Programa (Settings)

As regras retornam e recebem campos planos na raiz do JSON (não serializados como string JSON aninhada).

- **Métodos**: `GET` e `PUT`
- **Path**: `/api/settings`

#### `GET /api/settings` -> Resposta (**200 OK**):

```json
{
  "store_percent": 8,
  "fuel_percent": 2,
  "min_purchase_amount": 100,
  "min_purchase_usage": 500,
  "min_redemption_amount": 50
}
```

#### `PUT /api/settings` -> Corpo da Requisição:

```json
{
  "store_percent": 10,
  "fuel_percent": 2.5,
  "min_purchase_amount": 80,
  "min_purchase_usage": 400,
  "min_redemption_amount": 30
}
```

#### Resposta (**200 OK**):

Retorna o mesmo objeto com os valores validados e atualizados.

---

### 2.10. Dados da Empresa e Canais de Atendimento

Colunas individuais da tabela de settings (sem JSON), exibidas na página inicial pública. Campos de contato em branco ocultam o respectivo canal.

- **Métodos**: `GET` e `PUT`
- **Path**: `/api/settings/program`

```json
{
  "nome_programa": "Gestão de Fidelidade",
  "cnpj": "12.345.678/0001-90",
  "whatsapp": "(11) 98765-4321",
  "telefone_atendimento": "(11) 3214-5500",
  "email_atendimento": "atendimento@gestaofidelidade.com.br"
}
```

---

### 2.11. Leads de Contato da Página Pública

- **Path**: `/api/contact-leads`
- `POST` (público, sem token): grava um lead. Corpo: `{ "name": "Maria", "phone": "(11) 98765-4321", "message": "Quero saber mais" }`. Validação: nome ≥ 3 caracteres, telefone com 10/11 dígitos (DDD), mensagem de 3 a 1000 caracteres. Retorna **422** com `fieldErrors` em caso de erro.
- `GET` (admin): lista os leads, mais recentes primeiro. Cada item: `{ "id", "name", "phone", "message", "created" }`.

---

## 3. Modelo Físico de Dados PostgreSQL (DDL Sugerido)

Abaixo está o script SQL DDL para criar as tabelas no PostgreSQL com tipos otimizados, constraints de integridade referencial e índices de alta performance para busca e filtros do frontend.

```sql
-- Habilita extensão para geração de UUID se desejado (opcional, pode-se usar nanoid ou strings)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Clientes/Usuários
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(18) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar VARCHAR(500),
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_cpf ON customers (cpf);
CREATE INDEX idx_customers_email ON customers (email);

-- 2. Tabela de Regras e Parâmetros Globais
CREATE TABLE settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'current_rules',
    store_percent NUMERIC(5, 2) NOT NULL DEFAULT 8.00,
    fuel_percent NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
    min_purchase_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    min_purchase_usage NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    min_redemption_amount NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insere o registro padrão único de configurações
INSERT INTO settings (id, store_percent, fuel_percent, min_purchase_amount, min_purchase_usage, min_redemption_amount)
VALUES ('current_rules', 8.00, 2.00, 100.00, 500.00, 50.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela de Vendas / Compras
CREATE TYPE sale_status AS ENUM ('pending', 'approved', 'canceled');

CREATE TABLE sales (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) REFERENCES customers(id) ON DELETE SET NULL,
    customer_cpf VARCHAR(18) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- Ex: SALE-003
    total_amount NUMERIC(12, 2) NOT NULL,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    origin_channel VARCHAR(100) DEFAULT 'Loja Matriz',
    status sale_status NOT NULL DEFAULT 'pending',
    sync_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_transaction_id ON sales (transaction_id);
CREATE INDEX idx_sales_customer_id ON sales (customer_id);
CREATE INDEX idx_sales_customer_cpf ON sales (customer_cpf);
CREATE INDEX idx_sales_status ON sales (status);
CREATE INDEX idx_sales_purchase_date ON sales (purchase_date DESC);

-- 4. Tabela de Itens da Venda
CREATE TABLE sale_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_id VARCHAR(36) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale_id ON sale_items (sale_id);

-- 5. Tabela de Meios de Pagamento da Venda
CREATE TABLE sale_payments (
    id VARCHAR(36) PRIMARY KEY,
    sale_id VARCHAR(36) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- 'cartao_credito', 'cartao_debito', 'dinheiro', 'pix', etc.
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_payments_sale_id ON sale_payments (sale_id);

-- 6. Tabela de Cashback
CREATE TYPE cashback_type AS ENUM ('loja', 'combustivel');
CREATE TYPE cashback_status AS ENUM ('pending', 'released', 'used', 'expired');

CREATE TABLE cashback (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sale_id VARCHAR(36) REFERENCES sales(id) ON DELETE CASCADE,
    type cashback_type NOT NULL,
    amount_generated NUMERIC(12, 2) NOT NULL,
    amount_available NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_used NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status cashback_status NOT NULL DEFAULT 'pending',
    released_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cashback_customer_id ON cashback (customer_id);
CREATE INDEX idx_cashback_sale_id ON cashback (sale_id);
CREATE INDEX idx_cashback_status ON cashback (status);
CREATE INDEX idx_cashback_type ON cashback (type);

-- 7. Tabela de Catálogo de Prêmios
CREATE TABLE prizes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    stock INTEGER NOT NULL DEFAULT 0,
    required_amount NUMERIC(12, 2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    campaign_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tabela de Resgates de Prêmios
CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'delivered', 'canceled');

CREATE TABLE redemptions (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    prize_id VARCHAR(36) NOT NULL REFERENCES prizes(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_cost NUMERIC(12, 2) NOT NULL,
    status redemption_status NOT NULL DEFAULT 'approved',
    delivery_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redemptions_customer ON redemptions (customer_id);

-- 9. Tabela de Banners Promocionais
CREATE TABLE banners (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500) NOT NULL,
    position VARCHAR(50) DEFAULT 'home_carousel',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Tabela de Postos Parceiros Credenciados
CREATE TABLE partner_stations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    phone VARCHAR(30),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Instruções de Transição para o Driver REST

Quando a API REST em Node.js/Python/Go conectada ao PostgreSQL estiver pronta e disponível:

1. Configure no arquivo de ambiente `.env` (ou via runtime):
   ```env
   VITE_DATA_DRIVER=rest
   VITE_API_URL=https://sua-api.com/api
   ```
2. O arquivo `src/services/api.ts` já implementa `RestDataServiceImpl` em conformidade total com os endpoints acima. O frontend funcionará automaticamente consumindo o novo serviço sem alteração em nenhum componente visual.
