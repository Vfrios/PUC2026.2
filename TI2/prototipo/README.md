# Reviva — Doação e Troca de Objetos

Projeto completo: **backend Java 21 + Spring Boot 3** e **frontend React (Vite)**
já conversando de verdade um com o outro, com banco de dados real (H2 em
desenvolvimento, PostgreSQL pronto para produção).

```
reviva-projeto/
├── reviva-api/          ← backend Java/Spring Boot
└── reviva-frontend/     ← frontend React (Vite)
```

## O que mudou nesta versão (integração real)

Esta versão corrige/adiciona o que faltava para o front e o back conversarem
de verdade:

**Backend**
- **Bug de referência circular corrigido**: `Usuario.itensPublicados` agora é
  ignorado na serialização JSON (`@JsonIgnore`) — sem isso, `GET /api/itens`
  travava ou devolvia um JSON gigante e recursivo. Use `GET /api/itens/meus`
  para listar os itens de um usuário.
- **Senha nunca mais vaza pela API**: `Usuario.senhaHash` agora tem `@JsonIgnore`.
- **Endpoint que faltava**: `GET /api/itens/{id}` (a tela de Detalhes do Item
  dependia dele e ele não existia).
- **Endpoints novos**: `GET /api/solicitacoes/recebidas` e
  `GET /api/solicitacoes/enviadas`, usados nas telas "Gerenciar Itens" e
  "Histórico".
- **Chat de verdade, persistido no banco**: nova entidade `Mensagem` +
  `GET/POST /api/solicitacoes/{id}/mensagens`. O front busca a cada ~3,5s
  (polling simples); dá para evoluir para WebSocket/STOMP depois (a
  dependência já está no `pom.xml`).
- **Bug no QR Code de retirada corrigido**: o token gerado ao agendar não
  estava sendo salvo no banco (faltava `@Transactional` + `save()` explícito
  do item) — a confirmação por QR Code falhava silenciosamente antes.
- **Segurança mais precisa**: antes, `POST /api/itens` (cadastrar) estava
  liberado sem login, o que quebraria (doador ficaria nulo). Agora só GET é
  público em `/api/itens` e `/api/comunidades`; publicar, aceitar, agendar,
  confirmar etc. exigem login.
- **Dados de demonstração automáticos** (`DevDataSeeder`, perfil `dev`): ao
  subir a API pela primeira vez, ela já cria 2 usuários e 6 itens de exemplo.

**Frontend**
- Projeto Vite criado do zero em `reviva-frontend/`, com o protótipo visual
  original migrado telinha por telinha para chamadas reais em `src/api.js`.
- Login/registro reais, itens vindos do banco, solicitações, chat persistido,
  agendamento com geração de código de retirada, confirmação (com ou sem
  código), avaliações que atualizam a reputação, selo de impacto calculado
  pelo backend, notificações e comunidades reais.
- **Favoritos** continuam apenas no navegador (`localStorage`) — o backend
  não tem esse conceito ainda.
- **Feed de comunidade e "desafio do mês"** continuam ilustrativos — o
  backend não tem um modelo de post/desafio (ver "Próximos passos").
- **Upload de fotos** ainda não está implementado (o backend já aceita uma
  lista de URLs em `fotosUrls`, é só plugar um serviço de storage depois).

## Como rodar

### 1. Backend

```bash
cd reviva-api
mvn spring-boot:run
```
Requer **JDK 21+**. Se dois `mvn spring-boot:run` de tentativas antigas
travarem a porta, mate o processo Java (`Get-Process java | Stop-Process -Force`
no PowerShell) antes de rodar de novo.

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Console H2: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:reviva`, usuário `sa`, sem senha)

Ao subir, o `DevDataSeeder` cria automaticamente:

| Login                | Senha       | Perfil ativo |
|-----------------------|-------------|--------------|
| doador@reviva.com     | reviva123   | Doador (já com 6 itens publicados) |
| receptor@reviva.com   | reviva123   | Receptor     |

### 2. Frontend

Em outro terminal:

```bash
cd reviva-frontend
npm install
npm run dev
```

Abra o link que aparecer (normalmente **http://localhost:5173**). Por padrão
o front já aponta para `http://localhost:8080` — se sua API estiver em outro
endereço, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

