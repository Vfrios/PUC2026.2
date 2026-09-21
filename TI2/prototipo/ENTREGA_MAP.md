# Mapa do Monorepo Reviva

Ignorados: node_modules/, target/, dist/, .vite/, .git/, .github/, .vscode/, db/, miro/, build/, .mvn/ e qualquer cache.

## 1. Raiz (arquivos soltos)
| Arquivo | Papel | Usado por |
|---|---|---|
| .gitignore | Define exclusões do Git para o monorepo. | Git e ferramentas locais. |
| atlas-credentials.env | Armazena credenciais e configurações de acesso ao MongoDB Atlas. | scripts de seed/migração e backend. |
| d.py | Script auxiliar de operação/automação local. | Ambiente de desenvolvimento e manutenção. |
| docker-entrypoint.sh | Ponto de entrada do container para iniciar a aplicação no ambiente Docker. | Docker e deploy local. |
| Dockerfile | Define a imagem Docker do projeto. | Build e execução em container. |
| falta.txt | Registro de pendências e itens faltantes do projeto. | Desenvolvimento e acompanhamento. |
| minhas_extensoes.txt | Lista de extensões/ajustes do ambiente de desenvolvimento. | Setup do VS Code/local. |
| package-lock.json | Lockfile do npm no nível raiz do monorepo. | instalação/consistência de dependências. |
| package.json | Orquestra scripts do monorepo (frontend, backend e seed/migração do MongoDB). | desenvolvimento local e automação. |
| README.md | Documentação geral do projeto e do monorepo. | equipe, onboarding e execução local. |
| start-backend.cjs | Script para subir a API backend localmente em Node-driven bootstrap. | desenvolvimento local do backend. |

## 2. reviva-frontend/

### 2.1 Configuração (raiz do frontend)
| Arquivo | Papel |
|---|---|
| .env | Variáveis de ambiente locais do frontend. |
| .env.example | Modelo de variáveis de ambiente do frontend. |
| .gitignore | Exclusões do Git para o frontend. |
| index.html | HTML base para o Vite/React. |
| package-lock.json | Lockfile de dependências do frontend. |
| package.json | Dependências e scripts do frontend (dev/build/preview). |
| postcss.config.js | Configuração do PostCSS para Tailwind. |
| tailwind.config.js | Configuração do Tailwind CSS. |
| vite.config.js | Configuração do Vite e plugins. |
| vite.err.log | Log de erro do Vite. |
| vite.log | Log de execução do Vite. |

### 2.2 public/
| Arquivo | Papel |
|---|---|
| public/favicon.svg | Ícone do app exibido no navegador. |

### 2.3 src/ — estrutura completa

#### 2.3.1 src/auth/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/auth/authScreens.jsx | page | auth | Fluxo de autenticação, splash, login, cadastro e escolha de perfil. |
| src/auth/index.jsx | component | auth | Export/agrupamento das telas de autenticação. |

#### 2.3.2 src/shared/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/shared/index.jsx | component | shared | Barrel de exportação dos componentes compartilhados. |
| src/shared/shared.jsx | component | shared | Biblioteca central de utilitários, hooks, botões, cards e telas genéricas. |

#### 2.3.3 src/onboarding/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/onboarding/index.jsx | page | onboarding | Tela de onboarding e apresentação inicial do fluxo do usuário. |

#### 2.3.4 src/conjuntos/conjunto-01-publicacao-gestao/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/conjuntos/conjunto-01-publicacao-gestao/index.jsx | page | conjunto-01 | Entrypoint do conjunto de publicação e gestão de itens. |
| src/conjuntos/conjunto-01-publicacao-gestao/itemScreens.jsx | page | conjunto-01 | Cadastro, listagem, detalhes e solicitações do ciclo de item. |
| src/conjuntos/conjunto-01-publicacao-gestao/README.md | component | conjunto-01 | Documentação do conjunto de publicação e gestão. |

