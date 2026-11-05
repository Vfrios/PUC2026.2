# Planejamento Sprint 2 — Vitor

## Funcionalidade

Chat de negociacao e apoio ao ciclo de retirada: permitir que as partes
conversem sobre o item e acompanhem o agendamento/confirmacao.

## Trabalho

1. Exibir Inbox e conversas com item, participantes e ultima mensagem.
2. Persistir mensagens e atualizar a conversa em tempo real, com estado de
   leitura e presenca quando suportados.
3. Permitir envio de mensagem e anexos/location previstos pelo contrato atual;
   indicar falha e permitir nova tentativa.
4. Apoiar agendamento, confirmacao de retirada e tratamento de problema no
   ciclo da solicitacao.
5. Restringir leitura e escrita aos participantes e manter transicoes
   consistentes para Thiago avaliar somente negociacoes concluidas.

## Sequencia

- Dia 1: validar estados de solicitacao, mensagens e endpoints de agendamento.
- Dias 2–3: exercitar Inbox, chat, atualizacao em tempo real e retirada.
- Dia 4: testar duas contas, autorizacao, reconexao/falha e confirmacoes.
- Dia 5: validar o fluxo completo e preparar a demonstracao com Thiago.

## Criterios de aceite

- Duas contas participantes trocam mensagens persistidas e retomam o historico.
- A nova mensagem aparece sem recarregar a pagina quando a conexao em tempo
  real esta disponivel; falhas nao sao reportadas como envio concluido.
- Pessoas nao participantes nao acessam a conversa.
- Agendamento e confirmacoes atualizam o estado da negociacao.
- O encerramento habilita os proximos passos de impacto/avaliacao sem criar
  avaliacao antes da conclusao.
# Planejamento Sprint 2 — Thiago

## Funcionalidade

Reputacao: apresentar avaliacoes e indicadores reais e permitir avaliar uma
negociacao concluida.

## Trabalho

1. Consultar reputacao, media, avaliacoes e indicadores persistidos.
2. Exibir estado vazio quando ainda nao existirem avaliacoes, sem gerar notas
   ou selos ficticios.
3. Registrar avaliacao vinculada a negociacao concluida e ao participante
   correto, com nota valida e comentario opcional.
4. Impedir avaliacao duplicada ou antecipada conforme as regras da API.
5. Atualizar a reputacao somente depois de uma avaliacao aceita pelo servidor.

## Sequencia

- Dia 1: alinhar estados de conclusao e identificador do agendamento com Vitor.
- Dias 2–3: exercitar consulta, estado sem dados e envio de avaliacao.
- Dia 4: testar nota invalida, participantes incorretos e avaliacao duplicada.
- Dia 5: validar atualizacao de reputacao e preparar demonstracao.

## Criterios de aceite

- A tela apresenta somente dados retornados pela API.
- Cada parte elegivel avalia a outra apos a conclusao da negociacao.
- Avaliacao invalida, duplicada ou prematura e recusada com mensagem clara.
- A nota/media/selos sao recalculados a partir de dados persistidos.
- Perfil publico nao revela campos privados da conta.
# Planejamento Sprint 2 — Tang

## Funcionalidade

Seguranca e termos: reunir controles de conta, preferencias e notificacoes em
uma experiencia clara e restrita a pessoa autenticada.

## Trabalho

1. Consultar e salvar preferencias de notificacao.
2. Consultar notificacoes, marcar como lidas e usar as operacoes de limpeza
   disponiveis.
3. Permitir alteracao segura de senha e encerramento das outras sessoes,
   conforme endpoints existentes.
4. Apresentar orientacoes e documentos legais sem confundir conteudo
   informativo com configuracao de seguranca.
5. Exibir confirmacao somente depois de sucesso do servidor e tratar erro.

## Sequencia

- Dia 1: revisar endpoints de seguranca, sessoes e notificacoes.
- Dias 2–3: exercitar preferencias, central de notificacoes e controles de
  conta.
- Dia 4: testar conta autenticada, falhas e persistencia apos recarregar.
- Dia 5: validar criterios e preparar demonstracao.

## Criterios de aceite

- Preferencias persistem e podem ser consultadas novamente.
- Notificacoes diferenciam lidas/nao lidas e nao somem por falha de rede.
- Alteracoes de conta exigem autenticacao e validacao do backend.
- A interface nao afirma oferecer autenticacao em duas etapas se esse recurso
  nao estiver implementado.
