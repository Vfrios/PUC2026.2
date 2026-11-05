# Reviva - Arquitetura inicial proposta, dados e API



## 1. Visão arquitetural

Como referência inicial, o Reviva poderia ser organizado em camadas desacopladas: uma interface web, uma API responsável por regras de negócio e autorização, uma camada de persistência e integrações externas opcionais. Essa separação permitiria desenvolver e testar cada responsabilidade sem amarrar a solução a uma tecnologia antes de validar os requisitos.

```text
Navegador
  |
  | HTTPS e contrato HTTP a definir
  v
Interface web responsiva
  |
  | API para consultas e comandos
  | Canal em tempo real opcional
  v
API da aplicação
  |
  +-- autenticação e autorização
  +-- casos de uso e regras de domínio
  +-- adaptador de persistência
  +-- provedor de mensagens/notificações, se necessário
  +-- integrações geográficas selecionadas após avaliação
```

Como decisão de implantação, a equipe deverá comparar desenvolvimento e publicação no mesmo domínio ou em serviços separados. Portas, domínios e estratégia de hospedagem ainda seriam definidos no planejamento técnico.

## 2. Tecnologias candidatas

As alternativas abaixo são opções para avaliação, não escolhas já aprovadas. A seleção deve considerar experiência da equipe, custo, requisitos de segurança, manutenção e ambiente de publicação.

| Camada | Alternativas a avaliar | Critérios de decisão |
| --- | --- | --- |
| Frontend | React com Vite, Vue ou alternativa equivalente | Conhecimento da equipe, acessibilidade e suporte a navegação responsiva |
| API | Java com Spring Boot, Node.js com framework web ou alternativa compatível | Regras de domínio, autenticação, validação e facilidade de testes |
| Persistência | Banco relacional ou documental gerenciado | Relações entre usuários, itens, solicitações, mensagens e consistência transacional |
| Autenticação | Sessão segura ou tokens de curta duração | Proteção de rotas, logout, recuperação de credencial e mitigação de exposição de tokens |
| Mensagens | WebSocket, serviço gerenciado de tempo real ou atualização periódica como etapa inicial | Necessidade de atualização imediata, escala e custo operacional |
| Fotos | Armazenamento de objetos com URLs controladas | Limites de tamanho, privacidade, custo e ciclo de vida dos arquivos |
| Localização | Provedor de CEP, dados geográficos públicos e biblioteca de mapas | Cobertura, termos de uso, privacidade e alternativa manual |
| Documentação de API | OpenAPI ou especificação equivalente | Geração e validação de contratos entre frontend e backend |

## 3. Organização lógica proposta

- **Interface:** telas, acessibilidade, navegação e estados de carregamento, vazio e erro.
- **API/aplicação:** validação de entrada, autorização e coordenação dos casos de uso.
- **Domínio:** regras para publicação, solicitação, agendamento, conclusão, reputação e impacto.
- **Persistência:** consultas e gravações desacopladas do mecanismo de banco escolhido.
- **Integrações:** adaptadores para geografia, notificações, mensagens em tempo real e armazenamento de imagens.
- **Observabilidade:** registro de eventos técnicos sem credenciais ou dados pessoais desnecessários.

Uma opção de organização seria agrupar a interface e os serviços por contexto funcional — autenticação, descoberta, itens, conta e trocas — e manter contratos explícitos entre a interface e a API. A estrutura concreta de pastas deverá ser definida quando a tecnologia for escolhida.

## 4. Modelo conceitual de dados

As entidades a seguir representam conceitos exigidos pelos requisitos. Não determinam banco, formato de documento nem mapeamento físico.

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

## 6. Contratos de API candidatos

As rotas abaixo são uma possível organização REST para discussão e prototipação. Métodos, autenticação, códigos de resposta e formatos devem ser confirmados em uma especificação de contrato antes da implementação.

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

## 7. Comunicação de mensagens em tempo real

- Se a atualização imediata for necessária, avaliar WebSocket com autorização por conversa ou solicitação.
- A autenticação e a autorização devem ser verificadas também no canal em tempo real, não somente na API HTTP.
- Eventos propostos podem representar mensagem recebida, agendamento criado/confirmado e retirada confirmada.
- Uma alternativa inicial é consultar atualizações periodicamente, desde que o impacto em experiência e carga seja avaliado.

## 8. Configuração e execução a definir

- Definir ambientes separados para desenvolvimento, testes e produção.
- Manter segredos, URLs, credenciais e configuração de banco fora do código-fonte.
- Documentar comandos de execução e requisitos de ambiente após a seleção da stack.
- Definir estratégia de migração e backup conforme a tecnologia de persistência escolhida.

