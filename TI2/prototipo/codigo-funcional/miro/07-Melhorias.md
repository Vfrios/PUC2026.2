# Levantamento de melhorias — Reviva

Análise feita em cima do código real de cada conjunto (não só dos nomes das telas), com foco especial nas telas de **Comunidades** e **Solicitação de item**.

---

## Publicação e gestão

### Telas de publicação e gestão

Cadastro/edição de item (`cadastroItem.jsx`) e Gerenciar itens (`gerenciarItens.jsx`).

### Funcionalidades de publicação e gestão

Cria/edita anúncio (fotos, categoria, estado, endereço, rascunho automático) e depois lista/edita/duplica/remove/restaura os itens do usuário, com abas por status e respostas rápidas a solicitações recebidas.

#### Melhorias em publicação e gestão

- Não existe contador de visualizações nem qualquer estatística do anúncio (quantas pessoas viram, quantas favoritaram) — o doador publica "no escuro".
- O rascunho é salvo só no `localStorage`; se trocar de aparelho o rascunho some.

#### Funcionalidades futuras de publicação e gestão

- "Impulsionar" ou destacar um item parado há muito tempo (nem que seja só reordenar na busca).
- Campo de quantidade (para itens em lote, tipo "5 potes de vidro") — hoje é sempre 1 unidade implícita.
- Vídeo curto ou mais de uma "capa" configurável para o anúncio.

---

## Descoberta e detalhes

### Telas de descoberta e detalhes

Home do doador, Home do receptor (`discoveryScreens.jsx`), Busca, Lista de itens, Detalhes do item (`itensDetalhes.jsx`).

### Funcionalidades de descoberta e detalhes

Vitrine de itens: atalhos na home, busca por texto/categoria/UF/cidade/geolocalização, lista com favoritos, e tela de detalhes com fotos, localização e botão de solicitar.

#### Melhorias em descoberta e detalhes

- Busca não tem ordenação (mais recentes, mais próximos, etc.) nem filtro por raio de distância — só liga/desliga "usar minha localização".
- O filtro "Troca" já existe (`tipoFiltro === "TROCAR"`), mas nada na tela de detalhes ou na solicitação trata isso de forma diferente de uma doação simples.

#### Funcionalidades futuras de descoberta e detalhes

- Botão de "denunciar anúncio" direto na tela de Detalhes (hoje só existe denúncia depois que já tem chat/agendamento em andamento).
- Paginação/scroll infinito de verdade na Lista de itens (hoje é `POR_PAGINA` fixo sem "carregar mais" visível em todo lugar — vale conferir).
- Comparar dois itens lado a lado (nice-to-have, não essencial).

---

## Solicitação e chat

### Telas de solicitação e chat

Inbox, Chat (`tradeScreens.jsx`), Solicitação, Agendamento, Confirmação de doação/recebimento, Dashboard de impacto (`negociacaoScreens.jsx`).

### Funcionalidades de solicitação e chat

Todo o ciclo: pedir o item, conversar, marcar retirada, confirmar com código, e no fim mostrar o impacto (kg evitado, selo, pontos).

### Tela de Solicitação de item

#### Melhorias em solicitação e chat

- **O maior gap real:** o app tem "Doar" **e** "Trocar" como tipo de publicação (isso já existe no cadastro e no filtro de busca), mas a tela de Solicitação trata os dois exatamente igual — não tem campo pra dizer "eu ofereço X em troca" quando o item é do tipo Troca. Hoje o receptor só manda uma mensagem de texto livre, então a intenção de troca se perde ou vira só um combinado no chat.
- O textarea da mensagem não mostra contador de caracteres (`0/500`), diferente de outras telas do app (Mural da comunidade, por exemplo, mostra).
- Quando o item já está "Em negociação" com outra pessoa, o app só mostra um aviso genérico — não dá pra "entrar na fila" nem ser avisado automaticamente se a negociação cair.

#### Funcionalidades futuras de solicitação

- Campo opcional de "horário/dia preferido para retirada" já na hora de solicitar (hoje isso só é definido depois, na tela de Agendamento, exigindo mais uma etapa e mais um vai-e-volta pelo chat).
- Anexar uma foto na mensagem inicial da solicitação (o Chat já suporta imagem depois, mas a solicitação em si não).
- Para quem tem várias solicitações pendentes num mesmo item, o doador não vê nada tipo "3 pessoas já pediram esse item" — só descobre abrindo Gerenciar itens.

---

