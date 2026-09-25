# Conjunto 3 - Solicitacao e chat

## Objetivo

Controlar pedidos, conversas, presenca, agendamentos e confirmacao das trocas.

## Arquivos de solicitacao

- `SolicitacaoController.java`: endpoints de solicitacoes.
- `SolicitacaoService.java`: regras de negocio dos pedidos.
- `SolicitacaoRepository.java`: persistencia das solicitacoes.
- `Solicitacao.java`: modelo da solicitacao.
- `SolicitacaoRequest.java`: dados para criar solicitacao.
- `SolicitacaoResponse.java`: resposta da solicitacao.

## Arquivos de chat

- `MensagemController.java`: endpoints HTTP das mensagens.
- `MensagemRepository.java`: persistencia das mensagens.
- `Mensagem.java`: modelo da mensagem.
- `MensagemRequest.java`: dados de envio.
- `MensagemResponse.java`: resposta de mensagem.
- `PresencaController.java`: eventos de presenca online.
- `PresencaEvent.java`: formato do evento de presenca.

## Arquivos de agendamento

- `AgendamentoController.java`: endpoints de agendamento e confirmacao.
- `AgendamentoService.java`: regras da retirada, confirmacao, QR Code e problemas.
- `AgendamentoRepository.java`: persistencia dos agendamentos.
- `Agendamento.java`: modelo do agendamento.
- `AgendamentoRequest.java`: dados para marcar horario e local.

## Integracao

O conjunto usa usuario, item e notificacoes compartilhados. Todos os estados sao persistidos no mesmo banco MongoDB.

O Inbox suporta arquivar e desarquivar uma conversa por usuario e remove-la
apenas da visao do usuario logado. O envio de uma nova mensagem preserva o
estado de arquivamento da outra pessoa.

## Estado atual

Solicitacoes possuem controle de acesso, estados de troca, preview da ultima
mensagem, arquivamento e ocultacao por usuario. Mensagens suportam texto,
leitura, anexos de imagem e localizacao; o chat usa REST para persistencia e
WebSocket/STOMP para atualizacao em tempo real.

Reconexao, testes de integracao e refinamentos de anexos continuam como pontos
de evolucao.

## Organizacao para envio

```text
conjunto-03-solicitacao-chat/
├── solicitacao/
│   ├── SolicitacaoController.java
│   ├── SolicitacaoService.java
│   ├── SolicitacaoRepository.java
│   ├── Solicitacao.java
│   ├── SolicitacaoRequest.java
│   └── SolicitacaoResponse.java
├── chat-negociacao/
│   ├── MensagemController.java
│   ├── MensagemRepository.java
│   ├── Mensagem.java
│   ├── MensagemRequest.java
│   ├── MensagemResponse.java
│   ├── PresencaController.java
│   └── PresencaEvent.java
└── comum/
	├── AgendamentoController.java
	├── AgendamentoService.java
	├── AgendamentoRepository.java
	├── Agendamento.java
	└── AgendamentoRequest.java
```

Os tres subpacotes participam do mesmo fluxo e devem ser executados juntos.
