# Conjunto 5 - João - Comunidades e favoritos

## Objetivo

Fornecer participacao em comunidades e organizar itens salvos.

## Arquivos de comunidades

- `ComunidadeController.java`: endpoints para listar e participar de comunidades.
- `ComunidadeRepository.java`: persistencia das comunidades.
- `Comunidade.java`: modelo da comunidade.

## Favoritos

Favoritos possuem controller, service, repository, entidade e DTO proprios. A
API lista, adiciona e remove favoritos por usuario autenticado.

## Integracao

Comunidades usa a mesma autenticacao e o mesmo banco MongoDB. Favoritos deve futuramente persistir usando o identificador do usuario e do item.

## Estado atual

Comunidades permitem listar, criar, participar, sair, listar posts e apoiar
posts. Favoritos sao persistidos no MongoDB e sincronizados pelo frontend com
busca, detalhes e perfil.

Moderacao de posts, filtros mais ricos e ordenacao de favoritos continuam como
evolucoes possiveis.

## Organizacao para envio

```text
conjunto-05-João-comunidades-favoritos/
├── comunidades/
│   ├── ComunidadeController.java
│   ├── ComunidadeRepository.java
│   └── Comunidade.java
├── favoritos/
│   └── arquivos da API de favoritos quando implementados
└── comum/
    └── dependencias compartilhadas do conjunto
```

Comunidades e favoritos usam a autenticacao existente e podem ser publicados
juntos com o restante da API.
