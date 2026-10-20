# Guia de commits — Vitor (Sprint 1)

## Meta da sprint
- Meta recomendada: 10 a 12 commits.
- A sprint 1 tem foco em `Solicitacao` e criação da conversa inicial.
- A contagem considera apenas dias úteis: 13, 14, 15, 16 e 19/10.
- Fins de semana (17 e 18/10) não entram na contagem nem no ritmo.

## Cronograma real (dias úteis)

| Data | Foco | Commits esperados | Linhas esperadas |
|---|---|---:|---:|
| 13/10 (ter) | Estrutura inicial + entidades + repository | 2 | ~250 |
| 14/10 (qua) | Service e validações da solicitação | 2 | ~300 |
| 15/10 (qui) | Controller REST + primeira mensagem | 3 | ~350 |
| 16/10 (sex) | Tela `tradeScreens.jsx` + integração frontend | 2 | ~350 |
| 19/10 (seg) | Ajustes, melhorias, testes e correções | 3 | ~250 |

Total estimado: 12 commits, com foco em entregas funcionais reais.

## Padrão de mensagem de commit
- `feat(vitor): cria entidade Solicitacao`
- `feat(vitor): adiciona repository de solicitacoes`
- `feat(vitor): implementa service de criacao de solicitacao`
- `feat(vitor): adiciona endpoint POST /api/solicitacoes`
- `feat(vitor): cria mensagem inicial da conversa`
- `feat(vitor): integra tela de solicitacao no frontend`
- `fix(vitor): corrige duplicidade de solicitacao`
- `refactor(vitor): ajusta fluxo de navegacao para chat receptor`
- `test(vitor): valida cenarios de solicitacao e cancelamento`

## Regras da sprint
- 1 commit = 1 avanço funcional real.
- Não misturar backend e frontend em um mesmo commit, salvo integração direta da última etapa.
- Priorizar arquivos do módulo `Vitor-solicitacao-chat` e evitar qualquer alteração de outras pessoas.
- Eu não preciso gerar commits por arquivo isolado; preciso gerar commits por funcionalidade concluída.
- Trabalhar em blocos de até 200-400 linhas por dia útil para manter revisão simples.
- Nunca commitar `node_modules`, `.env`, credenciais ou dados sensíveis.

## Ritmo recomendado por dia
- 13/10: 2 commits, pouco mais de 250 linhas no total
- 14/10: 2 commits, ~300 linhas
- 15/10: 3 commits, ~350 linhas
- 16/10: 2 commits, ~350 linhas
- 19/10: 3 commits, ~250 linhas

## Quantidade mínima aceitável
- Mínimo: 10 commits na sprint 1.
- Ideal: 12 commits.
- Se o módulo ficar muito estável mais cedo, os últimos commits devem ser de correção/ajustes e não de “revisão vazia”.
