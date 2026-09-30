# Reviva — Documentação do Projeto

**Disciplina:** TI2 — PUC  
**Projeto:** Reviva — plataforma de doação e troca local de objetos  
**Equipe:** grupo responsável pelo protótipo  
**Repositório:** [Reviva no GitHub](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-2-ti2-7600100-reviva)  
**Versão do documento:** 2.0 — planejamento inicial  
**Data:** 28 de setembro de 2026

> Este documento representa a etapa de iniciação do Reviva. Reúne o material de descoberta fornecido pela equipe, as personas, os requisitos e as telas funcionais previstas. Não pressupõe que desenvolvimento, testes com usuários ou entregas já tenham sido realizados. O conteúdo da entrevista foi incorporado neste arquivo; não depende de pastas ou arquivos externos sobre participantes.

## 1. Resumo do projeto

O Reviva será uma aplicação web responsiva para aproximar pessoas que têm objetos sem uso de pessoas que podem reutilizá-los. A proposta prevê cadastro de anúncios, busca por categoria e localização, conversa, agendamento de retirada e acompanhamento do impacto. A mesma conta poderá publicar, doar, receber ou trocar itens conforme cada situação.

O planejamento começa pela compreensão do problema e pela pesquisa exploratória reunida neste documento. A partir dessas evidências, os requisitos e as telas funcionais descrevem uma proposta inicial de escopo: são referências para decidir o que deverá ser construído, não funcionalidades já implementadas. Nas próximas etapas, a equipe deverá validar essas necessidades, priorizar a primeira versão e então definir os protótipos, a arquitetura, as tecnologias e o plano de desenvolvimento. Os documentos de apoio detalham os [requisitos do sistema](01-REQUISITOS.md), os [riscos de segurança e a estratégia de testes](02-SEGURANCA-TESTES.md), o [registro da arquitetura](03-ARQUITETURA.md), os [fluxos previstos do usuário](04-FLUXOS-USUARIO.md), os [requisitos funcionais e não funcionais](05-RF-RNF.md), as [diretrizes iniciais de UX e UI](05-UX-UI.md) e as [telas funcionais previstas](06-TELAS-FUNCIONAIS.md). Esses materiais orientam a concepção e o planejamento da solução.

## 2. Contextualização do projeto

### 2.1 Introdução

A compra e o descarte de objetos fazem parte do cotidiano, mas muitos itens ainda úteis deixam de ser aproveitados por outras pessoas. Ao mesmo tempo, encontrar alguém próximo que possa receber ou trocar esses itens pode exigir divulgação em vários canais, conversas dispersas e combinações pouco claras.

O Reviva propõe um ponto de encontro digital para esse processo. Uma pessoa poderá anunciar um objeto; outra poderá encontrá-lo por categoria ou localização, consultar suas condições e iniciar uma conversa. As partes poderão combinar a retirada e registrar o resultado. O fluxo pretende tornar o reaproveitamento local mais acessível, organizado e confiável.

### 2.2 Problema

Pessoas que desejam doar ou trocar objetos e pessoas que poderiam reutilizá-los nem sempre conseguem se encontrar de maneira simples, localizada e segura. A divulgação em canais dispersos pode dificultar a descoberta de itens, a coordenação da retirada e o acompanhamento do combinado. O material exploratório recebido aponta falta de tempo, distância, desorganização e insegurança como barreiras a investigar; como a entrevista registrada é qualitativa e envolve uma pessoa, esses indícios ainda precisam ser validados com outros participantes.

**Pergunta norteadora:** como facilitar a conexão local entre quem tem um objeto reutilizável e quem pode aproveitá-lo, mantendo claros o anúncio, a conversa e a retirada?

### 2.3 Objetivo geral

Desenvolver uma aplicação web responsiva que facilite a doação e a troca local de objetos, conectando pessoas por meio de anúncios pesquisáveis, conversas e um fluxo acompanhado de retirada.

### 2.4 Objetivos específicos

