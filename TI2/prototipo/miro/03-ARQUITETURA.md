# Reviva - Arquitetura, Dados e API

## 1. Visão arquitetural

O Reviva é organizado como dois aplicativos coordenados:

```text
Navegador
  |
  | REST/JSON com Bearer JWT
  v
Frontend React + Vite
  |
  | HTTP para comandos e consultas
  | WebSocket/STOMP para mensagens e eventos do chat
  v
Backend Spring Boot
  |
  +-- Controllers REST
  +-- Services e regras transacionais
  +-- Repositories Spring Data JPA
  +-- MongoDB Atlas
  +-- APIs externas: ViaCEP, IBGE, Nominatim/OpenStreetMap
```

O frontend fica em `reviva-frontend` e o backend em `reviva-api`. Em desenvolvimento, o backend escuta na porta 8080 e o Vite na porta 5173. Em publicação same-origin, o frontend usa URLs relativas e a API pode servir a aplicação pelo mesmo domínio.

## 2. Stack tecnológica

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Linguagem backend | Java 21 | Implementação da API e regras de negócio |
| Framework backend | Spring Boot 3.3.2 | Inicialização, MVC, configuração e ciclo da aplicação |
| Web | Spring Web | Controllers REST e serialização JSON |
| Persistência | Spring Data MongoDB | Mapeamento de documentos e referências |
| Banco | MongoDB Atlas | Persistência gerenciada, índices e escala horizontal |
| Segurança | Spring Security, JWT e JJWT 0.12.5 | Autenticação stateless e proteção de endpoints |
| Validação | Jakarta Bean Validation | Validação de requisições |
| Tempo real | Spring WebSocket, STOMP e SockJS | Eventos de chat e agendamento |
| Documentação | Springdoc OpenAPI 2.6.0 | Swagger UI em `/swagger-ui.html` |
| Frontend | React 18 e Vite | Interface e composição de telas |
| Estilo | Tailwind CSS e estilos inline/tokens | Layout, estados e design responsivo |
| Ícones | Lucide React | Ícones consistentes e acessíveis |
| Mapas | Leaflet, react-leaflet e OpenStreetMap | Visualização de localização compartilhada |
| Integração frontend | Fetch, STOMP.js e SockJS | REST, autenticação e chat |

## 3. Organização do backend

- `controller`: expõe rotas HTTP e delega a casos de uso.
- `dto`: records de entrada e saída; evita expor entidades JPA diretamente.
- `model`: entidades e enums persistidos.
- `repository`: consultas e acesso às coleções MongoDB.
- `service`: regras de domínio, transações, notificações e pontuação.
- `security`: filtro JWT, serviço de token e configuração de segurança.
- `config`: CORS, WebSocket, OpenAPI e configurações da aplicação.
- `exception`: tratamento de erros de domínio e resposta HTTP.

O frontend centraliza as chamadas em `src/api.js`, mantendo base URL, token, parâmetros, conversão de erro e URL de WebSocket em um único ponto. As telas ficam agrupadas por contexto: autenticação, descoberta, itens, conta e trocas.

## 4. Modelagem de dados

### Usuario

| Campo | Tipo lógico | Descrição |
| --- | --- | --- |
| id | UUID/String | Identificador da conta |
| nome | texto | Nome exibido |
| email | texto único | Login e comunicação |
| cpf | texto único | Documento normalizado e validado |
| telefone | texto | Contato cadastrado |
| senhaHash | texto | Hash da senha |
| cep, numero, complemento | texto | Endereço cadastrado |
| latitude, longitude | decimal | Localização escolhida pelo usuário |
| raioBuscaKm | decimal | Alcance de busca |
| pontos | inteiro | Pontuação de engajamento |
| reputacaoScore | decimal | Média das avaliações |
| itensDoados | inteiro | Total de doações concluídas |
| kgResiduoEvitado | decimal | Impacto acumulado |
| seloAtual | enum | Bronze, Prata, Ouro ou Esmeralda |

### Item

Campos de identificação e conteúdo: `id`, `titulo`, `descricao`, `categoria`, `estadoConservacao`, `tipoPublicacao`, `fotosUrls`.

Campos de localização: `cep`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `latitude`, `longitude`.

Campos de impacto e ciclo: `impactoCo2Kg`, `pesoKg`, `status`, `publicadoEm`, `expiraEm`, `qrCodeToken`.

Enums principais:

