# Reviva - Fluxos Principais do Usuário

## 1. Convenções e regra principal de conta

- **Conta Reviva**: existe uma única conta por pessoa. Não há cadastro separado de doador e receptor.
- **Doador**: papel assumido pela conta que publicou um item em uma transação.
- **Receptor**: papel assumido pela conta que demonstrou interesse em um item de outra pessoa.
- A mesma conta pode publicar itens, receber mensagens sobre seus anúncios, procurar itens de outras pessoas, solicitar uma retirada, doar e receber em momentos diferentes ou até em paralelo.
- O papel é definido pelo contexto do item e da conversa, não por um campo fixo do usuário, seleção obrigatória no cadastro ou segunda conta.
- **Home principal**: tela autenticada única, com atalhos para publicar, descobrir, mensagens, comunidades, impacto e perfil.
- **Contexto da transação**: em uma conversa, a interface identifica se a conta é doadora ou receptora daquele item e mostra as ações correspondentes.
- **Participante**: doador ou receptor vinculado à solicitação.
- **Item ativo**: item publicado, não removido, doado ou expirado.
- **Feedback**: mensagem de sucesso, erro, carregamento ou estado vazio apresentada pela interface.

## 2. Navegação principal: cinco telas

Depois do login, a conta usa uma única navegação inferior. Doador e receptor não são perfis separados: a mesma pessoa pode buscar um item, iniciar uma troca, publicar outro item e acompanhar tudo pela mesma conta.

| Nº | Tela principal | Função no produto | Ações mais importantes |
| --- | --- | --- | --- |
| 1 | **Início** | Resumo personalizado e ponto de entrada para todas as tarefas | Ver novidades, abrir notificações, continuar conversas, buscar e acessar atalhos |
| 2 | **Buscar** | Descobrir itens publicados por outras pessoas | Filtrar, abrir detalhes, favoritar e iniciar conversa |
| 3 | **Doar** | Publicar um item para doação ou troca | Adicionar fotos, informar dados, endereço e publicar |
| 4 | **Minhas trocas** | Acompanhar conversas, agendamentos, retiradas e histórico | Abrir chat, confirmar etapas, cancelar, denunciar e avaliar |
| 5 | **Perfil** | Administrar a conta e consultar reputação e impacto | Editar dados, ver itens próprios, pontos, comunidades e sair |

As telas secundárias são abertas a partir dessas cinco: Login e Cadastro vêm antes da navegação; detalhes e filtros partem de Buscar; formulário de edição parte de Doar ou Perfil; Chat e Agendamento partem de Minhas trocas; Avaliação e Notificações podem ser abertas por Início, Minhas trocas ou Perfil.

### Fluxo geral entre as cinco telas

```text
[Login/Cadastro]
     |
     v
  [Início] <-------------------------------+
    |  \                                   |
    |   \                                  |
    v    v                                 |
 [Buscar] [Doar]                             |
  |       |                                |
  v       v                                |
[Detalhe] [Item publicado]                   |
  |       |                                |
  +---+---+                                |
    v                                    |
 [Minhas trocas] <--> [Chat/Agendamento] ----+
    |
    v
[Retirada] -> [Avaliação e impacto]
    ^             |
    +-------- [Perfil]
```

Uma troca só começa quando o usuário interessado envia uma mensagem sobre um item. Publicar um item não cria automaticamente uma troca nem exige escolher “doador” ou “receptor”.

### 2.1 Tela 1: Início

**Objetivo:** ser o ponto de entrada diário da conta e mostrar o que merece atenção agora.

**Entrada:** após login, cadastro e onboarding; também pelo botão Início da navegação inferior.

**Fluxo principal:**

