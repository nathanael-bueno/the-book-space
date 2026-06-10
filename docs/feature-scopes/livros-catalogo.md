# Feature: Livros e Catalogo

Branch: `feature/livros-catalogo`

## US cobertas

- US06: cadastrar livro.
- US07: editar livro.
- US08: remover livro.
- US09: buscar por titulo, autor ou ISBN.
- US10: ver detalhe do livro.
- US13: filtrar por genero, estado e localizacao.
- US46: gerenciar generos/categorias.

## Telas principais

- `/app/catalog`
- `/app/books/new`
- `/app/books/:bookId`
- `/app/books/:bookId/edit`
- `/app/admin/genres`

## Backend principal

- CRUD de livros.
- Upload/imagens de livros quando ligado ao cadastro.
- Busca e filtros de catalogo.
- Generos/categorias.
- Regras de propriedade para editar/remover livro.

## Contrato da branch

Esta branch deve concentrar mudancas de catalogo, livros, filtros e generos.
Nao deve receber mudancas de fluxo de troca, feed, doacao, perfil ou moderacao,
exceto uso compartilhado de dados como usuario dono do livro e generos.

## Validacao recomendada

- Cadastrar livro.
- Editar livro proprio.
- Remover livro proprio.
- Buscar por titulo, autor e ISBN.
- Filtrar catalogo.
- Abrir detalhe do livro.
- Gerenciar generos como admin.
