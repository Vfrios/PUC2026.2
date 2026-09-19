# Conjunto 1 - Publicacao e gestao

## Objetivo

Fornecer os endpoints para cadastrar e administrar itens publicados.

## Arquivos

- `ItemController.java`: endpoints HTTP de itens.
- `ItemService.java`: regras de negocio para criar, editar, listar, restaurar, remover e marcar itens como doados.
- `ItemRepository.java`: acesso MongoDB aos documentos de itens.
- `Item.java`: modelo persistido do item.
- `ItemRequest.java`: dados recebidos ao criar ou editar item.
- `ItemResponse.java`: formato de resposta enviado ao frontend.

## Integracao

Este conjunto compartilha `Usuario`, autenticacao e banco MongoDB com os demais. Os endpoints de item sao usados por descoberta, detalhes e solicitacao.

## O que falta implementar ou atualizar

### Cadastro de item

- validar campos obrigatorios e regras de categoria;
- suportar melhor fotos, rascunho e edicao;
- padronizar respostas de sucesso e erro;
- garantir que o item criado possa ser consultado imediatamente.

### Gerenciar itens

- consolidar filtros e status do item;
- retornar solicitacoes relacionadas quando necessario;
- separar melhor consulta publica e gerenciamento autenticado;
- adicionar testes para remover, restaurar e marcar como doado.

## Organizacao para envio

```text
conjunto-01-publicacao-gestao/
├── cadastro-item/
│   ├── ItemController.java
│   ├── ItemService.java
│   └── ItemRequest.java
├── gerenciar-itens/
│   └── arquivos da gestao que forem criados
└── comum/
	├── Item.java
	├── ItemRepository.java
	└── ItemResponse.java
```

Na Sprint 1, enviar `cadastro-item` junto com `comum`. Na Sprint 2, acrescentar `gerenciar-itens`.
