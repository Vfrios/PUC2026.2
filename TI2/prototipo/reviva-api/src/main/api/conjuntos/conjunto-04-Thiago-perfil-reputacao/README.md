# Conjunto 4 - Thiago - Perfil e reputacao

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

## Estado atual

O conjunto fornece perfil autenticado e publico, localizacao, foto, historico,
avaliacoes, pontuacao, selos e impacto. Operacoes de alteracao exigem o usuario
autenticado; a reputacao e calculada a partir das avaliacoes persistidas.

O frontend tambem apresenta estados de perfil incompleto e de usuario sem
avaliacoes. Exportacao de dados e fluxos administrativos sao evolucoes futuras.

## Organizacao para envio

```text
conjunto-04-Thiago-perfil-reputacao/
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

Perfil e reputacao compartilham os mesmos usuarios e avaliacoes durante a
execucao; nao devem criar bases ou contratos paralelos.
