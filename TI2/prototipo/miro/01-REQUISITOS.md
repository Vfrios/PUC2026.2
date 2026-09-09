# Reviva - Requisitos do Sistema

## 1. Identificação

| Campo | Definição |
| --- | --- |
| Produto | Reviva |
| Propósito | Conectar pessoas para doar ou trocar objetos de forma local, segura e rastreável |
| Público principal | Pessoas que possuem objetos em bom estado e pessoas que procuram itens reutilizáveis |
| Plataforma | Aplicação web responsiva com experiência prioritariamente mobile |
| Idioma | Português do Brasil |
| Perfis de uso | Conta única com capacidade de doar, receber, trocar, conversar e avaliar |
| Persistência | MongoDB Atlas, com documentos e referências entre coleções |
| Versão de referência | Protótipo funcional integrado, com backend Spring Boot e frontend React |

## 2. Visão do produto

O Reviva reduz o descarte de objetos ao aproximar doadores e interessados por região. O usuário publica um item, recebe ou inicia uma conversa, combina a retirada, confirma a conclusão e registra uma avaliação. Cada conclusão atualiza pontos, reputação, selo e impacto ambiental estimado.

A aplicação não usa papéis persistidos separados. A escolha visual entre doador e receptor orienta a navegação local, mas a mesma conta pode executar os dois papéis conforme o contexto do item.

## 3. Requisitos funcionais

### RF-01 - Cadastro e autenticação

1. O sistema deve permitir cadastro com nome, e-mail, CPF, telefone, senha e endereço.
2. O CPF deve ser normalizado para somente dígitos e validado pelo algoritmo dos dois dígitos verificadores.
3. O CEP deve conter oito dígitos após normalização.
4. E-mail e CPF devem ser únicos.
5. O cadastro deve retornar um JWT para iniciar a sessão sem exigir novo login.
6. O login deve validar e-mail e senha e retornar JWT.
7. O frontend deve persistir o token no navegador usando a chave `reviva_token`.
8. O logout deve remover o token e pedir confirmação antes de sair.
9. Credenciais inválidas devem retornar erro de autenticação sem revelar se o e-mail existe.

### RF-02 - Perfil e localização

1. O usuário autenticado deve consultar seus próprios dados, reputação, pontos, selo, itens doados e quilos de resíduo evitado.
2. O usuário deve atualizar coordenadas e raio de busca.
3. O sistema deve permitir consultar reputação e itens públicos de outro usuário.
4. O sistema deve preservar a separação entre dados públicos do anunciante e dados privados da conta.
5. O endereço informado por CEP deve poder preencher bairro, cidade, estado e coordenadas.

### RF-03 - Publicação de item

1. O usuário autenticado deve cadastrar título, descrição, categoria, conservação, tipo de publicação, endereço, peso estimado e fotos.
2. Os tipos de publicação devem ser `DOAR` e `TROCAR`.
3. As categorias devem ser Roupas, Livros, Móveis, Infantil, Eletrônicos, Cozinha e Outros.
4. Os estados de conservação devem ser Novo, Seminovo e Usado.
5. O sistema deve aceitar até três fotos por item, comprimidas no navegador e armazenadas como data URL.
6. O CEP deve consultar a API de endereço e permitir preenchimento manual quando a consulta falhar.
7. O impacto ambiental deve usar o peso informado ou uma estimativa por categoria.
8. Um item recém-publicado deve iniciar com status `ATIVO` e validade padrão de 60 dias.
9. A publicação deve registrar doador, data de publicação, endereço e coordenadas quando disponíveis.

### RF-04 - Busca e descoberta

1. Visitantes devem consultar comunidades e detalhes públicos de itens.
2. Usuários devem listar itens ativos por categoria, tipo de publicação, termo, cidade e UF.
3. Itens expirados não devem aparecer na busca pública.
4. A tela inicial deve exibir categorias, itens recentes e atalhos contextuais.
5. O usuário deve poder localizar a região por estado e cidade usando dados do IBGE.
6. O usuário deve poder usar GPS do navegador para converter coordenadas em cidade e UF.
7. O usuário deve poder salvar favoritos localmente no navegador.
8. A grade deve oferecer visualização rápida por toque longo ou contexto, quando suportado.

