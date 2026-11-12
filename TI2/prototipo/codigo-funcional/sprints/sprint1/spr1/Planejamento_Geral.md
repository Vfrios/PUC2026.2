# Planejamento da Sprint 1

## 1. Visão geral

Este documento reúne o planejamento funcional da Sprint 1 para as seis frentes de trabalho. A sprint está sendo planejada a partir do início do projeto: os itens descritos representam comportamentos que deverão ser concebidos e entregues, não funcionalidades já existentes ou implementadas.

A Sprint 1 estabelece os primeiros fluxos que dão forma ao Reviva: apresentar itens disponíveis, permitir a publicação de uma oferta, iniciar contato e oferecer informações iniciais de perfil, localização, comunidades e favoritos.

## 2. Objetivo da sprint

Entregar uma primeira experiência funcional em que uma pessoa consiga conhecer a proposta da plataforma, encontrar um item anunciado, consultar suas informações, demonstrar interesse e iniciar uma conversa com quem o publicou. Em paralelo, a sprint deve estabelecer recursos básicos para publicação e gestão inicial de itens, perfil, endereços, favoritos e participação em comunidades.

## 3. Resultado esperado

Ao final da sprint, espera-se que os principais fluxos iniciais estejam definidos e integrados funcionalmente:

1. Quem oferece um item consegue descrevê-lo e informar se é para doação ou troca.
2. Quem procura consegue consultar itens disponíveis, pesquisar e abrir os detalhes de uma oferta.
3. Quem se interessa por um item consegue iniciar uma conversa vinculada a essa oferta e consultar as mensagens trocadas.
4. Cada pessoa consegue consultar e manter informações básicas do próprio perfil e de seus endereços.
5. A pessoa consegue guardar itens de interesse e consultar comunidades disponíveis.

Este resultado representa o escopo planejado. A conclusão deverá ser avaliada por demonstrações dos fluxos e critérios funcionais desta sprint, não pela existência de funcionalidades de sprints posteriores.

## 4. Planejamento por frente de trabalho

### 4.1 Brayan — Descoberta e detalhes

**Objetivo da frente:** permitir que uma pessoa encontre ofertas publicadas e compreenda os dados disponíveis antes de decidir se deseja entrar em contato.

**Funcionalidades abrangidas:**

- Apresentar uma lista de itens disponíveis com informações resumidas, incluindo título, imagem representativa, categoria e modalidade.
- Permitir busca textual por informações relacionadas à oferta.
- Exibir e permitir consulta dos itens por categoria.
- Apresentar os detalhes disponíveis do item: descrição, condição de conservação, modalidade, imagens e localização informada.
- Identificar quem publicou a oferta e indicar se o item ainda está disponível.
- Informar quando a busca não tiver termo útil, não encontrar resultados ou não puder carregar as informações.

**Requisitos funcionais abrangidos:**

- **RF01 — Listar itens disponíveis:** mostrar ofertas ativas em uma lista que permita reconhecer e distinguir os itens.
- **RF02 — Buscar por texto:** receber um termo e apresentar itens com informações descritivas relacionadas.
- **RF03 — Consultar por categoria:** identificar a categoria dos itens e apoiar a consulta de uma categoria de interesse.
- **RF04 — Consultar detalhes:** apresentar as informações fornecidas para o item e não inventar dados que estejam ausentes.
- **RF05 — Identificar anunciante e disponibilidade:** indicar quem publicou o item e se a oferta continua ativa.
- **RF06 — Tratar busca vazia ou sem resultados:** explicar a ausência de correspondências e permitir tentar novamente ou retornar à lista.
- **RF07 — Tratar falha de consulta:** informar quando resultados ou detalhes não puderem ser carregados, sem apresentar informações incompletas como confirmadas.

**Critério de aceite funcional:** uma pessoa consegue sair da lista geral, localizar uma oferta por texto ou categoria, abrir seus detalhes e compreender se ela segue disponível; se não houver resultados ou ocorrer falha, recebe uma orientação clara.

### 4.2 Gustavo — Publicação e gestão inicial

**Objetivo da frente:** permitir que uma pessoa anuncie um objeto para doação ou troca e acompanhe as ofertas que publicou.