1. O sistema valida o token e consulta os dados básicos da conta.
2. Exibe saudação, notificações não lidas e resumo de impacto quando houver atividade concluída.
3. Mostra atalhos para **Buscar**, **Doar**, **Minhas trocas** e **Perfil**.
4. Exibe itens recentes ou categorias para iniciar uma busca sem sair da tela.
5. Exibe conversas ou agendamentos pendentes para o usuário continuar de onde parou.
6. Ao selecionar um item, segue para **Buscar > Detalhes**.
7. Ao selecionar uma conversa, segue para **Minhas trocas > Chat**.
8. Ao selecionar uma pendência, abre diretamente a etapa necessária de **Minhas trocas**, como confirmar agendamento ou retirada.

**Conexões:** é a origem de todos os fluxos. Depois de publicar em **Doar**, o usuário retorna ao Início; depois de concluir uma troca, o resumo de impacto é atualizado aqui; dados da conta são consultados em **Perfil**.

**Estados:** carregando resumo; sem atividade, com convite para buscar ou publicar; notificações pendentes; erro de rede com tentativa novamente; sessão expirada com retorno ao Login.

### 2.2 Tela 2: Buscar

**Objetivo:** permitir que qualquer usuário autenticado encontre algo que deseja receber ou trocar.

**Entrada:** botão Buscar no Início, navegação inferior, categoria ou item recente.

**Fluxo principal:**

1. O usuário informa termo, categoria, tipo de publicação, estado, cidade ou localização.
2. Pode usar GPS para sugerir a região, sem obrigação de conceder permissão.
3. O sistema aplica os filtros e apresenta a lista de itens ativos.
4. O usuário pode limpar filtros, repetir a busca, favoritar ou abrir um item.
5. Em **Detalhes**, consulta fotos, descrição, conservação, localização aproximada e reputação de quem publicou.
6. Ao tocar em **Enviar mensagem**, a conta assume o papel de receptora naquela transação e uma conversa é criada.
7. A conversa aparece em **Minhas trocas**; o usuário pode continuar navegando ou abrir o Chat imediatamente.

**Conexões:** Buscar não altera o perfil da conta. A ação **Enviar mensagem** cria a ligação com **Minhas trocas**. Se o usuário decidir publicar outro item, vai para **Doar** sem perder favoritos ou a conversa atual.

**Estados:** busca inicial; carregando; nenhum resultado com ação para remover filtros; item indisponível, expirado ou já doado; falha de localização com busca manual; erro da API com tentativa novamente.

### 2.3 Tela 3: Doar

**Objetivo:** transformar um objeto em anúncio de doação ou troca.

**Entrada:** botão Doar na navegação inferior, atalho no Início ou ação de publicar em Perfil.

**Fluxo principal:**

1. O usuário escolhe se quer **Doar** ou **Trocar** o item; isso define o anúncio, não o tipo de conta.
2. Adiciona fotos, título, descrição, categoria, estado de conservação e peso aproximado.
3. Informa CEP, número e complemento; o sistema tenta completar bairro, cidade e UF.
4. Confere a prévia do anúncio e corrige os campos necessários.
5. Confirma a publicação; o backend associa o anúncio à conta autenticada e marca o item como ativo.
6. O anúncio passa a aparecer em **Buscar** para outras contas.
7. O usuário retorna ao Início com confirmação e pode acompanhar mensagens em **Minhas trocas**.

**Edição:** pelo próprio anúncio em **Perfil > Meus itens** ou por uma ação de gerenciamento, o usuário altera os dados e renova a validade conforme a regra do produto.

**Conexões:** Doar alimenta a lista de **Buscar** e gera o lado do anunciante nas conversas de **Minhas trocas**. A mesma conta pode entrar em Buscar logo depois de publicar.

**Estados:** formulário vazio; preenchimento; foto processando; endereço incompleto; envio bloqueado durante publicação; sucesso com opção de ver anúncio; erro preservando os dados digitados.

### 2.4 Tela 4: Minhas trocas

**Objetivo:** concentrar tudo o que acontece depois que existe interesse em um item.

