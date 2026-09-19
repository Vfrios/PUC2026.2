# Conjunto 6 - Endereco e seguranca

## Objetivo

Centralizar notificacoes, preferencias de conta e os dados necessarios para endereco salvo.

## Arquivos atuais

- `NotificacaoController.java`: endpoints para listar, marcar como lida e limpar notificacoes.
- `NotificacaoService.java`: regras de criacao e gerenciamento de notificacoes.
- `NotificacaoRepository.java`: persistencia das notificacoes.
- `Notificacao.java`: modelo de notificacao.
- `NotificacaoResponse.java`: formato de resposta para o frontend.

## Endereco

A API ainda utiliza os arquivos de geolocalizacao do Conjunto 2 para CEP, cidade, UF e endereco. Um CRUD de endereco salvo pode ser adicionado neste conjunto sem criar outro banco.

## Integracao

Seguranca usa a pasta `shared/security`. Notificacoes, enderecos e preferencias devem utilizar o usuario autenticado e a mesma base MongoDB.

## O que falta implementar ou atualizar

### Endereco salvo

- criar model, repository, service, controller e DTO proprios;
- permitir multiplos enderecos e endereco padrao;
- validar CEP, cidade, bairro, numero e usuario dono;
- integrar endereco ao cadastro de item e agendamento.

### Seguranca e termos

- criar endpoints para alteracao de senha e preferencias;
- separar notificacoes de termos e politica de privacidade;
- reforcar validacao e autorizacao das operacoes da conta;
- adicionar testes para notificacoes lidas, nao lidas e vazias.

## Organizacao para envio

```text
conjunto-06-endereco-seguranca/
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

Na Sprint 1, enviar `endereco-salvo` com as dependencias comuns necessarias. Na Sprint 2, acrescentar `seguranca-termos`.
