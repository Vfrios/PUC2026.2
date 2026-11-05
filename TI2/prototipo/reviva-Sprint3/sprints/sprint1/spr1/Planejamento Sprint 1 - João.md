# Planejamento Sprint 1 - João

## Objetivo

Facilitar a descoberta de grupos de interesse e permitir que uma pessoa guarde itens para consultar novamente.

## Funcionalidades previstas

- Consultar as comunidades disponíveis e visualizar sua descrição.
- Demonstrar interesse em participar de uma comunidade.
- Consultar os itens marcados como favoritos.
- Adicionar um item aos favoritos a partir de sua apresentação ou de seus detalhes.
- Remover um item da lista de favoritos.
- Manter a lista de favoritos associada à pessoa usuária.

## Requisitos funcionais

- **RF01 — Consultar comunidades:** a pessoa deve conseguir visualizar as comunidades disponíveis e, para cada uma, consultar nome e descrição quando essas informações existirem. Se ainda não houver comunidades, o sistema deve indicar que não há opções para exibir.
- **RF02 — Manifestar participação:** a pessoa deve conseguir escolher uma comunidade e solicitar ou confirmar sua participação. O sistema deve apresentar o estado da participação para que a pessoa saiba se já faz parte dela e não repita a mesma ação sem necessidade.
- **RF03 — Favoritar item:** a partir da apresentação ou dos detalhes de um item, a pessoa deve conseguir adicioná-lo à sua lista de favoritos. A ação deve produzir uma confirmação visível e não deve criar entradas repetidas para o mesmo item.
- **RF04 — Consultar favoritos:** a pessoa deve conseguir abrir uma lista com os itens que salvou e consultar suas informações resumidas. Se ainda não houver itens salvos, deve ser apresentada uma indicação de lista vazia.
- **RF05 — Remover favorito:** a pessoa deve conseguir remover um item salvo e receber confirmação da alteração. O item removido não deve continuar aparecendo na lista de favoritos.
- **RF06 — Manter favoritos pessoais:** a lista deve pertencer à pessoa que a organizou; outra pessoa não deve visualizar ou alterar essa lista como se fosse sua.
- **RF07 — Refletir disponibilidade do item:** quando a pessoa consultar um favorito, o sistema deve apresentar a situação de disponibilidade conhecida do item. Um item indisponível pode permanecer identificável na lista, mas não deve parecer uma oferta ativa.

## Requisitos não funcionais

- **RNF01 — Desempenho:** em ambiente de teste acordado pela equipe, comunidades e favoritos devem ser apresentados em até 2 segundos no percentil 95, desconsiderando indisponibilidade de serviços externos.
- **RNF02 — Privacidade e autorização:** a lista de favoritos e as ações de participação devem ser associadas à conta autenticada; a pessoa não pode consultar ou alterar os favoritos de outra conta.
- **RNF03 — Integridade:** adicionar repetidamente o mesmo item não deve gerar favoritos duplicados; remoções e alterações de participação devem continuar refletidas ao consultar novamente.
- **RNF04 — Acessibilidade:** ações de favoritar, remover e manifestar participação devem ter rótulos compreensíveis, estado perceptível sem depender apenas de cor e operação por teclado.
- **RNF05 — Consistência:** a disponibilidade exibida para cada favorito deve vir do estado conhecido do anúncio; falhas ao atualizar esse estado devem ser diferenciadas de indisponibilidade confirmada.
- **RNF06 — Tratamento de falhas:** problemas ao carregar ou atualizar comunidades e favoritos devem ser comunicados sem apresentar dados desatualizados como resultado confirmado, oferecendo nova tentativa quando aplicável.

## Resultado esperado

Ao final da sprint, a pessoa deve conseguir encontrar comunidades relevantes e organizar os itens que pretende rever.