## Perfil e reputação

### Telas de perfil e reputação

Perfil, Perfil público, Reputação, Histórico (`accountScreens.jsx`), Avaliação (`avaliacao.jsx`), Moderação.

### Funcionalidades de perfil e reputação

Dados da conta, visão pública de reputação de outra pessoa, linha do tempo de atividades, avaliação pós-troca (estrelas + categorias), e formulário de denúncia.

#### Melhorias em perfil e reputação

- Reputação mostra a média e os selos, mas não dá pra filtrar/ordenar as avaliações recebidas (mais recentes, piores, por categoria).
- Não existe "bloquear usuário" em lugar nenhum — só denunciar. Se alguém for inconveniente, a única saída é arquivar o chat.

#### Funcionalidades futuras de perfil e reputação

- Resposta pública do avaliado a uma avaliação recebida (comum em apps de reputação, ajuda a contextualizar uma nota ruim).
- Selo de verificação (e-mail/celular verificado) aparecendo no Perfil público, não só internamente no `usuario.emailVerificado`.

---

## Comunidades e favoritos

### Telas de comunidades e favoritos

Comunidades (`communityScreens.jsx`), Favoritos (`favoritos.jsx`).

### Funcionalidades de comunidades e favoritos

Comunidades: buscar, participar/sair, e postar num mural por comunidade (com "apoiar" post). Favoritos: lista com seleção múltipla, remoção em lote e ordenação.

### Tela de Comunidades

Comunidades
Criar comunidade — o gap mais óbvio. Hoje só existe participar/sair de comunidades já criadas; não tem botão no front nem endpoint no api.js. Precisaria de um form simples (nome, categoria, cidade/bairro) + criarComunidade().
Comentar em post do mural — hoje o post só tem "apoiar" (like). Virar uma conversa de verdade no mural muda bastante a sensação de comunidade ativa.
Denunciar post / bloquear quem postou — dá pra plugar direto no modal de denúncia que você vai construir, só trocando o alvo (post em vez de usuário do chat).
Editar/excluir o próprio post — hoje, uma vez publicado, não tem volta.
Fixar post — pra ONGs/admin de comunidade destacarem um aviso (tipo mutirão) no topo do mural.
Lista de membros da comunidade — quem participa, quem criou/administra.
Reaproveitar uma coisa curiosa que achei: existe uma constante COMMUNITY_POSTS no shared.jsx (com posts mockados tipo "Mutirão de doação de agasalhos...") que é importada mas nunca usada em lugar nenhum — parece que o plano original era ter um mini-feed de comunidade na Home. Dá pra transformar isso num widget real puxando postsComunidade() de verdade.

### Favoritos

Coleções/listas — em vez de uma lista única de favoritos, pooder criar um tipo "Pra cozinha", "Pro bebê", etc.
Nota pessoal no item — campo tipo "perguntar sobre o tamanho" só visível pra você.
Aviso quando o item favoritado mudar de status — foi reservado, foi doado, teve o valor/condição alterada. Hoje você só descobre abrindo de novo.
Compartilhar um favorito ou a lista inteira com alguém (já existe helper compartilhar() usado em outras telas, é só reaproveitar).
Favoritar comunidade, não só item — hoje o conceito de favorito só existe pro lado de item.

---

## Endereço e segurança

### Telas de endereço e segurança

Endereços salvos (`enderecos.jsx`), Segurança e privacidade, Termos, Privacidade, Notificações (`seguranca.jsx`).

### Funcionalidades de endereço e segurança

CRUD de endereços com busca automática por CEP, troca de senha, encerrar sessões, preferências de notificação (in-app e do navegador), documentos legais e central de notificações com abas.

#### Melhorias em endereço e segurança

- Endereço só pega coordenadas via CEP (ViaCEP) — não dá pra ajustar o pino manualmente num mapa, mesmo o app já usando `react-leaflet` em outra tela (o Chat, pra mostrar localização de retirada). Seria reaproveitar uma lib que já está no projeto.
- Segurança não tem lista de sessões ativas de verdade (só um botão "sair de todos os outros dispositivos" — não mostra quais dispositivos/quando).

#### Funcionalidades futuras de endereço e segurança

- Autenticação em duas etapas — já tem até o toggle desenhado na tela, mas desabilitado com aviso de "não disponível neste protótipo".
- Exportar/baixar meus dados (a Política de Privacidade menciona LGPD e "entre em contato com a equipe" pra isso, mas não tem nada self-service no app).