### RF-05 - Gerenciamento de anúncios

1. O usuário deve listar seus próprios itens, inclusive itens que não estão ativos.
2. Somente o dono do item deve poder editar, remover, restaurar ou marcar como doado.
3. A edição deve renovar a validade por mais 60 dias.
4. A remoção deve alterar o status para `REMOVIDO`, sem apagar o registro fisicamente.
5. A restauração deve reativar item removido ou expirado e renovar sua validade.
6. A marcação como doado deve alterar o status para `DOADO`, atualizar impacto e pontos do doador uma única vez.
7. O sistema deve impedir que um usuário gerencie item pertencente a outra conta.

### RF-06 - Conversas e mensagens

1. Ao selecionar Enviar mensagem em um anúncio, o sistema deve criar imediatamente uma conversa vinculada ao item.
2. A solicitação deve identificar item, doador, receptor, mensagem inicial, status e data de criação.
3. O usuário deve visualizar Inbox com conversas enviadas e recebidas.
4. O usuário deve listar e enviar mensagens de texto em uma conversa.
5. Mensagens devem permanecer persistidas no banco.
6. O chat deve receber novas mensagens em tempo real via WebSocket/STOMP.
7. O cliente deve evitar duplicar mensagens recebidas por REST e WebSocket.
8. O usuário deve arquivar conversa por gesto de deslizar; o arquivamento atual é local ao navegador.
9. O chat deve orientar a manter negociações dentro da plataforma.
10. O usuário deve compartilhar localização atual, foto, câmera e referência de local conforme os recursos disponíveis no navegador.

### RF-07 - Agendamento e retirada

1. Participantes da conversa devem poder informar data, horário e local de encontro.
2. Deve existir no máximo um agendamento ativo por solicitação.
3. O receptor deve confirmar o agendamento.
4. Após a confirmação do receptor, o doador deve poder gerar código de retirada.
5. O ciclo deve permitir confirmação manual do doador e do receptor.
6. O ciclo deve permitir confirmação por token associado ao item e QR Code na interface.
7. A retirada deve ser concluída somente quando as duas confirmações forem registradas ou quando o fluxo de QR Code as representar.
8. Ao concluir, o item deve passar a `DOADO`, o agendamento a `CONCLUIDO` e os indicadores de impacto devem ser atualizados.
9. Qualquer participante deve poder cancelar enquanto a troca não estiver concluída.
10. Qualquer participante deve poder reportar problema, alterando o agendamento para `PROBLEMA_REPORTADO`.

### RF-08 - Avaliações, impacto e reputação

1. Após a retirada, cada participante deve poder avaliar o outro com nota de 1 a 5 e comentário opcional.
2. O sistema deve recalcular a reputação média do usuário.
3. O sistema deve contabilizar itens doados, quilos de resíduo evitado e pontos.
4. A pontuação deve considerar doação concluída, recebimento concluído e avaliação recebida.
5. Os selos devem ser Bronze, Prata, Ouro e Esmeralda.
6. A home e o dashboard devem exibir impacto de forma compreensível, sem transformar a métrica em obrigação para publicar.

### RF-09 - Notificações

1. O sistema deve criar notificações para novos contatos e eventos relevantes do chat.
2. O usuário deve listar notificações ordenadas da mais recente para a mais antiga.
3. O usuário deve marcar uma notificação como lida.
4. O badge da home deve mostrar a quantidade de não lidas.
5. O usuário deve limpar todas as notificações.
6. O usuário deve excluir apenas notificações expiradas.
7. A expiração padrão deve ser de 30 dias e ser configurável por `NOTIFICACOES_EXPIRACAO_DIAS`.

### RF-10 - Comunidades e denúncias

