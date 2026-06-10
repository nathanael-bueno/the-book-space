# Feature: Doacoes e Instituicoes

Branch: `feature/doacoes-instituicoes`

## US cobertas

- US de listar instituicoes/pontos de doacao.
- US de registrar doacao de livro.
- US de consultar historico de doacoes.
- US de gerenciar instituicoes como admin.
- US de relatorio de doacoes por instituicao.

## Telas principais

- `/app/institutions`
- `/app/donations/new`
- `/app/donations/history`
- `/app/admin/institutions`

## Backend principal

- CRUD administrativo de instituicoes.
- Listagem publica/autenticada de instituicoes.
- Registro de doacao vinculando usuario, livro e instituicao.
- Historico de doacoes do usuario.
- Indicadores de doacoes por instituicao para admin.

## Contrato da branch

Esta branch deve concentrar mudancas de doacoes, instituicoes e relatorios
diretamente ligados a doacao.
Nao deve receber mudancas de catalogo, trocas, feed, perfil ou moderacao,
exceto uso compartilhado de livros disponiveis para doacao e dados admin.

## Validacao recomendada

- Listar instituicoes.
- Cadastrar instituicao como admin.
- Editar instituicao como admin.
- Remover instituicao como admin.
- Registrar doacao de livro.
- Conferir historico de doacoes.
- Validar relatorio de doacoes por instituicao.
