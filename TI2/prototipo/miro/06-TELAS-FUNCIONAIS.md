# Organização dos conjuntos e telas

## Objetivo

O projeto será dividido em 6 conjuntos. Cada conjunto terá exatamente 2 telas funcionais, totalizando 12 telas.

Onboarding e login ficam separados, pois são telas de entrada do sistema e não fazem parte da contagem dos conjuntos funcionais.

Cada conjunto deve funcionar de forma independente durante o desenvolvimento, mas suas telas devem continuar integradas ao sistema completo na terceira sprint.

---

## Estrutura geral do projeto

```text
prototipo/
├── reviva-frontend/
│   └── src/
│       ├── onboarding/
│       ├── auth/
│       ├── shared/
│       └── conjuntos/
│           ├── conjunto-01-publicacao-gestao/
│           ├── conjunto-02-descoberta-detalhes/
│           ├── conjunto-03-solicitacao-chat/
│           ├── conjunto-04-perfil-reputacao/
│           ├── conjunto-05-comunidades-favoritos/
│           └── conjunto-06-endereco-seguranca/
│
└── reviva-api/
    └── src/
        └── main/
            └── api/
                ├── RevivaApiApplication.java
                ├── shared/
                ├── auth/
                └── conjuntos/
                    ├── conjunto-01-publicacao-gestao/
                    ├── conjunto-02-descoberta-detalhes/
                    ├── conjunto-03-solicitacao-chat/
                    ├── conjunto-04-perfil-reputacao/
                    ├── conjunto-05-comunidades-favoritos/
                    └── conjunto-06-endereco-seguranca/
```

---

## Pastas independentes do sistema

### Frontend: onboarding

```text
reviva-frontend/src/onboarding/
├── Onboarding.jsx
└── onboarding.css
```

### Frontend: login e cadastro

```text
reviva-frontend/src/auth/
├── Login.jsx
├── Cadastro.jsx
├── authService.js
└── auth.css
```

### API: autenticação

```text
reviva-api/src/main/api/auth/
├── controller/
│   └── AuthController.java
├── service/
│   └── AuthService.java
└── dto/
    ├── LoginRequest.java
    ├── RegistroRequest.java
    └── TokenResponse.java
```

Essas pastas ficam fora dos 6 conjuntos, mas são utilizadas por todas as telas que exigem usuário autenticado.

---

# Conjunto 1 - Publicação e gestão

## Tela 1: Cadastro de item

Permite cadastrar um item, adicionar fotos, informar categoria, descrição, condição e localização.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-01-publicacao-gestao/cadastro-item/
├── CadastroItem.jsx
├── cadastroItemService.js
└── cadastroItem.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/publicacao/
├── controller/
│   └── ItemPublicacaoController.java
├── service/
│   └── ItemPublicacaoService.java
├── dto/
│   └── ItemRequest.java
└── model/
    └── Item.java
```

## Tela 2: Gerenciar itens

Permite listar, editar, remover, restaurar e acompanhar o status dos itens publicados.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-01-publicacao-gestao/gerenciar-itens/
├── GerenciarItens.jsx
├── gerenciarItensService.js
└── gerenciarItens.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-01-publicacao-gestao/gestao/
├── controller/
│   └── ItemGestaoController.java
├── service/
│   └── ItemGestaoService.java
├── repository/
│   └── ItemRepository.java
└── dto/
    └── ItemStatusResponse.java
```

---

# Conjunto 2 - Descoberta e detalhes

## Tela 3: Busca / descoberta de itens

Permite pesquisar itens por termo, categoria, cidade, UF e disponibilidade.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-02-descoberta-detalhes/busca/
├── Busca.jsx
├── ListaItens.jsx
├── buscaService.js
└── busca.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/descoberta/
├── controller/
│   └── DescobertaController.java
├── service/
│   └── DescobertaService.java
└── dto/
    └── BuscaItensRequest.java
```

## Tela 4: Detalhes do item

Exibe fotos, descrição, localização, anunciante, reputação, favoritos e ação para solicitar o item.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-02-descoberta-detalhes/detalhes-item/
├── DetalhesItem.jsx
├── detalhesItemService.js
└── detalhesItem.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-02-descoberta-detalhes/detalhes/
├── controller/
│   └── DetalhesItemController.java
├── service/
│   └── DetalhesItemService.java
└── dto/
    └── ItemDetalhesResponse.java
```

---

# Conjunto 3 - Solicitação e chat

## Tela 5: Solicitação de item