1. O usuário deve listar comunidades disponíveis sem autenticação.
2. O usuário autenticado deve participar de uma comunidade.
3. O usuário deve denunciar item ou comportamento com motivo e detalhes.
4. Motivos suportados: item divergente, comportamento inadequado, não comparecimento, suspeita de golpe e outro.
5. Denúncias devem permanecer disponíveis para moderação e não devem expor dados sensíveis ao denunciante.

## 4. Requisitos não funcionais

| ID | Requisito | Critério de aceitação |
| --- | --- | --- |
| RNF-01 | Segurança | Endpoints privados exigem JWT válido e operações de item/agendamento validam o participante ou proprietário |
| RNF-02 | Privacidade | Respostas públicas usam DTOs resumidos; e-mail, CPF, senha e localização exata não devem ser serializados como dados do anunciante |
| RNF-03 | Desempenho | A home deve carregar estado de carregamento e não bloquear a navegação enquanto busca dados remotos |
| RNF-04 | Tempo real | Mensagens recebidas devem aparecer no chat sem polling contínuo, usando STOMP sobre SockJS |
| RNF-05 | Disponibilidade | Falha de API deve apresentar mensagem acionável, estado de erro e possibilidade de tentar novamente |
| RNF-06 | Compatibilidade | A interface deve funcionar em navegadores modernos desktop e mobile, com toque e teclado |
| RNF-07 | Responsividade | Conteúdo deve se adaptar a telas estreitas, sem rolagem horizontal acidental ou perda de controles |
| RNF-08 | Acessibilidade | Campos devem ter rótulos, botões devem ter nome acessível, foco deve ser visível e cor não deve ser o único indicador |
| RNF-09 | Manutenibilidade | Backend deve separar controller, service, repository, model e DTO; frontend deve centralizar chamadas em `api.js` |
| RNF-10 | Observabilidade | Erros de domínio devem retornar mensagens legíveis; logs devem diferenciar aplicação, web e SQL |
| RNF-11 | Portabilidade | Configurações de porta, JWT, caminho do banco e expiração de notificações devem ser externas por variáveis de ambiente |
| RNF-12 | Integridade | Conclusão, pontuação e atualização de impacto devem ocorrer em transação no backend |

## 5. Regras de negócio centrais

- Um perfil pode atuar como doador e receptor; não há alternância persistida de papel.
- Um item público só pode ser encontrado enquanto está ativo e não expirou.
- A validade inicial e a renovação de anúncio são de 60 dias.
- A conclusão via `marcar como doado` não deve duplicar os pontos se o item já estiver `DOADO`.
- O agendamento só pode ser acessado por doador ou receptor da solicitação.
- O item fica `DOADO` quando a retirada é concluída ou quando o doador usa a confirmação rápida.
- A denúncia de uma ocorrência não remove automaticamente item nem usuário.
- Favoritos e arquivamento do Inbox são dados locais do navegador no protótipo.

## 6. Critérios gerais de aceite

- Cadastro válido cria conta e entrega sessão autenticada.
- Login inválido falha sem expor qual credencial está errada.
- Item publicado aparece na busca quando ativo, dentro da validade e compatível com os filtros.
- Usuário não consegue editar ou excluir item de outro usuário.
- Mensagem enviada é persistida, notificada e distribuída em tempo real.
- Somente os participantes conseguem consultar ou alterar agendamento.
- Conclusão atualiza item, agendamento, pontuação e impacto de maneira consistente.
- Interface fornece retorno para carregamento, sucesso, erro, vazio e ação irreversível.

## 7. Atores e permissões

| Ator | Pode fazer | Não pode fazer |
| --- | --- | --- |
| Visitante | Consultar comunidades, buscar itens públicos, ver detalhes públicos e iniciar cadastro | Publicar, conversar, agendar, avaliar ou denunciar |
| Usuário autenticado | Manter perfil, publicar, editar e gerenciar seus itens, conversar, agendar, avaliar, denunciar e participar de comunidades | Acessar dados privados ou alterar recursos de outro usuário |
| Doador contextual | Gerenciar itens próprios, responder interessados, gerar código e confirmar entrega | Confirmar ações como se fosse o receptor |
| Receptor contextual | Buscar, iniciar conversa, confirmar agendamento, confirmar recebimento e avaliar | Editar item de outro usuário ou gerar código exclusivo do doador |
| Moderador operacional | Analisar denúncias e aplicar política interna | Expor ao usuário dados de investigação ou credenciais |