**Entrada:** navegação inferior, atalho do Início, notificação ou mensagem recebida.

**Organização:** a lista reúne conversas iniciadas pelo usuário e conversas recebidas sobre anúncios dele. O rótulo deve explicar o contexto, por exemplo **Você demonstrou interesse** ou **Interesse no seu item**, sem criar dois perfis.

**Fluxo principal:**

1. O usuário abre uma conversa vinculada a um item.
2. O Chat mostra a pessoa, o anúncio, o status do item e o histórico.
3. Os participantes enviam mensagens, localização e combinam a retirada.
4. Um participante cria o agendamento com data, horário e local.
5. O outro confirma, solicita alteração ou cancela antes da retirada.
6. Após confirmação, a tela mostra a próxima ação: gerar código, apresentar QR Code ou confirmar manualmente.
7. As duas confirmações concluem a retirada, atualizam o item e liberam a avaliação.
8. Cada participante avalia a experiência; a troca permanece no histórico.

**Conexões:** recebe solicitações criadas em **Buscar**; recebe notificações originadas em **Início**; abre dados da conta em **Perfil** quando o usuário consulta reputação; após conclusão, envia pontos e impacto para **Perfil** e **Início**.

**Estados:** nenhuma troca; conversa nova; mensagem não lida; agendamento aguardando confirmação; retirada pronta; concluída; cancelada; problema reportado; conexão WebSocket indisponível com envio REST e reconexão.

### 2.5 Tela 5: Perfil

**Objetivo:** reunir identidade, reputação, impacto, anúncios próprios e configurações da conta.

**Entrada:** navegação inferior, avatar ou ação de conta no Início.

**Fluxo principal:**

1. Exibe nome, foto, reputação, selo, pontos, itens doados e quilos de material reutilizado.
2. Permite editar foto e dados pessoais sem criar outro perfil.
3. Abre **Meus itens** para consultar anúncios ativos, expirados, removidos ou concluídos.
4. Permite editar, restaurar, remover ou marcar um anúncio como doado quando permitido.
5. Abre favoritos salvos localmente, comunidades e histórico.
6. Mostra indicadores de atividade como doador e como receptor, sem separar a conta em duas áreas de autenticação.
7. Permite consultar reputação, notificações e sair da sessão.

**Conexões:** Perfil leva para **Doar** quando o usuário quer publicar; leva para **Minhas trocas** quando acessa histórico; leva para **Buscar** ao abrir favoritos; retorna ao Início após alterações salvas.

**Estados:** perfil carregando; dados incompletos; sem anúncios próprios; sem histórico; atualização salva; falha ao salvar mantendo os valores preenchidos; logout confirmado retornando ao Login.

### Regra de leitura do fluxo

Quando o texto disser “doador” ou “receptor”, trata-se apenas do papel da conta naquela operação. Por exemplo, na tela 5 a mesma pessoa pode tocar em **Publicar item** e se tornar doadora daquele anúncio; depois pode tocar em **Buscar** e se tornar receptora de outro item. A conta, o login, o perfil, a reputação e o histórico continuam sendo os mesmos.

## 3. Fluxo de primeiro acesso e entrada nas cinco telas

```text
Abrir aplicação
  -> Tela de Login ou Cadastro
  -> Onboarding, quando for o primeiro acesso
  -> Tela principal: Início
  -> Navegação: Buscar, Doar, Minhas trocas ou Perfil
```

### Caminho alternativo

Se existir token válido em `localStorage`, o frontend consulta o usuário atual e abre a home sem solicitar credenciais. Se a consulta falhar por token expirado, remove a sessão e retorna à autenticação.

## 4. Fluxo da tela 3: cadastro de conta única

### Pré-condições

O visitante não precisa estar autenticado. O navegador deve permitir entrada de texto e, opcionalmente, geolocalização para completar endereço.

### Passo a passo

