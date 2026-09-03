# Reviva — Doação e Troca de Objetos

Projeto completo com **backend Java 21 + Spring Boot 3** e **frontend React (Vite)**,
conectados por REST e WebSocket, usando SQLite em desenvolvimento e PostgreSQL
preparado para producao.

```
reviva-projeto/
├── reviva-api/          ← backend Java/Spring Boot
└── reviva-frontend/     ← frontend React (Vite)
```

## Visao geral

O projeto e dividido em dois aplicativos:

```text
reviva-api/       API Java com Spring Boot, JPA e SQLite/PostgreSQL
reviva-frontend/  Interface React executada pelo Vite
```

O frontend se comunica com a API por REST e recebe novas mensagens por WebSocket/STOMP.

## Funcionalidades

### Autenticacao e conta

- Cadastro de usuario com nome, e-mail, CPF, telefone, senha e endereco.
- Consulta de CEP com preenchimento de bairro, cidade e estado.
- Login com token JWT.
- Persistencia da sessao no navegador.
- Logout com confirmacao.
- Perfil unico: a mesma conta pode publicar, doar, receber e conversar.
- Indicadores de e-mail/telefone verificados, reputacao, pontos e selo.

### Inicio

- Home com saudacao personalizada e indicador de impacto ambiental.
- Atalhos para cadastrar item, gerenciar itens, mensagens, comunidades e perfil.
- Atalho de mensagens que abre diretamente o Inbox.
- Solicitacoes ou conversas recentes.
- Indicador de notificacoes nao lidas.
- Seletor de localizacao por CEP, GPS e historico de bairros.
- Pull-to-refresh no feed.
- Home com categorias e itens publicados recentemente.

### Itens e anuncios

- Cadastro de item com titulo, descricao, categoria, estado de conservacao,
  tipo de publicacao, fotos, endereco e coordenadas.
- Tipos de publicacao: doacao ou troca.
- Categorias: roupas, livros, moveis, infantil, eletronicos, cozinha e outros.
- Condicoes: novo, seminovo e usado.
- Consulta de itens publicos.
- Filtro por categoria, tipo de publicacao, termo, estado e cidade.
- Lista de itens e tela de detalhes.
- Exibicao de anunciante, reputacao, status online/offline, distancia e localizacao.
- Favoritos salvos localmente no navegador.
- Preview rapido do item na Home com toque longo.
- Gerenciamento dos proprios itens.
- Edicao do anuncio, com renovacao do prazo de validade por 60 dias.
- Remocao, arquivamento, restauracao e marcacao do item como doado.
- Calculo de impacto ambiental estimado por categoria.
- Peso aproximado informado no anuncio para medir materiais reutilizados, em alinhamento com a ODS 12.

### Busca e localizacao

- Busca por texto com envio pelo Enter ou botao Buscar.
- Limpeza rapida do campo de busca.
- Sugestoes de categorias.
- Selecao manual de estado e cidade usando dados do IBGE.
- Deteccao automatica da cidade/UF pelo GPS do navegador.
- Geocodificacao reversa com Nominatim/OpenStreetMap na API.
- Consulta de CEP via ViaCEP.

### Mensagens e Inbox

- Conversa criada imediatamente ao clicar em Enviar mensagem em um anuncio.
- Mensagem inicial pronta perguntando se o item ainda esta disponivel.
- Nao existe etapa de match, aceite ou recusa para iniciar uma conversa.
- Inbox com conversas iniciadas e recebidas pelo usuario.
- Conversa vinculada ao anuncio, com foto, titulo e status do item.
- Mensagens de texto persistidas no banco.
- Atualizacao em tempo real por WebSocket/STOMP.
- Indicadores visuais de mensagem enviada, entregue e lida.
- Arquivamento de conversa por gesto de deslizar.
- Menu de anexos com galeria, camera e compartilhamento de localizacao.
- Aviso de seguranca para manter a interacao dentro da plataforma.

#### Compartilhamento de localizacao

- Captura da localizacao atual pelo navegador.
- Envio de latitude, longitude e horario como mensagem da conversa.
- Cartao com mini mapa Leaflet e OpenStreetMap.
- Zoom fixo 15, sem zoom, arrasto ou controles interativos.
- Link para abrir a coordenada no Google Maps em nova aba.

### Agendamento e retirada

- Agendamento de data, horario e local de encontro pelo chat.
- Geracao de codigo/token de retirada associado ao item.
- Confirmacao manual pelo doador ou receptor.
- Confirmacao por codigo/token.
- Fechamento da doacao quando os dois lados confirmam.
- Atualizacao do impacto, pontos e selo do doador ao concluir.
- Opcao de relatar problema.