Permite enviar, cancelar e acompanhar uma solicitação nos estados enviada, aceita, recusada, agendada e concluída.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-03-solicitacao-chat/solicitacao/
├── Solicitacao.jsx
├── solicitacaoService.js
└── solicitacao.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/solicitacao/
├── controller/
│   └── SolicitacaoController.java
├── service/
│   └── SolicitacaoService.java
├── repository/
│   └── SolicitacaoRepository.java
├── model/
│   └── Solicitacao.java
└── dto/
    ├── SolicitacaoRequest.java
    └── SolicitacaoResponse.java
```

## Tela 6: Chat de negociação

Permite conversar, trocar mensagens, combinar o local e acompanhar a negociação.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-03-solicitacao-chat/chat/
├── Chat.jsx
├── Inbox.jsx
├── chatService.js
└── chat.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-03-solicitacao-chat/chat/
├── controller/
│   ├── MensagemController.java
│   └── PresencaController.java
├── service/
│   └── MensagemService.java
├── repository/
│   └── MensagemRepository.java
├── model/
│   └── Mensagem.java
└── dto/
    ├── MensagemRequest.java
    └── MensagemResponse.java
```

O agendamento e a confirmação da troca ficam como apoio deste conjunto, pois dependem da solicitação e da conversa.

---

# Conjunto 4 - Perfil e reputação

## Tela 7: Perfil do usuário

Permite visualizar e editar dados pessoais, foto, informações públicas e preferências básicas.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-04-perfil-reputacao/perfil/
├── Perfil.jsx
├── PerfilPublico.jsx
├── perfilService.js
└── perfil.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/perfil/
├── controller/
│   └── PerfilController.java
├── service/
│   └── PerfilService.java
└── dto/
    └── UsuarioResponse.java
```

## Tela 8: Reputação

Exibe avaliações, pontuação, selos e histórico de confiabilidade do usuário.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-04-perfil-reputacao/reputacao/
├── Reputacao.jsx
├── Avaliar.jsx
├── reputacaoService.js
└── reputacao.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-04-perfil-reputacao/reputacao/
├── controller/
│   └── ReputacaoController.java
├── service/
│   ├── AvaliacaoService.java
│   └── PontuacaoService.java
├── repository/
│   ├── AvaliacaoRepository.java
│   └── UsuarioRepository.java
├── model/
│   └── Avaliacao.java
└── dto/
    └── AvaliacaoRequest.java
```

---

# Conjunto 5 - Comunidades e favoritos

## Tela 9: Comunidades

Permite visualizar comunidades, participar de grupos e acompanhar atividades por interesse ou região.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-05-comunidades-favoritos/comunidades/
├── Comunidades.jsx
├── comunidadesService.js
└── comunidades.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-05-comunidades-favoritos/comunidades/
├── controller/
│   └── ComunidadeController.java
├── service/
│   └── ComunidadeService.java
├── repository/
│   └── ComunidadeRepository.java
├── model/
│   └── Comunidade.java
└── dto/
    └── ComunidadeResponse.java
```

## Tela 10: Favoritos

Permite salvar itens, consultar a lista de favoritos e identificar itens que ficaram indisponíveis.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-05-comunidades-favoritos/favoritos/
├── Favoritos.jsx
├── favoritosService.js
└── favoritos.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-05-comunidades-favoritos/favoritos/
├── controller/
│   └── FavoritosController.java
├── service/
│   └── FavoritosService.java
└── dto/
    └── FavoritoResponse.java
```

Favoritos pode continuar usando armazenamento local na primeira entrega e receber persistência na API durante a integração.

---

# Conjunto 6 - Endereço e segurança

## Tela 11: Endereço salvo

Permite cadastrar, editar, excluir e definir endereço padrão para retirada ou entrega.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-06-endereco-seguranca/endereco/
├── EnderecoSalvo.jsx
├── enderecoService.js
└── endereco.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/endereco/
├── controller/
│   └── EnderecoController.java
├── service/
│   └── EnderecoService.java
├── repository/
│   └── EnderecoRepository.java
├── model/
│   └── Endereco.java
└── dto/
    └── EnderecoResponse.java
```

## Tela 12: Segurança e termos

Reúne senha, autenticação, preferências de notificação, termos de uso e política de privacidade.

### Frontend

```text
reviva-frontend/src/conjuntos/conjunto-06-endereco-seguranca/seguranca/
├── SegurancaTermos.jsx
├── Notificacoes.jsx
├── segurancaService.js
└── seguranca.css
```

### API

```text
reviva-api/src/main/api/conjuntos/conjunto-06-endereco-seguranca/seguranca/
├── controller/
│   ├── SegurancaController.java
│   └── NotificacaoController.java
├── service/
│   ├── SegurancaService.java
│   └── NotificacaoService.java
├── repository/
│   └── NotificacaoRepository.java
├── model/
│   └── Notificacao.java
└── dto/
    └── NotificacaoResponse.java