1. Usuário seleciona Criar conta.
2. Preenche nome, e-mail, telefone, CPF, senha, CEP, número e complemento.
3. O frontend aplica máscara de CPF e CEP e valida campos obrigatórios.
4. O CEP é consultado para preencher bairro, cidade, UF e coordenadas quando possível.
5. Usuário corrige manualmente bairro ou cidade se a consulta externa não responder.
6. Frontend envia `POST /api/auth/registrar`.
7. Backend normaliza CPF e CEP, valida formato e verifica duplicidade.
8. Backend grava apenas o hash da senha e retorna JWT.
9. Frontend salva o token, carrega `/api/usuarios/me` e abre o onboarding.
10. Ao concluir ou pular o onboarding, a conta chega à home única e pode publicar e receber itens sem escolher um perfil permanente.

### Falhas esperadas

- E-mail existente: informar conflito e permitir voltar ao login.
- CPF inválido: destacar o campo sem apagar os demais dados.
- CEP inválido: permitir preenchimento manual do endereço.
- API indisponível: informar que o backend não respondeu e manter o formulário.

## 5. Fluxo da tela 2: login e logout

### Login

1. Usuário informa e-mail e senha.
2. Frontend envia `POST /api/auth/login` sem Authorization.
3. Backend busca conta por e-mail e compara senha com hash.
4. Em sucesso, retorna token e frontend grava `reviva_token`.
5. Frontend consulta o perfil e abre a home única.
6. O usuário escolhe a próxima ação: publicar um item, buscar itens ou abrir uma conversa. Essa escolha define o contexto da operação, não altera o perfil da conta.

### Logout

1. Usuário escolhe Sair no perfil.
2. Interface solicita confirmação.
3. Ao confirmar, frontend remove token e dados de sessão local.
4. Aplicação retorna à tela de login.
5. Dados locais de favoritos e arquivamento podem ser preservados no dispositivo, pois não representam autenticação.

## 6. Fluxo da tela 5 para as telas 6 e 7: descobrir e demonstrar interesse

```text
Home única, no contexto de descoberta
  -> Categorias ou Buscar
  -> Texto, UF, cidade ou localização atual
  -> Lista de itens
  -> Detalhes do item
  -> Favoritar ou Enviar mensagem
```

1. A home única carrega atalhos de publicação, itens recentes, categorias e conversas.
2. O usuário abre Busca ou escolhe uma categoria.
3. Pode digitar termo e pressionar Enter ou Buscar.
4. Pode selecionar UF e cidade com dados do IBGE.
5. Pode autorizar GPS; o navegador retorna coordenadas e a API converte em região.
6. Frontend chama `GET /api/itens` com os filtros preenchidos.
7. A API retorna somente itens disponíveis e não expirados.
8. O usuário abre detalhe com fotos, descrição, conservação, localização aproximada, reputação e selo do anunciante.
9. Favorito é salvo localmente e pode ser removido sem chamada de API.

### Estados da tela

- Carregando: skeleton ou indicador de busca.
- Sem resultado: mensagem clara e ação para remover filtros.
- Falha: erro legível e botão de tentar novamente.
- Resultado: grade responsiva com distância quando coordenadas estiverem disponíveis.

## 7. Fluxo das telas 5 e 8: publicar item como doador daquela transação

1. Usuário autenticado escolhe Cadastrar item na home única ou em Meus itens.
2. Seleciona Doar ou Trocar.
3. Seleciona categoria e conservação.
4. Informa título e descrição.
5. Informa peso aproximado; se deixar vazio, sistema usa estimativa da categoria.
6. Adiciona até três fotos pela câmera ou galeria.
7. Frontend comprime cada imagem para aproximadamente 900 px e JPEG antes do envio.
8. Informa CEP, número e complemento.
9. CEP preenche endereço e coordenadas; usuário pode corrigir bairro e cidade.
10. Frontend valida título, número, bairro e cidade.
11. Envia `POST /api/itens`.
12. Backend associa usuário autenticado, marca item como `ATIVO` e define validade de 60 dias.
13. Frontend informa sucesso e retorna para a home única ou para Meus itens.
14. A conta passa a ser doadora somente em relação a esse anúncio; continua podendo buscar e solicitar outros itens normalmente.