- Permitir que uma pessoa crie uma conta e publique um item com descrição, categoria, conservação, fotos e localização aproximada.
- Ajudar interessados a encontrar anúncios por texto, categoria, cidade e estado.
- Oferecer uma conversa vinculada ao item para que as partes alinhem a retirada dentro da plataforma.
- Registrar agendamento, confirmação e conclusão da entrega, com controle de acesso dos participantes.
- Apresentar reputação e indicadores de impacto associados às trocas concluídas, sem tornar a pontuação uma condição para participar.
- Proteger dados pessoais e localização, expondo publicamente apenas as informações necessárias para avaliar um anúncio.
- Proporcionar uma experiência responsiva, compreensível e acessível em dispositivos móveis e desktop.

### 2.5 Justificativa

O projeto responde a uma oportunidade prática: prolongar a vida útil de objetos por meio de conexões locais e diminuir barreiras para a doação e a troca. A Política Nacional de Resíduos Sólidos estabelece princípios e instrumentos relacionados à gestão integrada de resíduos e à responsabilidade compartilhada pelo ciclo de vida dos produtos. O Objetivo de Desenvolvimento Sustentável 12 da ONU também trata de consumo e produção responsáveis. O Reviva não substitui políticas públicas ou serviços de coleta; oferece uma ferramenta digital para apoiar o reaproveitamento entre pessoas.

A solução também trata de aspectos de confiança e organização que uma simples publicação em rede social pode não resolver: anúncio estruturado, localização aproximada, conversa associada ao item, agendamento e confirmação. Reputação e métricas de impacto funcionam como informações complementares; não comprovam, por si sós, a quantidade real de resíduos evitados.

### 2.6 Público-alvo

O público-alvo são pessoas que possuem objetos em bom estado e desejam doá-los ou trocá-los, assim como pessoas que procuram itens reutilizáveis em sua região. A proposta também pode atender moradores de bairros, participantes de comunidades locais e organizações que promovam iniciativas de reutilização.

A experiência considera usuários com diferentes níveis de familiaridade digital e acesso principalmente por celular. Por isso, prioriza formulários objetivos, controles adequados para toque, localização opcional, mensagens de estado claras e alternativas manuais quando serviços externos ou permissões do dispositivo não estiverem disponíveis. Doador e receptor são papéis circunstanciais da negociação, e não tipos permanentes de conta.

## 3. Descoberta do problema

### 3.1 Matriz CSD

A matriz CSD organiza o que se sabe, o que ainda precisa ser investigado e o que é hipótese de trabalho. “Certezas” neste quadro são evidências iniciais ou fatos de contexto, não conclusões universais sobre todo o público.

| Dúvidas — o que ainda precisamos descobrir | Certezas preliminares — o que já consta no material | Suposições — hipóteses a validar |
| --- | --- | --- |
| Quais objetos as pessoas mais acumulam e com que frequência descartam itens ainda utilizáveis? O que pesa mais: falta de tempo, logística, falta de destinatário ou outro motivo? | Há pessoas que mantêm em casa roupas, livros, eletrônicos e outros objetos sem uso; nem todo objeto parado está inutilizado. | Uma plataforma específica e simples pode reduzir a distância entre a intenção de doar e a ação. |
| As pessoas preferem doar, trocar ou vender? Que experiências já tiveram com campanhas, grupos de mensagens e redes sociais? | O material da entrevista descreve doação em campanha e uso de grupos sociais, percebidos como trabalhosos ou desorganizados. | Pessoas interessadas em troca podem aderir se a proposta e a contrapartida forem fáceis de entender. |
| Quais detalhes, fotos e informações de localização são necessários antes de solicitar um item? Qual distância é aceitável para buscar ou entregar? | Fotos, estado do objeto e localização foram citados como informações importantes; a distância apareceu como fator relevante no relato recebido. | Ordenação por proximidade e mapa podem facilitar a descoberta e aumentar a chance de combinar a retirada. |
| O que faz as pessoas se sentirem seguras ao negociar com desconhecidos? Avaliações ajudam? Quais etapas de retirada geram maior preocupação? | O relato menciona insegurança nos canais atuais e valoriza informações transparentes e confiança entre participantes. | Perfis, avaliações, regras de segurança e confirmação da retirada podem aumentar a confiança. |
| Quais categorias têm maior demanda? Que indicadores de impacto são compreensíveis e motivadores? | Reutilizar prolonga a vida útil dos produtos; o participante entrevistado afirmou que números de reutilização e impacto seriam motivadores para ele. | Exibir impacto individual e coletivo pode estimular retorno e participação contínua. |

