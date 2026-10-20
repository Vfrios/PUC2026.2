# Reviva — Guia global da Sprint 1

Este documento é a referência principal para trabalhar, executar e demonstrar a cópia do Reviva preparada para a Sprint 1. O projeto original permanece fora desta pasta e não é alterado por este recorte.

## 1. Propósito desta cópia

`reviva-sprint1` contém uma aplicação independente com os fluxos iniciais planejados para a primeira sprint:

1. Publicar e consultar ofertas de doação ou troca.
2. Localizar ofertas por texto e categoria e consultar seus detalhes.
3. Guardar ofertas nos favoritos e consultar/participar de comunidades.
4. Manter o perfil e os endereços próprios.
5. Iniciar uma conversa vinculada a um item e trocar mensagens de texto.
6. Consultar informações iniciais de reputação, avisos e orientações básicas de segurança.

O recorte não deve ser confundido com o produto completo. As telas e as rotas de backend acessíveis nesta cópia foram reduzidas ao escopo inicial. Serviços e modelos internos que ainda dão suporte à leitura de dados antigos estão identificados na seção [Compatibilidade com dados antigos](#8-compatibilidade-com-dados-antigos).

O planejamento funcional usado como fonte é [`sprints/sprint1/Planejamento_Geral.md`](../sprints/sprint1/Planejamento_Geral.md).

## 2. O que cada frente deve entregar

### Brayan — Descoberta e detalhes

**Objetivo:** permitir que uma pessoa encontre ofertas e avalie as informações publicadas antes de iniciar contato.

- Consultar itens disponíveis em listas.
- Buscar por texto e consultar por categoria.
- Abrir os detalhes, incluindo descrição, condição, modalidade, imagens, localização informada e anunciante.
- Distinguir uma oferta disponível de uma que não esteja mais ativa.
- Comunicar estados vazios, ausência de resultados e erros de consulta sem apresentar dados incompletos como confirmados.

**Arquivos principais:** `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/discoveryScreens.jsx`, `itensDetalhes.jsx`; backend: `GeoController.java` e `GeoService.java` para a consulta de CEP usada no cadastro, além dos endpoints de itens mantidos na frente Gustavo.

**Demonstração/aceite:** encontrar uma oferta por texto ou categoria, abrir seus detalhes e compreender se continua disponível; uma busca sem resultados ou com falha deve orientar a pessoa.

### Gustavo — Publicação e gestão inicial

**Objetivo:** permitir que uma pessoa publique uma oferta e acompanhe os próprios anúncios.

- Criar anúncio com título, descrição, categoria e condição.
- Definir se a oferta é de doação ou troca.
- Informar fotos e localização geral quando houver dados.
- Consultar e editar anúncios próprios.
- Atualizar a disponibilidade da oferta.
- Validar os dados obrigatórios e informar falhas sem sugerir que uma publicação foi concluída quando não foi.

**Arquivos principais:** frontend `cadastroItem.jsx` e `gerenciarItens.jsx`; backend `ItemController.java`, `ItemRequest.java`, `ItemService.java`, `Item.java`, `ItemRepository.java` e `ItemResponse.java`.

**Demonstração/aceite:** cadastrar uma oferta válida, encontrá-la na gestão, editar seus dados e atualizar sua disponibilidade. A pessoa não pode editar anúncios de outra conta.

### João — Comunidades e favoritos iniciais

**Objetivo:** oferecer consulta de comunidades e uma lista pessoal de ofertas guardadas.

- Consultar comunidades, descrições e participação atual.
- Entrar ou sair de uma comunidade.
- Adicionar itens aos favoritos a partir das telas de oferta.
- Consultar e remover itens favoritos.
- Indicar se uma oferta salva deixou de estar disponível.
- Tratar lista vazia e falha de carregamento.

**Arquivos principais:** frontend `communityScreens.jsx` e `favoritos.jsx`; backend `Comunidade.java`, `ComunidadeController.java`, `ComunidadeRepository.java`, `ComunidadeResponse.java`, `Favorito.java`, `FavoritoController.java` e `FavoritoRepository.java`.

**Demonstração/aceite:** consultar comunidades, alterar a participação e salvar/remover uma oferta dos favoritos; a lista reflete a disponibilidade conhecida do anúncio.

### Tang — Endereços e segurança básica

**Objetivo:** permitir que a pessoa mantenha seus endereços e consulte avisos, preferências e recomendações básicas.

- Cadastrar, consultar, editar e remover endereços próprios.
- Definir o endereço principal.
- Consultar avisos e marcar avisos individuais como lidos.
- Consultar orientações de segurança e manter preferências básicas de notificação.
- Restringir endereços e preferências à conta autenticada.

**Arquivos principais:** frontend `enderecos.jsx` e `seguranca.jsx`; backend `Endereco.java`, `EnderecoController.java`, `EnderecoRepository.java`, `EnderecoRequest.java`, `EnderecoService.java`, `Notificacao.java`, `NotificacaoController.java`, `NotificacaoRepository.java`, `NotificacaoResponse.java`, `NotificacaoService.java`, `PreferenciasNotificacao.java` e `SegurancaController.java`.

**Demonstração/aceite:** criar e editar um endereço próprio, torná-lo principal, consultar avisos e salvar uma preferência. A aplicação não deve expor dados de outra pessoa.

### Thiago — Perfil e reputação inicial

**Objetivo:** apresentar informações públicas e próprias e mostrar reputação somente quando houver dados.

- Consultar e editar o próprio perfil.
- Consultar a apresentação pública de outra pessoa sem expor dados privados.
- Consultar indicadores de participação e avaliações existentes.
- Tratar claramente a ausência de avaliações.
- Restringir alterações à titular da conta.

**Arquivos principais:** frontend `accountScreens.jsx`; backend `PerfilPublicoResponse.java`, `PerfilRequest.java`, `Usuario.java`, `UsuarioController.java`, `UsuarioRepository.java`, `UsuarioResponse.java`, `Avaliacao.java`, `AvaliacaoRepository.java`, `AvaliacaoResponse.java`, `AvaliacaoService.java` e `PontuacaoService.java`.

**Demonstração/aceite:** alterar dados próprios, abrir um perfil público e verificar que informações privadas não aparecem; reputação inexistente não deve ser inventada.

### Vitor — Solicitação e conversa inicial

**Objetivo:** ligar o interesse em uma oferta a uma conversa de texto entre as pessoas envolvidas.

- Iniciar contato a partir de um item disponível.
- Manter cada conversa associada ao item que a originou.
- Consultar conversas recebidas e iniciadas na caixa de entrada.
- Consultar o histórico e enviar mensagens de texto.
- Identificar participantes e item em discussão.
- Permitir acesso à conversa somente às pessoas participantes e informar falhas de envio.

**Arquivos principais:** frontend `solicitacao.jsx` e `tradeScreens.jsx`; backend `Solicitacao.java`, `SolicitacaoController.java`, `SolicitacaoRepository.java`, `SolicitacaoRequest.java`, `SolicitacaoResponse.java`, `SolicitacaoService.java`, `Mensagem.java`, `MensagemController.java`, `MensagemRepository.java`, `MensagemRequest.java` e `MensagemResponse.java`.

**Demonstração/aceite:** iniciar uma conversa numa oferta ativa, enviar texto, sair da tela e voltar ao histórico. Não deve haver agenda, confirmação de retirada ou avaliação da troca neste fluxo.

## 3. Limites explícitos da Sprint 1

Os seguintes fluxos não fazem parte desta cópia funcional da Sprint 1:

- Agendar retirada/encontro, escolher data e local da retirada, gerar código, confirmar retirada ou concluir troca.
- Criar avaliações após uma troca.
- Histórico completo de atividades, moderação, denúncias e bloqueio de pessoas por ação da interface.
- Mural de comunidades, publicação de posts, curtidas/apoios e criação de comunidades.
- Busca geográfica avançada por GPS, geocodificação reversa ou listas de estados e municípios.
- Gestão em lote de anúncios, favoritos ou notificações.
- Arquivamento e remoção individual de conversas do Inbox.
- Presença em tempo real, WebSocket/STOMP ou indicador online/offline.
- Dashboard completo de impacto ambiental.

O endpoint que cria avaliações (`POST /api/avaliacoes`) não está incluído. A leitura de avaliações existentes continua habilitada como parte da apresentação inicial da reputação.

## 4. Arquitetura e responsabilidades

```text
reviva-sprint1/
├── reviva-frontend/       React + Vite; telas e chamadas HTTP
├── reviva-api/            Spring Boot; API REST, regras e persistência MongoDB
├── start-backend.cjs      Carrega as variáveis locais e inicia o Maven
├── .env                   Configuração local não versionada (MONGODB_DATABASE)
└── README.md              Este guia e inventário da Sprint 1
```

O frontend usa [`reviva-frontend/src/api.js`](./reviva-frontend/src/api.js) como cliente HTTP. A aplicação evita chamadas diretas ao backend dentro dos componentes. O backend disponibiliza controllers REST e persiste os dados com Spring Data MongoDB.

### Arquivos compartilhados do frontend

- `reviva-frontend/src/main.jsx` — ponto de entrada React.
- `reviva-frontend/src/App.jsx` — navegação, sessão, favoritos e proteção da lista de telas permitidas da Sprint 1.
- `reviva-frontend/src/api.js` — cliente REST, token e tratamento de falhas HTTP.
- `reviva-frontend/src/shared/shared.jsx` — componentes de interface, apresentação de itens, estados vazios, validações e utilitários visuais compartilhados.
- `reviva-frontend/src/index.css` — estilos globais.
- `reviva-frontend/src/auth/authScreens.jsx` — abertura, autenticação, cadastro e onboarding inicial.

### Inventário do frontend por frente

| Frente | Arquivos |
|---|---|
| Brayan | `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/discoveryScreens.jsx`; `itensDetalhes.jsx` |
| Gustavo | `reviva-frontend/src/conjuntos/Gustavo-publicacao-gestao/cadastroItem.jsx`; `gerenciarItens.jsx` |
| João | `reviva-frontend/src/conjuntos/João-comunidades-favoritos/communityScreens.jsx`; `favoritos.jsx` |
| Tang | `reviva-frontend/src/conjuntos/Tang-endereco-seguranca/enderecos.jsx`; `seguranca.jsx` |
| Thiago | `reviva-frontend/src/conjuntos/Thiago-perfil-reputacao/accountScreens.jsx` |
| Vitor | `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/solicitacao.jsx`; `tradeScreens.jsx` |

### Inventário do backend por frente

Os caminhos abaixo são relativos a `reviva-api/src/main/api/conjuntos/`.

| Frente | Arquivos incluídos |
|---|---|
| Brayan | `Brayan-descoberta-detalhes/busca-descoberta/GeoController.java`; `GeoService.java`; `EnderecoResponse.java` |
| Gustavo | `Gustavo-publicacao-gestao/cadastro-item/ItemController.java`; `ItemRequest.java`; `ItemService.java`; `comum/Item.java`; `comum/ItemRepository.java`; `comum/ItemResponse.java` |
| João | `João-comunidades-favoritos/comunidades/Comunidade.java`; `ComunidadeController.java`; `ComunidadeRepository.java`; `ComunidadeResponse.java`; `favoritos/Favorito.java`; `FavoritoController.java`; `FavoritoRepository.java` |
| Tang | `Tang-endereco-seguranca/endereco-salvo/Endereco.java`; `EnderecoController.java`; `EnderecoRepository.java`; `EnderecoRequest.java`; `EnderecoService.java`; `seguranca-termos/Notificacao.java`; `NotificacaoController.java`; `NotificacaoRepository.java`; `NotificacaoResponse.java`; `NotificacaoService.java`; `PreferenciasNotificacao.java`; `SegurancaController.java` |
| Thiago | `Thiago-perfil-reputacao/perfil/PerfilPublicoResponse.java`; `PerfilRequest.java`; `Usuario.java`; `UsuarioController.java`; `UsuarioRepository.java`; `UsuarioResponse.java`; `reputacao/Avaliacao.java`; `AvaliacaoRepository.java`; `AvaliacaoResponse.java`; `AvaliacaoService.java`; `PontuacaoService.java` |
| Vitor | `Vitor-solicitacao-chat/chat-negociacao/Mensagem.java`; `MensagemController.java`; `MensagemRepository.java`; `MensagemRequest.java`; `MensagemResponse.java`; `solicitacao/Solicitacao.java`; `SolicitacaoController.java`; `SolicitacaoRepository.java`; `SolicitacaoRequest.java`; `SolicitacaoResponse.java`; `SolicitacaoService.java` |

### Infraestrutura compartilhada do backend

- Aplicação e autenticação: `RevivaApiApplication.java`; `auth/AuthController.java`; `LoginRequest.java`; `RecuperarSenhaRequest.java`; `RegistroRequest.java`; `TokenResponse.java`.
- MongoDB e carregamento: `shared/config/CachingDbRefResolver.java`; `CarregadorEmLote.java`; `DbRefCache.java`; `DevDataSeeder.java`; `MongoConfig.java`; `MongoDbRefCacheConfig.java`; `RestClientConfig.java`.
- Segurança e erros: `shared/config/SecurityConfig.java`; `shared/security/JwtAuthFilter.java`; `JwtService.java`; `shared/exception/GlobalExceptionHandler.java`.
- Suporte operacional: `shared/operational/HealthController.java`; `Bloqueio.java`; `BloqueioRepository.java`; `BloqueioService.java`. O serviço de bloqueio permanece como regra interna para compatibilidade com registros existentes; não há tela ou endpoint de bloqueio na Sprint 1.

## 5. APIs REST disponíveis

Os endpoints abaixo são os usados pelos fluxos da Sprint 1. As rotas protegidas exigem token JWT, salvo quando a operação é explicitamente pública.

| Área | Método e rota | Uso |
|---|---|---|
| Autenticação | `POST /api/auth/registrar` | Criar conta |
| Autenticação | `POST /api/auth/login` | Iniciar sessão |
| Autenticação | `POST /api/auth/recuperar-senha` | Recuperação de senha do protótipo |
| Perfil | `GET /api/usuarios/me` | Consultar perfil próprio |
| Perfil | `PUT /api/usuarios/me` | Atualizar perfil próprio |
| Perfil público | `GET /api/usuarios/{id}/publico` | Consultar apresentação pública |
| Reputação | `GET /api/usuarios/{id}/reputacao` | Consultar indicadores disponíveis |
| Reputação | `GET /api/usuarios/{id}/avaliacoes` | Consultar avaliações históricas |
| Perfil público | `GET /api/usuarios/{id}/itens` | Consultar itens publicados |
| Segurança básica | `POST /api/usuarios/me/senha` | Alterar senha |
| Preferências | `GET/PUT /api/usuarios/me/preferencias` | Consultar e salvar preferências |
| Endereços | `GET/POST /api/enderecos` | Listar e criar endereços próprios |
| Endereços | `PUT/DELETE /api/enderecos/{id}` | Editar e remover endereço próprio |
| Endereços | `POST /api/enderecos/{id}/principal` | Definir endereço principal |
| CEP | `GET /api/geo/cep/{cep}` | Consultar endereço a partir do CEP |
| Itens | `GET /api/itens` | Buscar por texto, categoria, modalidade e região informada |
| Itens | `GET /api/itens/{id}` | Consultar detalhes |
| Itens próprios | `GET /api/itens/meus` | Listar anúncios da conta |
| Publicação | `POST /api/itens` | Criar anúncio |
| Publicação | `PUT /api/itens/{id}` | Editar anúncio próprio |
| Publicação | `POST /api/itens/{id}/doado` | Atualizar disponibilidade após doação |
| Conversas | `POST /api/solicitacoes` | Iniciar conversa vinculada a um item |
| Conversas | `GET /api/solicitacoes/conversas` | Listar conversas do Inbox |
| Conversas | `GET /api/solicitacoes/recebidas` | Listar conversas recebidas |
| Conversas | `GET /api/solicitacoes/enviadas` | Listar conversas iniciadas |
| Conversas | `GET /api/solicitacoes/{id}` | Consultar conversa (com autorização de participante) |
| Mensagens | `GET/POST /api/solicitacoes/{id}/mensagens` | Consultar histórico e enviar mensagem de texto |
| Mensagens | `POST /api/solicitacoes/{id}/mensagens/lidas` | Marcar mensagens como lidas |
| Notificações | `GET /api/notificacoes` | Listar avisos (opcional `?todas=true`) |
| Notificações | `POST /api/notificacoes/{id}/lida` | Marcar um aviso como lido |
| Comunidades | `GET /api/comunidades` | Consultar comunidades |
| Comunidades | `POST /api/comunidades/{id}/participar` | Participar |
| Comunidades | `POST /api/comunidades/{id}/sair` | Sair |
| Favoritos | `GET /api/favoritos` | Consultar favoritos próprios |
| Favoritos | `POST /api/favoritos/{itemId}` | Adicionar favorito |
| Favoritos | `DELETE /api/favoritos/{itemId}` | Remover favorito |
| Saúde | `GET /health` | Verificar se a API está respondendo |

O controller de solicitações não expõe ações de cancelar, recusar, arquivar ou ocultar conversas. Também não há rotas para agendamento, avaliação de troca, posts de comunidade, denúncias, bloqueios, ações em lote, geolocalização reversa ou presença WebSocket.

## 6. Configuração do MongoDB e variáveis de ambiente

O backend lê a configuração do diretório `reviva-sprint1`, não depende do `.env` do projeto original.

O script [`start-backend.cjs`](./start-backend.cjs) carrega as variáveis nesta ordem:

1. Variáveis já definidas no processo têm prioridade máxima.
2. `reviva-sprint1/.env` é lido antes.
3. `reviva-sprint1/atlas-credentials.env` completa as variáveis ausentes.

No clone atual, `.env` define `MONGODB_DATABASE=reviva`; `atlas-credentials.env` fornece os dados privados de conexão MongoDB. Os dois arquivos são ignorados pelo Git. Não copie senhas ou URI para este README, para logs ou para o código.

Para apontar a cópia a outro banco, edite somente a variável `MONGODB_DATABASE` em `.env`. Para usar outro cluster, atualize `MONGODB_URI` em `atlas-credentials.env`. Também é possível sobrescrever variáveis no ambiente do processo antes de iniciar:

```powershell
$env:MONGODB_DATABASE = "reviva"
$env:MONGODB_URI = "mongodb://localhost:27017"
pnpm start:backend
```

Quando nenhuma configuração externa existir, `application.yml` usa `mongodb://localhost:27017/reviva`. O projeto usa `MONGODB_DATABASE` para selecionar o banco; a URI é usada para conexão/autenticação. Não execute operações de limpeza ou migração destrutiva em um banco compartilhado.

## 7. Instalação, execução e validação

### Pré-requisitos

- Node.js 20.x.
- pnpm 12.5.1 (indicado no `package.json` e `.npmrc`).
- JDK 21.
- Maven compatível com o Spring Boot 3.3.2.
- MongoDB local ou credenciais privadas de um cluster configuradas nos arquivos locais.

### Executar frontend e backend

Na pasta `reviva-sprint1`:

```powershell
pnpm install
pnpm dev
```

O frontend Vite usa `http://localhost:5173`; a API Spring Boot inicia em `http://localhost:8080`. O script `dev` inicia os dois processos juntos. Para executá-los separadamente, use dois terminais:

```powershell
pnpm start:frontend
```

```powershell
pnpm start:backend
```

Em desenvolvimento, o frontend chama o backend no mesmo hostname da página, porta `8080`. Para outro endereço de API, defina `VITE_API_URL` antes de iniciar o frontend.

### Compilar

```powershell
pnpm build
```

Para validar o backend:

```powershell
Set-Location .\reviva-api
mvn clean package
```

O comando `clean` também remove classes antigas de funcionalidades já retiradas do clone.

## 8. Compatibilidade com dados antigos

O fluxo de agendamento foi removido desta cópia: não há tela, controller, DTO, entidade, repositório, serviço, rota de agendamento ou transporte WebSocket. As respostas de conversa não incluem dados de agenda, retirada ou confirmação.

O perfil pode continuar lendo avaliações antigas para apresentar reputação inicial. A leitura não exige nem expõe a relação histórica da avaliação com uma agenda; não existe endpoint para criar avaliação nesta sprint. Os campos adicionais armazenados em documentos MongoDB antigos não são usados pelos fluxos atuais.

## 9. Critérios gerais de aceite

- Os seis conjuntos demonstram somente os comportamentos descritos na seção 2.
- A pessoa entende quando uma ação foi concluída, está carregando ou falhou.
- Listas vazias e buscas sem resultados têm mensagens explicativas.
- O frontend não apresenta como sucesso uma operação que falhou na API.
- Perfil, endereços, favoritos e conversas respeitam a conta autenticada e as permissões do usuário.
- A oferta que originou uma conversa permanece identificável no Inbox e no histórico.
- Nenhum passo de agendamento, retirada, confirmação pós-troca ou avaliação pode ser iniciado pelas telas da Sprint 1.

## 10. Estrutura de pastas

```text
reviva-sprint1/
├── README.md
├── PROJETO.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── start-backend.cjs
├── .env                         # Local e ignorado pelo Git
├── atlas-credentials.env        # Local e ignorado pelo Git
├── reviva-frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── auth/
│       ├── conjuntos/
│       └── shared/
└── reviva-api/
    ├── pom.xml
    └── src/main/api/
        ├── auth/
        ├── conjuntos/
        └── shared/
```

`README.md` é a fonte de verdade do escopo, arquivos e execução desta cópia. Arquivos de compilação (`target/`, `dist/`) e dependências instaladas (`node_modules/`) não fazem parte do código-fonte funcional da Sprint 1.