**Funcionalidades abrangidas:**

- Criar um anúncio com título, descrição, categoria e condição de conservação.
- Escolher entre as modalidades de doação e troca.
- Complementar a oferta com imagens e localização geral, quando disponíveis.
- Confirmar a publicação e consultar os próprios anúncios.
- Atualizar informações e indicar se o item continua disponível.
- Evitar publicação com dados necessários ausentes ou inválidos e comunicar falhas sem duplicar a oferta.

**Requisitos funcionais abrangidos:**

- **RF01 — Cadastrar item:** coletar dados necessários e apontar campos obrigatórios ausentes ou inválidos.
- **RF02 — Definir modalidade:** registrar se o item é oferecido para doação ou troca.
- **RF03 — Complementar anúncio:** permitir informar imagens e localização geral sem presumir dados não fornecidos.
- **RF04 — Confirmar publicação:** informar o resultado da criação e permitir nova tentativa quando necessário sem criar duplicatas.
- **RF05 — Consultar anúncios próprios:** listar as ofertas da pessoa e tratar claramente a ausência de anúncios.
- **RF06 — Editar anúncio próprio:** permitir corrigir informações e confirmar que a alteração foi aplicada.
- **RF07 — Controlar disponibilidade:** permitir indicar se o item continua disponível e refletir esse estado na oferta.
- **RF08 — Restringir gestão ao anunciante:** permitir edição e mudança de disponibilidade somente à pessoa que publicou o anúncio.

**Critério de aceite funcional:** uma pessoa consegue cadastrar uma oferta válida, encontrá-la entre os próprios anúncios, corrigir seus dados e atualizar a disponibilidade; erros de preenchimento são explicados antes de concluir a ação.

### 4.3 João — Comunidades e favoritos iniciais

**Objetivo da frente:** permitir a descoberta inicial de comunidades e oferecer uma forma pessoal de guardar ofertas para consultar novamente.

**Funcionalidades abrangidas:**

- Consultar comunidades e suas descrições.
- Manifestar interesse ou registrar participação em uma comunidade.
- Adicionar uma oferta aos favoritos a partir de sua apresentação ou detalhes.
- Consultar e remover itens da lista pessoal de favoritos.
- Evitar favoritos duplicados e deixar clara a disponibilidade atual do item salvo.

**Requisitos funcionais abrangidos:**

- **RF01 — Consultar comunidades:** apresentar as comunidades disponíveis e tratar a ausência de opções.
- **RF02 — Manifestar participação:** permitir escolher uma comunidade e identificar o estado da participação.
- **RF03 — Favoritar item:** adicionar uma oferta à lista e confirmar a ação sem duplicá-la.
- **RF04 — Consultar favoritos:** apresentar itens salvos e informar quando a lista estiver vazia.
- **RF05 — Remover favorito:** permitir retirar um item da lista e refletir a remoção.
- **RF06 — Manter favoritos pessoais:** restringir a lista à pessoa que a organizou.
- **RF07 — Refletir disponibilidade:** indicar se uma oferta salva continua ativa, sem fazer parecer disponível algo que não está.

**Critério de aceite funcional:** a pessoa consegue explorar as comunidades disponíveis e manter uma lista pessoal de itens salvos que reflita a disponibilidade conhecida de cada oferta.

### 4.4 Tang — Endereços e segurança básica

**Objetivo da frente:** permitir que a pessoa organize endereços associados à conta e encontre informações básicas para uma utilização mais segura.

**Funcionalidades abrangidas:**

- Cadastrar, consultar, atualizar e remover endereços próprios.
- Escolher um endereço principal e manter essa indicação consistente.
- Consultar avisos relacionados à conta e às interações.
- Consultar orientações de segurança e ajustar preferências básicas de notificação.
- Restringir os dados e controles à pessoa titular da conta.

**Requisitos funcionais abrangidos:**

