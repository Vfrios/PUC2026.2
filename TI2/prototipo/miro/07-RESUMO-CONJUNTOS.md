# Resumo dos conjuntos de telas

Este documento resume os 6 conjuntos funcionais do projeto. Onboarding e login ficam fora da contagem, pois sao telas de entrada do sistema.

Cada conjunto possui 2 telas e deve funcionar de forma independente nas Sprints 1 e 2, continuando integrado ao sistema completo na Sprint 3.

---

## Conjunto 1 - Publicacao e gestao

### Telas

- Cadastro de item
- Gerenciar itens

### O que faz

Permite cadastrar itens para doacao ou troca e administrar os itens publicados pelo usuario.

### Tela de Cadastro de item

#### O que precisa atualizar

- melhorar a validacao dos campos obrigatorios;
- organizar categoria, descricao, condicao e localizacao;
- padronizar mensagens de sucesso e erro;
- melhorar o preview e a ordem das fotos;
- permitir editar o item depois de salva-lo.

#### O que falta implementar

- salvar rascunho de item;
- escolher fotos por arquivo ou galeria;
- editar e remover fotos depois do cadastro;
- validar duplicidade de itens;
- informar regras de retirada ou entrega.

### Tela de Gerenciar itens

#### O que precisa atualizar

- organizar filtros por status;
- deixar editar, remover, restaurar e marcar como doado mais claros;
- mostrar solicitacoes recebidas por item;
- atualizar a lista depois de cada acao;
- padronizar estados ativo, em negociacao, doado e removido.

#### O que falta implementar

- permitir duplicar item semelhante;
- mostrar quantidade de interessados;
- responder solicitacoes diretamente na tela;
- criar acoes em lote;
- concluir o fluxo de gerenciamento de todos os status.

---

## Conjunto 2 - Descoberta e detalhes

### Telas

- Busca / descoberta de itens
- Detalhes do item

### O que faz

Permite encontrar itens por termo, categoria e localizacao e consultar os detalhes antes de fazer uma solicitacao.

### Tela de Busca / descoberta de itens

#### O que precisa atualizar

- melhorar os filtros por cidade, UF e categoria;
- adicionar filtro de distancia usando a localizacao do usuario;
- criar ordenacao por relevancia, proximidade e data;
- melhorar os cards e a apresentacao dos resultados;
- tratar estados vazios, carregamento e erro da API;
- indicar claramente quando um item esta indisponivel.

#### O que falta implementar

- filtro por disponibilidade real do item;
- busca por varios criterios combinados;
- limpar todos os filtros com uma unica acao;
- paginacao ou carregamento progressivo dos resultados;
- sugestao de itens quando a busca nao encontrar resultados.

### Tela de Detalhes do item

#### O que precisa atualizar

- melhorar a apresentacao das fotos, descricao e localizacao;
- exibir a reputacao do anunciante de forma mais clara;
- mostrar regras de retirada ou entrega;
- atualizar o estado quando o item for removido, doado ou entrar em negociacao;
- deixar os botoes de favoritar e solicitar mais visiveis;
- tratar item inexistente ou erro ao carregar os dados.

#### O que falta implementar

- compartilhamento do item;
- exibicao do impacto ambiental estimado;
- tratamento especifico para item removido ou inexistente;
- carregamento completo ao abrir diretamente por `itemId`;
- indicador de item disponivel, reservado ou ja doado;
- exibicao do historico de atualizacoes ou interesse no item.

---

## Conjunto 3 - Solicitacao e chat

### Telas

- Solicitacao de item
- Chat de negociacao

### O que faz

Permite solicitar um item, conversar com o anunciante e combinar local, data e horario da troca.

### Tela de Solicitacao de item

#### O que precisa atualizar

- exibir status em etapas: enviada, aceita, recusada, agendada e concluida;
- melhorar confirmacoes de envio, aceite e cancelamento;
- mostrar a resposta do anunciante;
- tratar item indisponivel ou solicitacao duplicada;
- permitir abrir a solicitacao diretamente por identificador.

#### O que falta implementar

- cancelamento seguro de solicitacao;
- validacao de permissoes por usuario;
- notificacao de mudanca de status;
- historico das solicitacoes do usuario;
- fluxo completo de confirmacao da doacao e recebimento.

### Tela de Chat de negociacao

#### O que precisa atualizar

- tratar conversa vazia e falha de conexao;
- melhorar mensagens de evento e presenca online;
- deixar agendamento e confirmacao mais claros;
- exibir horarios e status de leitura;
- melhorar a exibicao de localizacao compartilhada.

#### O que falta implementar

- notificacao de novas mensagens;
- confirmacao de leitura;
- envio de imagens ou anexos;
- reconexao automatica do WebSocket;
- respostas a mensagens e cancelamento de conversa.