- `Categoria`: `ROUPAS`, `LIVROS`, `MOVEIS`, `INFANTIL`, `ELETRONICOS`, `COZINHA`, `OUTROS`.
- `EstadoConservacao`: `NOVO`, `SEMINOVO`, `USADO`.
- `TipoPublicacao`: `DOAR`, `TROCAR`.
- `StatusItem`: ativo, doado, removido e estados de expiração derivados pela data.

### Solicitacao

Relaciona um `Item` a um `Usuario` receptor e representa a conversa inicial. Contém `mensagem`, `status` e `criadaEm`. O status pode ser `AGUARDANDO`, `ACEITA`, `RECUSADA` ou `CANCELADA`; no fluxo atual a criação já habilita a conversa com status `ACEITA`.

### Mensagem

Relaciona uma solicitação ao remetente, texto e instante de envio. Mensagens comuns são texto; eventos de localização, agendamento e retirada são serializados como JSON controlado para renderização específica no chat.

### Agendamento

Relaciona-se a uma solicitação e guarda `dataHora`, `localEncontro`, `status`, confirmação do receptor, confirmação do doador, confirmação do receptor na retirada e timestamps correspondentes. Status principais: `CONFIRMADO`, `CONCLUIDO`, `CANCELADO` e `PROBLEMA_REPORTADO`.

### Avaliacao

Relaciona o agendamento, avaliador e avaliado. Guarda nota de 1 a 5 e comentário opcional. A avaliação recalcula a reputação do usuário avaliado.

### Notificacao

Pertence a um usuário e pode referenciar uma solicitação. Guarda título, tipo, lida e data. A API permite marcação individual, limpeza total e remoção por expiração.

### Comunidade e Denuncia

`Comunidade` representa agrupamentos disponíveis e participantes. `Denuncia` registra autor, contexto, motivo, detalhes e estado de tratamento para moderação. O feed ilustrativo de posts exibido em algumas telas não é uma entidade persistida no backend atual.

## 5. Relações

```text
Usuario 1 ---- N Item
Usuario 1 ---- N Solicitacao como receptor
Item 1 ------- N Solicitacao
Solicitacao 1 N Mensagem
Solicitacao 1 1 Agendamento
Agendamento 1 N Avaliacao
Usuario 1 ---- N Avaliacao como avaliador/avaliado
Usuario 1 ---- N Notificacao
Usuario N ---- N Comunidade
Usuario 1 ---- N Denuncia
```

## 6. API REST

### Autenticação e usuário

| Método | Endpoint | Auth | Resultado |
| --- | --- | --- | --- |
| POST | `/api/auth/registrar` | Não | Cria conta e retorna JWT |
| POST | `/api/auth/login` | Não | Valida credenciais e retorna JWT |
| GET | `/api/usuarios/me` | Sim | Perfil da conta autenticada |
| PATCH | `/api/usuarios/me/perfil-ativo` | Sim | Atualiza contexto de perfil ativo |
| PATCH | `/api/usuarios/me/localizacao` | Sim | Salva latitude, longitude e raio de busca |
| GET | `/api/usuarios/{id}/reputacao` | Conforme controller | Consulta reputação pública |
| GET | `/api/usuarios/{id}/itens` | Não | Consulta itens públicos do usuário |

### Geografia

| Método | Endpoint | Auth | Resultado |
| --- | --- | --- | --- |
| GET | `/api/geo/cep/{cep}` | Não | Endereço e coordenadas aproximadas do CEP |
| GET | `/api/geo/reverse?lat=&lon=` | Não | Converte coordenadas em região |
| GET | `/api/geo/estados` | Não | Estados brasileiros |
| GET | `/api/geo/estados/{uf}/cidades` | Não | Cidades da UF |

### Itens

| Método | Endpoint | Auth | Resultado |
| --- | --- | --- | --- |
| GET | `/api/itens` | Sim ou público conforme configuração | Busca por categoria, tipo, termo, cidade e UF |
| GET | `/api/itens/{id}` | Não | Detalhes públicos do item |
| GET | `/api/itens/meus` | Sim | Itens do usuário autenticado |
| POST | `/api/itens` | Sim | Publica item e retorna 201 |
| PUT | `/api/itens/{id}` | Sim, dono | Edita e renova por 60 dias |
| DELETE | `/api/itens/{id}` | Sim, dono | Marca item como removido |
| POST | `/api/itens/{id}/restaurar` | Sim, dono | Reativa item expirado ou removido |
| POST | `/api/itens/{id}/doado` | Sim, dono | Marca como doado e atualiza impacto |

### Solicitações e mensagens

