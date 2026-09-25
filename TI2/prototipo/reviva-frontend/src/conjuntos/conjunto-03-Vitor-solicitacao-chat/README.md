# Conjunto 3 - Vitor - Solicitação e chat

## Objetivo

Este conjunto cuida do ciclo de pedido, conversa e confirmação da doação.

## Arquivos do conjunto

- `tradeScreens.jsx`: Inbox e Chat, incluindo mensagens, anexos, localização, leitura e arquivamento.
- `negociacaoScreens.jsx`: solicitação, agendamento, confirmações e dashboard de impacto.

## Quantidade de telas: 7 telas lógicas

| Tela | Rotas no `App.jsx` | Responsabilidade |
| --- | --- | --- |
| Solicitação | `solicitacao` | Iniciar o pedido relacionado ao item. |
| Inbox | `inbox` | Listar conversas ativas e arquivadas. |
| Chat | `chatDoador`, `chatReceptor` | Conversa, mensagens, anexos e localização. É a mesma tela com papel diferente. |
| Agendamento | `agendamentoDoador`, `agendamentoReceptor` | Definir data, horário e local da retirada. É a mesma tela com papel diferente. |
| Confirmação de doação | `confirmDoacao` | Confirmar a entrega pelo doador. |
| Confirmação de recebimento | `confirmRecebimento` | Confirmar o recebimento pelo receptor. |
| Dashboard de impacto | `dashboardImpacto` | Exibir doações, pontos e impacto ambiental. |

Avaliação não entra nesta contagem: a tela `Avaliar` pertence ao Conjunto 4 e
é usada pelas rotas `avaliarDoador` e `avaliarReceptor`.

## Separação adotada

O conjunto agora possui dois arquivos funcionais por responsabilidade: conversa
em `tradeScreens.jsx` e fluxo da troca em `negociacaoScreens.jsx`. Eles compartilham
as APIs e componentes visuais, mas a navegação importa cada grupo pelo arquivo
correspondente.

## Observações

A implementação e a navegação permanecem concentradas diretamente em
`tradeScreens.jsx`. Não há arquivo intermediário ou `index.jsx` neste conjunto.