### Avaliacoes e impacto

- Avaliacao mutua apos a retirada, com nota de 1 a 5 e comentario opcional.
- Recalculo da reputacao, pontos e selos Bronze, Prata, Ouro e Esmeralda.
- Dashboard com itens doados, residuos evitados, pontos e nota media.
- Cada quilo informado no anuncio representa material que ganhou uma nova vida.

### Notificacoes, comunidades e moderacao

- Lista e marcacao de notificacoes como lidas.
- Badge de notificacoes nao lidas na Home.
- Clique em notificacao de chat abre a conversa relacionada.
- Limpeza manual de todas as notificacoes ou somente das expiradas.
- Expiracao configuravel por `reviva.notificacoes.expiracao-dias` ou pela variavel `NOTIFICACOES_EXPIRACAO_DIAS`.
- Listagem e participacao em comunidades.
- Denuncias com motivos de item divergente, comportamento inadequado,
    nao comparecimento, suspeita de golpe e outros.

## Stack tecnologica

- Backend: Java 21, Spring Boot 3.3.2, Spring Web, Security, Validation,
    Data JPA, WebSocket, JWT, SQLite, PostgreSQL e Springdoc.
- Frontend: React 18, Vite, Tailwind CSS, Lucide, STOMP.js, SockJS, Leaflet,
    react-leaflet e OpenStreetMap.

## Como executar

Pre-requisitos: JDK 21, Maven, Node.js e npm.

```powershell
cd reviva-api
mvn spring-boot:run
```

API: http://localhost:8080. Swagger: http://localhost:8080/swagger-ui.html.
O perfil `dev` usa o banco SQLite em `reviva-api/db/reviva.db`.

Para executar duas instâncias locais compartilhando os mesmos dados, configure
`REVIVA_DB_PATH` com o caminho absoluto do mesmo arquivo nas duas instâncias:

```powershell
$env:REVIVA_DB_PATH = "C:\caminho\do\projeto\reviva-api\db\reviva.db"
mvn spring-boot:run
```

O cadastro e o login usam essa mesma base. A conta não possui perfil persistido:
qualquer usuário pode doar e receber; a escolha da tela é apenas local no frontend.

### Railway (teste com SQLite)

Use um único serviço Railway com o `Dockerfile` da raiz. Em **Settings > Build**,
selecione o builder `Dockerfile` (ou informe `Dockerfile` como arquivo de configuração)
e deixe o Start Command vazio, pois o `ENTRYPOINT` já inicia a aplicação.

Crie um **Volume** Railway montado em `/data`. Configure as variáveis:

```text
SPRING_PROFILES_ACTIVE=prod
REVIVA_DB_PATH=/data/reviva.db
JWT_SECRET=<uma-chave-fixa-com-pelo-menos-32-caracteres>
```

O frontend e a API serão servidos pelo mesmo domínio; não configure
`VITE_API_URL` nesse cenário. O frontend usa URLs relativas e o navegador acessa
`/api` no próprio domínio Railway. Depois de criar o Volume, faça um novo deploy.
Sem Volume, o arquivo `.db` pode ser perdido a cada redeploy ou reinício.

No Render, o perfil `prod` usa o SQLite versionado em `reviva-api/db/reviva.db`,
igual ao ambiente local. Configure `SPRING_PROFILES_ACTIVE=prod`. Para manter
alterações feitas em produção após reinícios e novos deploys, monte um
Persistent Disk do Render em `/app/db`. Na primeira inicialização, o `reviva.db`
incluído na imagem é copiado para o disco; depois disso, os dados gravados no
Render são preservados e não são sobrescritos por novos deploys.

Em outro terminal:

```powershell
cd reviva-frontend
npm install
npm run dev
```

Frontend: http://localhost:5173. Para iniciar pela raiz, use `npm install` e
`npm run dev`; o comando usa `concurrently` para iniciar os dois aplicativos.

