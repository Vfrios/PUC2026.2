# Reviva - Segurança e Estratégia de Testes

## 1. Objetivo

Este documento define os controles de segurança e a estratégia de verificação do Reviva. O foco é proteger identidade, dados pessoais, localização, conversas e transações de retirada, além de preservar a confiança entre doador e receptor.

## 2. Modelo de ameaça

| Ativo | Ameaça principal | Controle esperado |
| --- | --- | --- |
| Conta e sessão | Roubo ou reutilização de token | JWT assinado, expiração configurável e remoção local no logout |
| Senha | Vazamento por armazenamento inadequado | Persistir somente hash com `PasswordEncoder`; nunca registrar senha em log |
| CPF e endereço | Exposição indevida | Validação no cadastro, DTOs mínimos e acesso restrito ao proprietário |
| Localização | Rastreamento ou uso fora do contexto | Consentimento do navegador, envio sob ação explícita e exibição de região quando possível |
| Item | Alteração por usuário não autorizado | Verificação de proprietário em service e uso de usuário autenticado |
| Conversa | Leitura por terceiro | Conferência de participação antes de listar e enviar mensagens |
| Retirada | Falsa conclusão | Confirmações por participante, token associado ao item e estados transacionais |
| Denúncia | Abuso ou exposição de vítima | Autenticação, motivo controlado e tratamento reservado pela moderação |
| API | Entrada malformada ou abuso de recursos | Bean Validation, limites de payload, erros uniformes e logs sem dados sensíveis |

## 3. Controles implementados

### Autenticação e autorização

- Login e cadastro são endpoints públicos; os demais endpoints de conta exigem `Authorization: Bearer <JWT>`.
- O JWT contém identidade mínima para localizar o usuário autenticado.
- Senhas são comparadas com hash por `PasswordEncoder`.
- Cadastro rejeita e-mail ou CPF duplicado.
- Operações sobre itens usam o dono autenticado para impedir edição horizontal.
- Operações de agendamento validam que o usuário é doador ou receptor da solicitação.
- Notificação só pode ser marcada como lida pelo usuário a quem pertence.
- DTOs evitam serializar diretamente entidades JPA com dados privados e relacionamentos circulares.

### Proteção de dados

- CPF é armazenado normalizado, nunca usado como serviço de endereço.
- Consulta de CEP usa somente o CEP e não envia CPF a serviço externo.
- Coordenadas são solicitadas pelo navegador no momento da ação e devem ter finalidade clara.
- A localização compartilhada no chat é enviada como mensagem estruturada e abre mapa externo apenas mediante clique.
- O frontend não deve incluir token, senha, CPF completo ou endereço completo em mensagens de erro.
- Banco SQLite de produção deve ser colocado em volume persistente e com acesso de arquivo restrito ao processo da API.

### Segurança de comunicação e configuração

- Produção deve usar HTTPS para proteger JWT, mensagens e coordenadas em trânsito.
- `JWT_SECRET` deve ser uma chave fixa, aleatória e com pelo menos 32 caracteres; o valor de desenvolvimento não pode ser usado em produção.
- `SPRING_PROFILES_ACTIVE`, `REVIVA_DB_PATH`, `PORT` e `NOTIFICACOES_EXPIRACAO_DIAS` são configurações externas.
- WebSocket deve validar o token recebido no handshake e restringir a inscrição ao tópico da solicitação permitida.
- CORS, origem do frontend e cabeçalhos de segurança devem ser restritos ao domínio publicado.
- Logs devem omitir senha, token, CPF, conteúdo de mensagem e coordenadas exatas.

## 4. Riscos e reforços recomendados

| Prioridade | Risco | Ação recomendada |
| --- | --- | --- |
| Alta | JWT armazenado em `localStorage` é acessível a scripts em caso de XSS | Preferir cookie `HttpOnly`, `Secure` e `SameSite` quando a topologia permitir |
| Alta | Data URLs de fotos podem produzir payloads e registros grandes | Validar tamanho no backend e migrar fotos para armazenamento de objetos com URL assinada |
| Alta | Endpoint de WebSocket precisa aplicar autorização por tópico | Validar sessão e participação antes de assinar ou publicar mensagens |
| Média | Referências entre documentos podem exigir múltiplas leituras | Criar índices nas coleções, medir consultas e avaliar embedding ou agregações quando necessário |
| Média | Não há menção a limitação de tentativas de login | Adicionar rate limit, atraso progressivo e alerta de tentativas repetidas |
| Média | Link de Google Maps recebe coordenadas por URL | Pedir confirmação antes de abrir serviço externo e documentar compartilhamento com terceiro |
| Média | Texto de mensagem pode conter abuso ou dados pessoais | Criar moderação, bloqueio, denúncia e política de retenção |
| Baixa | Favoritos e arquivamento são apenas locais | Sincronizar com backend se a experiência exigir continuidade entre dispositivos |

