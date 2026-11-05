# Reviva — documentação global do sistema

## 1. Visão geral

O Reviva é uma plataforma de doação e troca local de objetos em bom estado, criada para conectar pessoas que querem se desfazer de itens úteis com outras que buscam objetos reutilizáveis. O sistema foi pensado para reduzir desperdício, facilitar a logística de retirada e dar mais confiança na negociação entre usuários próximos.

A solução é composta por:

- Backend Java 21 com Spring Boot 3
- Frontend React + Vite
- Banco MongoDB Atlas
- Comunicação em tempo real via WebSocket/STOMP
- Autenticação via JWT
- Separação funcional por conjuntos de negócio

O projeto foi estruturado em duas aplicações principais:

- `reviva-api/` — API REST + WebSocket + regras de negócio
- `reviva-frontend/` — interface web do usuário

---

## 2. Objetivo do produto

O objetivo principal do Reviva é tornar o reaproveitamento local mais simples, rápido e confiável.

Ele permite:

- publicar itens com fotos, descrição e condições
- buscar itens por categoria, cidade, UF e texto
- encontrar pessoas próximas para retirada
- iniciar conversas para combinar entrega ou troca
- agendar encontro e confirmar retirada
- avaliar a experiência após a negociação
- acompanhar indicadores de impacto e reputação

Em resumo, o sistema conecta: quem oferece, quem procura e quem quer reutilizar algo útil, tudo em um fluxo organizando a comunicação e a retirada.

---

## 3. Problema que resolve

Entre querer doar ou trocar e conseguir fazê-lo de forma prática, existem vários obstáculos:

- objetos em bom estado acumulam poeira em casa
- a parte logística exige coordenação entre pessoas
- a busca por itens específicos é cansativa
- alguns anúncios estão incompletos ou pouco confiáveis
- distância, segurança e ausência de informação dificultam o processo

O sistema tenta reduzir estes pontos com:

- filtros por categoria e localização
- fotos e descrição do item
- reputação de usuários
- conversas atreladas ao anúncio
- confirmação de retirada
- avaliações e impacto estimado

---

## 4. Público-alvo e perfis de usuário

### 4.1 Marina — quer doar com praticidade
Ela quer liberar objetos sem uso, publicar rapidamente e encontrar alguém que os aproveite.

### 4.2 Aline — procura itens reutilizáveis
Ela quer encontrar objetos específicos, comparar fotos, condições, proximidade e confiar mais na negociação.

### 4.3 Carlos — quer liberar espaço em casa
Ele costuma ter vários itens para encaminhar e precisa acompanhar anúncios e interessados próximos.

Todos os perfis podem, em diferentes momentos, atuar como:

- doador
- receptor
- trocador
- anunciante
- interessado

---

## 5. Visão de funcionalidades gerais

O sistema cobre seis grandes blocos funcionais:

1. Publicação e gestão
2. Descoberta e detalhes
3. Solicitação e chat
4. Perfil e reputação
5. Comunidades e favoritos
6. Endereço e segurança

Cada bloco aparece tanto no frontend quanto no backend como um conjunto funcional com responsabilidades próprias.

---

## 6. Estrutura do repositório

```text
prototipo/
├── README.md
├── PROJETO.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── atlas-credentials.env
├── start-backend.cjs
├── Dockerfile
├── docker-entrypoint.sh
├── d.py
├── miro/
│   └── PROMPT-GAMMA-APRESENTACAO-INICIAL.md
├── reviva-api/
│   ├── README.md
│   └── src/
│       └── main/
│           └── api/
│               ├── auth/
│               ├── conjuntos/
│               ├── shared/
│               └── RevivaApiApplication.java
├── reviva-frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── auth/
│       ├── conjuntos/
│       ├── shared/
│       └── index.css
├── sprints/
└── node_modules/
```

---

## 7. Arquitetura do sistema

### 7.1 Arquitetura geral

O projeto foi pensado em camadas:

- Frontend em React para interface e navegação
- API REST em Spring Boot para regras de negócio
- MongoDB Atlas como banco de dados persistente
- WebSocket para comunicação em tempo real
- JWT para autenticação e autorização

### 7.2 Modelo de integração

O frontend se comunica com a API via REST para:

