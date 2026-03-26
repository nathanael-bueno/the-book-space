# The Book Space

Projeto Integrador (PI) de Engenharia de Software para desenvolvimento de uma plataforma de troca e doacao de livros, com recursos de autenticacao, interacao social e intermediacao por pontos de troca.

## 1. Visao Geral

O **The Book Space** e uma aplicacao web que conecta pessoas interessadas em compartilhar livros por meio de:

- cadastro e gestao de usuarios;
- publicacao de livros para troca ou doacao;
- negociacao de trocas entre usuarios;
- uso de **pontos de troca** como intermediadores do processo;
- interacao social por postagens, comentarios, curtidas e seguidores.

O projeto esta organizado como monorepo, com backend em Laravel e frontend em React.

## 2. Objetivos do Projeto

- Promover a circulacao de livros entre usuarios.
- Estruturar um fluxo de troca seguro e rastreavel.
- Disponibilizar canais de doacao para instituicoes parceiras.
- Aplicar boas praticas de engenharia de software (arquitetura, versionamento, validacao e documentacao).

## 3. Arquitetura e Estrutura

```text
the-book-space/
|-- api/        # Backend (Laravel)
|-- client/     # Frontend (React + TypeScript)
|-- README.md
|-- schema-ajustado.dbml
```

### 3.1 Backend (`/api`)

Responsavel por regras de negocio, autenticacao, persistencia e exposicao da API.

### 3.2 Frontend (`/client`)

Responsavel pela interface da aplicacao, consumo da API e experiencia do usuario.

## 4. Tecnologias Utilizadas

### 4.1 API

- PHP 8.2
- Laravel
- PostgreSQL 15
- Composer

### 4.2 Client

- React
- TypeScript
- Vite

### 4.3 Infraestrutura local

- Docker
- Docker Compose

## 5. Execucao do Projeto

### 5.1 Pre-requisitos

- Docker e Docker Compose instalados.

### 5.2 Passos para executar

```bash
docker compose up -d --build
```

```bash
# Executar migrations da API
docker compose exec app php artisan migrate
```

### 5.3 Endpoints locais (padrao)

- API: `http://localhost:8000`
- Client: `http://localhost:5173`

## 6. Modelo de Dados

O banco PostgreSQL foi modelado em DBML e contempla **15 tabelas**:

`usuarios`, `generos`, `livros`, `pontos_troca`, `trocas`, `avaliacoes`, `instituicoes`, `doacoes`, `postagens`, `mensagens`, `notificacoes`, `curtidas`, `comentarios`, `seguidores`, `denuncias`.

Arquivo de referencia local: `local-artifacts/schema-ajustado.dbml` (nao versionado).

### 6.1 Papel de cada tabela

- `usuarios`: dados de identidade, autenticacao e perfil; inclui e-mail unico e senha armazenada em hash.
- `generos`: padronizacao de categorias literarias.
- `livros`: cadastro de obras disponiveis para troca ou doacao.
- `pontos_troca`: locais fisicos que intermediam o processo de troca.
- `trocas`: processo de negociacao entre usuarios, vinculado obrigatoriamente a um ponto de troca.
- `avaliacoes`: feedback e reputacao dos usuarios apos trocas concluidas.
- `instituicoes`: entidades aptas a receber doacoes.
- `doacoes`: historico de doacoes de livros para instituicoes.
- `postagens`: publicacoes no feed social da plataforma.
- `mensagens`: comunicacao entre usuarios em contexto de troca.
- `notificacoes`: avisos de eventos relevantes para o usuario.
- `curtidas`: interacoes de aprovacao em postagens.
- `comentarios`: interacoes textuais em postagens.
- `seguidores`: relacoes de acompanhamento entre usuarios.
- `denuncias`: mecanismo de moderacao de conteudo.

## 7. Regras Funcionais Relevantes

- Cadastro de usuario com validacoes de entrada.
- E-mail obrigatoriamente unico no cadastro.
- Senha armazenada somente em formato hash.
- Trocas com intermediacao obrigatoria por `pontos_troca`.

## 8. Consideracoes Academicas

Este repositorio foi estruturado para documentar a evolucao tecnica do PI, permitindo rastreabilidade das entregas por sprint e validacao dos requisitos funcionais definidos em sala.

## 9. Licenca

Consulte o arquivo `LICENSE` para informacoes de uso e distribuicao.
