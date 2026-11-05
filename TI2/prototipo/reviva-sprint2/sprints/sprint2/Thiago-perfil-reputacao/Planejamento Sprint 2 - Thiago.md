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