## 5. Pirâmide de testes

### Camada unitária

Cobrir regras puras e serviços isolados:

- Validação de CPF, CEP, e-mail, senha e campos obrigatórios.
- Expiração e renovação de item em 60 dias.
- Filtros de categoria, tipo, termo, cidade e UF.
- Transições de status de item, solicitação e agendamento.
- Impedimento de acesso por usuário que não participa da solicitação.
- Geração, validação e rejeição de token de retirada.
- Pontuação, reputação, selo e impacto ambiental.
- Expiração de notificações em 30 dias ou valor configurado.
- Tratamento uniforme de erro de API no cliente.

### Camada de integração

Usar contexto Spring e banco isolado para verificar:

- Persistência e unicidade de usuário.
- Relacionamentos JPA entre item, usuário, solicitação, mensagem e agendamento.
- Transações de conclusão, atualização do item e pontuação.
- Serialização de DTOs sem senha, CPF ou relacionamentos cíclicos.
- Autorização dos controllers com usuário autenticado.
- Consulta de busca sem itens expirados.
- Notificação criada ao abrir conversa e ao agendar.

### Camada de contrato HTTP

Validar método, rota, status e payload para cada endpoint descrito em `03-ARQUITETURA.md`:

- `201 Created` para cadastro e publicação bem-sucedidos.
- `401 Unauthorized` para ausência ou invalidade de JWT.
- `403 Forbidden` para recurso de outro usuário.
- `404 Not Found` para item, solicitação ou agendamento inexistente.
- `409 Conflict` para e-mail ou CPF duplicado.
- `400 Bad Request` para campos inválidos ou transição de estado impossível.
- `204 No Content` para exclusões e ações sem corpo quando aplicável.

### Camada frontend

- Renderização de carregamento, erro, vazio e sucesso em cada tela remota.
- Formatação e validação de CPF, CEP e peso.
- Bloqueio do botão durante submissão para evitar duplicidade.
- Persistência e remoção de token no login e logout.
- Filtros acionados por Enter e botão Buscar.
- Permissionamento do navegador para GPS, câmera e galeria.
- Atualização de mensagem via REST e WebSocket sem duplicata.
- Navegação por teclado, foco, rótulos, aria-label e leitura por tecnologia assistiva.
- Responsividade em 320 px, 390 px, 768 px e 1440 px de largura.

### End-to-end

Cenário principal com duas contas:

1. Registrar doador e receptor.
2. Entrar em navegadores ou contextos separados.
3. Doador publicar item com foto, peso e endereço.
4. Receptor encontrar item por busca e abrir detalhes.
5. Receptor iniciar conversa com mensagem.
6. Doador receber notificação e responder em tempo real.
7. Criar agendamento, confirmar pelo receptor e gerar código pelo doador.
8. Confirmar retirada por QR Code ou por ambas as confirmações manuais.
9. Verificar item doado, pontos, impacto, selo e avaliação.
10. Reportar um problema em fluxo alternativo e verificar o estado correspondente.

## 6. Testes de segurança

- Tentar acessar perfil, item privado, mensagens e agendamento sem token.
- Repetir requisição autenticada com token expirado, malformado e de outra conta.
- Tentar editar, remover, restaurar e marcar como doado item de outra pessoa.
- Tentar ler mensagens e agendamento de solicitação sem participar.
- Tentar marcar notificação de outra conta como lida.
- Enviar strings muito longas, JSON incompleto, caracteres de controle e HTML em campos de texto.
- Enviar foto acima do limite e data URL inválida.
- Repetir confirmação de retirada e confirmar com token incorreto.
- Verificar que erros não exibem stack trace, SQL, JWT, senha ou CPF.
- Rodar análise de dependências Maven e npm e tratar vulnerabilidades críticas antes da publicação.

## 7. Dados de teste

Usar contas sintéticas, sem CPF, endereço ou telefone reais. O banco de teste deve ser descartável e isolado. Os usuários demonstrativos documentados são `doador@reviva.com` e `receptor@reviva.com`, ambos com senha `reviva123`; essas credenciais devem existir somente em ambiente de demonstração.

## 8. Evidências mínimas para uma release

- Relatório de testes unitários e integração sem falhas.
- Resultado dos cenários E2E principais e alternativos.
- Registro de contratos HTTP exercitados.
- Resultado de auditoria de dependências.
- Verificação manual de acessibilidade e responsividade.
- Confirmação de que segredos de produção não estão versionados.

## 9. Casos de teste funcionais detalhados