- Conteudo legal e recomendacoes estao acessiveis sem expor dados privados.
# Planejamento Sprint 2 — Joao

## Funcionalidade

Favoritos: oferecer uma lista pessoal persistida de itens guardados e manter
visivel a disponibilidade conhecida de cada oferta.

## Trabalho

1. Consultar favoritos da conta e abrir os detalhes do item selecionado.
2. Permitir selecionar/remover um ou varios itens sem duplicar operacoes.
3. Atualizar a lista apos sucesso confirmado pelo servidor.
4. Distinguir item ativo de indisponivel/removido e tratar lista vazia.
5. Manter o estado do favorito coerente com as acoes em busca e detalhes.

## Sequencia

- Dia 1: alinhar identificadores e estados do item com Brayan e Gustavo.
- Dias 2–3: validar consulta, selecao e remocao individual/em lote.
- Dia 4: testar sincronizacao entre telas e erros de persistencia.
- Dia 5: revisar criterios e preparar a demonstracao.

## Criterios de aceite

- A lista corresponde a conta autenticada e persiste entre sessoes.
- Remover um item ou uma selecao remove somente os identificadores escolhidos.
- Uma resposta de erro nao apaga favoritos visualmente como se tivesse sucesso.
- Disponibilidade desatualizada nao e apresentada como confirmada.
- Busca/detalhes e a lista de favoritos mostram um estado consistente.
# Planejamento Sprint 2 — Gustavo

## Funcionalidade

Gerenciar itens: permitir que a pessoa acompanhe e administre os proprios
anuncios depois de publica-los.

## Trabalho

1. Listar os anuncios da conta autenticada e separar seus estados.
2. Permitir editar, remover/arquivar, restaurar e marcar como doado conforme o
   estado e as operacoes existentes da API.
3. Atualizar a interface depois de cada operacao confirmada pela API.
4. Manter validacao de titularidade no servidor; nao confiar apenas em filtros
   do frontend.
5. Manter status consistente para descoberta, detalhes e favoritos.

## Sequencia

- Dia 1: mapear estados e operacoes existentes com Brayan e Vitor.
- Dias 2–3: validar lista, filtros de estado, edicao e acoes de gestao.
- Dia 4: testar permissao, transicoes invalidas e atualizacao das telas
  dependentes.
- Dia 5: revisar criterios e preparar a demonstracao.

## Criterios de aceite

- A pessoa ve apenas os anuncios que pode administrar.
- Edicao e transicoes atualizam o estado persistido, sem sucesso falso.
- Remocao/restauracao e marcacao como doado refletem o estado correto.
- A tela distingue lista vazia, carregamento e falha da API.
- A disponibilidade atualizada aparece coerentemente na busca, detalhes e
  favoritos.
# Planejamento Sprint 2 — Brayan

## Funcionalidade

Detalhes do item: permitir que a pessoa avalie uma oferta antes de iniciar uma
solicitacao, com informacoes claras e atualizadas.

## Trabalho

1. Abrir os detalhes a partir da lista ou busca mantendo o identificador do
   item.
2. Exibir titulo, descricao, categoria, condicao, modalidade, fotos,
   localizacao informada e perfil publico de quem anunciou.
3. Distinguir item disponivel de item reservado, encerrado ou removido.
4. Manter acoes de favorito e de inicio de contato ligadas ao mesmo item.
5. Tratar carregamento, item inexistente, dados opcionais ausentes e erro da
   consulta sem afirmar disponibilidade sem confirmacao.

## Sequencia

- Dia 1: conferir o contrato `itemPorId` e os estados do item com Gustavo.
- Dias 2–3: validar a tela de detalhes e integracao com perfil/favoritos.
- Dia 4: testar item ativo, item encerrado, item inexistente e falha da API.
- Dia 5: revisar criterios e preparar a demonstracao.

## Criterios de aceite

- A pessoa sai de uma oferta da busca e abre os detalhes correspondentes.
- As informacoes exibidas pertencem ao item selecionado e nao sao inventadas.
- Uma oferta inativa nao oferece uma acao de solicitacao como se estivesse
  disponivel.
- Favoritar e iniciar contato preservam o item correto.
- A tela explica falhas e estados sem resultado e oferece uma acao apropriada.
