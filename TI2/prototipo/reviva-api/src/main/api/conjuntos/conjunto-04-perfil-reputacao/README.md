# Conjunto 4 - Perfil e reputacao

## Objetivo

Fornecer os dados do usuario e controlar avaliacoes e pontuacao.

## Arquivos de perfil

- `UsuarioController.java`: endpoints de usuario, perfil, localizacao e itens do usuario.
- `UsuarioRepository.java`: persistencia e consultas de usuarios.
- `Usuario.java`: modelo do usuario.
- `UsuarioResponse.java`: resposta publica e autenticada do usuario.

## Arquivos de reputacao

- `AvaliacaoController.java`: endpoint para registrar avaliacao.
- `AvaliacaoService.java`: valida e grava avaliacoes.
- `AvaliacaoRepository.java`: persistencia de avaliacoes.
- `Avaliacao.java`: modelo da avaliacao.
- `AvaliacaoRequest.java`: dados da avaliacao enviada.
- `PontuacaoService.java`: calcula pontos e selo do usuario.

## Integracao

Perfil, detalhes do item e fluxo de troca podem consultar os mesmos usuarios e avaliacoes. Nao criar outra base de usuario.

## O que falta implementar ou atualizar

### Perfil do usuario

- completar endpoints de edicao de dados e foto;
- separar dados privados de dados publicos;
- adicionar historico e impacto do usuario;
- validar acesso apenas ao proprio perfil para alteracoes.

### Reputacao

- consolidar calculo de pontos e selo;
- impedir avaliacao duplicada ou fora de troca concluida;
- retornar historico detalhado de avaliacoes;
- adicionar testes de avaliacao, pontuacao e permissao.

## Organizacao para envio

```text
conjunto-04-perfil-reputacao/
├── perfil/
│   ├── UsuarioController.java
│   ├── UsuarioRepository.java
│   ├── Usuario.java
│   └── UsuarioResponse.java
├── reputacao/
│   ├── AvaliacaoController.java
│   ├── AvaliacaoService.java
│   ├── AvaliacaoRepository.java
│   ├── Avaliacao.java
│   ├── AvaliacaoRequest.java
│   └── PontuacaoService.java
└── comum/
	└── dependencias compartilhadas entre perfil e reputacao
```

Na Sprint 1, enviar `perfil`. Na Sprint 2, acrescentar `reputacao`.