| ID | Cenário | Dado de entrada | Resultado esperado |
| --- | --- | --- | --- |
| TS-01 | Cadastro válido | E-mail e CPF inéditos, CPF válido e CEP com 8 dígitos | `201`, token emitido, senha armazenada somente como hash |
| TS-02 | Cadastro duplicado | E-mail já utilizado | `409`, nenhuma segunda conta criada |
| TS-03 | Login inválido | E-mail existente e senha incorreta | `401`, mensagem genérica, sem indicar qual campo falhou |
| TS-04 | Publicação mínima | Item com título, categoria, tipo e endereço válidos | `201`, status `ATIVO`, validade de 60 dias |
| TS-05 | Item expirado | `expiraEm` anterior ao instante atual | Item não aparece em `GET /api/itens` |
| TS-06 | Alteração horizontal | Usuário B envia `PUT` para item do usuário A | `403` ou erro de domínio equivalente, item inalterado |
| TS-07 | Conversa | Usuário B solicita item de A com mensagem | Solicitação, mensagem inicial e notificação criadas |
| TS-08 | Mensagem em tempo real | Participante envia texto e outro participante está conectado | Mensagem persistida e recebida uma vez no tópico |
| TS-09 | Consulta indevida | Usuário C consulta mensagens de solicitação de A e B | Acesso negado, sem conteúdo retornado |
| TS-10 | Agendamento duplicado | Segunda tentativa para a mesma solicitação | Reutiliza ou rejeita o agendamento existente, sem duplicidade |
| TS-11 | QR inválido | Token diferente do token do item | Operação rejeitada, status não concluído |
| TS-12 | Conclusão | Confirmação do doador e receptor | Item `DOADO`, agendamento `CONCLUIDO`, impacto e pontos atualizados |
| TS-13 | Repetição de conclusão | Confirmação repetida após conclusão | Não duplica pontos nem contagem de itens |
| TS-14 | Notificação de terceiro | Usuário A marca notificação de B como lida | `403`, notificação de B permanece inalterada |
| TS-15 | Denúncia | Motivo válido e detalhes | Denúncia registrada sem revelar tratamento interno |

## 10. Testes de contrato e payloads

Cada endpoint deve ser verificado com payload válido, campo obrigatório ausente, tipo incorreto, valor fora do enum, token ausente e token de outro usuário. A suíte deve confirmar:

- nomes de propriedades em camelCase, compatíveis com os records Java e `api.js`;
- datas em ISO-8601, com conversão correta para `Date` no frontend;
- listas vazias como `[]`, nunca como `null` quando a tela espera iteração;
- resposta `204` sem tentativa de fazer parse de JSON;
- erro com campo `erro` ou `message`, convertido por `ApiError` para mensagem de tela;
- DTO público sem `senhaHash`, CPF completo, token de retirada ou localização privada;
- compatibilidade entre enum Java e filtros enviados pelo frontend, como `ROUPAS`, `DOAR` e `SEMINOVO`.

## 11. Testes de concorrência e recuperação

- Dois usuários tentam agendar o mesmo item simultaneamente; apenas um agendamento ativo deve prevalecer.
- Doador clica duas vezes em Marcar como doado; a contagem e os pontos devem ser incrementados uma vez.
- REST e WebSocket entregam a mesma mensagem; o cliente deve deduplicar pelo ID.
- Banco fica indisponível durante uma transação; nenhuma atualização parcial de impacto deve ser confirmada.
- WebSocket cai durante conversa; o cliente deve tentar reconectar e continuar permitindo envio pelo endpoint REST.
- Reinício da aplicação com volume persistente; usuários, itens e mensagens devem permanecer disponíveis.

## 12. Testes de acessibilidade e UX

Para cada tela principal, executar com teclado, leitor de tela e viewport estreito:

1. Login: alcançar e enviar todos os campos sem mouse.
2. Cadastro: ouvir rótulos, erros e retorno da consulta de CEP.
3. Busca: perceber filtros, resultado vazio e limpeza de filtros.
4. Item: identificar título, estado, anunciante e ação principal.
5. Chat: distinguir mensagem própria, recebida e evento de sistema.
6. Agendamento: entender etapa atual, responsável e próxima ação.
7. Modal destrutivo: mover foco, confirmar, cancelar e devolver foco ao gatilho.

Registrar screenshot ou vídeo somente com dados sintéticos e anotar problemas por severidade: bloqueador, alto, médio ou baixo.

## 13. Critérios de saída

Uma versão pode ser considerada pronta quando todos os testes P0 passam, nenhum achado crítico ou alto de segurança está aberto, os contratos documentados estão compatíveis com o cliente, e os fluxos de cadastro, publicação, conversa e conclusão foram executados em ambiente limpo.