### Falhas esperadas

- Foto inválida: descartar somente a foto com erro e manter as demais.
- Endereço incompleto: impedir envio e indicar campos faltantes.
- Erro de servidor: manter dados preenchidos para nova tentativa.

## 8. Fluxo da tela 9: gerenciamento dos próprios itens

### Listar

1. Usuário abre Gerenciar itens.
2. Frontend chama `GET /api/itens/meus`.
3. Exibe itens ativos, expirados, removidos e doados com estados visuais distintos.

### Editar

1. Usuário abre menu Editar em item próprio.
2. Formulário carrega dados existentes.
3. Usuário altera campos e confirma.
4. Frontend envia `PUT /api/itens/{id}`.
5. Backend verifica propriedade, atualiza campos e renova validade por 60 dias.
6. Interface confirma atualização.

### Remover

1. Usuário escolhe Remover.
2. Interface confirma ação.
3. Frontend envia `DELETE /api/itens/{id}`.
4. Backend altera status para `REMOVIDO`.
5. Item deixa de aparecer na busca pública.

### Restaurar

1. Usuário escolhe Restaurar item removido ou expirado.
2. Frontend envia `POST /api/itens/{id}/restaurar`.
3. Backend valida estado e propriedade, marca `ATIVO` e renova por 60 dias.

### Marcar como doado

1. Usuário escolhe Doação concluída.
2. Interface confirma a ação.
3. Frontend envia `POST /api/itens/{id}/doado`.
4. Backend marca `DOADO`, incrementa itens doados, impacto e pontuação uma única vez.

## 9. Fluxo das telas 7, 10 e 11: conversa entre dois papéis da mesma conta

```text
Detalhes do item
  -> Enviar mensagem
  -> Solicitação criada
  -> Inbox único dos dois contextos
  -> Chat
  -> Texto, foto, localização ou agendamento
```

1. Receptor seleciona Enviar mensagem.
2. Frontend envia `POST /api/solicitacoes` com `itemId` e mensagem.
3. Backend cria solicitação, mensagem inicial e notificação para o doador.
4. O dono do anúncio vê a conversa recebida na Inbox; o usuário interessado vê a mesma conversa como iniciada.
5. Ambos carregam histórico por `GET /api/solicitacoes/{id}/mensagens`.
6. Mensagem nova é enviada por `POST /api/solicitacoes/{id}/mensagens`.
7. Backend persiste e publica no tópico STOMP da solicitação.
8. O outro navegador recebe mensagem em tempo real.
9. Usuário pode arquivar Inbox por gesto de deslizar; o estado é local.

## 10. Fluxo da tela 11: compartilhamento de localização

1. Usuário abre o menu de anexos no chat.
2. Escolhe compartilhar localização.
3. Navegador solicita permissão de geolocalização.
4. Frontend cria mensagem JSON com tipo `LOCALIZACAO`, latitude, longitude e horário.
5. Destinatário vê cartão com mapa Leaflet e OpenStreetMap.
6. O cartão usa zoom fixo 15 e não permite navegação interativa.
7. Usuário escolhe Abrir no Google Maps para abrir coordenada em nova aba.

## 11. Fluxo das telas 12 e 13: agendamento, retirada e conclusão

### Criar e confirmar data

1. Um participante escolhe Agendar no chat.
2. Informa data, horário e local de encontro.
3. Frontend envia `POST /api/agendamentos`.
4. Backend valida participação, ausência de troca ativa concorrente e status não cancelado.
5. Evento `AGENDAMENTO_CRIADO` é persistido como mensagem e publicado no WebSocket.
6. Receptor confirma com `POST /api/agendamentos/{id}/confirmar-agendamento`.
7. Evento `AGENDAMENTO_CONFIRMADO` atualiza o chat.

