# Conjunto 5 - Comunidades e favoritos

## Objetivo

Fornecer participacao em comunidades e organizar itens salvos.

## Arquivos de comunidades

- `ComunidadeController.java`: endpoints para listar e participar de comunidades.
- `ComunidadeRepository.java`: persistencia das comunidades.
- `Comunidade.java`: modelo da comunidade.

## Favoritos

Ainda nao existem arquivos Java exclusivos de favoritos. A funcionalidade atual e mantida no estado local do frontend. Uma evolucao pode adicionar controller, service, repository, model e DTO proprios.

## Integracao

Comunidades usa a mesma autenticacao e o mesmo banco MongoDB. Favoritos deve futuramente persistir usando o identificador do usuario e do item.

## O que falta implementar ou atualizar

### Comunidades

- completar participacao, saida e filtros por interesse ou regiao;
- definir endpoints para atividade ou publicacoes;
- validar usuario autenticado nas alteracoes;
- tratar comunidade vazia ou inexistente.

### Favoritos

- criar persistencia no MongoDB;
- adicionar controller, service, repository, model e DTO;
- criar endpoints para listar, adicionar e remover favorito;
- garantir status atualizado para item removido ou doado.

## Organizacao para envio

```text
conjunto-05-comunidades-favoritos/
├── comunidades/
│   ├── ComunidadeController.java
│   ├── ComunidadeRepository.java
│   └── Comunidade.java
├── favoritos/
│   └── arquivos da API de favoritos quando implementados
└── comum/
	└── dependencias compartilhadas do conjunto
```

Na Sprint 1, enviar `comunidades`. Na Sprint 2, acrescentar `favoritos` e seus endpoints de persistencia.
