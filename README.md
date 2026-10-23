# Projeto Criado com o Skip

Este projeto foi criado de ponta a ponta com o [Skip](https://goskip.dev).

## 👥 Credenciais e Dados para Teste (Ambiente Mock)

Para testar o acesso flexível por **E-mail**, **CPF** ou **Telefone**:

| Papel | Nome | E-mail | CPF | Telefone | Senha Padrão |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin / Cliente Seed 1** | Diego Miler | `diegomiler@live.com` | `123.456.789-00` (ou `12345678900`) | `(11) 98765-4321` (ou `11987654321`) | `Skip@Pass` |
| **Cliente de Teste 2** | Maria Oliveira | `maria.oliveira@exemplo.com` | `234.567.890-11` (ou `23456789011`) | `(11) 97654-3210` (ou `11976543210`) | `Skip@Pass` |
| **Cliente de Teste 3** | Carlos Eduardo | `carlos.santos@exemplo.com` | `345.678.901-22` (ou `34567890122`) | `(21) 96543-2109` (ou `21965432109`) | `Skip@Pass` |

*Dica de teste:*
- Você pode entrar em qualquer um dos usuários acima digitando apenas o E-mail, apenas o CPF (com ou sem pontuação) ou apenas o Telefone (com ou sem máscara/DDD).
- Ao realizar um novo cadastro com CPF que tenha compras pré-importadas, o extrato é automaticamente vinculado no primeiro acesso.
- Bloqueio temporário de segurança (Rate Limit): 5 tentativas incorretas bloqueiam temporariamente por 30s.

## 🚀 Stack Tecnológica

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool extremamente rápida
- **TypeScript** - Superset tipado do JavaScript
- **Shadcn UI** - Componentes reutilizáveis e acessíveis
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento para aplicações React
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de schemas TypeScript-first
- **Recharts** - Biblioteca de gráficos para React

## 📋 Pré-requisitos

- Node.js 18+
- npm

## 🔧 Instalação

```bash
npm install
```

## 💻 Scripts Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start
# ou
npm run dev
```

Abre a aplicação em modo de desenvolvimento em [http://localhost:5173](http://localhost:5173).

### Build

```bash
# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev
```

Gera os arquivos otimizados para produção na pasta `dist/`.

### Preview

```bash
# Visualizar build de produção localmente
npm run preview
```

Permite visualizar a build de produção localmente antes do deploy.

### Linting e Formatação

```bash
# Executar linter
npm run lint

# Executar linter e corrigir problemas automaticamente
npm run lint:fix

# Formatar código com Oxfmt
npm run format
```

## 📁 Estrutura do Projeto

```
.
├── src/              # Código fonte da aplicação
├── public/           # Arquivos estáticos
├── dist/             # Build de produção (gerado)
├── node_modules/     # Dependências (gerado)
└── package.json      # Configurações e dependências do projeto
```

## 🎨 Componentes UI

Este template inclui uma biblioteca completa de componentes Shadcn UI baseados em Radix UI:

- Accordion
- Alert Dialog
- Avatar
- Button
- Checkbox
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Select
- Switch
- Tabs
- Toast
- Tooltip
- E muito mais...

## 📝 Ferramentas de Qualidade de Código

- **TypeScript**: Tipagem estática
- **Oxlint**: Linter extremamente rápido
- **Oxfmt**: Formatação automática de código

## 🔄 Workflow de Desenvolvimento

1. Instale as dependências: `npm install`
2. Inicie o servidor de desenvolvimento: `npm start`
3. Faça suas alterações
4. Verifique o código: `npm run lint`
5. Formate o código: `npm run format`
6. Crie a build: `npm run build`
7. Visualize a build: `npm run preview`

## 📦 Build e Deploy

Para criar uma build otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/` e estarão prontos para deploy.