## 9. Exemplos de payloads para discussão

Os exemplos abaixo ilustram informações necessárias aos fluxos. São rascunhos de contrato e podem mudar após validação dos requisitos e da tecnologia.

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

Como regra proposta, o serviço de cadastro deverá normalizar os campos, validar unicidade e nunca devolver a senha. O mecanismo de sessão e autenticação deverá ser definido após análise de segurança.

### Exemplo de payload de anúncio

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

Uma resposta de anúncio deverá expor somente os dados públicos necessários, sem serializar a conta completa do anunciante. A política de expiração deverá ser definida nos requisitos de negócio.

### Exemplo de payload de mensagem

```json
{
  "texto": "Olá, o item ainda está disponível?"
}
```

Se a solução incluir mensagens de localização ou eventos, o formato e os tipos permitidos deverão ser especificados no contrato da API.

### Exemplo de payload de agendamento

```json
{
  "solicitacaoId": "uuid-da-solicitacao",
  "dataHora": "2026-09-15T14:00:00Z",
  "localEncontro": "Entrada do Parque Municipal"
}
```

Como regra proposta, a API deverá validar a participação do usuário, o estado da solicitação e a inexistência de outro agendamento ativo incompatível.

## 10. Tratamento de erros proposto

| Situação | Status esperado | Tratamento do frontend |
| --- | --- | --- |
| JSON ou campo inválido | 400 | Mostrar correção próxima ao campo ou mensagem da API |
| Token ausente/expirado | 401 | Limpar sessão e voltar para login |
| Usuário não é proprietário/participante | 403 | Informar que o recurso não pertence ao usuário |
| Recurso inexistente | 404 | Atualizar lista e mostrar que o item não está disponível |
| E-mail ou CPF duplicado | 409 | Manter formulário e solicitar outro valor |
| Erro inesperado | 500 | Mensagem genérica, log correlacionável no backend |

O contrato deverá padronizar o corpo de erro e preservar o status HTTP para que a interface diferencie validação, sessão expirada, falta de permissão e recurso indisponível.

## 11. Fluxo lógico candidato de uma requisição

```text
Request HTTP
  -> autenticação e contexto de segurança
  -> validação da entrada
  -> caso de uso com autorização e regra de domínio
  -> interface de persistência
  -> mecanismo de armazenamento a escolher
  -> resultado convertido em resposta pública
  -> resposta JSON
```

As responsabilidades devem manter separação entre transporte, regras de domínio e persistência. A autorização contextual, as transições de estado e as atualizações relacionadas à conclusão devem ser executadas de forma consistente no servidor.

## 12. Persistência e implantação a decidir

### Critérios de persistência

- Avaliar banco relacional e documental considerando consultas, relações, consistência das transações e experiência da equipe.
- Se for adotado banco gerenciado, definir controles de acesso, criptografia, backup, retenção e ambiente de testes.
- Manter credenciais e strings de conexão fora do código e dos documentos públicos.
- Definir identificadores e índices a partir dos padrões de consulta esperados.
- Avaliar armazenamento de objetos para fotos, com limites de tamanho e política de acesso, em vez de assumir arquivos no banco principal.

### Implantação e dados

- Escolher estratégia de hospedagem para interface, API e persistência após comparar custo, manutenção e disponibilidade.
- Planejar carga de dados de demonstração e migrações reversíveis antes de operar dados reais.
- Definir rotinas de backup e validação de restauração antes da publicação.

## 13. Integrações externas candidatas

| Serviço | Uso | Falha esperada | Degradação |
| --- | --- | --- | --- |
| Serviço de CEP a selecionar | Sugerir endereço a partir do CEP | CEP inválido ou indisponibilidade | Permitir preenchimento manual |
| Fonte geográfica pública a avaliar | Listar estados e municípios | Timeout, resposta inválida ou mudança de contrato | Permitir nova tentativa e entrada manual |
| Provedor de mapas/geocodificação a avaliar | Exibir região ou localização compartilhada | Limite de uso, indisponibilidade ou restrição de licença | Informar bairro/cidade em texto e não bloquear a tarefa |
| Serviço de notificações a definir | Avisar mudanças relevantes | Falha de entrega | Manter notificações dentro da aplicação quando possível |

## 14. Requisitos operacionais propostos

- Definir verificações de saúde para a aplicação e para dependências críticas.
- Registrar falhas e métricas sem expor credenciais, dados pessoais, mensagens privadas ou coordenadas precisas.
- Monitorar disponibilidade, latência, erros e consumo dos serviços escolhidos.
- Planejar alertas, retenção de logs e recuperação de falhas antes da publicação.
- Garantir encerramento controlado e consistência das operações em andamento.