### 3.2 Mapa de stakeholders

| Grupo | Stakeholders | Interesse ou participação esperada |
| --- | --- | --- |
| Fundamentais — usuários diretos | Pessoas com objetos sem uso; pessoas que procuram objetos; pessoas que realizam trocas. | Publicar, buscar, avaliar a experiência e apontar barreiras de doação, retirada e negociação. |
| Importantes — apoio ou influência operacional | Cooperativas de reciclagem; organizações ambientais; associações de bairro e comunidades locais; instituições de ensino; projetos sociais e instituições beneficentes; coordenadores e voluntários. | Divulgar iniciativas, orientar destinação adequada e ajudar a compreender necessidades comunitárias e logísticas. |
| Influenciadores — conhecimento e contexto | Especialistas em sustentabilidade; profissionais de gestão de resíduos; professores e pesquisadores; influenciadores de sustentabilidade; órgãos públicos e iniciativas municipais. | Contribuir com conhecimento, avaliar impactos e orientar a compatibilidade com políticas e iniciativas locais. |

### 3.3 Roteiro de entrevista qualitativa

O roteiro busca compreender comportamentos e experiências recentes, sem induzir respostas favoráveis à solução. Perguntas de acompanhamento como “Por quê?”, “Como foi?” e “Pode dar um exemplo?” devem ser usadas quando ajudarem a aprofundar o contexto.

1. Você tem objetos em casa que não utiliza mais? Quais?
2. O que costuma fazer com esses objetos?
3. O que leva você a descartar um objeto em vez de doar ou trocar?
4. Com que frequência descarta algo que ainda está em boas condições?
5. Você já doou ou trocou objetos? Como foi a experiência?
6. Quais foram as maiores dificuldades para doar, trocar ou combinar a retirada?
7. Você prefere doar, trocar ou vender? O que influencia essa escolha?
8. Já usou grupos de WhatsApp, Facebook ou outros canais para anunciar ou procurar objetos? Como foi?
9. O que precisaria saber sobre um objeto antes de solicitar?
10. Como você se sentiria ao combinar uma retirada com alguém que não conhece? O que ajudaria a se sentir seguro?
11. Que distância seria razoável para buscar um item? Como costuma decidir se o deslocamento vale a pena?
12. Um mapa ou filtro por localização ajudaria? Como você usaria esse recurso?
13. Que tipo de informação sobre reutilização ou impacto seria útil para você?
14. O que faria você voltar a usar um serviço desse tipo?

**Participantes potenciais:** estudantes que moram em república ou apartamento; jovens adultos em transição de moradia; famílias em mudança; pessoas que participam de grupos locais de doação; coordenadores de projetos sociais; representantes de associações de bairro; gestores de cooperativas e voluntários ambientais. Especialistas e representantes públicos podem ser consultados para questões de sustentabilidade e gestão de resíduos.

**Orientações de campo:** realizar entrevistas individuais de 15 a 30 minutos, presenciais ou por videochamada; explicar o objetivo e pedir autorização antes de gravar; não substituir a conversa por questionário online; observar contexto e exemplos sem interpretar linguagem corporal como prova isolada; registrar os principais insights logo após a conversa. Identificadores pessoais devem ser mantidos apenas quando houver autorização e necessidade acadêmica.

### 3.4 Síntese da entrevista qualitativa disponível

