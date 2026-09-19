# Conjunto 5 - Comunidades e favoritos

## Objetivo

Aumentar o engajamento do usuario por meio de comunidades e itens salvos.

## Telas

- **Comunidades:** lista comunidades, mostra interesses e permite participar.
- **Favoritos:** lista os itens salvos pelo usuario e indica itens indisponiveis.

## Arquivos

- `index.jsx`: ponto de entrada do conjunto. Reexporta `Comunidades` e `Favoritos`.
- `../conjunto-04-perfil-reputacao/accountScreens.jsx`: implementacao das duas telas.

## Dependencias

Comunidades usa a API. Favoritos atualmente usa o estado local do frontend e pode receber persistencia na API em uma evolucao futura.

## Integracao

Favoritos deve sincronizar com busca e detalhes sem duplicar o estado. Comunidades deve continuar funcionando mesmo quando a lista estiver vazia.

## O que falta implementar ou atualizar

### Comunidades

- melhorar entrada, saida e participacao;
- separar comunidades por interesse ou regiao;
- tratar lista vazia, erro e comunidade indisponivel;
- definir conteudo que pode ser publicado ou compartilhado.

### Favoritos

- criar persistencia na API para complementar o `localStorage`;
- sincronizar adicao e remocao com busca e detalhes;
- indicar itens indisponiveis;
- permitir ordenar ou remover favoritos em lote.