| Método | Endpoint | Auth | Resultado |
| --- | --- | --- | --- |
| POST | `/api/solicitacoes` | Sim | Cria conversa e mensagem inicial |
| GET | `/api/solicitacoes/conversas` | Sim | Inbox com enviadas e recebidas |
| GET | `/api/solicitacoes/recebidas` | Sim | Conversas sobre itens do usuário |
| GET | `/api/solicitacoes/enviadas` | Sim | Conversas iniciadas pelo usuário |
| GET | `/api/solicitacoes/{id}/mensagens` | Sim, participante | Histórico da conversa |
| POST | `/api/solicitacoes/{id}/mensagens` | Sim, participante | Envia mensagem |

### Agendamento, avaliação e moderação

| Método | Endpoint | Auth | Resultado |
| --- | --- | --- | --- |
| GET | `/api/agendamentos/solicitacao/{id}` | Sim, participante | Consulta agendamento |
| POST | `/api/agendamentos` | Sim, participante | Cria agendamento |
| POST | `/api/agendamentos/solicitacao/{id}/cancelar` | Sim, participante | Cancela troca |
| POST | `/api/agendamentos/{id}/confirmar-agendamento` | Sim, receptor | Confirma data e local |
| POST | `/api/agendamentos/{id}/gerar-codigo` | Sim, doador | Gera token/QR de retirada |
| POST | `/api/agendamentos/{id}/confirmar-doador` | Sim, participante | Confirma retirada pelo doador |
| POST | `/api/agendamentos/{id}/confirmar-receptor` | Sim, participante | Confirma retirada pelo receptor |
| POST | `/api/agendamentos/{id}/confirmar-qrcode?token=` | Sim, participante | Confirma usando token |
| POST | `/api/agendamentos/{id}/reportar-problema` | Sim, participante | Registra problema |
| POST | `/api/avaliacoes` | Sim | Registra avaliação pós-retirada |
| POST | `/api/denuncias` | Sim | Registra denúncia |

### Notificações e comunidades

| Método | Endpoint | Auth | Resultado |
| --- | --- | --- | --- |
| GET | `/api/notificacoes` | Sim | Lista notificações e limite de expiração |
| POST | `/api/notificacoes/{id}/lida` | Sim, proprietário | Marca como lida |
| DELETE | `/api/notificacoes` | Sim | Limpa notificações da conta |
| DELETE | `/api/notificacoes/expiradas` | Sim | Remove notificações antigas |
| GET | `/api/comunidades` | Não | Lista comunidades |
| POST | `/api/comunidades/{id}/participar` | Sim | Participa da comunidade |

## 7. WebSocket e eventos

- Endpoint de transporte: `/ws` via SockJS.
- O cliente envia o JWT na conexão usando o parâmetro `token`.
- O cliente assina `/topic/solicitacoes/{solicitacaoId}`.
- Mensagens comuns carregam texto; eventos usam `tipo`.
- Eventos conhecidos: `AGENDAMENTO_CRIADO`, `AGENDAMENTO_CONFIRMADO` e `RETIRADA_CONFIRMADA`.
- Ao receber evento, o frontend atualiza mensagens e reconsulta o agendamento quando necessário.

## 8. Configuração e execução

- Perfil padrão: `dev`.
- Porta: `8080`, sobrescrita por `PORT`.
- Banco: `./db/reviva.db`, sobrescrito por `REVIVA_DB_PATH`.
- JWT: segredo por `JWT_SECRET` e validade padrão de 1440 minutos.
- Notificações: expiração padrão de 30 dias.
- Swagger: `http://localhost:8080/swagger-ui.html`.
- Frontend: `npm install` e `npm run dev` dentro de `reviva-frontend`.

## 9. Contratos de requisição principais

### Registro

```json
{
  "nome": "Maria da Silva",
  "email": "maria@example.com",
  "cpf": "529.982.247-25",
  "telefone": "31999999999",
  "senha": "senha-de-exemplo",
  "cep": "30110-000",
  "numero": "100",
  "complemento": "Apto 2"
}
```

O backend remove máscara de CPF e CEP, valida unicidade e nunca devolve a senha. A resposta de autenticação contém o token necessário para as chamadas seguintes.

### Item

```json
{
  "titulo": "Jaqueta jeans P/M",
  "descricao": "Pouco usada, sem avarias.",
  "categoria": "ROUPAS",
  "estadoConservacao": "SEMINOVO",
  "tipoPublicacao": "DOAR",
  "cep": "30110000",
  "numero": "100",
  "complemento": "",
  "bairro": "Centro",
  "cidade": "Belo Horizonte",
  "uf": "MG",
  "latitude": -19.92,
  "longitude": -43.94,
  "impactoCo2Kg": 2.5,
  "pesoKg": 1.2,
  "fotosUrls": []
}
```

