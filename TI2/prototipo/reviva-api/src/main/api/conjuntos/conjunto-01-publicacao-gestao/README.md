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

## Estado atual

O conjunto atende cadastro, edicao, consulta publica, remocao, restauracao e
marcacao de doacao. A validacao de campos, controle do proprietario e respostas
de erro ficam concentrados no service e nos DTOs. Fotos sao recebidas como
URLs/data URLs; o armazenamento dedicado de imagens ainda nao faz parte da API.

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

Os subpacotes atuais podem ser executados juntos; a separacao acima serve como
organizacao de dominio e nao representa uma ordem obrigatoria de deploy.