- autenticação
- cadastro e edição de usuários
- itens e filtros
- solicitações
- notificações
- avaliações
- comunidades
- endereços

A comunicação em tempo real é feita via WebSocket/STOMP para:

- chat entre usuários
- presença online
- atualização de mensagens lidas
- notificações de conversa

### 7.3 Organização funcional

O frontend e o backend usam a mesma divisão por conjuntos funcionais:

| Conjunto | Frontend | Backend |
| --- | --- | --- |
| Publicação e gestão | cadastro/edição e gestão de itens | itens e regras de publicação |
| Descoberta e detalhes | home, busca, lista e detalhes | geolocalização e consulta |
| Solicitação e chat | solicitação, inbox, chat e troca | solicitações, mensagens e agendamento |
| Perfil e reputação | perfil, histórico, reputação e avaliação | usuários, avaliações e pontuação |
| Comunidades e favoritos | comunidades e favoritos | comunidades, posts e favoritos |
| Endereço e segurança | endereços, segurança, termos e notificações | endereços, segurança e notificações |

---

## 8. Stack tecnológica

### 8.1 Backend

- Java 21
- Spring Boot 3.3.2
- Spring Web
- Spring Security
- Spring Validation
- Spring Data MongoDB
- WebSocket / STOMP
- JWT
- MongoDB Atlas
- Springdoc / Swagger

### 8.2 Frontend

- React 18
- Vite
- Tailwind CSS
- Lucide
- STOMP.js
- SockJS
- Leaflet
- react-leaflet
- OpenStreetMap

### 8.3 Infra e utilidades

- Node.js 20
- pnpm
- MongoDB Atlas
- Docker suportado no projeto
- Scripts de carga/limpeza e migração de dados MongoDB

---

## 9. Funcionalidades do sistema

## 9.1 Autenticação e conta

O sistema possui fluxo de criação de conta e login com JWT.

Funcionalidades:

- cadastro de usuário com nome, e-mail, CPF, telefone, senha e endereço
- consulta de CEP com preenchimento automático de bairro, cidade e UF
- login com token JWT
- persistência da sessão no navegador
- logout com confirmação
- perfil único para publicar, receber, doar ou conversar
- indicadores de e-mail e telefone verificados
- reputação, pontos e selo do usuário
- recuperação de senha com validação de e-mail + CPF e nova senha
- bloqueio de usuários para segurança e prevenção de abuso

## 9.2 Home e início

A home do usuário oferece:

- saudação personalizada
- indicador de impacto ambiental
- atalhos para cadastro de item, gestão de itens, mensagens, comunidades e perfil
- acesso rápido ao inbox
- solicitações e conversas recentes
- notificações não lidas
- seletor de localização por CEP, GPS e histórico de bairros
- pull-to-refresh no feed
- categorias e itens publicados recentemente

## 9.3 Itens e anúncios

Funcionalidades de publicação:

- cadastro de item com título, descrição, categoria, estado de conservação
- tipo de publicação: doação ou troca
- fotos e endereço
- coordenadas geográficas
- peso estimado
- impacto ambiental estimado em kg de CO2 evitado
- regras de retirada
- modo de entrega

Categorias disponíveis:

- roupas
- livros
- móveis
- infantil
- eletrônicos
- cozinha
- outros

Condições:

- novo
- seminovo
- usado

Integrações e filtros:

- consulta de itens públicos
- filtro por categoria, tipo de publicação, termo, estado e cidade
- listagem de itens
- tela de detalhes do item
- exibição de anunciante, reputação, distância e localização
- verificação de status online/offline
- favoritos por usuário
- preview rápido do item na home

Gestão de anúncios:

- edição do anúncio
- renovação de validade por 60 dias
- remoção
- arquivamento
- restauração
- marcação como doado
- ações em lote para múltiplos itens
- cálculo de impacto ambiental por item

## 9.4 Busca e geolocalização

- busca por texto com Enter ou botão Buscar
- limpeza rápida do campo de pesquisa
- sugestões de categorias
- seleção manual de estado e cidade via dados do IBGE
- detecção automática da cidade/UF pelo GPS
- geocodificação reversa com Nominatim/OpenStreetMap
- consulta de CEP por ViaCEP
- armazenamento de endereço do usuário e geolocalização

## 9.5 Solicitações e chat

