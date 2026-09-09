# Reviva - Fluxos Principais do Usuário

## 1. Convenções

- **Doador**: usuário responsável por um anúncio; não é um tipo de conta separado.
- **Receptor**: usuário interessado em um anúncio.
- **Participante**: doador ou receptor vinculado à solicitação.
- **Item ativo**: item publicado, não removido, doado ou expirado.
- **Feedback**: mensagem de sucesso, erro, carregamento ou estado vazio apresentada pela interface.

## 2. Fluxo de primeiro acesso

```text
Abrir aplicação
  -> Tela de boas-vindas
  -> Escolher Entrar ou Criar conta
  -> Autenticar
  -> Home contextual
```

### Caminho alternativo

Se existir token válido em `localStorage`, o frontend consulta o usuário atual e abre a home sem solicitar credenciais. Se a consulta falhar por token expirado, remove a sessão e retorna à autenticação.

## 3. Fluxo de cadastro

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
9. Frontend salva o token, carrega `/api/usuarios/me` e abre a home.

### Falhas esperadas

- E-mail existente: informar conflito e permitir voltar ao login.
- CPF inválido: destacar o campo sem apagar os demais dados.
- CEP inválido: permitir preenchimento manual do endereço.
- API indisponível: informar que o backend não respondeu e manter o formulário.

## 4. Fluxo de login e logout

### Login

1. Usuário informa e-mail e senha.
2. Frontend envia `POST /api/auth/login` sem Authorization.
3. Backend busca conta por e-mail e compara senha com hash.
4. Em sucesso, retorna token e frontend grava `reviva_token`.
5. Frontend consulta perfil e abre home de doador ou receptor conforme a navegação local escolhida.
6. O usuário pode alternar o contexto de uso sem criar nova conta.

### Logout

1. Usuário escolhe Sair no perfil.
2. Interface solicita confirmação.
3. Ao confirmar, frontend remove token e dados de sessão local.
4. Aplicação retorna à tela de login.
5. Dados locais de favoritos e arquivamento podem ser preservados no dispositivo, pois não representam autenticação.

## 5. Fluxo de descoberta de item

```text
Home do receptor
  -> Categorias ou Buscar
  -> Texto, UF, cidade ou localização atual
  -> Lista de itens
  -> Detalhes do item
  -> Favoritar ou Enviar mensagem
```

1. A home carrega itens recentes e categorias.
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

## 6. Fluxo de cadastro de item

1. Usuário autenticado escolhe Cadastrar item.
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
13. Frontend informa sucesso e retorna para a home do doador ou gerenciador.

### Falhas esperadas

- Foto inválida: descartar somente a foto com erro e manter as demais.
- Endereço incompleto: impedir envio e indicar campos faltantes.
- Erro de servidor: manter dados preenchidos para nova tentativa.

## 7. Fluxo de gerenciamento e CRUD de item

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

## 8. Fluxo de conversa

```text
Detalhes do item
  -> Enviar mensagem
  -> Solicitação criada
  -> Inbox dos dois contextos
  -> Chat
  -> Texto, foto, localização ou agendamento
```

1. Receptor seleciona Enviar mensagem.
2. Frontend envia `POST /api/solicitacoes` com `itemId` e mensagem.
3. Backend cria solicitação, mensagem inicial e notificação para o doador.
4. Doador vê conversa em recebidas e na Inbox.
5. Ambos carregam histórico por `GET /api/solicitacoes/{id}/mensagens`.
6. Mensagem nova é enviada por `POST /api/solicitacoes/{id}/mensagens`.
7. Backend persiste e publica no tópico STOMP da solicitação.
8. O outro navegador recebe mensagem em tempo real.
9. Usuário pode arquivar Inbox por gesto de deslizar; o estado é local.

## 9. Fluxo de compartilhamento de localização

1. Usuário abre o menu de anexos no chat.
2. Escolhe compartilhar localização.
3. Navegador solicita permissão de geolocalização.
4. Frontend cria mensagem JSON com tipo `LOCALIZACAO`, latitude, longitude e horário.
5. Destinatário vê cartão com mapa Leaflet e OpenStreetMap.
6. O cartão usa zoom fixo 15 e não permite navegação interativa.
7. Usuário escolhe Abrir no Google Maps para abrir coordenada em nova aba.

## 10. Fluxo de agendamento e retirada

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

## 11. Fluxo de avaliação e impacto

