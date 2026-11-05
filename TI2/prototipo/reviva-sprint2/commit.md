# Sprint 2 — Instrucoes de envio e commits

Este arquivo organiza a entrega da segunda sprint por frente. A base do codigo
e a entrega funcional da Sprint 1; os incrementos desta pasta implementam a
segunda etapa (aproximadamente 66% do escopo total), sem incluir a integracao
final e as evolucoes reservadas para a Sprint 3. `codigo-funcional` e
`reviva-sprint1` sao preservadas e nao devem ser editadas durante esta sprint.

## Regras gerais

- Trabalhar na pasta `reviva-sprint2`.
- Enviar somente os arquivos listados para a respectiva frente e as
  dependencias compartilhadas explicitamente coordenadas.
- Arquivos existentes que contem telas de mais de uma sprint devem ser
  enviados inteiros quando forem alterados; nao remover a tela anterior.
- Alteracoes em `App.jsx`, `api.js`, `shared.jsx`, autenticacao ou configuracao
  WebSocket precisam de alinhamento entre os responsaveis antes do merge.
- Nao enviar `node_modules`, `target`, `dist`, logs, `.env`,
  `atlas-credentials.env`, tokens, URI de banco ou dados reais.
- Mensagens de commit sugeridas seguem
  `tipo(responsavel): descricao curta`, por exemplo
  `feat(vitor): habilitar chat em tempo real`.
- Antes de enviar: `pnpm --filter reviva-frontend build` e, em `reviva-api`,
  `mvn test` (ou `mvn -q -DskipTests compile` quando a execucao de testes
  depender de servico externo).

## Brayan — Detalhes do item

1. `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/itensDetalhes.jsx`
2. `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/README.md`
3. `reviva-frontend/src/api.js` — apenas mudancas combinadas do contrato de
   consulta/favorito/solicitacao.

Commit: `feat(brayan): concluir detalhes e disponibilidade do item`

## Gustavo — Gerenciar itens

1. `reviva-frontend/src/conjuntos/Gustavo-publicacao-gestao/gerenciarItens.jsx`
2. `reviva-frontend/src/conjuntos/Gustavo-publicacao-gestao/README.md`
3. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/` — controller,
   service, modelo e repositorio somente quando alterados.
4. `reviva-frontend/src/api.js` — operacoes de gestao de anuncio acordadas.

Commit: `feat(gustavo): concluir gestao dos proprios anuncios`

## Joao — Favoritos

1. `reviva-frontend/src/conjuntos/João-comunidades-favoritos/favoritos.jsx`
2. `reviva-frontend/src/conjuntos/João-comunidades-favoritos/README.md`
3. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/favoritos/`
4. `reviva-frontend/src/api.js` — listar, adicionar, remover e remover em lote.

Commit: `feat(joao): concluir lista persistida de favoritos`

## Tang — Seguranca e termos

1. `reviva-frontend/src/conjuntos/Tang-endereco-seguranca/seguranca.jsx`
2. `reviva-frontend/src/conjuntos/Tang-endereco-seguranca/README.md`
3. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/`
4. `reviva-frontend/src/api.js` — notificacoes, preferencias e seguranca,
   somente metodos alterados.

Commit: `feat(tang): concluir seguranca e central de notificacoes`

## Thiago — Reputacao

1. `reviva-frontend/src/conjuntos/Thiago-perfil-reputacao/avaliacao.jsx`
2. `reviva-frontend/src/conjuntos/Thiago-perfil-reputacao/accountScreens.jsx`
   — somente a exibicao de reputacao alterada.
3. `reviva-frontend/src/conjuntos/Thiago-perfil-reputacao/README.md`
4. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/reputacao/`
5. `reviva-frontend/src/api.js` — consulta/registro de avaliacao.

Commit: `feat(thiago): concluir reputacao e avaliacao`

## Vitor — Chat e negociacao

1. `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/tradeScreens.jsx`
2. `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/negociacaoScreens.jsx`
3. `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/README.md`
4. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/`
5. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/comum/`
6. `reviva-api/src/main/api/shared/config/WebSocketConfig.java` e
   `shared/security/WsAuthChannelInterceptor.java`, somente se alterados e
   coordenados.

Commit: `feat(vitor): concluir chat e fluxo de retirada`

## Arquivos compartilhados e fechamento

- `reviva-frontend/src/App.jsx`: rotas das telas desta sprint, mudancas
  revisadas em conjunto.
- `reviva-frontend/src/api.js`: contratos consumidos pelas seis frentes,
  integrados sem sobrescrever operacoes existentes.
- `reviva-frontend/src/shared/shared.jsx`: somente helpers/componentes
  compartilhados efetivamente usados.
- `README.md` e `sprints/sprint2/`: documentacao desta entrega.
- Rodar build frontend e testes/compilacao backend, revisar `git status` e
  confirmar que nenhum arquivo de `codigo-funcional` ou `reviva-sprint1` foi
  alterado.