O sistema oferece um fluxo direto de negociação sem necessidade de uma etapa de match formal.

Funcionalidades:

- ao clicar em “Enviar mensagem”, a conversa é criada imediatamente
- mensagem inicial pronta sugerindo disponibilidade do item
- inbox com conversas iniciadas e recebidas
- abas de conversas ativas e arquivadas
- arquivamento / desarquivamento / exclusão da conversa
- conversa vinculada ao anúncio
- mensagens de texto persistidas
- atualização em tempo real por WebSocket
- indicadores de enviada, entregue e lida
- anexos de galeria, câmera e localização
- aviso de segurança para manter a interação dentro da plataforma

## 9.6 Compartilhamento de localização no chat

- captura da localização atual do navegador
- envio de latitude, longitude e horário em mensagem de conversa
- card com mini mapa Leaflet + OpenStreetMap
- zoom fixo
- link para abrir a coordenada no Google Maps em nova aba

## 9.7 Agendamento e retirada

- agendamento de data, horário e local de encontro
- geração de código/token de retirada associado ao item
- confirmação manual pelo doador ou receptor
- confirmação por código/token
- fechamento da doação quando os dois lados confirmam
- atualização de impacto, pontos e selo do doador ao concluir
- opção de relatar problema

## 9.8 Avaliações e impacto

- avaliação mútua após a retirada
- nota de 1 a 5 + comentário opcional
- recalculo de reputação, pontos e selos Bronze, Prata, Ouro e Esmeralda
- dashboard de itens doados, resíduos evitados, pontos e nota média
- cada quilo informado representa material reutilizado

## 9.9 Comunidades e favoritos

- listagem de comunidades
- participação em comunidades
- criação de posts
- apoio em posts
- listagem de itens salvos como favoritos
- favoritos persistidos no backend
- migração dos favoritos antigos do navegador

## 9.10 Endereços, segurança e notificações

Funcionalidades:

- cadastro e edição de endereços salvos
- definição de endereço principal
- gerenciamento de preferências de notificações
- notificação de chat, sistema e eventos relevantes
- badge com notificações não lidas
- leitura e limpeza de notificações
- expiração configurável de notificações
- troca de senha
- encerramento de outras sessões
- bloqueio de usuários
- denúncias por motivo diversos

## 9.11 Moderação e denúncias

O sistema contempla denúncias de:

- item divergente
- comportamento inadequado
- não comparecimento
- suspeita de golpe
- outros motivos

Além disso há controle operacional de bloqueio e gestão de risco de interação entre usuários.

---

## 10. Fluxos principais do produto

### 10.1 Cadastro e login

1. Usuário cria conta com dados pessoais e endereço
2. Validações de CPF/CNPJ, telefone e CEP
3. Backend cria usuário e gera token JWT
4. Frontend guarda o token e entra na aplicação

### 10.2 Cadastro de item

1. Usuário acessa tela de cadastro
2. Preenche dados do item
3. Adiciona fotos, categoria, tipo, condição e local
4. Backend valida dados e salva o anúncio
5. Item fica disponível para busca

### 10.3 Busca e descoberta

1. Usuário filtra por categoria/tipo/termo/estado/cidade
2. Sistema consulta itens públicos
3. Usuário acessa detalhes do item
4. Se interessado, inicia conversa

### 10.4 Solicitação e chat

1. Usuário abre conversa sobre um item
2. Mensagem inicial é criada automaticamente
3. Doador ou receptor responde pelo chat
4. Conversa fica registrada junto ao item
5. Mensagens e lidas são sincronizadas em tempo real

### 10.5 Agendamento e confirmação

1. Usuário agenda data/hora/local de encontro
2. Código/token de retirada é gerado
3. Doador e receptor confirmam participação
4. Sistema fecha a doação após confirmação mútua
5. Pontuação, reputação e impacto são atualizados

### 10.6 Avaliação pós-entrega

1. Usuário avalia o outro participante
2. Nota e comentário são registrados
3. Reputação e selo são recalculados
4. Impacto do item é refletido em indicadores

---

## 11. Estrutura funcional do frontend

A interface foi organizada em módulos e telas.

### 11.1 Módulos principais