- **RF01 — Cadastrar endereço:** coletar dados necessários e indicar informações ausentes ou inconsistentes.
- **RF02 — Consultar endereços:** apresentar os endereços próprios e tratar lista vazia.
- **RF03 — Definir endereço principal:** permitir escolher um endereço principal por conta.
- **RF04 — Atualizar endereço:** permitir corrigir dados e apresentar o resultado atualizado.
- **RF05 — Remover endereço:** permitir remoção e alertar quando a escolha principal precisar ser revista.
- **RF06 — Consultar orientações de segurança:** apresentar recomendações compreensíveis para interações na plataforma.
- **RF07 — Consultar avisos:** exibir avisos importantes ou informar que não há novos conteúdos.
- **RF08 — Ajustar preferências básicas:** permitir consultar e alterar opções disponíveis, confirmando e preservando as escolhas.
- **RF09 — Restringir acesso:** permitir administração somente dos dados associados à própria conta.

**Critério de aceite funcional:** uma pessoa consegue manter seus endereços, escolher seu endereço principal e consultar orientações, avisos e preferências sem acessar dados de outra conta.

### 4.5 Thiago — Perfil e reputação inicial

**Objetivo da frente:** estabelecer uma apresentação básica das pessoas usuárias e mostrar informações iniciais de participação e reputação quando existirem.

**Funcionalidades abrangidas:**

- Consultar informações públicas de apresentação de outra pessoa.
- Consultar e atualizar as próprias informações de apresentação.
- Exibir reputação e indicadores de participação disponíveis.
- Diferenciar a visão da titular da visão pública.
- Não presumir avaliações ou atividade ainda inexistentes.

**Requisitos funcionais abrangidos:**

- **RF01 — Consultar perfil de outra pessoa:** apresentar somente informações definidas como públicas.
- **RF02 — Consultar próprio perfil:** apresentar os dados atuais e sua visibilidade.
- **RF03 — Atualizar apresentação:** permitir alterar dados próprios e indicar problemas de preenchimento.
- **RF04 — Apresentar reputação:** mostrar dados existentes ou informar que ainda não há avaliações suficientes.
- **RF05 — Apresentar participação:** mostrar indicadores disponíveis e distinguir ausência de atividade de falha.
- **RF06 — Diferenciar visão própria e pública:** não expor informações privadas na apresentação pública.
- **RF07 — Restringir edição:** somente a titular pode alterar seu perfil.

**Critério de aceite funcional:** uma pessoa consegue consultar e atualizar seu próprio perfil, enquanto outras visualizam apenas informações públicas; ausência de avaliações não resulta em reputação fictícia.

### 4.6 Vitor — Solicitação e conversa inicial

**Objetivo da frente:** conectar o interesse em uma oferta a uma conversa entre quem procura e quem publicou o item.

**Funcionalidades abrangidas:**

- Iniciar conversa a partir de uma oferta disponível.
- Manter cada conversa vinculada ao item que motivou o contato.
- Consultar conversas iniciadas e recebidas em uma caixa de entrada.
- Enviar mensagens de texto e consultar o histórico.
- Identificar participantes e oferta em discussão.
- Restringir o acesso aos participantes e oferecer orientação de segurança.

**Requisitos funcionais abrangidos:**

- **RF01 — Iniciar contato:** permitir começar uma conversa sobre uma oferta ativa e informar se ela não está mais disponível.
- **RF02 — Vincular conversa ao item:** manter contexto claro da oferta discutida.
- **RF03 — Consultar caixa de entrada:** apresentar conversas, participantes, item e mensagem recente quando disponíveis.
- **RF04 — Enviar mensagem:** permitir enviar texto não vazio e associá-lo à conversa correta.
- **RF05 — Consultar histórico:** apresentar mensagens em ordem compreensível.
- **RF06 — Identificar participantes e item:** deixar claro quem conversa e sobre qual oferta.
- **RF07 — Restringir acesso:** permitir consulta e envio somente aos participantes.
- **RF08 — Informar falha de envio:** não marcar mensagens como enviadas quando houver falha e permitir nova tentativa.
- **RF09 — Exibir orientação de segurança:** disponibilizar recomendações para uma negociação segura.

**Critério de aceite funcional:** uma pessoa consegue iniciar contato sobre uma oferta, trocar mensagens e retomar o histórico sabendo quem participa e qual item está em discussão.

