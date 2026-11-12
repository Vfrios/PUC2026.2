# Reviva - Requisitos Funcionais e Não Funcionais

## 1. Requisitos funcionais

### RF-01 - Cadastro e autenticação

1. O sistema deve permitir cadastro com nome, e-mail, CPF, telefone, senha e endereço.
2. O CPF deve ser normalizado para somente dígitos e validado pelo algoritmo dos dois dígitos verificadores.
3. O CEP deve conter oito dígitos após a normalização.
4. E-mail e CPF devem ser únicos.
5. O cadastro deve retornar um JWT para iniciar a sessão sem exigir novo login.
6. O login deve validar e-mail e senha e retornar um JWT.
7. O frontend deve persistir o token no navegador usando a chave `reviva_token`.
8. O logout deve remover o token após confirmação do usuário.
9. Credenciais inválidas devem retornar erro de autenticação sem revelar se o e-mail existe.

### RF-02 - Perfil e localização

1. O usuário autenticado deve consultar seus dados, reputação, pontos, selo, itens doados e quilos de resíduo evitado.
2. O usuário deve atualizar suas coordenadas e seu raio de busca.
3. O sistema deve permitir consultar a reputação e os itens públicos de outro usuário.
4. O sistema deve separar dados públicos do anunciante e dados privados da conta.
5. O endereço informado por CEP deve poder preencher bairro, cidade, estado e coordenadas.

### RF-03 - Publicação de item

1. O usuário autenticado deve cadastrar título, descrição, categoria, conservação, tipo de publicação, endereço, peso estimado e fotos.
2. Os tipos de publicação devem ser `DOAR` e `TROCAR`.
3. As categorias devem ser Roupas, Livros, Móveis, Infantil, Eletrônicos, Cozinha e Outros.
4. Os estados de conservação devem ser Novo, Seminovo e Usado.
5. O sistema deve aceitar até três fotos por item.
6. O CEP deve consultar uma API de endereço e permitir preenchimento manual quando a consulta falhar.
7. O impacto ambiental deve usar o peso informado ou uma estimativa por categoria.
8. Um item recém-publicado deve iniciar com status `ATIVO` e validade padrão de 60 dias.
9. A publicação deve registrar o doador, a data de publicação, o endereço e as coordenadas disponíveis.

### RF-04 - Busca e descoberta

1.rf -5 Visitantes devem consultar comunidades e detalhes públicos de itens.
2. Usuários devem listar itens ativos por categoria, tipo de publicação, termo, cidade e UF.
3. Itens expirados não devem aparecer na busca pública.
4. A tela inicial deve exibir categorias, itens recentes e atalhos contextuais.
5. O usuário deve poder localizar uma região por estado e cidade usando dados do IBGE.
6. O usuário deve poder usar o GPS do navegador para obter cidade e UF a partir de coordenadas.
7. O usuário deve poder salvar favoritos localmente no navegador.
8. A grade deve oferecer visualização rápida do item quando o dispositivo permitir.

### RF-05 - Gerenciamento de anúncios

1. O usuário deve listar seus próprios itens, inclusive os que não estão ativos.
2. Somente o dono do item deve poder editá-lo, removê-lo, restaurá-lo ou marcá-lo como doado.
3. A edição deve renovar a validade do item por mais 60 dias.
4. A remoção deve alterar o status para `REMOVIDO`, sem apagar o registro fisicamente.
5. A restauração deve reativar item removido ou expirado e renovar sua validade.
6. A marcação como doado deve alterar o status, atualizar o impacto e contabilizar os pontos do doador uma única vez.
7. O sistema deve impedir que um usuário gerencie item pertencente a outra conta.

### RF-06 - Conversas e mensagens

1. Ao selecionar Enviar mensagem em um anúncio, o sistema deve criar uma conversa vinculada ao item.
2. A solicitação deve identificar item, doador, receptor, mensagem inicial, status e data de criação.
3. O usuário deve visualizar uma caixa de entrada com conversas enviadas e recebidas.
4. O usuário deve listar e enviar mensagens de texto em uma conversa.
5. As mensagens devem permanecer persistidas no banco de dados.
6. O chat deve receber novas mensagens em tempo real via WebSocket/STOMP.
7. O cliente deve evitar duplicar mensagens recebidas por REST e WebSocket.
8. A caixa de entrada deve manter as conversas disponíveis enquanto elas existirem no backend.
9. O chat deve orientar os usuários a manter as negociações dentro da plataforma.
10. O usuário deve compartilhar localização atual, foto, câmera e referência de local conforme os recursos disponíveis no navegador.

### RF-07 - Agendamento e retirada

