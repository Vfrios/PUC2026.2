# Conjunto 6 - Endereco e seguranca

## Objetivo

Concentrar os dados de localizacao e as preferencias de seguranca e comunicacao da conta.

## Telas

- **Endereco salvo:** cadastra, edita, remove e define endereco padrao.
- **Seguranca e termos:** concentra seguranca, notificacoes, preferencias, termos e privacidade.

## Arquivos

- `index.jsx`: ponto de entrada do conjunto. Reexporta `Notificacoes`; o modulo de endereco sera integrado neste ponto quando a tela for criada.
- `../conjunto-04-perfil-reputacao/accountScreens.jsx`: implementacao atual de notificacoes.
- `../../api.js`: fornece as chamadas de geolocalizacao e notificacoes usadas pelo frontend.

## Dependencias

Usa usuario autenticado, dados de CEP/geolocalizacao e configuracoes compartilhadas.

## Integracao

Endereco sera usado por cadastro de item, busca e agendamento. Seguranca e notificacoes devem abrir diretamente sem depender de outra tela.

## O que falta implementar ou atualizar

### Endereco salvo

- criar o componente da tela, ainda nao implementado neste conjunto;
- permitir cadastrar, editar, remover e definir endereco padrao;
- validar CEP, cidade, bairro e numero;
- integrar endereco ao cadastro de item e ao agendamento.

### Seguranca e termos

- criar tela de alteracao de senha e preferencias de notificacao;
- separar termos de uso e politica de privacidade;
- tratar notificacoes lidas, nao lidas e vazias;
- incluir mensagens claras para operacoes de seguranca.
