# Conjunto 6 - Tang - Endereco e seguranca

## Objetivo

Centralizar notificacoes, preferencias de conta e os dados necessarios para endereco salvo.

## Arquivos atuais

- `NotificacaoController.java`: endpoints para listar, marcar como lida e limpar notificacoes.
- `NotificacaoService.java`: regras de criacao e gerenciamento de notificacoes.
- `NotificacaoRepository.java`: persistencia das notificacoes.
- `Notificacao.java`: modelo de notificacao.
- `NotificacaoResponse.java`: formato de resposta para o frontend.

## Endereco

- `EnderecoController.java`: endpoints de listar, criar, remover e definir endereco principal.
- `EnderecoService.java`: regras do usuario dono e do endereco principal.
- `EnderecoRepository.java`: persistencia dos enderecos salvos.
- `Endereco.java` e DTOs: modelo e contrato de endereco.

Consultas de CEP, cidade e UF continuam no Conjunto 2; enderecos salvos ficam
persistidos neste conjunto.

## Integracao

Seguranca usa a pasta `shared/security`. Notificacoes, enderecos e preferencias devem utilizar o usuario autenticado e a mesma base MongoDB.

## Estado atual

Enderecos salvos suportam multiplos registros, endereco principal e remocao.
Seguranca oferece alteracao de senha, preferencias de notificacao e encerramento
de sessoes. Notificacoes podem ser listadas, marcadas como lidas e removidas
individualmente por estado de expiracao.

Integracoes futuras podem usar enderecos salvos diretamente no cadastro de item
e no agendamento.

## Organizacao para envio

```text
conjunto-06-Tang-endereco-seguranca/
├── endereco-salvo/
│   └── arquivos de endereco a implementar
├── seguranca-termos/
│   ├── NotificacaoController.java
│   ├── NotificacaoService.java
│   ├── NotificacaoRepository.java
│   ├── Notificacao.java
│   └── NotificacaoResponse.java
└── comum/
    └── dependencias de seguranca e geolocalizacao
```

Os subpacotes `endereco-salvo` e `seguranca-termos` usam a mesma autenticacao e
devem ser tratados como parte do mesmo conjunto.
