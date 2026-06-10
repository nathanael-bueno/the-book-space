# Feature: Perfil e Reputacao

Branch: `feature/perfil-reputacao`

## US cobertas

- US05: editar perfil.
- US11: visualizar avaliacao no perfil.
- US12: perfil publico de outros usuarios.
- US21: calculo automatico de reputacao.
- US22: ver avaliacoes recebidas detalhadas.
- US25: historico de avaliacoes de outro usuario.
- US41: preferencias de notificacao.

## Telas principais

- `/app/profile`
- `/app/profile/edit`
- `/app/users/:userId`
- `/app/settings`
- `/app/profile/notifications` como redirecionamento para settings

## Backend principal

- Perfil do usuario autenticado.
- Perfil publico.
- Atualizacao de dados pessoais, foto, bio e cidade.
- Avaliacoes, reviews e reputacao agregada.
- Preferencias de notificacao do usuario.

## Contrato da branch

Esta branch deve concentrar mudancas de identidade do usuario, perfil,
preferencias pessoais, reputacao e historico de avaliacoes. Nao deve receber
mudancas de livros, trocas, feed, doacoes ou administracao, exceto quando a
integracao exigir leitura de dados para exibir resumo no perfil.

## Validacao recomendada

- Editar perfil.
- Abrir perfil proprio.
- Abrir perfil publico de outro usuario.
- Conferir nota/reputacao.
- Conferir lista de avaliacoes.
- Salvar preferencias de notificacao.