O retorno é `ItemResponse`, contendo resumo do doador e não a entidade `Usuario` inteira. O prazo `expiraEm` é calculado no backend.

### Mensagem

```json
{
  "texto": "Olá, o item ainda está disponível?"
}
```

Mensagens de localização e eventos são JSON serializado no campo `texto`, com tipos controlados como `LOCALIZACAO`, `AGENDAMENTO_CRIADO`, `AGENDAMENTO_CONFIRMADO` e `RETIRADA_CONFIRMADA`.

### Agendamento

```json
{
  "solicitacaoId": "uuid-da-solicitacao",
  "dataHora": "2026-09-15T14:00:00Z",
  "localEncontro": "Entrada do Parque Municipal"
}
```

O backend valida participante, solicitação cancelada e existência de outro agendamento ativo para o item.

## 10. Modelo de erros

| Situação | Status esperado | Tratamento do frontend |
| --- | --- | --- |
| JSON ou campo inválido | 400 | Mostrar correção próxima ao campo ou mensagem da API |
| Token ausente/expirado | 401 | Limpar sessão e voltar para login |
| Usuário não é proprietário/participante | 403 | Informar que o recurso não pertence ao usuário |
| Recurso inexistente | 404 | Atualizar lista e mostrar que o item não está disponível |
| E-mail ou CPF duplicado | 409 | Manter formulário e solicitar outro valor |
| Erro inesperado | 500 | Mensagem genérica, log correlacionável no backend |

O cliente lê preferencialmente `erro` ou `message` e encapsula o resultado em `ApiError`, mantendo o status HTTP para decisões como tratar `404` de agendamento inexistente como estado vazio.

## 11. Camadas e fluxo de uma requisição

```text
Request HTTP
  -> filtro JWT e contexto de segurança
  -> controller e Bean Validation
  -> service com autorização e regra de domínio
  -> repository MongoDB
  -> banco
  -> entidade convertida em DTO
  -> resposta JSON
```

Controllers não devem construir respostas com entidades JPA completas. Services são responsáveis por autorização contextual, transações, mudanças de estado, notificações, publicação de eventos e pontuação.

## 12. Persistência e implantação

### MongoDB Atlas

- `MONGODB_URI` contém a connection string do cluster; nunca versionar esse segredo.
- `MONGODB_DATABASE` define o banco lógico, normalmente `reviva`.
- O backend usa `@Document` e `@DBRef`; os IDs legados continuam como strings para preservar URLs e relações.
- MongoDB Atlas fornece persistência, backup, controle de acesso, índices e escalabilidade.
- O cluster deve usar TLS, usuário com privilégio mínimo e lista de IPs restrita.
- Criar índices para e-mail, CPF, status/expiração de item, item da solicitação e usuário de notificação.
- Fotos base64 permanecem compatíveis, mas devem migrar futuramente para armazenamento de objetos.

### Migração

- `migrar_sqlite_para_mongodb.js --dry-run` valida contagens sem escrever.
- `migrar_sqlite_para_mongodb.js` faz upsert idempotente por ID.
- O script converte a tabela de fotos para `fotosUrls` e a tabela de membros para referências em `membros`.
- Fazer backup do SQLite antes da migração e validar contagens por coleção depois.

## 13. Integrações externas

| Serviço | Uso | Falha esperada | Degradação |
| --- | --- | --- | --- |
| ViaCEP | Preencher endereço a partir do CEP | CEP inválido ou indisponibilidade | Permitir bairro/cidade manualmente |
| IBGE | Listar estados e cidades | Timeout ou resposta inválida | Manter campos de região e permitir nova tentativa |
| Nominatim/OpenStreetMap | Geocodificação reversa e mapa | Limite de uso ou indisponibilidade | Exibir coordenada/região já disponível sem bloquear o chat |
| Google Maps | Abrir localização compartilhada | Serviço externo indisponível | Manter mapa Leaflet e texto de localização |

## 14. Requisitos operacionais

- Health check deve verificar processo, conexão com banco e configuração mínima de JWT.
- Logs devem conter timestamp, nível, classe e contexto da operação sem dados pessoais.
- Monitorar taxa de 4xx, 5xx, tempo de resposta, falhas de WebSocket e crescimento do SQLite.
- Alertar quando o volume estiver próximo do limite ou quando backups falharem.
- Desligamento deve permitir concluir transações em andamento antes de encerrar.
