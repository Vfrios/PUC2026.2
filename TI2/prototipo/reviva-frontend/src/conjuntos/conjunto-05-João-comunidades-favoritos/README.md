# Conjunto 5 - João - Comunidades e favoritos

## Objetivo

Este conjunto conecta engajamento social e itens salvos pelo usuário.

## Arquivos do conjunto

- `communityScreens.jsx`: tela de comunidades e integração com a experiência social do app.
- `favoritos.jsx`: lista de itens salvos pelo usuário.

## Quantidade de telas: 2

| Tela | Rota no `App.jsx` | Arquivo responsável | Função |
| --- | --- | --- | --- |
| Comunidades | `comunidades` | `communityScreens.jsx` | Listar comunidades, participar e acompanhar conteúdo social. |
| Favoritos | `favoritos` | `favoritos.jsx` | Listar, abrir e remover itens salvos. |

## Separação recomendada

Este conjunto já possui a separação ideal: uma tela por arquivo. A implementação
legada de comunidades e favoritos ainda compartilha componentes de conta, mas a
entrada da navegação e a responsabilidade de cada tela estão separadas.

## Observações

O conjunto ficou com dois módulos funcionais reais, sem `index.jsx`, e cada tela é acessada diretamente pela navegação principal.