#### 2.3.5 src/conjuntos/conjunto-02-descoberta-detalhes/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/conjuntos/conjunto-02-descoberta-detalhes/discoveryScreens.jsx | page | conjunto-02 | Telas de descoberta, busca por itens e home do doador/receptor. |
| src/conjuntos/conjunto-02-descoberta-detalhes/index.jsx | page | conjunto-02 | Entrypoint do conjunto de descoberta e detalhes. |
| src/conjuntos/conjunto-02-descoberta-detalhes/README.md | component | conjunto-02 | Documentação do conjunto de descoberta e detalhes. |

#### 2.3.6 src/conjuntos/conjunto-03-solicitacao-chat/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/conjuntos/conjunto-03-solicitacao-chat/index.jsx | page | conjunto-03 | Entrypoint do fluxo de solicitação, negociação e chat. |
| src/conjuntos/conjunto-03-solicitacao-chat/README.md | component | conjunto-03 | Documentação do conjunto de solicitação e chat. |
| src/conjuntos/conjunto-03-solicitacao-chat/tradeScreens.jsx | page | conjunto-03 | Telas de inbox, chat, agendamento, confirmação e avaliação. |

#### 2.3.7 src/conjuntos/conjunto-04-perfil-reputacao/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/conjuntos/conjunto-04-perfil-reputacao/accountScreens.jsx | page | conjunto-04 | Telas de perfil, histórico, reputação, favoritos e notificações. |
| src/conjuntos/conjunto-04-perfil-reputacao/index.jsx | page | conjunto-04 | Entrypoint do conjunto de perfil e reputação. |
| src/conjuntos/conjunto-04-perfil-reputacao/README.md | component | conjunto-04 | Documentação do conjunto de perfil e reputação. |

#### 2.3.8 src/conjuntos/conjunto-05-comunidades-favoritos/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/conjuntos/conjunto-05-comunidades-favoritos/index.jsx | page | conjunto-05 | Entrypoint do conjunto de comunidades e favoritos. |
| src/conjuntos/conjunto-05-comunidades-favoritos/README.md | component | conjunto-05 | Documentação do conjunto de comunidades e favoritos. |

#### 2.3.9 src/conjuntos/conjunto-06-endereco-seguranca/
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/conjuntos/conjunto-06-endereco-seguranca/index.jsx | page | conjunto-06 | Entrypoint do conjunto de endereço e segurança/termos. |
| src/conjuntos/conjunto-06-endereco-seguranca/README.md | component | conjunto-06 | Documentação do conjunto de endereço e segurança. |

#### 2.3.10 src/ restante
| Arquivo | Tipo (page/component/hook/util/style) | Conjunto | Descrição em 1 linha |
|---|---|---|---|
| src/api.js | util | shared | Cliente HTTP/WS central para autenticação, requisições e WebSocket do app. |
| src/App.jsx | page | app-shell | Shell principal do app, navegação, sessão, toasts e estado global. |
| src/index.css | style | shared | Estilos globais e base do tema visual do projeto. |
| src/main.jsx | component | app-shell | Bootstrap do React e montagem da aplicação. |

## 3. reviva-api/

### 3.1 Configuração
| Arquivo | Papel |
|---|---|
| README.md | Documentação geral do módulo backend. |
| pom.xml | Definição do projeto Maven, dependências e configuração do Spring Boot. |
| src/main/resources/application.properties | Configuração principal da aplicação e variáveis externas. |
| src/main/resources/application.yml | Configuração YAML alternativa da aplicação. |
| .mvn/ | Ignorado conforme regra do monorepo. |
| mvnw | Não presente no projeto atual; ignorado/sem uso. |

### 3.2 src/main/api/ — estrutura completa