- `src/auth/` — login, cadastro, recuperação de senha e onboarding
- `src/conjuntos/Gustavo-publicacao-gestao/` — cadastro e gerenciamento de itens
- `src/conjuntos/Brayan-descoberta-detalhes/` — busca, home, lista e detalhes
- `src/conjuntos/Vitor-solicitacao-chat/` — solicitações, chat, negociação e agendamento
- `src/conjuntos/Thiago-perfil-reputacao/` — perfil, histórico, reputação e avaliações
- `src/conjuntos/João-comunidades-favoritos/` — comunidades e favoritos
- `src/conjuntos/Tang-endereco-seguranca/` — endereços, privacidade e notificações
- `src/shared/` — componentes globais como navegação, status bar e toasts

### 11.2 Telas presentes no App.jsx

A aplicação possui telas como:

- splash
- auth
- onboarding
- chooseProfile
- homeDoador
- cadastroItem
- gerenciarItens
- chatDoador
- agendamentoDoador
- confirmDoacao
- inbox
- avaliarReceptor
- dashboardImpacto
- homeReceptor
- busca
- listaItens
- detalhesItem
- solicitacao
- chatReceptor
- agendamentoReceptor
- confirmRecebimento
- avaliarDoador
- historico
- perfil
- reputacao
- comunidades
- favoritos
- perfilPublico
- notificacoes
- moderacao
- enderecos
- seguranca
- termos
- privacidade

---

## 12. Estrutura funcional do backend

O backend foi organizado em pacotes por domínio e conjunto de negócio.

### 12.1 Pacotes principais

- `auth/` — autenticação e recuperação de senha
- `conjuntos/.../cadastro-item/` — gestão de itens
- `conjuntos/.../busca-descoberta/` — CEP, estados, cidades e geolocalização
- `conjuntos/.../solicitacao/` — solicitações e pedidos
- `conjuntos/.../chat-negociacao/` — mensagens, presença e chat
- `conjuntos/.../comum/` — agendamento e suporte compartilhado
- `conjuntos/.../perfil/` — usuários e perfil
- `conjuntos/.../reputacao/` — avaliações, pontuação e selo
- `conjuntos/.../comunidades/` — comunidades e posts
- `conjuntos/.../favoritos/` — itens salvos
- `conjuntos/.../endereco-salvo/` — endereços salvos
- `conjuntos/.../seguranca-termos/` — notificações e configurações de segurança
- `shared/operational/` — bloqueios, denúncias, saúde do sistema
- `shared/config/` — configurações gerais, MongoDB, WebSocket, cache
- `shared/security/` — autenticação, JWT e interceptadores WebSocket

---

## 13. Endpoints REST da API

Abaixo está o mapeamento dos principais endpoints do sistema.

### 13.1 Autenticação

- `POST /api/auth/registrar`
- `POST /api/auth/login`
- `POST /api/auth/recuperar-senha`

### 13.2 Usuários e perfil

- `GET /api/usuarios/me`
- `PUT /api/usuarios/me`
- `GET /api/usuarios/me/historico`
- `PATCH /api/usuarios/me/localizacao`
- `GET /api/usuarios/{id}/itens`
- `GET /api/usuarios/{id}/reputacao`
- `GET /api/usuarios/{id}/publico`
- `GET /api/usuarios/{id}/avaliacoes`
- `POST /api/usuarios/me/senha`
- `GET /api/usuarios/me/preferencias`
- `PUT /api/usuarios/me/preferencias`
- `POST /api/usuarios/me/sessoes/encerrar`

### 13.3 Bloqueios e segurança

- `GET /api/usuarios/me/bloqueados`
- `POST /api/usuarios/me/bloqueados/{usuarioId}`
- `DELETE /api/usuarios/me/bloqueados/{usuarioId}`

### 13.4 Endereços

- `GET /api/enderecos`
- `POST /api/enderecos`
- `PUT /api/enderecos/{id}`
- `DELETE /api/enderecos/{id}`
- `POST /api/enderecos/{id}/principal`

### 13.5 Geolocalização e CEP

- `GET /api/geo/cep/{cep}`
- `GET /api/geo/reverse`
- `GET /api/geo/estados`
- `GET /api/geo/estados/{uf}/cidades`

### 13.6 Itens e anúncios