## 5. Integração e dependências entre frentes

- A descoberta depende de anúncios publicados com informações suficientes para apresentação. A pessoa responsável por publicação define os dados da oferta; a frente de descoberta os apresenta.
- O início de uma conversa depende de a oferta estar identificada e disponível. A conversa deve preservar o vínculo com o item e com as pessoas envolvidas.
- Favoritos dependem de itens consultáveis e devem refletir o estado de disponibilidade conhecido.
- As informações públicas de perfil podem ser apresentadas junto de ofertas e conversas, respeitando a distinção entre dados públicos e dados próprios.
- O endereço principal e a localização da oferta são informações relacionadas, mas não devem ser tratadas como equivalentes: o endereço da conta pertence à pessoa; a localização do item é informada para a oferta.
- Essas dependências são pontos de integração a combinar durante o trabalho; não presumem que qualquer fluxo já esteja pronto.

## 6. Critérios gerais de aceite da sprint

- Cada frente entrega os comportamentos funcionais listados no seu escopo.
- Uma pessoa consegue compreender quando uma ação foi concluída, está pendente ou falhou.
- Dados opcionais ausentes são identificados como desconhecidos, não preenchidos por suposição.
- Estados vazios, como lista sem itens ou busca sem resultados, são explicados de forma clara.
- Ações de edição e gestão respeitam a titularidade dos dados e das ofertas.
- Os fluxos de publicação, descoberta e início de conversa mantêm o mesmo contexto do item.
- As frentes são apresentadas em conjunto, sem exigir recursos que pertencem ao escopo da Sprint 2.

## 7. Fora do escopo desta sprint

Não fazem parte deste primeiro recorte o refinamento avançado por filtros de localização e distância, o ciclo completo de negociação e retirada, avaliações após conclusão, indicadores completos de impacto, gerenciamento avançado de notificações, denúncias e recursos de comunidade além da consulta e participação inicial. Esses itens ficam reservados ao planejamento da Sprint 2 ou a decisões futuras.

## 8. Premissas e pontos a confirmar durante o planejamento

- Os campos obrigatórios de uma oferta e as opções permitidas de categoria e condição precisam ser acordados antes da validação final do cadastro.
- O significado de “participar” de uma comunidade deve ser combinado com as regras do produto antes de ampliar o fluxo.
- Os dados de perfil visíveis publicamente devem ser definidos sem expor informações pessoais desnecessárias.
- O endereço cadastrado pela pessoa não deve ser mostrado automaticamente como localização pública de uma oferta.
- A disponibilidade de uma oferta precisa ser representada de forma coerente entre gestão, descoberta, favoritos e início de conversa.

## 9. Requisitos não funcionais gerais

Os requisitos abaixo complementam os requisitos funcionais de cada frente. Os alvos de tempo devem ser verificados em ambiente de teste acordado pela equipe, registrando o conjunto de dados e as condições utilizadas; indisponibilidade de serviços externos deve ser identificada separadamente.

- **RNF01 — Desempenho:** consultas e operações comuns de leitura e gravação devem responder em até 2 segundos no percentil 95 no ambiente de teste acordado. Se a operação exceder esse alvo ou falhar, a interface deve informar o estado em vez de parecer travada ou indicar sucesso incorretamente.
- **RNF02 — Segurança e autorização:** operações que consultam ou alteram dados pessoais, anúncios próprios ou conversas devem validar a identidade e a permissão no servidor. Restringir um botão na interface não substitui a autorização no servidor.
- **RNF03 — Privacidade:** endereços, favoritos, mensagens e demais dados pessoais só devem ser apresentados a quem tem permissão. Dados ausentes ou privados não devem ser inferidos nem expostos por padrão.
- **RNF04 — Acessibilidade:** fluxos principais devem permitir navegação por teclado, usar rótulos compreensíveis e comunicar erros e estados sem depender exclusivamente de cor. Imagens informativas devem ter texto alternativo.
- **RNF05 — Responsividade e compatibilidade:** telas dos fluxos da Sprint 1 devem continuar legíveis e operáveis nas larguras de tela e nos navegadores definidos como suportados pelo projeto, sem rolagem horizontal da página.
- **RNF06 — Integridade dos dados:** após confirmação, alterações devem permanecer refletidas em consultas posteriores; tentativas repetidas após falha não devem criar duplicatas em anúncios, favoritos ou mensagens.
- **RNF07 — Tratamento de erros:** falha, ausência de dados e lista vazia são situações distintas e devem ser comunicadas como tais. Uma operação só deve ser indicada como concluída depois de confirmação.
- **RNF08 — Validação:** dados recebidos devem ser validados na interface para orientar a pessoa e no servidor para proteger a integridade, sem confiar exclusivamente em verificações do cliente.
- **RNF09 — Integração:** frentes que exibem ou alteram o mesmo item, perfil ou estado devem usar identificadores e estados coerentes, com validação dos fluxos de integração antes da demonstração da sprint.