## 8. Validações de entrada

| Campo | Regra |
| --- | --- |
| Nome | Obrigatório, deve aceitar nome completo e ser normalizado sem espaços desnecessários |
| E-mail | Obrigatório, formato válido, comparação sem diferenciação de maiúsculas e unicidade |
| CPF | Obrigatório, 11 dígitos após máscara, rejeitar sequência repetida e validar dígitos verificadores |
| Senha | Obrigatória, nunca devolver ou registrar em resposta; a política mínima deve ser exibida no formulário |
| CEP | Oito dígitos após remoção de máscara; consulta externa não pode bloquear preenchimento manual |
| Título do item | Obrigatório, curto o suficiente para cards e sem conteúdo HTML executável |
| Descrição | Opcional, texto simples, preservando quebras de linha e com limite de tamanho definido no DTO |
| Categoria, conservação e tipo | Obrigatórios e limitados aos enums do backend |
| Peso | Numérico positivo; unidade exibida explicitamente como kg |
| Foto | Imagem válida, no máximo três por item, com limite de dimensão e tamanho do payload |
| Data de retirada | Data e hora futuras no fuso local informado pela aplicação |
| Nota | Inteiro de 1 a 5; comentário opcional e sem HTML executável |

## 9. Estados de negócio

### Item

```text
ATIVO -> DOADO
ATIVO -> REMOVIDO -> ATIVO
ATIVO -> EXPIRADO -> ATIVO
```

Um item expirado é identificado pela data `expiraEm`; a restauração renova a validade. Item `DOADO` não retorna ao catálogo por edição comum.

### Solicitação

```text
AGUARDANDO -> ACEITA
AGUARDANDO -> RECUSADA
ACEITA -> CANCELADA
```

No fluxo atual, a criação de conversa já grava a solicitação como `ACEITA`, pois não existe etapa separada de aceite ou recusa antes do chat.

### Agendamento

```text
CONFIRMADO -> CONCLUIDO
CONFIRMADO -> CANCELADO
CONFIRMADO -> PROBLEMA_REPORTADO
```

O estado `CONCLUIDO` exige as confirmações da retirada. Uma troca concluída é definitiva para fins de pontuação e não pode ser cancelada.

## 10. Priorização

| Prioridade | Requisitos | Motivo |
| --- | --- | --- |
| P0 | RF-01, RF-03, RF-04, RF-06, RF-07 | Fluxo mínimo de autenticar, publicar, encontrar, conversar e concluir |
| P1 | RF-02, RF-05, RF-08, RF-09 | Retenção, confiança, impacto e operação diária |
| P2 | RF-10, localização avançada, favoritos sincronizados e moderação ampliada | Evolução de comunidade e escala |

## 11. Matriz de rastreabilidade

| Resultado esperado | Requisitos relacionados | Evidência |
| --- | --- | --- |
| Usuário consegue realizar uma doação completa | RF-01, RF-03, RF-04, RF-06, RF-07, RF-08 | Cenário E2E com duas contas |
| Anúncio não é alterado por terceiro | RF-05, RNF-01, RNF-02 | Teste de autorização do proprietário |
| Conversa chega em tempo real | RF-06, RNF-04 | Teste REST + assinatura STOMP |
| Dados pessoais não vazam no catálogo | RF-02, RNF-02 | Teste de contrato dos DTOs públicos |
| Aplicação continua compreensível em falha | RNF-03, RNF-05, RNF-08 | Teste de estados de erro e acessibilidade |

## 12. Fora do escopo atual

- Pagamento, entrega ou intermediação financeira.
- Verificação documental automática de identidade.
- Match automático entre oferta e procura.
- Feed social persistido de posts e comentários; o conteúdo ilustrativo não representa API implementada.
- Push nativo por FCM/APNs; as notificações atuais são persistidas e exibidas pela aplicação.
