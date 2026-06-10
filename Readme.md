# The Book Space

Plataforma web para troca, doação e descoberta de livros, desenvolvida como
Projeto Integrador do curso de Engenharia de Software.

## Sumário

- [Resumo](#resumo)
- [Problema](#problema)
- [Objetivos](#objetivos)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Instalação local](#instalação-local)
- [Banco de dados](#banco-de-dados)
- [Segurança](#segurança)
- [Testes e qualidade](#testes-e-qualidade)
- [Organização das branches](#organização-das-branches)
- [Contexto acadêmico](#contexto-acadêmico)
- [Estado atual](#estado-atual)

## Resumo

O **The Book Space** conecta leitores interessados em compartilhar livros,
negociar trocas, realizar doações para instituições e interagir em uma
comunidade literária.

O sistema é organizado como um monorepo com frontend em React e backend em
Laravel. A aplicação disponibiliza autenticação, catálogo, perfil e reputação,
trocas com mensagens em tempo real, doações, feed social, notificações e
recursos administrativos.

## Problema

Livros que já foram lidos frequentemente permanecem sem uso, enquanto outras
pessoas buscam acesso mais econômico e sustentável à leitura. Ao mesmo tempo,
instituições que recebem doações nem sempre possuem um canal centralizado para
divulgar suas necessidades.

O projeto busca reduzir essa distância por meio de uma plataforma que:

- facilite a circulação de livros entre leitores;
- registre e acompanhe propostas de troca;
- conecte doadores a instituições;
- ofereça mecanismos de reputação e moderação;
- promova interação social em torno da leitura.

## Objetivos

### Objetivo geral

Desenvolver uma aplicação web que apoie o compartilhamento responsável de
livros por meio de trocas, doações e interação entre leitores.

### Objetivos específicos

- Permitir cadastro, autenticação e recuperação de acesso.
- Disponibilizar catálogo pesquisável de livros.
- Controlar cadastro, edição e remoção de livros pelo proprietário.
- Registrar propostas e acompanhar o ciclo de vida das trocas.
- Permitir comunicação entre participantes de uma troca.
- Registrar avaliações e formar a reputação dos usuários.
- Divulgar instituições e registrar doações.
- Oferecer feed social com postagens, curtidas e comentários.
- Disponibilizar notificações e eventos em tempo real.
- Fornecer ferramentas administrativas de gestão e moderação.

## Funcionalidades

### Autenticação e segurança

- Cadastro e login com validação.
- Login em duas etapas por código.
- Autenticação com Google OAuth.
- Verificação de endereço de e-mail.
- Recuperação e redefinição de senha.
- Renovação e invalidação de tokens JWT.
- Bloqueio de acesso para usuários inativos.

### Livros e catálogo

- Cadastro, edição e exclusão de livros.
- Upload de imagens.
- Busca por título, autor e ISBN.
- Filtros por gênero, estado de conservação e localização.
- Recomendações baseadas em gêneros favoritos.
- Controle de disponibilidade e propriedade.

### Trocas e reputação

- Proposta de troca entre dois livros.
- Validação dos livros oferecido e solicitado.
- Aceite, recusa, cancelamento e acompanhamento de status.
- Mensagens vinculadas à negociação.
- Notificações de eventos da troca.
- Avaliação após conclusão.
- Perfil público com histórico de avaliações e reputação.

### Doações e instituições

- Consulta de instituições cadastradas.
- Registro de doação de livro.
- Histórico de doações do usuário.
- Gestão administrativa de instituições.
- Indicadores de doações por instituição.

### Feed social

- Criação, edição e remoção de postagens.
- Associação opcional entre postagem e livro.
- Curtidas e comentários.
- Denúncia de conteúdo.
- Feed autenticado para interação entre leitores.

### Administração e moderação

- Dashboard com indicadores.
- Gestão e alteração do status de usuários.
- Moderação de denúncias.
- CRUD de instituições.
- CRUD de gêneros literários.
- Controle de acesso por perfil administrativo.

## Arquitetura

O projeto adota uma arquitetura cliente-servidor:

```text
┌──────────────────────────────┐
│ Frontend                     │
│ React + TypeScript + Vite    │
└──────────────┬───────────────┘
               │ HTTP/JSON e WebSocket
┌──────────────▼───────────────┐
│ Backend                      │
│ Laravel REST API + Reverb    │
└──────────────┬───────────────┘
               │ Eloquent ORM
┌──────────────▼───────────────┐
│ PostgreSQL                   │
└──────────────────────────────┘
```

### Frontend

O diretório `frontend/` contém uma SPA responsável pela interface, navegação,
estado de autenticação e consumo da API. As páginas são organizadas por fluxo
funcional e carregadas sob demanda pelo roteador.

### Backend

O diretório `backend/` contém a API REST, regras de negócio, persistência,
autorização, notificações e comunicação em tempo real. As rotas são separadas
em públicas, autenticadas e exclusivas de administradores.

### Integrações

- **PostgreSQL:** persistência relacional.
- **Laravel Reverb:** eventos e mensagens em tempo real.
- **Cloudflare R2/S3:** armazenamento de imagens.
- **Google OAuth:** autenticação social.
- **Resend/serviço SMTP:** envio de mensagens transacionais.

## Tecnologias

### Frontend

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Tailwind CSS 4
- Laravel Echo
- Pusher JS
- Lucide React
- ESLint e Prettier

### Backend

- PHP 8.2 ou superior
- Laravel 12
- PostgreSQL
- Eloquent ORM
- JWT Auth
- Laravel Socialite
- Laravel Reverb
- Laravel Sanctum
- L5 Swagger
- PHPUnit 11

### Infraestrutura

- Nginx
- Supervisor
- Docker Compose para PostgreSQL local
- Cloudflare R2

## Estrutura do repositório

```text
the-book-space/
├── backend/
│   ├── app/                 # Domínio da aplicação e camada HTTP
│   ├── config/              # Configurações do Laravel
│   ├── database/
│   │   ├── migrations/      # Evolução do esquema
│   │   └── seeders/         # Dados iniciais
│   ├── routes/              # Rotas HTTP e broadcasting
│   └── tests/               # Testes automatizados
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── layouts/         # Estruturas de página
│   │   ├── pages/           # Telas da aplicação
│   │   ├── router/          # Rotas do frontend
│   │   ├── services/        # Comunicação com a API
│   │   └── stores/          # Estado compartilhado
│   └── package.json
├── docs/
│   └── feature-scopes/      # Escopo funcional de cada branch
├── nginx/                   # Configuração de produção
└── Readme.md
```

## Instalação local

### Pré-requisitos

- Git
- PHP 8.2 ou superior
- Composer
- Node.js compatível com Vite 8
- npm
- PostgreSQL
- Extensões PHP exigidas pelo Laravel e pelo driver `pdo_pgsql`

### 1. Clonar o projeto

```bash
git clone git@github.com:nathanael-bueno/the-book-space.git
cd the-book-space
```

### 2. Preparar o banco

É possível usar uma instalação local do PostgreSQL ou o serviço disponível em
`backend/docker-compose.yml`:

```bash
cd backend
docker compose up -d
```

O Compose atual provisiona somente o PostgreSQL. A API e o frontend devem ser
executados separadamente.

### 3. Configurar o backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Revise no arquivo `.env` as variáveis:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=postgres
DB_PASSWORD=password
```

Esses valores correspondem ao PostgreSQL fornecido pelo Compose. Caso utilize
outro banco, ajuste as credenciais.

Execute as migrations:

```bash
php artisan migrate
```

Inicie a API:

```bash
php artisan serve
```

A API ficará disponível em `http://localhost:8000`.

### 4. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

Inicie o frontend:

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### 5. Recursos opcionais

Para usar autenticação Google, upload de imagens, e-mail e eventos em tempo
real, configure no backend e no frontend as credenciais correspondentes a
Google OAuth, Cloudflare R2, serviço de e-mail e Laravel Reverb.

Nunca versione arquivos `.env` ou credenciais reais.

## Banco de dados

O esquema é mantido por migrations Laravel. Os principais grupos de dados são:

| Domínio | Entidades principais |
| --- | --- |
| Acesso | usuários, códigos de verificação e tokens |
| Catálogo | gêneros, livros e gêneros favoritos |
| Trocas | trocas, mensagens e avaliações |
| Comunicação | notificações |
| Comunidade | postagens, curtidas e comentários |
| Doações | instituições e doações |
| Moderação | denúncias |

As chaves estrangeiras representam vínculos entre usuários, livros,
instituições e interações. Índices e restrições definidos nas migrations
protegem integridade e apoiam consultas frequentes.

## Segurança

O projeto aplica controles em diferentes camadas:

- Hash de senhas pelo mecanismo do Laravel.
- Autenticação baseada em JWT.
- Rotação e blacklist de tokens.
- Verificação de e-mail.
- Validação de usuário ativo e token atualizado.
- Autorização por perfil para rotas administrativas.
- Verificação de propriedade em operações sensíveis.
- Rate limiting em autenticação, recuperação, denúncias e uploads.
- Validação de entrada por requests e regras do backend.
- Separação entre rotas públicas, autenticadas e administrativas.
- Credenciais externas carregadas por variáveis de ambiente.

Nenhuma credencial real deve ser registrada no Git.

## Testes e qualidade

### Backend

```bash
cd backend
composer test
```

Formatação PHP:

```bash
cd backend
./vendor/bin/pint
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

O build executa a verificação TypeScript antes de gerar os arquivos de
produção.

> A suíte automatizada atual ainda é inicial. A ampliação de testes de
> autenticação, autorização, catálogo, trocas, doações e moderação permanece
> como evolução recomendada.

## Organização das branches

O desenvolvimento foi dividido por contexto funcional. Cada escopo está
documentado em `docs/feature-scopes/`.

| Branch | Responsabilidade |
| --- | --- |
| `feature/auth-seguranca` | autenticação, recuperação, verificação e segurança |
| `feature/perfil-reputacao` | perfil, avaliações e reputação |
| `feature/livros-catalogo` | livros, catálogo, busca, filtros e gêneros |
| `feature/trocas` | propostas, negociação, mensagens e conclusão |
| `feature/doacoes-instituicoes` | instituições, doações e relatórios relacionados |
| `feature/feed-social` | postagens, curtidas, comentários e denúncias |
| `feature/admin-moderacao` | painel administrativo, usuários e moderação |

A branch `main` representa a versão integrada do projeto.

## Contexto acadêmico

Este repositório registra a evolução de um Projeto Integrador de Engenharia de
Software. A organização busca demonstrar:

- levantamento e rastreabilidade de requisitos;
- divisão do trabalho por histórias de usuário e contextos funcionais;
- modelagem de dados relacional;
- separação entre frontend e backend;
- controle de versão com branches temáticas;
- aplicação de autenticação, autorização e validação;
- integração com serviços externos;
- documentação técnica e reprodutibilidade do ambiente.

Os documentos de escopo preservam a relação entre módulos, entregas e
responsabilidades, facilitando avaliação acadêmica e manutenção técnica.

## Estado atual

O projeto possui os principais fluxos funcionais implementados e integrados.
Algumas integrações dependem de credenciais externas e configuração de
infraestrutura. A cobertura de testes automatizados deve ser expandida antes
de uso em produção.

Este software foi desenvolvido para fins acadêmicos.