**Dica para testar o fluxo completo (doação de ponta a ponta):** abra duas
abas/navegadores — uma logada como `doador@reviva.com` e outra como
`receptor@reviva.com`. No papel de Receptor, solicite um dos itens do doador;
no papel de Doador, aceite a solicitação em "Gerenciar itens"; depois é só
seguir o chat → agendar → confirmar → avaliar dos dois lados.

## Estrutura do backend

```
model/        Entidades JPA (Usuario, Item, Solicitacao, Agendamento, Avaliacao,
              Notificacao, Comunidade, Denuncia, Mensagem)
repository/   Interfaces Spring Data JPA
service/      Regras de negócio (impacto ambiental, selos, QR Code de retirada,
              recálculo de reputação)
controller/   Endpoints REST, um por fluxo/tela
dto/          Records de entrada e saída da API
security/     JWT (geração/validação) + filtro de autenticação
config/       Spring Security, CORS, seed de dados de demonstração
exception/    Tratamento global de erros (JSON padronizado)
```

## Mapeamento tela → endpoint

| Tela do front                   | Endpoint                                                |
|----------------------------------|----------------------------------------------------------|
| Login / Criar conta             | `POST /api/auth/login`, `POST /api/auth/registrar`       |
| Escolher perfil / Perfil        | `PATCH /api/usuarios/me/perfil-ativo`, `GET /api/usuarios/me` |
| Cadastro de Item                | `POST /api/itens`                                         |
| Gerenciar Itens                 | `GET /api/itens/meus`, `GET /api/solicitacoes/recebidas`, `DELETE /api/itens/{id}` |
| Busca / Lista / Mapa de Itens   | `GET /api/itens?categoria=&tipo=&termo=`                  |
| Detalhes do Item                | `GET /api/itens/{id}`                                     |
| Solicitação de Item             | `POST /api/solicitacoes`                                   |
| Aceitar / Recusar solicitação   | `POST /api/solicitacoes/{id}/aceitar`, `.../recusar`       |
| Chat                            | `GET/POST /api/solicitacoes/{id}/mensagens`                |
| Agendamento                     | `POST /api/agendamentos`                                    |
| Confirmação (Doação/Recebimento)| `POST /api/agendamentos/{id}/confirmar-doador`, `.../confirmar-receptor`, `.../confirmar-qrcode?token=` |
| Avaliação                       | `POST /api/avaliacoes`                                       |
| Dashboard de Impacto / Reputação| `GET /api/usuarios/me`                                       |
| Notificações                    | `GET /api/notificacoes`, `POST /api/notificacoes/{id}/lida`  |
| Comunidades                     | `GET/POST /api/comunidades`, `POST /api/comunidades/{id}/participar` |
| Moderação (denúncia)            | `POST /api/denuncias`                                        |
| Histórico de solicitações       | `GET /api/solicitacoes/enviadas`                              |

## Funcionalidade: confirmação por código/QR Code

Ao agendar uma retirada (`POST /api/agendamentos`), um token é gerado no
`Item` (`qrCodeToken`) e devolvido dentro do agendamento
(`agendamento.solicitacao.item.qrCodeToken`). No app:

- O **Doador** vê esse código na tela de confirmação e o mostra ao Receptor.
- O **Receptor** digita o código e confirma com
  `POST /api/agendamentos/{id}/confirmar-qrcode?token=...` — isso fecha
  **as duas pontas de uma vez**, atualiza o impacto ambiental e recalcula o
  selo do doador (Bronze/Prata/Ouro/Esmeralda), sem precisar de duas
  confirmações manuais separadas.
- Também dá para confirmar manualmente de cada lado, sem código, caso o
  encontro não permita compartilhar a tela.

## Próximos passos sugeridos

- Trocar o polling do chat por WebSocket/STOMP (a dependência já está no
  `pom.xml`) para mensagens em tempo real.
- Modelo de "post"/"desafio" no backend para o feed de comunidade deixar de
  ser ilustrativo.
- Upload real de fotos (S3/Cloud Storage) em vez de `fotosUrls` como lista de
  URLs livres.
- Job agendado (`@Scheduled`) para lembretes de 24h/1h antes da retirada.
- Trocar para o perfil `prod` (PostgreSQL) na hora de publicar de verdade —
  ajuste `DB_URL`, `DB_USER`, `DB_PASSWORD` e `JWT_SECRET` como variáveis de
  ambiente (não deixe o valor padrão de `JWT_SECRET` em produção).
