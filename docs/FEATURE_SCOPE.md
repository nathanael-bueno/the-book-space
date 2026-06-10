# Feature: Admin e Moderacao

Branch: `feature/admin-moderacao`

## US cobertas

- US de painel administrativo.
- US de gestao de usuarios.
- US de moderacao de denuncias.
- US de estatisticas administrativas.

## Telas principais

- `/app/admin/dashboard`
- `/app/admin/reports`
- `/app/admin/users`

## Backend principal

- Rotas administrativas protegidas por perfil admin.
- Listagem e status de usuarios.
- Listagem e tratamento de denuncias.
- Indicadores administrativos.
- Bloqueio ou reativacao de usuarios quando aplicavel.

## Contrato da branch

Esta branch deve concentrar mudancas de painel admin, moderacao, usuarios e
estatisticas administrativas.
Nao deve receber mudancas de catalogo, troca, doacao, feed ou perfil, exceto
quando forem necessarias para expor dados ao painel administrativo.

## Validacao recomendada

- Acessar painel admin com usuario administrador.
- Bloquear ou reativar usuario.
- Listar denuncias.
- Atualizar status de denuncia.
- Validar bloqueio de acesso para usuario comum.
- Conferir indicadores do dashboard.