- `POST /api/itens`
- `GET /api/itens`
- `GET /api/itens/meus`
- `GET /api/itens/{id}`
- `PUT /api/itens/{id}`
- `POST /api/itens/{id}/doado`
- `DELETE /api/itens/{id}`
- `POST /api/itens/{id}/restaurar`
- `POST /api/itens/lote`

### 13.7 Solicitações e conversas

- `POST /api/solicitacoes`
- `GET /api/solicitacoes/recebidas`
- `GET /api/solicitacoes/conversas`
- `GET /api/solicitacoes/enviadas`
- `GET /api/solicitacoes/{id}`
- `POST /api/solicitacoes/{id}/cancelar`
- `POST /api/solicitacoes/{id}/recusar`
- `POST /api/solicitacoes/{id}/arquivar`
- `POST /api/solicitacoes/{id}/desarquivar`
- `DELETE /api/solicitacoes/{id}/inbox`

### 13.8 Mensagens e chat

- `GET /api/solicitacoes/{solicitacaoId}/mensagens`
- `POST /api/solicitacoes/{solicitacaoId}/mensagens`
- `POST /api/solicitacoes/{solicitacaoId}/mensagens/lidas`
- `POST /api/solicitacoes/{solicitacaoId}/mensagens`

### 13.9 Agendamento

- `GET /api/agendamentos/solicitacao/{solicitacaoId}`
- `POST /api/agendamentos/solicitacao/{solicitacaoId}/cancelar`
- `POST /api/agendamentos`
- `POST /api/agendamentos/{id}/gerar-codigo`
- `POST /api/agendamentos/{id}/confirmar-agendamento`
- `POST /api/agendamentos/{id}/confirmar-doador`
- `POST /api/agendamentos/{id}/confirmar-receptor`
- `POST /api/agendamentos/{id}/confirmar-qrcode`
- `POST /api/agendamentos/{id}/reportar-problema`

### 13.10 Avaliações

- `POST /api/avaliacoes`
- `GET /api/avaliacoes/agendamento/{agendamentoId}/minha`

### 13.11 Comunidades e posts

- `GET /api/comunidades`
- `POST /api/comunidades`
- `POST /api/comunidades/{id}/participar`
- `POST /api/comunidades/{id}/sair`
- `GET /api/comunidades/{id}/posts`
- `POST /api/comunidades/{id}/posts`
- `POST /api/comunidades/{id}/posts/{postId}/apoiar`

### 13.12 Favoritos

- `GET /api/favoritos`
- `POST /api/favoritos/{itemId}`
- `DELETE /api/favoritos/{itemId}`
- `POST /api/favoritos/remover`

### 13.13 Notificações

- `GET /api/notificacoes`
- `POST /api/notificacoes/{id}/lida`
- `POST /api/notificacoes/lidas`
- `DELETE /api/notificacoes`
- `DELETE /api/notificacoes/expiradas`

### 13.14 Denúncias e saúde

- `POST /api/denuncias`
- `GET /health`

---

## 14. WebSocket e comunicação em tempo real

O sistema usa WebSocket para o fluxo de chat e presença do usuário.

Funcionalidades de tempo real:

- mensagens instantâneas
- entrega e leitura de mensagens
- status online/offline
- presença do usuário
- notificações de chat

A aplicação usa STOMP e SockJS no frontend.

---

## 15. Modelo de dados e domínio

Os principais dominios do sistema incluem:

- Usuário
- Item
- Solicitação
- Mensagem
- Agendamento
- Avaliação
- Comunidade
- Post de comunidade
- Endereço
- Notificação
- Denúncia
- Bloqueio
- Favorito

### 15.1 Usuario

Dados principais:

- nome
- e-mail
- CPF/CNPJ
- telefone
- senha hash
- endereço principal
- cidade, bairro, UF
- reputação
- pontos
- selo
- histórico de interações

### 15.2 Item

Dados principais:

- título
- descrição
- categoria
- tipo de publicação
- condição
- fotos
- endereço e coordenadas
- impacto CO2 estimado
- peso estimado
- doador
- status
- data de publicação
- validade

### 15.3 Solicitação

Relaciona um interessado com um item, servindo como base para conversa e confirmação.

### 15.4 Mensagem

- texto
- remetente
- solicitacaoId
- data
- status de leitura
- anexos e coordenadas geográficas

### 15.5 Agendamento

- item relacionado
- participantes
- data e hora
- local
- código/token
- confirmações
a
- status de problema

