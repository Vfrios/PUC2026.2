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