O material fornecido registra uma entrevista exploratória com **Luiz Felipe**, em **18 de agosto de 2024**, no **Prédio 34 da PUC Minas, Coração Eucarístico**. As respostas abaixo são uma síntese do registro, não citações literais. Como há apenas uma entrevista documentada, os achados servem para orientar novas perguntas e não podem ser generalizados para todos os usuários.

| Tema perguntado | Síntese do relato |
| --- | --- |
| Objetos sem uso | Roupas que não servem mais, livros didáticos e um secador de cabelo pouco utilizado. |
| Doar ou descartar | Falta de tempo para encontrar interessados, organizar entrega e transportar; dificuldade de saber quem teria interesse em objetos específicos. |
| Frequência de descarte | Raramente descarta algo que ainda funciona; costuma guardar por um tempo ou passar a parentes e amigos. Observa que objetos pequenos podem ser descartados por outras pessoas por parecerem sem valor. |
| Experiência de doação e troca | Doou roupas em uma campanha da igreja e considerou o processo burocrático. Nunca realizou troca porque imagina que seja complicada. |
| Preferência | Prefere doar para evitar negociação e preço; vender exige anunciar, responder e combinar entrega. |
| Interesse em uma plataforma | Usaria um serviço fácil de usar, com filtros por categoria e localização e visualização em mapa para encontrar itens próximos e divulgar objetos. |
| Informações antes de solicitar | Fotos de vários ângulos, descrição do estado e defeitos, tamanho, cor, material e localização exata ou ao menos o bairro. |
| Indicadores de impacto | Quantidade de objetos reutilizados, doações realizadas e impacto ambiental poderiam reforçar a percepção de contribuição e a motivação. |

**Principais insights registrados:** existe uma lacuna entre querer doar e concluir a doação; tempo e logística dificultam a ação; a distância pesa para quem oferece e para quem procura; canais informais são percebidos como desorganizados e inseguros; informações detalhadas e indicadores de impacto podem contribuir para confiança e motivação. O próximo ciclo de pesquisa deve explorar coleta agendada, pontos comunitários de entrega e o efeito de visualizar resultados das doações.

### 3.5 Personas e mapas de empatia

As personas a seguir foram estruturadas a partir do material de pesquisa entregue pela equipe. São ferramentas de síntese para orientar decisões de projeto, não retratos estatisticamente representativos. As frases em “Diz” resumem temas e não devem ser interpretadas como citações literais dos entrevistados.

#### Persona — Marina Santos, estudante que quer doar com praticidade

**Perfil:** 20 anos, estudante universitária; consciente, organizada, empática e engajada. Gosta de leitura, moda e séries. Tem roupas, livros didáticos, pequenos eletrônicos, acessórios e materiais escolares que já não usa.

**Objetivos:** liberar espaço em casa; encaminhar os objetos a pessoas próximas que possam aproveitá-los; contribuir com consumo consciente; perceber o resultado da sua participação.

**Dores e necessidades:** pouco tempo para organizar doações; dificuldade de saber para quem ou onde doar; grupos de doação percebidos como desorganizados e inseguros; precisa de cadastro rápido, categorias e busca local.

##### Mapa de empatia — Marina

| Dimensão | Síntese |
| --- | --- |
| Diz | Quer uma forma simples de divulgar objetos e encontrar quem realmente possa usá-los. |
| Pensa | “Como faço esses itens chegarem a alguém sem transformar isso em mais uma tarefa demorada?” |
| Faz | Separa roupas, livros e eletrônicos; procura alternativas em canais locais; considera fotos e cadastro rápido importantes. |
| Sente | Responsabilidade ambiental e vontade de ajudar, com frustração quando a organização e a logística atrasam a doação. |
| Vê e ouve | Grupos de doação informais, pessoas próximas e iniciativas ligadas à universidade e à comunidade. |
| Necessidade principal | Publicar rapidamente, encontrar pessoas próximas e ter retorno visível de que os objetos foram reutilizados. |

#### Persona — Aline Maia, designer que procura itens para reutilizar

**Perfil:** 43 anos, designer gráfica; esforçada, sensível, empática e atenciosa. Tem interesse por arte, feiras de usados, exposições e atividades culturais. Procura livros, móveis, eletrônicos, equipamentos de áudio e materiais de arte.