### 15.6 Avaliação

- autor
- alvo
- agendamento
- nota
- comentário

---

## 16. Segurança e regras de negócio

### 16.1 Autenticação

- login e acesso protegidos por JWT
- token é incluído no header Authorization
- rotas protegidas exigem autenticação

### 16.2 Autorização

- usuários só podem mexer em seus próprios itens
- cada conversa e solicitação tem dono e participantes
- ações de arquivar, excluir e manipular mensagens respeitam o usuário autenticado

### 16.3 Validação

A API valida:

- e-mail
- CPF/CNPJ
- telefone
- CEP
- senha
- campos obrigatórios do item
- payloads de request via `@Valid`

### 16.4 Segurança adicional

- senha armazenada em hash
- bloqueio de usuários
- denúncias e moderacao
- validação de sessão e logout
- proteção das rotas por Spring Security

---

## 17. Configuração e execução

### 17.1 Pré-requisitos

- JDK 21
- Maven
- Node.js
- pnpm
- MongoDB Atlas

### 17.2 Variáveis de ambiente

Para o backend:

```powershell
$env:MONGODB_URI = "******SEU-CLUSTER.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Reviva"
$env:MONGODB_DATABASE = "reviva"
```

Também podem existir configuração de JWT e demais valores sensíveis no ambiente.

### 17.3 Como rodar o backend

```powershell
cd reviva-api
mvn spring-boot:run
```

A API fica em:

- http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### 17.4 Como rodar o frontend

```powershell
cd reviva-frontend
pnpm install
pnpm run dev
```

### 17.5 Como rodar tudo com o monorepo

Na raiz do projeto:

```powershell
pnpm install
pnpm run dev
```

Scripts do projeto:

- `start:frontend` — inicia o frontend
- `start:backend` — inicia o backend
- `dev` — instala dependências e roda frontend + backend
- `seed:mongodb` — carrega massa de dados
- `clear:mongodb` — limpa dados do banco
- `migrate:mongodb-ids` — audita IDs antigos
- `migrate:mongodb-ids:apply` — aplica correção de IDs

---

## 18. Dados de demo e massa de teste

O projeto inclui scripts para carga e limpeza de dados no MongoDB Atlas.

Atenção:

- os dados ficam no MongoDB Atlas, não em banco local
- os IDs do MongoDB devem ser `ObjectId`
- o projeto possui preparação para migrar dados antigos que tenham IDs em string

---

## 19. Regras e decisões de implementação relevantes

O código do projeto enfatiza alguns princípios importantes:

- os endpoints são organizados por fluxo de negócio e não por tecnologia isolada
- o frontend usa múltiplas telas por conjunto funcional, sem `index.jsx` em cada pasta
- a API evita serialização problemática e ciclos em entidades
- a lógica de geolocalização usa CEP, GPS e cidades/UF
- a comunicação com o usuário é orientada a notificações e chat
- existe foco em confiança, privacidade e conveniência na negociação

---

## 20. Resumo executivo

O Reviva é uma plataforma local de reutilização de objetos com foco em simplicidade, confiança, proximidade e praticidade. Ele reúne as principais etapas de doação e troca em um único fluxo: encontrar um item, conversar, combinar retirada, confirmar a transação, avaliar a experiência e acompanhar o impacto.

Ele combina:

- frontend amigável e orientado a mobile
- backend robusto e modular
- chat em tempo real
- reputação e avaliação
- geolocalização e busca por proximidade
- notificação e segurança para usuários
- reutilização como alternativa prática ao descarte

Esse conjunto torna o sistema um produto funcional, completo e bem alinhado com o problema de doação e troca local.

---

## 21. Observações finais

Este documento foi escrito como uma visão global do sistema, reunindo os principais fluxos, módulos, funcionalidades, stack, regras de negócio e estrutura técnica. Ele funciona como uma base de documentação de projeto e pode ser usado como referência para manutenção, evolução ou apresentação para stakeholders.

Se quiser, no próximo passo posso criar também uma versão mais técnica, orientada para desenvolvedores, com:

- diagramas de arquitetura
- mapa de entidades e relacionamentos
- documentação dos controllers e services
- checklist de onboarding para novos devs
- documentação de API em formato Swagger/Markdown
