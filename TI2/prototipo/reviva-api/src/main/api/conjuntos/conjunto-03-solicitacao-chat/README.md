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

## O que falta implementar ou atualizar

### Solicitacao

- formalizar transicoes de status e permissoes;
- permitir cancelamento seguro;
- validar item disponivel e solicitacao duplicada;
- adicionar testes para solicitacoes enviadas e recebidas.

### Chat de negociacao

- tratar reconexao e falha de WebSocket;
- adicionar leitura, anexos e notificacoes quando necessario;
- garantir autorizacao por solicitacao;
- testar mensagens, presenca, localizacao e agendamento em conjunto.

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

Na Sprint 1, enviar `solicitacao` e `comum`. Na Sprint 2, acrescentar `chat-negociacao`.