```

---

## Código compartilhado entre todos os conjuntos

### Frontend

```text
reviva-frontend/src/shared/
├── components/
│   ├── Button.jsx
│   ├── ItemCard.jsx
│   ├── Avatar.jsx
│   ├── Loading.jsx
│   ├── ErrorBox.jsx
│   └── EmptyState.jsx
├── hooks/
│   ├── useApiData.js
│   └── useToast.js
├── navigation/
│   ├── BottomNav.jsx
│   └── screenRegistry.js
└── constants/
    ├── categories.js
    └── statuses.js
```

### API

```text
reviva-api/src/main/api/shared/
├── config/
│   ├── MongoConfig.java
│   ├── RestClientConfig.java
│   ├── SecurityConfig.java
│   └── WebSocketConfig.java
├── exception/
│   └── GlobalExceptionHandler.java
├── security/
│   ├── JwtAuthFilter.java
│   ├── JwtService.java
│   ├── JwtHandshakeInterceptor.java
│   └── WsAuthChannelInterceptor.java
└── geo/
    ├── GeoController.java
    ├── GeoService.java
    ├── EstadoResponse.java
    ├── CidadeResponse.java
    └── EnderecoResponse.java
```

Essa camada é compartilhada. Ela não pertence a um aluno específico e não deve ser duplicada dentro dos conjuntos.

---

# Organização das três sprints

## Sprint 1: primeira tela do conjunto

| Conjunto | Tela da Sprint 1 |
|---|---|
| Conjunto 1 | Cadastro de item |
| Conjunto 2 | Busca / descoberta de itens |
| Conjunto 3 | Solicitação de item |
| Conjunto 4 | Perfil do usuário |
| Conjunto 5 | Comunidades |
| Conjunto 6 | Endereço salvo |

Cada aluno entrega a tela visual, estado local, validação, loading, estado vazio, tratamento de erro e serviço frontend correspondente.

## Sprint 2: segunda tela do conjunto

| Conjunto | Tela da Sprint 2 |
|---|---|
| Conjunto 1 | Gerenciar itens |
| Conjunto 2 | Detalhes do item |
| Conjunto 3 | Chat de negociação |
| Conjunto 4 | Reputação |
| Conjunto 5 | Favoritos |
| Conjunto 6 | Segurança e termos |

A segunda tela deve continuar independente e reaproveitar somente componentes compartilhados ou contratos definidos para o conjunto.

## Sprint 3: integração

Na terceira sprint, cada conjunto deve:

- integrar suas duas telas ao sistema principal;
- conectar os serviços frontend aos endpoints da API;
- revisar autenticação e permissões;
- reutilizar os componentes compartilhados;
- validar loading, erro e estado vazio;
- testar navegação para outros conjuntos;
- corrigir conflitos de rotas, nomes e estilos;
- manter as duas telas funcionando isoladamente.

### Fluxo principal integrado

```text
Busca
  -> Detalhes do item
  -> Solicitação
  -> Chat
  -> Agendamento
  -> Confirmação
  -> Reputação
```

### Fluxo de conta integrado

```text
Perfil
  -> Reputação
  -> Comunidades
  -> Favoritos
  -> Endereço salvo
  -> Segurança e termos
```

---

## Critério de independência de cada tela

Toda tela deverá ter:

- componente próprio;
- serviço próprio ou acesso claramente definido à API;
- loading;
- estado vazio;
- tratamento de erro;
- dados mínimos para renderizar sem depender de outra tela aberta;
- entrada de dados por props, parâmetros ou usuário autenticado;
- navegação de retorno sem quebrar o `App.jsx`.

Uma tela pode utilizar entidades compartilhadas, como usuário, item ou solicitação, mas não deve depender de variáveis internas de outra tela.

---

## Resumo dos seis conjuntos

| Conjunto | Tela 1 | Tela 2 |
|---|---|---|
| 1 | Cadastro de item | Gerenciar itens |
| 2 | Busca / descoberta | Detalhes do item |
| 3 | Solicitação | Chat |
| 4 | Perfil | Reputação |
| 5 | Comunidades | Favoritos |
| 6 | Endereço salvo | Segurança e termos |

Total: **6 conjuntos, 12 telas funcionais, 3 sprints e duas áreas separadas para onboarding e autenticação**.