1. Após conclusão, cada participante acessa Avaliar.
2. Escolhe nota de 1 a 5 e pode escrever comentário.
3. Frontend envia `POST /api/avaliacoes`.
4. Backend registra avaliação e recalcula média do avaliado.
5. Pontos recebidos atualizam o selo entre Bronze, Prata, Ouro e Esmeralda.
6. Dashboard apresenta itens doados, quilos evitados, pontos e nota média.

## 12. Fluxo de notificações

1. Home consulta `GET /api/notificacoes`.
2. Badge mostra notificações não lidas.
3. Usuário abre lista e seleciona uma notificação.
4. Frontend marca com `POST /api/notificacoes/{id}/lida`.
5. Se a notificação for de chat, navega para a solicitação relacionada.
6. Usuário pode limpar tudo ou excluir apenas expiradas.

## 13. Fluxo de denúncia

1. Usuário abre menu de segurança em item, conversa ou agendamento.
2. Escolhe motivo controlado: item divergente, comportamento inadequado, não comparecimento, suspeita de golpe ou outro.
3. Adiciona detalhes objetivos.
4. Frontend envia `POST /api/denuncias`.
5. Interface confirma recebimento sem expor ação de moderação.
6. A equipe responsável analisa a denúncia e decide medida apropriada.

## 14. Fluxos de erro e recuperação

- Token inválido: remover sessão e solicitar login novamente.
- API indisponível: apresentar mensagem e botão de repetição.
- Conflito de item: atualizar tela e informar que o item já foi agendado ou concluído.
- Permissão de GPS negada: permitir busca manual por UF e cidade.
- WebSocket desconectado: exibir estado discreto e manter envio REST com reconexão automática.
- Formulário inválido: destacar campo e preservar todo conteúdo já digitado.

## 15. Matriz de telas e ações

| Tela | Entrada principal | Dados consumidos | Ações primárias | Estado vazio |
| --- | --- | --- | --- | --- |
| Login | E-mail e senha | Resposta JWT | Entrar, ir para cadastro | Não se aplica |
| Cadastro | Dados pessoais e endereço | ViaCEP opcional | Criar conta, voltar ao login | Não se aplica |
| Home doador | Usuário, solicitações e notificações | `/usuarios/me`, `/solicitacoes/recebidas`, `/notificacoes` | Cadastrar item, gerenciar, abrir Inbox |
| Home receptor | Itens e notificações | `/itens`, `/notificacoes` | Buscar, abrir categoria, ver detalhe | Nenhum item publicado |
| Busca | Termo, UF, cidade, GPS | IBGE, reverse geocode e `/itens` | Buscar, limpar filtros, abrir item | Nenhum resultado |
| Detalhe | ID do item | `/itens/{id}`, reputação | Favoritar, enviar mensagem, denunciar | Item indisponível |
| Gerenciar itens | Conta autenticada | `/itens/meus` | Editar, remover, restaurar, marcar doado | Nenhum item próprio |
| Inbox | Conta autenticada | `/solicitacoes/conversas` | Abrir chat, arquivar | Nenhuma conversa |
| Chat | Solicitação | Mensagens, agendamento e WebSocket | Enviar, anexar, agendar, denunciar |
| Impacto | Conta autenticada | Perfil, avaliações e pontos | Consultar evolução | Sem atividade concluída |
| Comunidades | Nenhuma ou sessão | `/comunidades` | Ver e participar | Nenhuma comunidade |
| Notificações | Conta autenticada | `/notificacoes` | Marcar lida, limpar, abrir contexto | Nenhuma notificação |

## 16. Pré-condições, pós-condições e invariantes

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

## 17. Fluxo detalhado de estados da troca

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

## 18. Regras de comunicação da interface

- Antes de uma ação irreversível, explicar o objeto e a consequência: “Marcar jaqueta como doada?”.
- Depois de uma operação, informar o resultado e a próxima ação: “Item publicado. Ver anúncio”.
- Em erro de validação, apontar campo e solução, sem resetar o formulário.
- Em erro de autorização, não sugerir que o usuário tente manipular outro ID.
- Em item removido ou doado, explicar por que o botão de mensagem não está disponível.
- Em fluxo de localização, pedir permissão somente no momento em que o usuário escolhe usar GPS.

## 19. Cenário alternativo completo: troca cancelada

1. Usuário A e usuário B conversam sobre um item.
2. Um participante cria agendamento.
3. Antes da retirada, um participante escolhe Cancelar.
4. Interface pede confirmação e informa que a troca não será concluída.
5. Backend marca agendamento e solicitação como cancelados.
6. O item pode voltar a receber interesse conforme a regra de disponibilidade.
7. O histórico da conversa permanece para auditoria e segurança.

Nenhum ponto, avaliação ou quilo evitado é contabilizado nesse cenário.
