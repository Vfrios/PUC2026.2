# Conjunto 2 - Brayan - Descoberta e detalhes

## Objetivo

Este conjunto concentra a navegação de descoberta, busca e avaliação rápida dos itens antes da solicitação.

## Arquivos do conjunto

- `discoveryScreens.jsx`: Home do doador e Home do receptor.
- `itensDetalhes.jsx`: Busca, lista de itens e detalhes do item, incluindo filtros, favoritos e navegação para a solicitação.

## Quantidade de telas: 5 telas lógicas

| Tela | Rota no `App.jsx` | Arquivo responsável | Observação |
| --- | --- | --- | --- |
| Home do doador | `homeDoador` | `discoveryScreens.jsx` | Atalhos, impacto e solicitações recentes. |
| Home do receptor | `homeReceptor` | `discoveryScreens.jsx` | Itens recentes, categorias e acesso à busca. É uma variação da home. |
| Busca | `busca` | `discoveryScreens.jsx` | Busca por texto, categoria, estado, cidade e localização. |
| Lista de itens | `listaItens` | `itensDetalhes.jsx` | Resultados filtrados e favoritos. |
| Detalhes do item | `detalhesItem` | `itensDetalhes.jsx` | Fotos, descrição, anunciante, localização e solicitação. |

Se as variações de home forem contadas separadamente, o conjunto possui 5
componentes de tela e 5 rotas, sendo 2 delas variações por perfil.

## Separação recomendada

`discoveryScreens.jsx` pode ser dividido futuramente em `home.jsx` e
`busca.jsx`. `itensDetalhes.jsx` pode ser dividido em `listaItens.jsx` e
`detalhesItem.jsx`. A divisão atual já separa descoberta de aprofundamento.

## Observações

Os dois arquivos são módulos funcionais distintos, sem `index.jsx` e com importação direta na navegação principal. A contagem acima considera tela de produto, não cada componente auxiliar.