---

## Conjunto 4 - Perfil e reputacao

### Telas

- Perfil do usuario
- Reputacao

### O que faz

Apresenta os dados do usuario e mostra sua confiabilidade, pontuacao, selos e avaliacoes recebidas.

### Tela de Perfil do usuario

#### O que precisa atualizar

- melhorar edicao dos dados pessoais e da foto;
- separar informacoes pessoais, endereco e seguranca;
- mostrar historico de trocas e contribuicoes;
- tratar perfil incompleto e usuario sem avaliacao;
- organizar melhor favoritos, notificacoes e preferencias.

#### O que falta implementar

- perfil publico completo do anunciante;
- resumo de impacto ambiental do usuario;
- historico detalhado de acoes;
- edicao de todos os dados permitidos;
- atalhos para endereco, seguranca e termos.

### Tela de Reputacao

#### O que precisa atualizar

- organizar melhor pontos, selos e avaliacoes;
- explicar como a pontuacao e calculada;
- mostrar confiabilidade de forma mais visual;
- tratar usuario sem avaliacao;
- atualizar os dados depois de uma nova avaliacao.

#### O que falta implementar

- avaliacao por categorias, como pontualidade e comunicacao;
- historico detalhado de avaliacoes;
- atualizacao automatica de pontos e selos;
- controle contra avaliacao duplicada;
- destaque de conquistas e contribuicoes positivas.

---

## Conjunto 5 - Comunidades e favoritos

### Telas

- Comunidades
- Favoritos

### O que faz

Permite participar de comunidades por interesse ou regiao e salvar itens para consultar depois.

### Tela de Comunidades

#### O que precisa atualizar

- melhorar entrada e saida de comunidades;
- organizar comunidades por categoria e localizacao;
- tratar lista vazia e comunidade indisponivel;
- melhorar a exibicao de interesses e atividades;
- padronizar feedback ao participar ou sair.

#### O que falta implementar

- publicacoes ou atividades dentro das comunidades;
- filtros por interesse;
- busca de comunidades por regiao;
- sistema de seguir ou deixar de seguir comunidade;
- compartilhamento de atividades comunitarias.

### Tela de Favoritos

#### O que precisa atualizar

- melhorar ordenacao dos favoritos;
- indicar itens favoritados que ficaram indisponiveis;
- sincronizar favoritos com busca e detalhes;
- tratar lista vazia;
- mostrar data em que o item foi salvo.

#### O que falta implementar

- persistencia de favoritos na API;
- endpoints para adicionar, listar e remover favoritos;
- remocao de varios favoritos de uma vez;
- separacao por categoria;
- atualizacao automatica quando o item for doado ou removido.

---

## Conjunto 6 - Endereco e seguranca

### Telas

- Endereco salvo
- Seguranca e termos

### O que faz

Permite guardar locais de retirada ou entrega e administrar seguranca, notificacoes, termos e preferencias da conta.

### Tela de Endereco salvo

#### O que precisa atualizar

- criar a tela de endereco salvo;
- validar CEP, cidade, bairro e numero;
- mostrar endereco principal de forma clara;
- tratar lista vazia e erro de consulta;
- integrar o endereco ao agendamento.

#### O que falta implementar

- cadastro, edicao e exclusao de enderecos;
- possibilidade de ter varios enderecos;
- definicao de endereco padrao;
- nome para cada endereco, como casa ou trabalho;
- preenchimento automatico por CEP.

### Tela de Seguranca e termos

#### O que precisa atualizar

- separar seguranca, notificacoes, termos e privacidade;
- melhorar mensagens de alteracao de senha;
- tratar notificacoes lidas, nao lidas e vazias;
- organizar preferencias da conta;
- mostrar confirmacao para operacoes sensiveis.

#### O que falta implementar

- endpoint de alteracao de senha;
- preferencias de notificacao;
- telas separadas para termos de uso e politica de privacidade;
- autenticacao em duas etapas;
- gerenciamento de sessoes e dispositivos conectados.

---

## Resumo geral

| Conjunto | Telas | Principal pendencia |
|---|---|---|
| 1 | Cadastro de item + Gerenciar itens | Completar gerenciamento e status dos itens |
| 2 | Busca + Detalhes do item | Melhorar filtros, detalhes e disponibilidade |
| 3 | Solicitacao + Chat | Completar negociacao, notificacoes e confirmacoes |
| 4 | Perfil + Reputacao | Consolidar dados, avaliacoes e pontuacao |
| 5 | Comunidades + Favoritos | Implementar persistencia e ampliar interacao |
| 6 | Endereco + Seguranca e termos | Criar endereco salvo e configuracoes da conta |

Total: **6 conjuntos e 12 telas funcionais**.
