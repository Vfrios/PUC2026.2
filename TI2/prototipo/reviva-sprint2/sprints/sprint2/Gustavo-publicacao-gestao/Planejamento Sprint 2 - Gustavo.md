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
