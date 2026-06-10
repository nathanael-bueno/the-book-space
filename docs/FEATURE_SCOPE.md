# Feature: Trocas

Branch: `feature/trocas`

## US cobertas

- US de propor troca de livros.
- US de aceitar ou recusar proposta.
- US de cancelar proposta pendente.
- US de acompanhar status da troca.
- US de consultar historico de trocas.
- US de conversar no contexto da troca.
- US de concluir troca pelas duas partes.

## Telas principais

- `/app/trades`
- `/app/trades/new/:bookId`
- `/app/trades/:tradeId`
- `/app/trades/:tradeId/chat`

## Backend principal

- Criacao de proposta entre livro solicitado e livro oferecido.
- Validacao de propriedade e disponibilidade dos livros.
- Restricoes de titulos aceitos e localizacao quando aplicavel.
- Transicoes de status da troca.
- Historico de trocas por usuario.
- Mensagens e notificacoes ligadas a troca.
- Confirmacao de conclusao pelas partes.

## Contrato da branch

Esta branch deve concentrar mudancas de proposta, negociacao, acompanhamento,
mensagens, notificacoes e conclusao de trocas.
Nao deve receber mudancas de catalogo, feed, doacao, perfil ou moderacao,
exceto dados compartilhados de livros, usuarios, reputacao e localidades
necessarios para executar a troca.

## Validacao recomendada

- Propor troca com livro proprio disponivel.
- Impedir troca pelo proprio livro.
- Impedir oferta de livro indisponivel.
- Aceitar ou recusar proposta.
- Cancelar proposta pendente.
- Conferir historico e detalhe da troca.
- Trocar mensagens apos aceite.
- Concluir troca pelas duas partes.
