# Conjunto 1 - Publicacao e gestao

## Objetivo

Responsavel por criar e administrar os itens disponibilizados na plataforma.

## Telas

- **Cadastro de item:** cria ou edita um item com fotos, categoria, descricao e localizacao.
- **Gerenciar itens:** lista os itens do usuario e permite editar, restaurar, remover e acompanhar status.

## Arquivos

- `index.jsx`: ponto de entrada do conjunto. Reexporta `CadastroItem` e `GerenciarItens` para o `App.jsx`.
- `itemScreens.jsx`: implementacao das telas deste conjunto.

## Dependencias

Utiliza `api.js`, componentes de `shared` e o usuario autenticado. Os dados sao persistidos na mesma API e no mesmo banco MongoDB usados pelo restante do sistema.

## Integracao

Os endpoints de itens devem continuar compativeis com busca, detalhes e solicitacoes. Nao alterar contratos sem atualizar os conjuntos dependentes.

## O que falta implementar ou atualizar

### Cadastro de item

- validar campos obrigatorios;
- permitir rascunho e edicao de fotos;
- tratar loading, erro, sucesso e formulario vazio;
- confirmar que o item salvo aparece no gerenciamento.

### Gerenciar itens

- melhorar filtros por status;
- mostrar quantidade de solicitacoes por item;
- deixar editar, remover, restaurar e marcar como doado mais claros;
- atualizar a lista depois de cada acao.