### Confirmar retirada por código

1. Doador solicita geração do código.
2. Backend confirma que o receptor já confirmou o agendamento.
3. Backend gera token numérico associado ao item.
4. Doador exibe QR Code ou informa código no encontro.
5. Participante escaneia ou envia `POST /api/agendamentos/{id}/confirmar-qrcode?token=...`.
6. Backend valida token e registra as duas confirmações.
7. Agendamento passa a `CONCLUIDO`, item passa a `DOADO` e indicadores são atualizados.
8. Evento `RETIRADA_CONFIRMADA` aparece no chat.

### Confirmar manualmente

Cada lado pode usar seu botão de confirmação. Quando os timestamps do doador e do receptor estiverem presentes, o backend executa a mesma conclusão transacional.

### Cancelar ou reportar

- Cancelar usa `POST /api/agendamentos/solicitacao/{id}/cancelar`; troca concluída não pode ser cancelada.
- Reportar problema usa `POST /api/agendamentos/{id}/reportar-problema` e preserva o histórico para tratamento.

## 12. Fluxo da tela 14: avaliação, reputação e impacto

1. Após conclusão, cada participante acessa Avaliar.
2. Escolhe nota de 1 a 5 e pode escrever comentário.
3. Frontend envia `POST /api/avaliacoes`.
4. Backend registra avaliação e recalcula média do avaliado.
5. Pontos recebidos atualizam o selo entre Bronze, Prata, Ouro e Esmeralda.
6. Dashboard apresenta itens doados, quilos evitados, pontos e nota média.

## 13. Fluxo da tela 17: notificações

1. Home consulta `GET /api/notificacoes`.
2. Badge mostra notificações não lidas.
3. Usuário abre lista e seleciona uma notificação.
4. Frontend marca com `POST /api/notificacoes/{id}/lida`.
5. Se a notificação for de chat, navega para a solicitação relacionada.
6. Usuário pode limpar tudo ou excluir apenas expiradas.

## 14. Fluxo da tela 18: denúncia

1. Usuário abre menu de segurança em item, conversa ou agendamento.
2. Escolhe motivo controlado: item divergente, comportamento inadequado, não comparecimento, suspeita de golpe ou outro.
3. Adiciona detalhes objetivos.
4. Frontend envia `POST /api/denuncias`.
5. Interface confirma recebimento sem expor ação de moderação.
6. A equipe responsável analisa a denúncia e decide medida apropriada.

## 15. Fluxos de erro e recuperação

- Token inválido: remover sessão e solicitar login novamente.
- API indisponível: apresentar mensagem e botão de repetição.
- Conflito de item: atualizar tela e informar que o item já foi agendado ou concluído.
- Permissão de GPS negada: permitir busca manual por UF e cidade.
- WebSocket desconectado: exibir estado discreto e manter envio REST com reconexão automática.
- Formulário inválido: destacar campo e preservar todo conteúdo já digitado.

## 16. Matriz de telas e ações