#### 3.2.1 auth/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/auth/AuthController.java | com.reviva.api.controller | Controller | Endpoint de autenticação e registro do usuário. |
| reviva-api/src/main/api/auth/LoginRequest.java | com.reviva.api.dto | DTO | Payload de login enviado pela aplicação. |
| reviva-api/src/main/api/auth/RegistroRequest.java | com.reviva.api.dto | DTO | Payload de registro do usuário. |
| reviva-api/src/main/api/auth/TokenResponse.java | com.reviva.api.dto | DTO | Resposta de autenticação com token JWT. |

#### 3.2.2 shared/config/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/shared/config/DevDataSeeder.java | com.reviva.api.config | Config | Seeder inicial para dados de desenvolvimento e testes. |
| reviva-api/src/main/api/shared/config/MongoConfig.java | com.reviva.api.config | Config | Configuração do cliente e banco MongoDB. |
| reviva-api/src/main/api/shared/config/RestClientConfig.java | com.reviva.api.config | Config | Configuração de clientes REST internos e integrações. |
| reviva-api/src/main/api/shared/config/SecurityConfig.java | com.reviva.api.config | Config | Regras de segurança, autenticação e autorização geral. |
| reviva-api/src/main/api/shared/config/WebSocketConfig.java | com.reviva.api.config | Config | Configuração do canal WebSocket para chat e presença. |

#### 3.2.3 shared/exception/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/shared/exception/GlobalExceptionHandler.java | com.reviva.api.exception | Util | Tratamento centralizado de exceções da API. |

#### 3.2.4 shared/operational/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/shared/operational/Denuncia.java | com.reviva.api.model | Model | Entidade de denúncia compartilhada entre módulos. |
| reviva-api/src/main/api/shared/operational/DenunciaController.java | com.reviva.api.controller | Controller | Endpoints de criação e gestão de denúncias. |
| reviva-api/src/main/api/shared/operational/DenunciaRepository.java | com.reviva.api.repository | Repository | Acesso ao MongoDB para denúncias. |
| reviva-api/src/main/api/shared/operational/DenunciaService.java | com.reviva.api.service | Service | Lógica de processamento e validação de denúncias. |
| reviva-api/src/main/api/shared/operational/HealthController.java | com.reviva.api.controller | Controller | Endpoint de healthcheck da API. |

#### 3.2.5 shared/security/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/shared/security/JwtAuthFilter.java | com.reviva.api.security | Security | Filtro JWT para autenticação em requisições HTTP. |
| reviva-api/src/main/api/shared/security/JwtHandshakeInterceptor.java | com.reviva.api.security | Security | Interceptor de handshake WebSocket para autenticação via token. |
| reviva-api/src/main/api/shared/security/JwtService.java | com.reviva.api.security | Security | Geração e validação de tokens JWT. |
| reviva-api/src/main/api/shared/security/WsAuthChannelInterceptor.java | com.reviva.api.security | Security | Interceptor de canal de mensagens WebSocket para autenticação do chat. |

#### 3.2.6 RevivaApiApplication.java
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/RevivaApiApplication.java | com.reviva.api | Config | Classe principal de bootstrap do Spring Boot. |

#### 3.2.7 conjunto-01-publicacao-gestao/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/cadastro-item/ItemController.java | com.reviva.api.controller | Controller | API de cadastro, atualização e listagem de itens. |
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/cadastro-item/ItemRequest.java | com.reviva.api.dto | DTO | Payload de criação/edição de item. |
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/cadastro-item/ItemService.java | com.reviva.api.service | Service | Lógica de negócio para itens e publicação. |
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/comum/Item.java | com.reviva.api.model | Model | Entidade principal do item publicado. |
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/comum/ItemRepository.java | com.reviva.api.repository | Repository | Repositório de itens para persistência. |
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/comum/ItemResponse.java | com.reviva.api.dto | DTO | Resposta pública de item para cliente/app. |
| reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/README.md | N/A | Documentation | Documentação do conjunto de publicação e gestão. |