### Verificação dos requisitos não funcionais

- Medir os tempos das consultas e gravações principais no ambiente acordado e registrar os resultados.
- Exercitar tentativas não autorizadas de consultar ou alterar dados de outra conta.
- Conferir teclado, rótulos, mensagens de erro e apresentação em uma largura móvel e uma largura desktop suportadas.
- Recarregar as telas após alterações confirmadas para verificar persistência, ausência de duplicatas e consistência entre frentes.
- Simular falhas de carregamento e gravação para confirmar que a interface distingue erro de lista vazia e não indica sucesso indevido.

## 10. APIs do sistema previstas para a Sprint 1

As rotas abaixo correspondem às funcionalidades planejadas para esta sprint e às chamadas disponíveis na camada de API do frontend (`reviva-frontend/src/api.js`). A inclusão nesta lista indica uso previsto, não que a implementação já esteja concluída.

- **Acesso à conta:** `POST /api/auth/registrar` e `POST /api/auth/login`, para criar uma conta e autenticar as operações protegidas.
- **Descoberta de itens (Brayan):** `GET /api/itens` (com consulta por texto, categoria, modalidade e disponibilidade) e `GET /api/itens/{id}`; `GET /api/usuarios/{id}/publico` para apresentar os dados públicos de quem anunciou.
- **Publicação e gestão de itens (Gustavo):** `GET /api/itens/meus`, `POST /api/itens`, `PUT /api/itens/{id}` e `POST /api/itens/{id}/doado`, para consultar, criar, editar e atualizar a disponibilidade dos próprios anúncios. `GET /api/geo/cep/{cep}` pode ser usado para preencher a localização informada a partir do CEP.
- **Comunidades e favoritos (João):** `GET /api/comunidades`, `POST /api/comunidades/{id}/participar`, `GET /api/favoritos`, `POST /api/favoritos/{itemId}` e `DELETE /api/favoritos/{itemId}`.
- **Endereços e preferências (Tang):** `GET`, `POST /api/enderecos`; `PUT` e `DELETE /api/enderecos/{id}`; `POST /api/enderecos/{id}/principal`; `GET /api/usuarios/me/preferencias` e `PUT /api/usuarios/me/preferencias`.
- **Avisos básicos (Tang):** `GET /api/notificacoes` para consultar os avisos disponíveis.
- **Perfil e reputação inicial (Thiago):** `GET /api/usuarios/me`, `PUT /api/usuarios/me`, `GET /api/usuarios/{id}/publico`, `GET /api/usuarios/{id}/reputacao` e `GET /api/usuarios/{id}/itens` para os indicadores de participação previstos.
- **Solicitações e conversa (Vitor):** `POST /api/solicitacoes`, `GET /api/solicitacoes/recebidas`, `GET /api/solicitacoes/enviadas`, `GET /api/solicitacoes/conversas`, `GET /api/solicitacoes/{id}`, `GET /api/solicitacoes/{id}/mensagens` e `POST /api/solicitacoes/{id}/mensagens`.

Os parâmetros e identificadores entre chaves são preenchidos conforme a operação. As rotas de localização avançada, agendamentos, avaliações após a negociação, denúncias, publicações em comunidades e gerenciamento avançado de notificações permanecem fora desta sprint, conforme o escopo definido na seção 7.
