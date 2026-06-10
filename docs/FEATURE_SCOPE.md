# Feature: Autenticacao e Seguranca

Branch: `feature/auth-seguranca`

## US cobertas

- US01: armazenar dados do usuario de forma segura.
- US02: acessar pagina de cadastro.
- US03: cadastro/login com validacoes.
- US04: recuperar senha via e-mail.
- US42: notificacao por e-mail.

## Telas principais

- `/auth/register`
- `/auth/login`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/auth/google/callback`
- `/auth/complete-profile`
- `/app/settings` na aba de notificacoes/e-mail

## Backend principal

- Autenticacao, cadastro, login e usuario autenticado.
- Verificacao de e-mail.
- Recuperacao de senha.
- Preferencias ligadas a notificacao por e-mail.
- Middlewares de usuario ativo, token e e-mail verificado.

## Contrato da branch

Esta branch deve concentrar mudancas de autenticacao, seguranca de acesso,
validacao de credenciais, recuperacao de senha e envio/preferencia de e-mail.
Nao deve receber mudancas de catalogo, trocas, feed, doacoes ou administracao,
exceto ajustes minimos necessarios para manter a integracao.

## Validacao recomendada

- Cadastro de usuario.
- Login e logout.
- Redirecionamento apos login.
- Recuperacao de senha.
- Verificacao de e-mail.
- Preferencias de notificacao por e-mail.