#### 3.2.8 conjunto-02-descoberta-detalhes/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/busca-descoberta/CidadeResponse.java | com.reviva.api.dto | DTO | Resposta de cidade em buscas geográficas. |
| reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/busca-descoberta/EnderecoResponse.java | com.reviva.api.dto | DTO | Resposta de endereço de busca/detalhes. |
| reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/busca-descoberta/EstadoResponse.java | com.reviva.api.dto | DTO | Resposta de UF/estado em busca. |
| reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/busca-descoberta/GeoController.java | com.reviva.api.controller | Controller | Endpoints geográficos e de localização. |
| reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/busca-descoberta/GeoService.java | com.reviva.api.service | Service | Lógica de geolocalização, cidades e estados. |
| reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/README.md | N/A | Documentation | Documentação do conjunto de descoberta e detalhes. |

#### 3.2.9 conjunto-03-solicitacao-chat/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/Mensagem.java | com.reviva.api.model | Model | Entidade de mensagem do chat entre doador e receptor. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/MensagemController.java | com.reviva.api.controller | Controller | Endpoints de mensagens e presença em tempo real. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/MensagemRepository.java | com.reviva.api.repository | Repository | Persistência de mensagens do chat. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/MensagemRequest.java | com.reviva.api.dto | DTO | Payload de envio de mensagem. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/MensagemResponse.java | com.reviva.api.dto | DTO | Resposta serializada da mensagem. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/PresencaController.java | com.reviva.api.controller | Controller | Endpoints de presença online/heartbeat do chat. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat-negociacao/PresencaEvent.java | com.reviva.api.dto | DTO | Evento de presença para atualização em tempo real. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/comum/Agendamento.java | com.reviva.api.model | Model | Entidade de agendamento de doação/entrega. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/comum/AgendamentoController.java | com.reviva.api.controller | Controller | API de agendamento e acompanhamento da visita. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/comum/AgendamentoRepository.java | com.reviva.api.repository | Repository | Persistência de agendas e horários. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/comum/AgendamentoRequest.java | com.reviva.api.dto | DTO | Payload para criação/edição de agendamento. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/comum/AgendamentoService.java | com.reviva.api.service | Service | Lógica de negócio de agendamento. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/Solicitacao.java | com.reviva.api.model | Model | Entidade de solicitação de troca/doação. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/SolicitacaoController.java | com.reviva.api.controller | Controller | Endpoints para criação e atualização de solicitações. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/SolicitacaoRepository.java | com.reviva.api.repository | Repository | Persistência de solicitações. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/SolicitacaoRequest.java | com.reviva.api.dto | DTO | Payload da solicitação de item. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/SolicitacaoResponse.java | com.reviva.api.dto | DTO | Resposta serializada da solicitação. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/SolicitacaoService.java | com.reviva.api.service | Service | Lógica de negócio da solicitação e fluxo de troca. |
| reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/README.md | N/A | Documentation | Documentação do conjunto de solicitação e chat. |

#### 3.2.10 conjunto-04-perfil-reputacao/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/perfil/Usuario.java | com.reviva.api.model | Model | Entidade principal de usuário com perfil e reputação. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/perfil/UsuarioController.java | com.reviva.api.controller | Controller | Endpoints do perfil do usuário. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/perfil/UsuarioRepository.java | com.reviva.api.repository | Repository | Persistência de usuários. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/perfil/UsuarioResponse.java | com.reviva.api.dto | DTO | Resposta de usuário para consumo do frontend. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/Avaliacao.java | com.reviva.api.model | Model | Entidade de avaliação de doação/troca. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/AvaliacaoController.java | com.reviva.api.controller | Controller | Endpoints de avaliação e reputação. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/AvaliacaoRepository.java | com.reviva.api.repository | Repository | Persistência de avaliações. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/AvaliacaoRequest.java | com.reviva.api.dto | DTO | Payload de criação de avaliação. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/AvaliacaoService.java | com.reviva.api.service | Service | Lógica de cálculo e registro de avaliações. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/PontuacaoService.java | com.reviva.api.service | Service | Cálculo de pontos e indicadores de reputação. |
| reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/README.md | N/A | Documentation | Documentação do conjunto de perfil e reputação. |

