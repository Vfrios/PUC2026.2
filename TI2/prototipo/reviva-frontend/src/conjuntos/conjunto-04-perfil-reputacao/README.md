# Conjunto 4 - Perfil e reputacao

## Objetivo

Apresentar a identidade do usuario, seus dados publicos e a confiabilidade construida nas trocas.

## Telas

- **Perfil:** mostra e edita dados pessoais, foto, favoritos e acoes da conta.
- **Reputacao:** mostra pontos, selo, avaliacoes e historico de confiabilidade.

## Arquivos

- `index.jsx`: ponto de entrada do conjunto. Reexporta perfil, perfil publico, reputacao, historico, moderacao e avaliacao.
- `accountScreens.jsx`: implementacao de perfil, perfil publico, reputacao, historico e moderacao.
- `../conjunto-03-solicitacao-chat/tradeScreens.jsx`: implementacao do formulario de avaliacao.

## Dependencias

Usa usuario autenticado, dados de avaliacoes, favoritos e navegacao compartilhada.

## Integracao

Perfil e reputacao devem poder abrir diretamente. A reputacao exibida nos detalhes de um item deve usar os mesmos dados deste conjunto.

## O que falta implementar ou atualizar

### Perfil do usuario

- completar edicao de foto e dados pessoais;
- separar informacoes pessoais, endereco, seguranca e preferencias;
- mostrar impacto, historico e itens do usuario;
- tratar perfil incompleto e usuario sem avaliacoes.

### Reputacao

- exibir avaliacao por categoria e historico detalhado;
- atualizar pontos e selo depois de uma avaliacao;
- mostrar estados sem avaliacoes e sem trocas concluidas;
- garantir que detalhes do item e perfil usem a mesma pontuacao.
