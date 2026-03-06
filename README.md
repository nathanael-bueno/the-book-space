# the-book-space

Plataforma de troca e doação de livros — PI: Engenharia de Software.

---

## O que é

O The Book Space é uma plataforma onde usuários podem cadastrar livros, propor trocas entre si, fazer doações para outros usuários ou instituições parceiras, e interagir em um feed social. O objetivo é conectar pessoas que amam livros e facilitar a circulação de obras.

---

## Tecnologias

**API**
- PHP 8.2 + Laravel
- PostgreSQL 15
- Docker (PHP-FPM + Nginx)

**Client**
- React com TypeScript
- Vite 8 + SWC

---

## Estrutura do projeto

```
the-book-space/
├── api/        → back-end em Laravel
├── client/     → front-end em React
└── docker-compose.yml
```

---

## Como rodar

**Pré-requisitos:** Docker instalado.

```bash
# Subir todos os containers
docker-compose up -d --build

# Rodar as migrations
docker-compose exec app php artisan migrate
```

- API: http://localhost:8000
- Client: http://localhost:5173

---

## Banco de dados

PostgreSQL modelado no dbdiagram.io com 14 tabelas:

`usuarios` `livros` `generos` `trocas` `doacoes` `instituicoes` `avaliacoes` `mensagens` `notificacoes` `follows` `postagens` `curtidas` `comentarios` `denuncias`

Todos os IDs utilizam UUID.