#### 3.2.11 conjunto-05-comunidades-favoritos/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/conjuntos/conjunto-05-comunidades-favoritos/comunidades/Comunidade.java | com.reviva.api.model | Model | Entidade de comunidade e agrupamento social. |
| reviva-api/src/main/api/conjuntos/conjunto-05-comunidades-favoritos/comunidades/ComunidadeController.java | com.reviva.api.controller | Controller | Endpoints de comunidades e associação de usuários. |
| reviva-api/src/main/api/conjuntos/conjunto-05-comunidades-favoritos/comunidades/ComunidadeRepository.java | com.reviva.api.repository | Repository | Persistência de comunidades. |
| reviva-api/src/main/api/conjuntos/conjunto-05-comunidades-favoritos/README.md | N/A | Documentation | Documentação do conjunto de comunidades e favoritos. |

#### 3.2.12 conjunto-06-endereco-seguranca/
| Arquivo | Package | Tipo (Controller/Service/Repository/Model/DTO/Config/Security/Util) | Descrição em 1 linha |
|---|---|---|---|
| reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/seguranca-termos/Notificacao.java | com.reviva.api.model | Model | Entidade de notificação do sistema. |
| reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/seguranca-termos/NotificacaoController.java | com.reviva.api.controller | Controller | Endpoints de painel e disparo de notificações. |
| reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/seguranca-termos/NotificacaoRepository.java | com.reviva.api.repository | Repository | Persistência de notificações. |
| reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/seguranca-termos/NotificacaoResponse.java | com.reviva.api.dto | DTO | Resposta serializada de notificação para o cliente. |
| reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/seguranca-termos/NotificacaoService.java | com.reviva.api.service | Service | Lógica de criação e envio de notificações. |
| reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/README.md | N/A | Documentation | Documentação do conjunto de endereço e segurança. |

### 3.3 src/main/resources/
| Arquivo | Papel |
|---|---|
| reviva-api/src/main/resources/application.properties | Configuração base da aplicação Spring Boot. |
| reviva-api/src/main/resources/application.yml | Configuração alternativa em formato YAML com parâmetros do ambiente. |

## 4. Resumo numérico
- Total de arquivos por pasta:
  - raiz: 11
  - reviva-frontend/: 41
  - reviva-api/: 77
  - total geral em escopo: 129
- Total por extensão:
  - .java: 67
  - .jsx: 17
  - .js: 5
  - .css: 2
- Duplicatas de classe (class X em 2+ lugares):
  - Mensagem: 1 ocorrência
  - Solicitacao: 1 ocorrência
  - Usuario: 1 ocorrência
  - Item: 1 ocorrência
  - Agendamento: 1 ocorrência
  - Resultado: nenhuma duplicata detectada em 2+ arquivos; não há classe repetida que indique conflito de compilação por nome.

## 5. Conclusões
- Quantos arquivos a Tela 1 do conjunto-03 precisa (front + api): 22 arquivos no total, considerando o conjunto-03 completo no monorepo (3 no frontend + 19 na API).
- Quantos são exclusivos de outros conjuntos: 107 arquivos do monorepo não pertencem ao conjunto-03; o conjunto-03 representa uma fatia menor do escopo total.
- Se há duplicatas que impedem compilação: não há duplicatas de classes nos nomes auditados (Mensagem, Solicitacao, Usuario, Item, Agendamento). A análise atual não aponta conflito de compilação por duplicação de classe.

## Observação final
A estrutura está organizada em módulo por feature. O frontend tem um shell principal, utilitários compartilhados e seis conjuntos temáticos; a API segue a mesma divisão com modelos, DTOs, serviços, repositories, controllers e configurações transversais. O conjunto-03 é o módulo mais denso em chat/negociação e contém as entidades centrais de solicitação, agendamento e mensagens.
