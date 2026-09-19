# Conjunto 3 - Solicitacao e chat

## Objetivo

Controlar o contato entre as pessoas interessadas em um item, desde o pedido ate a negociacao.

## Telas

- **Solicitacao:** envia, acompanha e cancela pedidos de itens.
- **Chat de negociacao:** conversa, mensagens, presenca, localizacao e combinacao da retirada.

## Arquivos

- `index.jsx`: ponto de entrada do conjunto. Reexporta `Solicitacao`, `Inbox`, `Chat`, `Agendamento`, `ConfirmDoacao`, `ConfirmRecebimento`, `Avaliar` e `DashboardImpacto`.
- `../conjunto-01-publicacao-gestao/itemScreens.jsx`: implementacao de `Solicitacao`.
- `tradeScreens.jsx`: implementacao de chat, inbox, agendamento, confirmacoes e avaliacao.

## Dependencias

Usa usuario autenticado, `solicitacaoId`, WebSocket/STOMP, `api.js` e estado de presenca online.

## Integracao

O chat pode ser aberto com um `solicitacaoId` existente. Com dados ausentes, deve exibir estado vazio sem quebrar. Agendamento e confirmacoes usam a mesma solicitacao e a mesma base de dados.

## O que falta implementar ou atualizar

### Solicitacao

- exibir status em etapas: enviada, aceita, recusada, agendada e concluida;
- permitir cancelar solicitacao com confirmacao;
- tratar item indisponivel e usuario nao autenticado;
- atualizar o status apos resposta do anunciante.

### Chat de negociacao

- melhorar mensagens de evento, leitura e notificacoes;
- tratar conversa vazia, reconexao e falha do WebSocket;
- permitir anexos ou imagens quando a API suportar;
- deixar agendamento, localizacao e confirmacao visiveis.