1. Os participantes da conversa devem poder informar data, horário e local de encontro.
2. Deve existir no máximo um agendamento ativo por solicitação.
3. O receptor deve confirmar o agendamento.
4. Após a confirmação do receptor, o doador deve poder gerar um código de retirada.
5. O ciclo deve permitir confirmação manual do doador e do receptor.
6. O ciclo deve permitir confirmação por token associado ao item e QR Code na interface.
7. A retirada deve ser concluída somente quando as duas confirmações forem registradas ou quando o fluxo de QR Code as representar.
8. Ao concluir, o item deve passar a `DOADO`, o agendamento a `CONCLUIDO` e os indicadores de impacto devem ser atualizados.
9. Qualquer participante deve poder cancelar enquanto a troca não estiver concluída.
10. Qualquer participante deve poder reportar um problema.

### RF-08 - Avaliações, impacto e reputação

1. Após a retirada, cada participante deve poder avaliar o outro com nota de 1 a 5 e comentário opcional.
2. O sistema deve recalcular a reputação média do usuário avaliado.
3. O sistema deve contabilizar itens doados, quilos de resíduo evitado e pontos.
4. A pontuação deve considerar doação concluída, recebimento concluído e avaliação recebida.
5. Os selos devem ser Bronze, Prata, Ouro e Esmeralda.
6. A página inicial e o dashboard devem exibir os indicadores de impacto.

### RF-09 - Notificações

1. O sistema deve criar notificações para novos contatos e eventos relevantes do chat.
2. O usuário deve listar notificações ordenadas da mais recente para a mais antiga.
3. O usuário deve marcar uma notificação como lida.
4. O indicador da página inicial deve mostrar a quantidade de notificações não lidas.
5. O usuário deve limpar todas as notificações.
6. O usuário deve excluir notificações expiradas.
7. A expiração padrão deve ser de 30 dias e configurável por `NOTIFICACOES_EXPIRACAO_DIAS`.

### RF-10 - Comunidades e denúncias

1. O usuário deve listar comunidades disponíveis sem autenticação.
2. O usuário autenticado deve participar de uma comunidade.
3. O usuário deve denunciar item ou comportamento informando motivo e detalhes.
4. Os motivos suportados devem incluir item divergente, comportamento inadequado, não comparecimento, suspeita de golpe e outro.
5. As denúncias devem permanecer disponíveis para moderação e não devem expor dados sensíveis ao denunciante.

## 2. Requisitos não funcionais

| ID | Categoria | Requisito | Critério de aceitação |
| --- | --- | --- | --- |
| RNF-01 | Segurança | Endpoints privados devem exigir JWT válido. | Operações de item e agendamento validam o proprietário ou participante antes de executar. |
| RNF-02 | Privacidade | Dados privados não devem ser expostos em consultas públicas. | E-mail, CPF, senha e localização exata não são serializados como dados do anunciante. |
| RNF-03 | Desempenho | A aplicação deve indicar carregamento sem bloquear a navegação durante buscas remotas. | A página inicial exibe estado de carregamento enquanto aguarda a API. |
| RNF-04 | Tempo real | Mensagens devem ser atualizadas sem polling contínuo. | O chat utiliza STOMP sobre SockJS para receber mensagens. |
| RNF-05 | Disponibilidade | Falhas de API devem produzir retorno compreensível e recuperável. | A interface exibe estado de erro e oferece uma ação para tentar novamente. |
| RNF-06 | Compatibilidade | A interface deve funcionar em navegadores modernos desktop e mobile. | Os principais fluxos funcionam com toque e teclado. |
| RNF-07 | Responsividade | O conteúdo deve se adaptar a telas estreitas. | Não há rolagem horizontal acidental nem perda de controles. |
| RNF-08 | Acessibilidade | A interface deve ser utilizável por pessoas com diferentes necessidades de acesso. | Campos possuem rótulos, botões têm nome acessível, o foco é visível e a cor não é o único indicador. |
| RNF-09 | Manutenibilidade | O código deve manter separação clara de responsabilidades. | O backend separa controller, service, repository, model e DTO; o frontend centraliza chamadas em `api.js`. |
| RNF-10 | Observabilidade | Erros e eventos relevantes devem ser identificáveis nos registros da aplicação. | Erros de domínio retornam mensagens legíveis e os logs diferenciam aplicação, web e banco de dados. |
| RNF-11 | Portabilidade | Configurações variáveis devem ser externas ao código-fonte. | Porta, JWT, caminho do banco e expiração de notificações podem ser definidos por variáveis de ambiente. |
| RNF-12 | Integridade | Operações relacionadas à conclusão devem preservar consistência. | Conclusão, pontuação e atualização de impacto ocorrem de forma transacional no backend. |
