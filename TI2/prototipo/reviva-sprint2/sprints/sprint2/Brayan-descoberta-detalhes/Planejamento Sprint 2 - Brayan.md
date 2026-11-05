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
