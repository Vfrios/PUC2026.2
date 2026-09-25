# Levantamento de melhorias — Reviva

Análise feita em cima do código real de cada conjunto (não só dos nomes das telas), com foco especial nas telas de **Comunidades** e **Solicitação de item**.

---

## Conjunto 1 - Publicação e gestão

### Conjunto 1 - Telas

Cadastro/edição de item (`cadastroItem.jsx`) e Gerenciar itens (`gerenciarItens.jsx`).

### Conjunto 1 - O que faz

Cria/edita anúncio (fotos, categoria, estado, endereço, rascunho automático) e depois lista/edita/duplica/remove/restaura os itens do usuário, com abas por status e respostas rápidas a solicitações recebidas.

#### Conjunto 1 - O que precisa atualizar/melhorar

- Não existe contador de visualizações nem qualquer estatística do anúncio (quantas pessoas viram, quantas favoritaram) — o doador publica "no escuro".
- O rascunho é salvo só no `localStorage`; se trocar de aparelho o rascunho some.

#### Conjunto 1 - O que falta implementar

- "Impulsionar" ou destacar um item parado há muito tempo (nem que seja só reordenar na busca).
- Campo de quantidade (para itens em lote, tipo "5 potes de vidro") — hoje é sempre 1 unidade implícita.
- Vídeo curto ou mais de uma "capa" configurável para o anúncio.

---

## Conjunto 2 - Descoberta e detalhes

### Conjunto 2 - Telas

Home do doador, Home do receptor (`discoveryScreens.jsx`), Busca, Lista de itens, Detalhes do item (`itensDetalhes.jsx`).

### Conjunto 2 - O que faz

Vitrine de itens: atalhos na home, busca por texto/categoria/UF/cidade/geolocalização, lista com favoritos, e tela de detalhes com fotos, localização e botão de solicitar.

#### Conjunto 2 - O que precisa atualizar/melhorar

- Busca não tem ordenação (mais recentes, mais próximos, etc.) nem filtro por raio de distância — só liga/desliga "usar minha localização".
- O filtro "Troca" já existe (`tipoFiltro === "TROCAR"`), mas nada na tela de detalhes ou na solicitação trata isso de forma diferente de uma doação simples.

#### Conjunto 2 - O que falta implementar

- Botão de "denunciar anúncio" direto na tela de Detalhes (hoje só existe denúncia depois que já tem chat/agendamento em andamento).
- Paginação/scroll infinito de verdade na Lista de itens (hoje é `POR_PAGINA` fixo sem "carregar mais" visível em todo lugar — vale conferir).
- Comparar dois itens lado a lado (nice-to-have, não essencial).

---

## Conjunto 3 - Solicitação e chat

### Conjunto 3 - Telas

Inbox, Chat (`tradeScreens.jsx`), Solicitação, Agendamento, Confirmação de doação/recebimento, Dashboard de impacto (`negociacaoScreens.jsx`).

### Conjunto 3 - O que faz

Todo o ciclo: pedir o item, conversar, marcar retirada, confirmar com código, e no fim mostrar o impacto (kg evitado, selo, pontos).

### Tela de Solicitação de item

#### Conjunto 3 - O que precisa atualizar/melhorar

- **O maior gap real:** o app tem "Doar" **e** "Trocar" como tipo de publicação (isso já existe no cadastro e no filtro de busca), mas a tela de Solicitação trata os dois exatamente igual — não tem campo pra dizer "eu ofereço X em troca" quando o item é do tipo Troca. Hoje o receptor só manda uma mensagem de texto livre, então a intenção de troca se perde ou vira só um combinado no chat.
- O textarea da mensagem não mostra contador de caracteres (`0/500`), diferente de outras telas do app (Mural da comunidade, por exemplo, mostra).
- Quando o item já está "Em negociação" com outra pessoa, o app só mostra um aviso genérico — não dá pra "entrar na fila" nem ser avisado automaticamente se a negociação cair.

#### Conjunto 3 - Solicitação - O que falta implementar