| Tela | Entrada principal | Dados consumidos | Ações primárias | Estado vazio |
| --- | --- | --- | --- | --- |
| Login | E-mail e senha | Resposta JWT | Entrar, ir para cadastro | Não se aplica |
| Cadastro | Dados pessoais e endereço | ViaCEP opcional | Criar conta, voltar ao login | Não se aplica |
| Home única | Usuário, itens, solicitações e notificações | `/usuarios/me`, `/itens`, `/solicitacoes/conversas`, `/notificacoes` | Publicar, buscar, abrir Inbox, consultar impacto e perfil | Nenhum item ou conversa |
| Busca | Termo, UF, cidade, GPS | IBGE, reverse geocode e `/itens` | Buscar, limpar filtros, abrir item | Nenhum resultado |
| Detalhe | ID do item | `/itens/{id}`, reputação | Favoritar, enviar mensagem, denunciar | Item indisponível |
| Gerenciar itens | Conta autenticada | `/itens/meus` | Editar, remover, restaurar, marcar doado | Nenhum item próprio |
| Inbox | Conta autenticada | `/solicitacoes/conversas` | Abrir chat, arquivar | Nenhuma conversa |
| Chat | Solicitação | Mensagens, agendamento e WebSocket | Enviar, anexar, agendar, denunciar |
| Impacto | Conta autenticada | Perfil, avaliações e pontos | Consultar evolução | Sem atividade concluída |
| Comunidades | Nenhuma ou sessão | `/comunidades` | Ver e participar | Nenhuma comunidade |
| Notificações | Conta autenticada | `/notificacoes` | Marcar lida, limpar, abrir contexto | Nenhuma notificação |

## 17. Pré-condições, pós-condições e invariantes

| Operação | Pré-condição | Pós-condição |
| --- | --- | --- |
| Publicar item | Sessão válida e campos obrigatórios preenchidos | Item próprio `ATIVO`, validade definida e disponível na busca |
| Editar item | Item pertence ao usuário | Dados atualizados e validade renovada |
| Iniciar conversa | Item existe e receptor está autenticado | Solicitação, mensagem inicial e notificação persistidas |
| Enviar mensagem | Usuário participa da solicitação | Mensagem persistida e evento publicado |
| Agendar retirada | Participante, troca não cancelada e item sem troca ativa | Um agendamento associado à solicitação |
| Gerar código | Doador autenticado e receptor confirmou agendamento | Token associado ao item disponível para retirada |
| Concluir retirada | Confirmações válidas ou QR Code válido | Item doado, agendamento concluído, pontos e impacto atualizados |
| Avaliar | Agendamento concluído e participante elegível | Avaliação persistida e reputação recalculada |

Invariantes: uma conta não pode ler conversa de que não participa; um item não pode ter duas trocas ativas; conclusão não pode duplicar contadores; dados privados não aparecem em resumo público.

## 18. Fluxo detalhado de estados da troca

```text
[Item ATIVO]
  |
  | receptor envia mensagem
  v
[Solicitacao ACEITA]
  |
  | participante agenda
  v
[Agendamento CONFIRMADO]
  |
  | receptor confirma data/local
  v
[Código disponível]
  |
  | confirmação manual dupla ou QR válido
  v
[Retirada CONCLUIDA]
  |
  +--> [Item DOADO] + pontos + impacto + avaliação
```

Rotas alternativas: cancelamento leva a `CANCELADO`; incidente leva a `PROBLEMA_REPORTADO`; token inválido não muda nenhum estado.

## 19. Regras de comunicação da interface

- Antes de uma ação irreversível, explicar o objeto e a consequência: “Marcar jaqueta como doada?”.
- Depois de uma operação, informar o resultado e a próxima ação: “Item publicado. Ver anúncio”.
- Em erro de validação, apontar campo e solução, sem resetar o formulário.
- Em erro de autorização, não sugerir que o usuário tente manipular outro ID.
- Em item removido ou doado, explicar por que o botão de mensagem não está disponível.
- Em fluxo de localização, pedir permissão somente no momento em que o usuário escolhe usar GPS.

## 20. Cenário alternativo completo: troca cancelada

1. Usuário A e usuário B conversam sobre um item.
2. Um participante cria agendamento.
3. Antes da retirada, um participante escolhe Cancelar.
4. Interface pede confirmação e informa que a troca não será concluída.
5. Backend marca agendamento e solicitação como cancelados.
6. O item pode voltar a receber interesse conforme a regra de disponibilidade.
7. O histórico da conversa permanece para auditoria e segurança.

Nenhum ponto, avaliação ou quilo evitado é contabilizado nesse cenário.