**Objetivos:** encontrar objetos de qualidade para projetos e para o dia a dia; economizar recursos; consumir de forma consciente; descobrir opções próximas por doação ou troca.

**Dores e necessidades:** dificuldade para encontrar itens específicos; anúncios desatualizados ou com poucas informações; falta de filtros por localização em outros canais; insegurança ao negociar com desconhecidos.

##### Mapa de empatia — Aline

| Dimensão | Síntese |
| --- | --- |
| Diz | Precisa de informações claras e de uma forma confiável de localizar objetos que possa reutilizar. |
| Pensa | “Esse item está em boas condições? Vale a distância e o esforço para buscá-lo?” |
| Faz | Pesquisa por nome e categoria, compara fotos e descrição e considera distância antes de solicitar. |
| Sente | Interesse em reaproveitar e economizar, mas cautela diante de anúncios incompletos e contatos sem confiança. |
| Vê e ouve | Grupos e anúncios locais com organização limitada, além de recomendações para buscar itens usados. |
| Necessidade principal | Filtrar por categoria e região, avaliar condição com fotos e descrição e negociar com segurança. |

#### Persona — Carlos Mendonça, responsável por organizar a casa

**Perfil:** 30 anos, administrador; analítico, focado e atento a detalhes. Gosta de carros clássicos e restauração. Tem móveis, eletrodomésticos, roupas, brinquedos e materiais escolares da família sem utilização.

**Objetivos:** liberar espaço; destinar os objetos a quem realmente possa usá-los; concluir doações sem uma logística excessivamente complexa; organizar e acompanhar os itens anunciados.

**Dores e necessidades:** falta de tempo; dificuldade para transportar móveis e objetos grandes; não saber onde levar itens específicos; precisa de um processo simples, busca por distância e combinação clara da retirada.

##### Mapa de empatia — Carlos

| Dimensão | Síntese |
| --- | --- |
| Diz | Quer uma maneira prática de encaminhar os objetos para pessoas que precisam deles. |
| Pensa | “Como faço para retirar esses itens de casa sem passar dias organizando o transporte?” |
| Faz | Separa móveis, eletrodomésticos e itens das crianças; procura destinos e pessoas próximas; precisa acompanhar anúncios. |
| Sente | Desejo de ajudar e organizar a casa, com preocupação diante de objetos grandes e difíceis de transportar. |
| Vê e ouve | Itens acumulados no ambiente doméstico e alternativas locais de doação que podem exigir deslocamento. |
| Necessidade principal | Cadastrar e gerenciar itens com rapidez, encontrar interessados próximos e alinhar uma retirada viável. |

**Implicações para o projeto:** reduzir o esforço de cadastro e coordenação; mostrar fotos, condição e localização antes do contato; permitir filtros locais; apoiar a negociação e a retirada; e comunicar indicadores de impacto sem apresentá-los como medição ambiental exata quando forem estimativas.

## 4. Especificação do projeto

Os requisitos completos e suas regras de negócio estão detalhados em [05-RF-RNF.md](05-RF-RNF.md). A tabela abaixo sintetiza o escopo funcional proposto para a primeira versão; prioridades devem ser confirmadas com a equipe após validar o problema e as necessidades dos usuários.

### 4.1 Requisitos funcionais