- Campo opcional de "horário/dia preferido para retirada" já na hora de solicitar (hoje isso só é definido depois, na tela de Agendamento, exigindo mais uma etapa e mais um vai-e-volta pelo chat).
- Anexar uma foto na mensagem inicial da solicitação (o Chat já suporta imagem depois, mas a solicitação em si não).
- Para quem tem várias solicitações pendentes num mesmo item, o doador não vê nada tipo "3 pessoas já pediram esse item" — só descobre abrindo Gerenciar itens.

---

## Conjunto 4 - Perfil e reputação

### Conjunto 4 - Telas

Perfil, Perfil público, Reputação, Histórico (`accountScreens.jsx`), Avaliação (`avaliacao.jsx`), Moderação.

### Conjunto 4 - O que faz

Dados da conta, visão pública de reputação de outra pessoa, linha do tempo de atividades, avaliação pós-troca (estrelas + categorias), e formulário de denúncia.

#### Conjunto 4 - O que precisa atualizar/melhorar

- Reputação mostra a média e os selos, mas não dá pra filtrar/ordenar as avaliações recebidas (mais recentes, piores, por categoria).
- Não existe "bloquear usuário" em lugar nenhum — só denunciar. Se alguém for inconveniente, a única saída é arquivar o chat.

#### Conjunto 4 - O que falta implementar

- Resposta pública do avaliado a uma avaliação recebida (comum em apps de reputação, ajuda a contextualizar uma nota ruim).
- Selo de verificação (e-mail/celular verificado) aparecendo no Perfil público, não só internamente no `usuario.emailVerificado`.

---

## Conjunto 5 - Comunidades e favoritos

### Conjunto 5 - Telas

Comunidades (`communityScreens.jsx`), Favoritos (`favoritos.jsx`).

### Conjunto 5 - O que faz

Comunidades: buscar, participar/sair, e postar num mural por comunidade (com "apoiar" post). Favoritos: lista com seleção múltipla, remoção em lote e ordenação.

### Tela de Comunidades

#### Conjunto 5 - Comunidades - O que precisa atualizar/melhorar

- O mural (`MuralComunidade`) só tem "apoiar" (curtir) — não dá pra comentar num post, então cada publicação vira um mural de post soltos sem conversa.
- Não tem como remover ou editar o próprio post depois de publicado (nem denunciar o post de outra pessoa).
- Busca de comunidades é só por texto/categoria/cidade — não mostra nada tipo "comunidades ativas perto de você" ordenado por atividade recente.

#### Conjunto 5 - Comunidades - O que falta implementar

- **Criar uma comunidade nova.** Isso é o gap mais chamativo: hoje só dá pra participar de comunidades que já existem — não existe nem botão no front nem endpoint no `api.js` (`comunidades()`, `participarComunidade()`, `sairComunidade()`, `postsComunidade()`, `publicarNaComunidade()`, `apoiarPost()` — nenhum de criar). Precisaria de back e front.
- Notificação/indicador de "post novo" numa comunidade que você participa (hoje só aparece se você entrar e olhar).
- Anexar foto num post do mural (por exemplo, foto do item que virou doação, resultado de uma troca).

---

## Conjunto 6 - Endereço e segurança

### Conjunto 6 - Telas

Endereços salvos (`enderecos.jsx`), Segurança e privacidade, Termos, Privacidade, Notificações (`seguranca.jsx`).

### Conjunto 6 - O que faz

CRUD de endereços com busca automática por CEP, troca de senha, encerrar sessões, preferências de notificação (in-app e do navegador), documentos legais e central de notificações com abas.

#### Conjunto 6 - O que precisa atualizar/melhorar

- Endereço só pega coordenadas via CEP (ViaCEP) — não dá pra ajustar o pino manualmente num mapa, mesmo o app já usando `react-leaflet` em outra tela (o Chat, pra mostrar localização de retirada). Seria reaproveitar uma lib que já está no projeto.
- Segurança não tem lista de sessões ativas de verdade (só um botão "sair de todos os outros dispositivos" — não mostra quais dispositivos/quando).

#### Conjunto 6 - O que falta implementar

- Autenticação em duas etapas — já tem até o toggle desenhado na tela, mas desabilitado com aviso de "não disponível neste protótipo".
- Exportar/baixar meus dados (a Política de Privacidade menciona LGPD e "entre em contato com a equipe" pra isso, mas não tem nada self-service no app).
