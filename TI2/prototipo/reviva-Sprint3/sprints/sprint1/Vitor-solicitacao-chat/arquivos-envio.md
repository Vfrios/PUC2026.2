# Arquivos para envio — Vitor (Sprint 1)

## Frontend
- `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/tradeScreens.jsx`
  - Tela principal do fluxo de solicitação. Exibe o item, o campo de mensagem, a ação de enviar solicitação e a navegação para o chat do receptor.

## Backend
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/Solicitacao.java`
  - Entidade de solicitação de troca. Guarda o item, o doador, o receptor, o estado atual e a data de criação.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoRequest.java`
  - Payload usado para receber o `itemId` e a mensagem inicial do usuário que deseja solicitar o item.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoResponse.java`
  - DTO de resposta retornado após a criação da solicitação, contendo dados do item, doador e conversa gerada.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoRepository.java`
  - Repositório para buscar solicitações por usuário, item e status.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoService.java`
  - Implementa a regra de negócio para permitir a solicitação, validar duplicidade e criar o estado inicial do pedido.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoController.java`
  - Exposição dos endpoints REST de criação e consulta de solicitações.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/Mensagem.java`
  - Modelo da mensagem enviada no início do chat entre solicitante e anunciante.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemRequest.java`
  - Payload para envio de mensagem, incluindo texto e remetente.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemResponse.java`
  - Resposta de mensagem com meta informação do envio (usuário, data, leitura e status).
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemRepository.java`
  - Persistência e consulta das mensagens por solicitação.
- `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemController.java`
  - Endpoints HTTP para envio e recuperação das mensagens do chat inicial.

## Observações
- Entregar somente os arquivos do escopo desta sprint.
- Validar a integração `frontend ↔ backend` antes de enviar.
- A conversa inicial deve ser criada em conjunto com a solicitação.
- Não incluir arquivos de outros módulos ou atividades de outras pessoas.
