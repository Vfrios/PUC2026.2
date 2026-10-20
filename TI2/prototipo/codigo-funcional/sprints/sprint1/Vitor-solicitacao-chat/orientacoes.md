# Orientações da Sprint 1 — Vitor (solicitacao-chat)

## Objetivo
Entregar o fluxo de solicitação de item funcionando no frontend e no backend, incluindo a criação da solicitação e a geração automática da conversa inicial. A sprint tem foco em completar a parte de entrada do fluxo de troca antes do chat em tempo real.

## Escopo exclusivo desta sprint
- Trabalhar somente no módulo `Vitor-solicitacao-chat`.
- Não alterar arquivos de outros conjuntos funcionais.
- Priorizar a funcionalidade da tela `tradeScreens.jsx` e do fluxo de criação de solicitação.
- A parte de chat/negociação e agendamento fica para a Sprint 2.

## Telas e arquivos desta sprint

### Frontend
- `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/tradeScreens.jsx`
  - Tela de solicitação do item, botão de envio da mensagem inicial, controle do estado da solicitação e navegação para o chat receptor.

### Backend
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoController.java`
  - Endpoint principal para criação de solicitações, com validação da existência do item e do usuário.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoService.java`
  - Regras de negócio do fluxo: criação, validações, atualização de etapa e controle de acesso.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoRepository.java`
  - Persistência das solicitações e busca por item/usuário.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/Solicitacao.java`
  - Entidade que representa o pedido de troca.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoRequest.java`
  - Payload de entrada para criação da solicitação.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemController.java`
  - API de mensagens para persistir a primeira mensagem no início do fluxo.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/Mensagem.java`
  - Entidade da mensagem da conversação.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemRepository.java`
  - Persistência das mensagens da negociação.

## Endpoints REST esperados
- `POST /api/solicitacoes`
  - Cria a solicitação e dispara a conversa inicial.
- `GET /api/solicitacoes/{id}`
  - Recupera o status da solicitação.
- `GET /api/solicitacoes/enviadas`
  - Lista as solicitações do usuário logado.
- `POST /api/mensagens`
  - Salva a primeira mensagem do fluxo de negociação.

## Critérios de aceite
- [ ] O usuário consegue abrir o item e enviar uma solicitação com mensagem inicial.
- [ ] O backend cria a solicitação e a conversa automaticamente em um único fluxo funcional.
- [ ] A primeira mensagem aparece corretamente para o outro usuário e encontra-se persistida.
- [ ] O frontend redireciona para o chat receptor após envio bem-sucedido.
- [ ] O estado da solicitação (`ENVIADA`, `ACEITA`, `CANCELADA`, etc.) é exibido corretamente.
- [ ] A interface e a API ficam integradas sem erros de console ou falhas de carga.
- [ ] Não há regressão em outros módulos do sistema.
- [ ] O fluxo foi validado com ao menos 2 cenários reais de usuário diferentes.

## Prazo
- Início: 13/10/2026
- Entrega: 19/10/2026
- Dias úteis disponíveis: 13, 14, 15, 16 e 19 de outubro
- Entrega final do projeto: 26/10/2026

## Diferenciação da Sprint 2
- Sprint 1: foco em `Solicitacao` e criação da conversa inicial.
- Sprint 2: foco em `Chat` real, `Presença`, `Mensagens em tempo real` e `Agendamento/Retirada`.
