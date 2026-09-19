# Conjunto 2 - Descoberta e detalhes

## Objetivo

Permitir que o usuario encontre itens e consulte todas as informacoes antes de solicitar.

## Telas

- **Busca / descoberta:** pesquisa itens por termo, categoria, cidade e UF.
- **Detalhes do item:** mostra fotos, descricao, localizacao, anunciante, favoritos e acao de solicitacao.

## Arquivos

- `index.jsx`: ponto de entrada do conjunto. Reexporta `Busca`, `ListaItens`, `HomeDoador`, `HomeReceptor` e `DetalhesItem`.
- `discoveryScreens.jsx`: implementacao de home e busca.
- `../conjunto-01-publicacao-gestao/itemScreens.jsx`: implementacao compartilhada de lista e detalhes.

## Dependencias

Usa `api.js`, `ItemCard`, estado de favoritos, usuario autenticado e componentes compartilhados.

## Integracao

A busca abre detalhes por `itemId`. A tela de detalhes deve funcionar tambem quando aberta diretamente, sem depender de a busca ter sido carregada antes.

## O que falta implementar ou atualizar

### Busca / descoberta

- adicionar filtros por distancia, disponibilidade e categoria;
- melhorar ordenacao, estados vazios e mensagens de erro;
- permitir limpar filtros;
- tratar API indisponivel sem quebrar a tela.

### Detalhes do item

- melhorar galeria de fotos e informacoes de retirada;
- exibir reputacao do anunciante e impacto estimado;
- tratar item inexistente, removido ou ja doado;
- manter favoritar e solicitar funcionando ao abrir diretamente.