Se a porta 8080 estiver ocupada:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen
Stop-Process -Id <PID>
```

## Usuarios de demonstracao

| Usuario | Senha | Perfil |
| --- | --- | --- |
| `doador@reviva.com` | `reviva123` | Doador |
| `receptor@reviva.com` | `reviva123` | Receptor |

O seed cria itens e comunidades quando o banco esta vazio. Para testar, use os
dois usuarios em abas separadas, abra um anuncio e clique em Enviar mensagem.

## API REST

| Recurso | Metodo e rota | Funcao |
| --- | --- | --- |
| Auth | `POST /api/auth/registrar` | Criar conta |
| Auth | `POST /api/auth/login` | Entrar e obter JWT |
| Usuario | `GET /api/usuarios/me` | Consultar perfil |
| Usuario | `PATCH /api/usuarios/me/perfil-ativo` | Atualizar perfil ativo |
| Usuario | `PATCH /api/usuarios/me/localizacao` | Salvar coordenadas |
| Geo | `GET /api/geo/cep/{cep}` | Buscar endereco por CEP |
| Geo | `GET /api/geo/reverse` | Converter coordenadas em regiao |
| Geo | `GET /api/geo/estados` | Listar estados |
| Geo | `GET /api/geo/estados/{uf}/cidades` | Listar cidades |
| Itens | `GET /api/itens` | Buscar itens publicos |
| Itens | `GET /api/itens/{id}` | Ver detalhes |
| Itens | `GET /api/itens/meus` | Listar itens do usuario |
| Itens | `POST /api/itens` | Publicar item |
| Itens | `PUT /api/itens/{id}` | Editar item |
| Itens | `DELETE /api/itens/{id}` | Remover item |
| Itens | `POST /api/itens/{id}/restaurar` | Restaurar item |
| Itens | `POST /api/itens/{id}/doado` | Marcar como doado |
| Conversas | `POST /api/solicitacoes` | Criar conversa e mensagem inicial |
| Conversas | `GET /api/solicitacoes/conversas` | Listar Inbox |
| Conversas | `GET /api/solicitacoes/recebidas` | Listar conversas recebidas |
| Conversas | `GET /api/solicitacoes/enviadas` | Listar conversas iniciadas |
| Mensagens | `GET /api/solicitacoes/{id}/mensagens` | Listar mensagens |
| Mensagens | `POST /api/solicitacoes/{id}/mensagens` | Enviar mensagem |
| Agendamento | `POST /api/agendamentos` | Agendar retirada |
| Agendamento | `POST /api/agendamentos/{id}/confirmar-doador` | Confirmar pelo doador |
| Agendamento | `POST /api/agendamentos/{id}/confirmar-receptor` | Confirmar pelo receptor |
| Agendamento | `POST /api/agendamentos/{id}/confirmar-qrcode?token=` | Confirmar por codigo |
| Agendamento | `POST /api/agendamentos/{id}/reportar-problema` | Relatar problema |
| Avaliacoes | `POST /api/avaliacoes` | Avaliar usuario |
| Notificacoes | `GET /api/notificacoes` | Listar notificacoes |
| Notificacoes | `POST /api/notificacoes/{id}/lida` | Marcar como lida |
| Notificacoes | `DELETE /api/notificacoes` | Limpar todas |
| Notificacoes | `DELETE /api/notificacoes/expiradas` | Excluir expiradas |
| Comunidades | `GET /api/comunidades` | Listar comunidades |
| Comunidades | `POST /api/comunidades/{id}/participar` | Participar |
| Moderacao | `POST /api/denuncias` | Criar denuncia |

## WebSocket

As mensagens sao enviadas por REST para persistencia e publicadas no topico:

```text
/topic/solicitacoes/{solicitacaoId}
```

O cliente conecta pelo endpoint SockJS `/ws` e atualiza o chat em tempo real.

## Seguranca e configuracao

- Rotas publicas: autenticacao, documentacao, busca de itens e geolocalizacao.
- Publicacao, edicao, mensagens, agendamento, confirmacao, avaliacao e dados
    pessoais exigem JWT.
- Senhas e colecoes sensiveis nao sao expostas nas respostas publicas.
- Para producao, defina `DB_URL`, `DB_USER`, `DB_PASSWORD` e `JWT_SECRET`.
- Substitua o segredo JWT padrao antes de publicar o sistema.

## Limites atuais

- Favoritos ficam somente no `localStorage` e nao sincronizam entre dispositivos.
- Fotos aceitam URLs/data URLs; ainda nao existe storage dedicado.
- Posts e desafios de comunidade ainda nao possuem modelo de backend.
- Push notifications nativas ainda nao foram implementadas.
- Arquivamento e algumas preferencias sao locais.
- O mapa precisa de internet para carregar tiles do OpenStreetMap, mas nao exige token.

## Verificacao

```powershell
cd reviva-frontend
npm run build

cd ..\reviva-api
mvn test-compile -q
mvn test -q
```
