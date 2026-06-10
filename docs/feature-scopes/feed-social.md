# Feature: Feed Social

Branch: `feature/feed-social`

## US cobertas

- US de visualizar feed social.
- US de criar postagem.
- US de editar ou remover propria postagem.
- US de curtir postagem.
- US de comentar postagem.
- US de denunciar conteudo do feed.
- US de seguir ou priorizar leitores no feed quando aplicavel.

## Telas principais

- `/app/feed`
- `/app/posts/new`
- `/app/posts/:postId/edit`
- `/app/profile/:userId`

## Backend principal

- CRUD de postagens.
- Vinculo opcional de postagem com livro.
- Curtidas em postagens.
- Comentarios em postagens.
- Denuncias de conteudo para moderacao.
- Filtros e ordenacao do feed social.

## Contrato da branch

Esta branch deve concentrar mudancas de feed, postagens, curtidas,
comentarios, denuncias de conteudo e relacoes sociais usadas pelo feed.
Nao deve receber mudancas de cadastro de livros, troca, doacao, admin ou
perfil, exceto dados compartilhados necessarios para exibir autor, livro
vinculado ou enviar denuncia para moderacao.

## Validacao recomendada

- Abrir feed social.
- Criar postagem.
- Editar propria postagem.
- Remover propria postagem.
- Curtir e remover curtida.
- Comentar postagem.
- Denunciar conteudo.
- Validar que usuario nao edita postagem de outro usuario.
