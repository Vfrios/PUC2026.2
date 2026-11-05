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
