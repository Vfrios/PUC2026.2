# Conjunto 2 - Brayan - Descoberta e detalhes

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

## Estado atual

O conjunto fornece estados, cidades, consulta de CEP e geolocalizacao reversa.
A busca e os detalhes reutilizam os contratos de itens do Conjunto 1. O
frontend combina esses dados com filtros de texto, categoria e regiao.

Evolucoes conhecidas: paginacao, ordenacao avancada e busca por distancia ainda
podem ser adicionadas sem duplicar as entidades de item.

## Organizacao para envio

```text
conjunto-02-Brayan-descoberta-detalhes/
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

Os detalhes reutilizam os contratos de item sem duplicar o banco.