| ID | Requisito | Resultado esperado | Prioridade |
| --- | --- | --- | --- |
| RF-01 | Cadastro e autenticação | Criar conta, validar dados, autenticar com JWT e encerrar a sessão. | P0 |
| RF-02 | Perfil e localização | Consultar e atualizar dados próprios, reputação e localização; proteger dados privados. | P1 |
| RF-03 | Publicação de item | Criar anúncio de doação ou troca com fotos, categoria, conservação, peso e localização. | P0 |
| RF-04 | Busca e descoberta | Encontrar itens ativos por termo, categoria e região; consultar detalhes públicos. | P0 |
| RF-05 | Gerenciamento de anúncios | Consultar, editar, remover, restaurar e concluir anúncios próprios. | P1 |
| RF-06 | Conversas e mensagens | Criar conversa vinculada ao item, enviar mensagens persistidas e recebê-las em tempo real. | P0 |
| RF-07 | Agendamento e retirada | Combinar retirada, confirmar participantes e atualizar o estado da negociação. | P0 |
| RF-08 | Avaliações e impacto | Avaliar após a retirada e atualizar reputação, pontos e indicadores de impacto. | P1 |
| RF-09 | Notificações | Consultar, marcar como lidas e limpar notificações da própria conta. | P1 |
| RF-10 | Comunidades e denúncias | Consultar/participar de comunidades disponíveis e registrar denúncias. | P2 |

### 4.2 Requisitos não funcionais

| ID | Categoria | Requisito e critério de aceitação | Prioridade |
| --- | --- | --- | --- |
| RNF-01 | Segurança | Rotas privadas exigem JWT válido; itens e agendamentos verificam proprietário ou participante. | P0 |
| RNF-02 | Privacidade | Respostas públicas não expõem senha, CPF, e-mail privado nem endereço/localização exata sem necessidade. | P0 |
| RNF-03 | Desempenho e experiência | Operações remotas exibem carregamento sem bloquear desnecessariamente a navegação. | P1 |
| RNF-04 | Tempo real | Mensagens novas chegam por WebSocket/STOMP sem duplicação no cliente. | P0 |
| RNF-05 | Disponibilidade | Falhas da API exibem mensagem compreensível e possibilidade de tentar novamente quando aplicável. | P1 |
| RNF-06 | Compatibilidade | Fluxos principais funcionam em navegadores modernos, com teclado e toque. | P1 |
| RNF-07 | Responsividade | Conteúdo se adapta a telas estreitas sem rolagem horizontal acidental ou controles inacessíveis. | P1 |
| RNF-08 | Acessibilidade | Campos têm rótulos, foco visível, nomes acessíveis e informação que não depende somente de cor. | P1 |
| RNF-09 | Manutenibilidade | Backend separa responsabilidades e frontend centraliza chamadas à API. | P1 |
| RNF-10 | Observabilidade | Erros de domínio são legíveis e registros não expõem dados sensíveis. | P1 |
| RNF-11 | Portabilidade | Configurações de ambiente, banco, porta e JWT não dependem de valores fixos no código. | P1 |
| RNF-12 | Integridade | Conclusão da retirada e atualização dos indicadores ocorrem de maneira consistente. | P0 |

## 5. Telas funcionais e priorização

As telas abaixo são o escopo funcional definido para orientar a concepção e o planejamento. A presença de uma tela na especificação não significa que ela já foi desenvolvida.

| Área funcional | Telas previstas |
| --- | --- |
| Publicação e gestão | Cadastro de item; gerenciamento de itens. |
| Descoberta e detalhes | Busca/descoberta; detalhes do item. |
| Solicitação e chat | Solicitação de item; chat de negociação. |
| Perfil e reputação | Perfil do usuário; reputação. |
| Comunidades e favoritos | Comunidades; favoritos. |
| Endereço e segurança | Endereço salvo; segurança e termos. |

A priorização inicial usa três níveis: **P0**, necessário para validar e concluir o fluxo essencial; **P1**, importante para confiança, gestão e continuidade; **P2**, evolução que pode ser planejada após validar o núcleo da solução.

| P0 — fluxo principal | P1 — confiança e recorrência | P2 — expansão |
| --- | --- | --- |
| Cadastro e acesso; publicar e gerenciar um item; buscar e consultar detalhes; iniciar solicitação e conversa; combinar e confirmar a retirada. | Perfil e localização; favoritos; reputação e avaliações; notificações; privacidade e segurança; informações claras sobre condição, retirada e estado do anúncio. | Comunidades ampliadas; recursos comunitários e de moderação; filtros avançados por raio; métricas agregadas de impacto; recursos adicionais de gestão de anúncios. |

