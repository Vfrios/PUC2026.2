# Conjunto 1 - Gustavo - Publicação e gestão

## Objetivo

Este conjunto reúne o fluxo de publicação e o painel de manutenção dos anúncios do usuário.

## Arquivos do conjunto

- `cadastroItem.jsx`: tela de cadastro e edição do item, com fotos, categoria, estado, endereço, salvamento de rascunho e publicação.
- `gerenciarItens.jsx`: tela própria do painel de gestão, com listagem, edição, duplicação, exclusão e acompanhamento do status dos itens.

## Quantidade de telas: 2

| Tela | Rota no `App.jsx` | Arquivo responsável | Função |
| --- | --- | --- | --- |
| Cadastro/edição de item | `cadastroItem` | `cadastroItem.jsx` | Criar, editar, duplicar e salvar rascunhos de anúncios. |
| Gerenciar itens | `gerenciarItens` | `gerenciarItens.jsx` | Listar, editar, remover, restaurar e acompanhar anúncios do usuário. |

## Separação recomendada

Este é o conjunto mais simples para separar fisicamente: cada arquivo deve
conter somente uma tela. A listagem pública e os detalhes aparecem em outros
conjuntos no `App.jsx`, mesmo que parte da implementação legada ainda esteja
no arquivo de cadastro.

## Observações

O conjunto ficou organizado em dois componentes de tela, sem `index.jsx` e sem reexportação de barrel entre pastas do módulo.
