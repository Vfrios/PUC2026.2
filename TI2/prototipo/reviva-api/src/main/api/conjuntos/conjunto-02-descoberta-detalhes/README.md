# Conjunto 2 - Descoberta e detalhes

## Objetivo

Permitir busca, filtros regionais e consulta dos dados necessarios para exibir itens.

## Arquivos

- `GeoController.java`: endpoints de CEP, estados, cidades e geolocalizacao reversa.
- `GeoService.java`: integra servicos externos e transforma dados geograficos.
- `EstadoResponse.java`: resposta de estado para filtros.
- `CidadeResponse.java`: resposta de cidade para filtros.
- `EnderecoResponse.java`: resposta de endereco obtido por CEP ou geolocalizacao.

## Integracao

A consulta dos itens usa tambem `ItemController`, `ItemService`, `ItemRepository`, `Item` e `ItemResponse` do Conjunto 1. Os dados continuam na mesma API e no mesmo MongoDB.

## O que falta implementar ou atualizar

### Busca / descoberta

- evoluir filtros por distancia, disponibilidade e categoria;
- padronizar paginacao e ordenacao;
- tratar consultas sem resultado e erros de servicos externos;
- adicionar testes para termo, cidade e UF.

### Detalhes do item

- responder corretamente para item inexistente, removido ou doado;
- incluir dados de reputacao e regras de retirada;
- separar consulta publica de operacoes autenticadas;
- manter o contrato compativel com solicitacao e favoritos.

## Organizacao para envio

```text
conjunto-02-descoberta-detalhes/
├── busca-descoberta/
│   ├── GeoController.java
│   ├── GeoService.java
│   ├── EstadoResponse.java
│   ├── CidadeResponse.java
│   └── EnderecoResponse.java
├── detalhes-item/
│   └── arquivos especificos que forem criados
└── comum/
	└── dependencias de item usadas pelo conjunto 1
```

Na Sprint 1, enviar `busca-descoberta`. Na Sprint 2, acrescentar `detalhes-item`. Os detalhes reutilizam os contratos de item sem duplicar o banco.