### 5.1 Quadro Kanban de partida

O quadro representa o início do planejamento, não o andamento de implementação. Os requisitos e as telas funcionais são insumos já documentados; nenhuma tarefa de desenvolvimento é marcada como concluída neste cenário inicial. O grupo deverá atribuir responsáveis, estimativas e critérios de aceite ao iniciar cada cartão.

| Backlog priorizado | A fazer | Em andamento | Concluído |
| --- | --- | --- | --- |
| Validar as hipóteses da matriz CSD com novas entrevistas. | **P0:** detalhar critérios de aceite para cadastro, publicação, busca, solicitação, chat e retirada. | Nenhuma tarefa registrada no início do planejamento. | Nenhuma entrega de desenvolvimento registrada neste cenário inicial. |
| Prototipar e revisar os fluxos das telas funcionais. | **P1:** definir critérios para perfil, favoritos, avaliações, reputação, notificações e segurança. | Mover cartão para esta coluna ao iniciar trabalho e preencher responsável. | Mover cartão após revisão e validação dos critérios de aceite. |
| Validar a proposta com representantes de projetos sociais, associações e cooperativas. | **P2:** detalhar comunidades, filtros avançados e indicadores de impacto após validação do núcleo. | Registrar impedimentos e dependências no cartão. | Registrar evidência de teste e atualizar documentação. |

### 5.2 Critérios para movimentação

### 5.1 Critérios para mover cartões

- **A fazer:** requisito priorizado, ainda sem implementação iniciada.
- **Em andamento:** há uma pessoa responsável e uma alteração em desenvolvimento; registrar responsável, data e impedimento no quadro do grupo.
- **Em revisão/teste:** implementação concluída, aguardando revisão de código ou verificação dos critérios de aceite.
- **Concluído:** critérios de aceite verificados, alteração integrada ao repositório e documentação atualizada quando necessário.

Este Kanban pode ser acompanhado neste documento durante a iniciação. Se a equipe optar por GitHub Projects ou outra ferramenta, adicionar o link direto do quadro e manter os cartões sincronizados antes da entrega.

## 6. Metodologia e organização da equipe

### 6.1 Método de trabalho

O projeto deve avançar de forma incremental, começando pela validação do problema e das necessidades, seguindo para fluxos e protótipos, detalhamento técnico, implementação e testes. O trabalho pode ser organizado em ciclos curtos e no Kanban. Cada cartão deve ter prioridade, responsável, descrição e critério de aceite. A passagem para “Concluído” exige revisão e evidência de validação.

As áreas funcionais definidas são publicação e gestão; descoberta e detalhes; solicitação e chat; perfil e reputação; comunidades e favoritos; endereço e segurança. O detalhamento das telas está em [06-TELAS-FUNCIONAIS.md](06-TELAS-FUNCIONAIS.md), e os fluxos previstos estão em [04-FLUXOS-USUARIO.md](04-FLUXOS-USUARIO.md). A arquitetura e as tecnologias descritas em outros documentos devem ser confirmadas durante o planejamento técnico, antes da implementação.

### 6.2 Papéis e responsabilidades

Os papéis abaixo organizam o trabalho por responsabilidade. A documentação disponível não registra os nomes dos integrantes nem a distribuição individual; o grupo deve preencher a última coluna com os responsáveis reais. Uma pessoa pode exercer mais de um papel, desde que a revisão e a integração sejam combinadas pela equipe.

| Papel | Responsabilidades | Referência no projeto | Integrante responsável |
| --- | --- | --- | --- |
| Coordenação e produto | Manter escopo, prioridades, critérios de aceite, comunicação e atualização do Kanban. | Requisitos e planejamento | A definir pelo grupo |
| UX/UI e documentação | Organizar fluxos, personas, acessibilidade, consistência visual e documentação da entrega. | Fluxos, UX/UI e este documento | A definir pelo grupo |
| Frontend | Implementar telas React, estados de carregamento/erro/vazio, responsividade e integração com a API. | `reviva-frontend/` | A definir pelo grupo |
| Backend e dados | Implementar endpoints, regras de negócio, autorização, persistência e consistência das operações. | `reviva-api/` | A definir pelo grupo |
| Integração e qualidade | Integrar conjuntos, executar testes funcionais e registrar defeitos e evidências. | Repositório e estratégia de testes | A definir pelo grupo |

### 6.3 Ferramentas e comunicação

| Ferramenta | Uso | Acesso |
| --- | --- | --- |
| Git e GitHub | Versionamento, integração do código, histórico de alterações e documentação. | [Repositório Reviva](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-2-ti2-7600100-reviva) |
| Visual Studio Code | Edição e execução local do frontend e backend. | [Documentação oficial do VS Code](https://code.visualstudio.com/docs) |
| Ferramentas de prototipação | Desenho de fluxos e telas antes da implementação. | Definir pela equipe |
| Ferramenta de gestão Kanban | Acompanhamento de cartões, responsáveis e bloqueios. | Definir pela equipe; registrar o link do quadro |
| Git e GitHub | Versionamento e colaboração quando o desenvolvimento começar. | [Repositório do projeto](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-2-ti2-7600100-reviva) |
| Markdown | Registro versionado de requisitos, pesquisa, fluxos e decisões do projeto. | Pasta [`miro/`](.) |

A equipe deve combinar um canal de comunicação, frequência de acompanhamento e forma de registrar decisões. Preencher os nomes dos responsáveis e os links das ferramentas escolhidas antes da entrega.

## 7. Referências bibliográficas

BRASIL. **Lei nº 12.305, de 2 de agosto de 2010**. Institui a Política Nacional de Resíduos Sólidos. Brasília, DF: Presidência da República, 2010. Disponível em: [Planalto](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm). Acesso em: 28 set. 2026.

ELLEN MACARTHUR FOUNDATION. **The circular economy in detail**. Disponível em: [Ellen MacArthur Foundation](https://www.ellenmacarthurfoundation.org/the-circular-economy-in-detail-deep-dive). Acesso em: 28 set. 2026.

NAÇÕES UNIDAS. **Objetivo de Desenvolvimento Sustentável 12: Consumo e produção responsáveis**. Disponível em: [United Nations — Goal 12](https://sdgs.un.org/goals/goal12). Acesso em: 28 set. 2026.

WORLD WIDE WEB CONSORTIUM (W3C). **Web Content Accessibility Guidelines (WCAG) 2.2**. 2023. Disponível em: [W3C Recommendation](https://www.w3.org/TR/WCAG22/). Acesso em: 28 set. 2026.

REVIVA. **Documentação do projeto: requisitos, arquitetura, fluxos e UX/UI**. Repositório do projeto, pasta `miro/`. Disponível em: [repositório Reviva](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-2-ti2-7600100-reviva). Acesso em: 28 set. 2026.

REVIVA. **Material de descoberta fornecido pela equipe: matriz CSD, mapa de stakeholders, roteiro de entrevista, síntese qualitativa e personas**. Registro interno compartilhado para elaboração deste documento. Entrevista atribuída a Luiz Felipe, realizada em 18 ago. 2024 no Prédio 34 da PUC Minas, Coração Eucarístico.

## 8. Checklist para a versão PDF

- Preencher nomes e responsabilidades da equipe e confirmar o canal de comunicação.
- Inserir o link direto do quadro Kanban, caso seja usada uma ferramenta externa, e atualizar cartões, prioridades e responsáveis.
- Realizar entrevistas adicionais; registrar consentimento e anonimizar dados pessoais quando sua identificação não for necessária.
- Revisar as hipóteses da matriz CSD, validar as personas e ajustar requisitos e telas conforme os achados.
- Definir critérios de aceite antes de iniciar implementação e só marcar cartões como concluídos após validação.
- Confirmar data, identificação da disciplina e demais dados solicitados pela instituição.
- Exportar o documento para PDF e verificar se links, tabelas, títulos e quebras de página permanecem legíveis.
