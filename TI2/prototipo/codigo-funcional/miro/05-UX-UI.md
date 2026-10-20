# Reviva - UX, UI e Acessibilidade

## 1. Direção de experiência

O Reviva deve comunicar reaproveitamento, confiança e proximidade local. A interface é mobile-first, acolhedora e objetiva: ações frequentes ficam próximas do polegar, informações de item aparecem em blocos escaneáveis e estados da troca são sempre visíveis.

A experiência deve reduzir a ansiedade de uma doação entre desconhecidos. Por isso, o produto mostra reputação, selo, status online quando disponível, localização aproximada, mensagens de segurança e confirmação clara em cada etapa.

## 2. Tokens visuais

### Cores

#### Paleta base

| Token | Hexadecimal | RGB aproximado | Contraste/uso recomendado |
| --- | --- | --- | --- |
| `--role-primary-doador` | `#1F6E43` | 31, 110, 67 | Ação primária do doador, links, impacto e status ativo sobre branco |
| `--role-primary-doador-dark` | `#123F27` | 18, 63, 39 | Texto de alto contraste, hover, gradiente do cartão de impacto |
| `--role-soft-doador` | `#E4EFE7` | 228, 239, 231 | Fundo de chip selecionado, aviso positivo e área de formulário do doador |
| `--role-primary-receptor` | `#E0673F` | 224, 103, 63 | Ação de busca, descoberta, favoritos e contexto receptor |
| `--role-primary-receptor-dark` | `#9C4327` | 156, 67, 39 | Texto de ação sobre fundo claro, erro contextual e hover |
| `--role-soft-receptor` | `#FBE8E0` | 251, 232, 224 | Chip selecionado, filtro de busca e destaque de receptor |
| `--ink` | `#16281F` | 22, 40, 31 | Títulos, texto principal, mensagens próprias e ícones importantes |
| `--ink-soft` | `#516357` | 81, 99, 87 | Descrições, datas, ajuda, distância e metadados |
| `--surface` | `#FFFFFF` | 255, 255, 255 | Cards, modais, campos, folhas de ação e mensagens recebidas |
| `--background` | `#F7F6F0` | 247, 246, 240 | Fundo global e áreas de leitura |
| `--border` | `#EDEBE1` | 237, 235, 225 | Divisórias, bordas de cards e campos neutros |
| `--border-map` | `#DFE8DF` | 223, 232, 223 | Borda do cartão de localização e componentes geográficos |
| `--gold` | `#F2A93C` | 242, 169, 60 | Estrelas, pontos, progresso, selo Ouro e destaque de conquista |
| `--error` | `#B43B2F` | 180, 59, 47 | Erros, exclusão, denúncia crítica e falha de validação |
| `--warning` | `#9C6B14` | 156, 107, 20 | Permissão negada, localização indisponível e atenção não destrutiva |
| `--success` | `#1F6E43` | 31, 110, 67 | Conclusão, confirmação e retorno positivo |

#### Uso por tela

| Tela/contexto | Fundo | Ação principal | Texto | Elementos secundários |
| --- | --- | --- | --- | --- |
| Login e cadastro | `--background` | `--role-primary-doador` | `--ink` | `--ink-soft` para ajuda, `--error` para validação |
| Home doador | `--background` | Verde doador | `--ink` | Cartão de impacto em `--role-primary-doador` para `--role-primary-doador-dark` |
| Home receptor | `--background` | Coral receptor | `--ink` | Categorias em `--role-soft-receptor`, favorito em coral |
| Busca e filtros | `--background` | `--role-primary-receptor` | `--ink` | Filtro selecionado em `--role-soft-receptor`, GPS em `--warning` quando falhar |
| Cadastro/edição de item | `--background` | Cor do contexto ativo | `--ink` | Campos em `--surface`, foco na cor primária, erro em `--error` |
| Inbox | `--background` | `--role-primary-doador` | `--ink` | Badge não lida na cor primária, arquivar com `--ink-soft` |
| Chat | `--background` | Cor do usuário atual | `--ink` | Mensagem própria em cor suave do papel, recebida em `--surface`, eventos em neutro |
| Agendamento | `--background` | Verde para confirmar | `--ink` | Cancelar em `--error`, atenção em `--warning`, concluído em `--success` |
| Impacto e perfil | `--background` | Verde doador | `--ink` | Pontos e estrelas em `--gold`, selos com cores próprias e rótulo textual |
| Denúncia | `--background` | `--error` somente na confirmação | `--ink` | Motivos neutros, aviso de segurança em `--warning` |

#### Cores dos selos

| Selo | Cor | Aplicação |
| --- | --- | --- |
| Bronze | `#B08968` | Ícone e borda do selo Bronze; sempre acompanhado de “Bronze” |
| Prata | `#9CA3AF` | Ícone e borda do selo Prata; não usar como único indicador de status |
| Ouro | `#F2A93C` | Ícone, progresso e destaque de conquista Ouro |
| Esmeralda | `#1F6E43` | Ícone e destaque do selo máximo |

#### Estados de componentes

| Estado | Fundo | Borda/ícone | Texto | Exemplo |
| --- | --- | --- | --- | --- |
| Neutro | `--surface` | `--border` | `--ink` | Campo vazio e card de item |
| Hover/foco | `--role-soft-*` | Primária, 2 px no foco | `--ink` | Botão, chip ou campo ativo |
| Desabilitado | `#F1EFE6` | `--border` | `--ink-soft` | Botão bloqueado durante envio |
| Sucesso | `--role-soft-doador` | `--success` | `--role-primary-doador-dark` | Item publicado ou retirada concluída |
| Atenção | `#FFF4D6` | `--warning` | `#6F4A0C` | GPS negado ou ação pendente |
| Erro | `#FBE6E3` | `--error` | `#7A271F` | CPF inválido ou API indisponível |
| Informativo | `#EAF0F4` | `#42677A` | `#294455` | Explicação sobre etapa do agendamento |

O verde identifica contribuição e impacto; o coral identifica descoberta, procura e recepção. A mudança de contexto nunca deve ser comunicada apenas por cor: usar título, ícone e texto.

#### Regras de aplicação de cor

- Não aplicar o coral receptor em telas de conta como se representasse erro; o significado vem do contexto e do rótulo.
- Não usar `--gold` para botões primários, pois a cor é reservada a avaliação, pontos e conquistas.
- Não usar vermelho para item removido sem exibir o texto “Removido”; cor e ícone devem complementar o rótulo.
- Links em fundo branco devem usar as variantes escuras para manter legibilidade.
- A cor primária de cada contexto deve aparecer em ação principal, seleção ativa e indicador de navegação, mas não dominar todo o fundo.
- Toda combinação deve ser conferida com contraste WCAG AA; textos auxiliares pequenos não devem usar cores claras demais.

### Tipografia

- Fonte de interface: `Plus Jakarta Sans`, com fallback para uma sans-serif do sistema.
- Fonte de display e títulos: `Fraunces`, com fallback para uma serif expressiva disponível.
- Corpo: 14 a 16 px, line-height entre 1.4 e 1.6.
- Texto auxiliar: mínimo de 12 px em desktop e 11 px somente para metadados não essenciais.
- Títulos de tela: 20 a 24 px, peso 600.
- Título de card: 14 a 16 px, peso 700.
- Nunca usar caixa alta extensa em frases longas.
- Evitar texto muito condensado e manter espaçamento de letras neutro.

### Forma e elevação

- Cards e campos usam raio entre 12 e 16 px; modais podem chegar a 18 px.
- Botões principais têm raio entre 10 e 14 px.
- Bordas suaves usam `#EDEBE1` ou `#DFE8DF`.
- Sombras são curtas e discretas, com opacidade baixa.
- Não empilhar card dentro de card sem necessidade; seções de página devem respirar como áreas contínuas.

### Espaçamento e dimensões

| Token | Valor | Uso |
| --- | --- | --- |
| `space-1` | 4 px | Distância entre ícone e texto ou metadado curto |
| `space-2` | 8 px | Gap entre chips, controles e itens de uma linha |
| `space-3` | 12 px | Padding de card compacto, campo e mensagem |
| `space-4` | 16 px | Separação padrão entre blocos |
| `space-5` | 20 px | Margem lateral principal nas telas mobile |
| `space-6` | 24 px | Separação de seções e modal |
| `space-8` | 32 px | Respiro entre áreas principais em desktop |
| `control-height` | 44 a 48 px | Altura mínima de botão, campo e alvo de toque |
| `content-max` | 1200 px | Largura máxima do conteúdo em telas grandes |

Alvos de toque devem ter pelo menos 44 por 44 px, mesmo quando o ícone visual tiver 16 ou 20 px. Cards de item devem reservar proporção fixa para a imagem, evitando que uma foto carregada altere a posição das ações.

## 3. Componentes

### Navegação

- `TopBar`: título curto, voltar à esquerda e ação contextual à direita.
- `BottomNav`: Home, Busca, Inbox, Comunidades e Perfil; item ativo tem ícone e rótulo.
- `SectionTitle`: título de seção e ação secundária, como Ver tudo.
- Breadcrumbs não são necessários na experiência mobile; o botão Voltar deve ser consistente.

### Ações

- `Button`: ação principal com texto e ícone quando houver símbolo conhecido.
- `iconBtn`: ações de sino, voltar, fechar, favorito, editar, arquivar e compartilhar; deve ter tooltip ou `aria-label`.
- `Chip`: seleção de categoria, conservação, tipo e filtros.
- Ações destrutivas devem usar cor de erro e confirmação explícita.
- Botões desabilitados devem manter contraste suficiente e explicar indisponibilidade com texto auxiliar quando relevante.

### Conteúdo

- `ItemCard`: foto, título, categoria, conservação, tipo, distância, favorito e resumo do anunciante.
- `Avatar`: foto ou iniciais, com nome acessível.
- `Stars`: nota visual acompanhada de valor textual para leitores de tela.
- `ImpactRing`: quilos reutilizados, itens doados e progresso; sempre exibir valor numérico além do gráfico.
- `StatusBar`: status de ativo, expirado, removido, agendado, concluído ou problema.
- `EmptyState`: ícone, explicação curta e próxima ação útil.
- `ErrorBox`: mensagem acionável, sem stack trace ou detalhes técnicos.
- `Toast`: confirmação breve, não essencial para concluir a tarefa e que desaparece sozinha.

### Formulários

- Campos têm `label` persistente; placeholder não substitui rótulo.
- Erro fica abaixo do campo e é associado por `aria-describedby`.
- Inputs de CEP, CPF, telefone e peso usam teclado adequado em mobile.
- Foto deve mostrar miniatura, estado de processamento, remoção e limite de três arquivos.
- Datas e horários devem usar controles nativos com formato local e resumo legível antes do envio.

## 4. Layout por tela

### Autenticação

Tela limpa, marca Reviva no primeiro viewport, formulário centralizado e uma ação principal por vez. Login e cadastro devem ter navegação evidente entre si. O conteúdo deve funcionar em 320 px sem exigir zoom.

### Home do doador

1. Saudação e sino de notificações.
2. Cartão de impacto com itens doados e quilos reutilizados.
3. Atalhos para cadastrar item, gerenciar itens, mensagens, comunidades e perfil.
4. Solicitações recentes.
5. Navegação inferior persistente.

### Home do receptor

1. Saudação contextual e sino.
2. Campo de busca proeminente.
3. Categorias em rolagem horizontal controlada.
4. Itens publicados recentemente em grade de duas colunas.
5. Favorito e preview rápido sem perder o contexto.

### Busca e lista

Filtros devem ficar acima dos resultados e ser fáceis de limpar. Estado, cidade e localização atual devem ter relação visual clara. Cards devem manter proporção estável para evitar saltos enquanto imagens carregam.

### Detalhes do item

Imagem principal, galeria, título, tipo, conservação, descrição, impacto, dados resumidos do anunciante, região aproximada e ação Enviar mensagem. A ação principal deve permanecer acessível sem cobrir o conteúdo.

### Cadastro e edição

Formulário vertical dividido em grupos: fotos, descrição, classificação, impacto e endereço. O botão Salvar fica após os campos e pode ser fixado somente se não encobrir erro ou teclado. Em edição, indicar que salvar renova o anúncio por 60 dias.

### Inbox e chat

Inbox prioriza pessoa, item, última mensagem e não lidas. O gesto de arquivar deve ter alternativa visível ou acessível. No chat, mensagens próprias e recebidas devem ter alinhamento, cor e rótulo diferentes sem depender apenas de cor. Eventos de agendamento e retirada usam cartões de sistema.

### Agendamento e confirmação

Mostrar uma linha do tempo simples: solicitação, agendamento, confirmação do receptor, código e retirada concluída. Cada etapa deve informar quem pode agir e qual é o próximo passo.

### Perfil e impacto

Exibir reputação, selo, pontos, itens doados, quilos evitados e ações de conta. Privacidade e logout devem ficar separados de métricas para reduzir cliques acidentais.

## 5. Estados e feedback

Cada tela que depende de API deve contemplar:

- carregando, com indicador visual e rótulo;
- sucesso, com confirmação curta e próxima ação;
- vazio, com contexto e ação para começar;
- erro de rede, com tentativa novamente;
- não autorizado, com retorno ao login;
- conflito de domínio, com explicação do estado atual;
- submissão, com botão desabilitado e indicador para evitar duplo envio.

Mensagens devem usar linguagem direta, humana e específica. Preferir “Não foi possível publicar o item. Verifique sua conexão e tente novamente.” a “Erro 500”.

## 6. Acessibilidade

### Teclado e foco

- Toda ação deve ser alcançável por Tab e acionável por Enter ou Espaço.
- Foco visível nunca deve ser removido.
- Modal deve mover foco para o título ou primeira ação, prender foco enquanto aberto e devolver foco ao gatilho ao fechar.
- Gestos de toque, toque longo e deslize precisam de equivalente por botão ou menu.

### Leitores de tela

- Usar HTML semântico: `header`, `nav`, `main`, `section`, `form`, `label`, `button` e `time`.
- Ícones decorativos devem ter `aria-hidden=true`; ícones de ação devem ter nome.
- Contadores de notificação devem informar “3 notificações não lidas”, não apenas mostrar o número.
- Atualizações do chat e toasts devem usar uma região `aria-live` adequada.
- Mapas devem ter alternativa textual com região, horário e ação para abrir a coordenada.

### Cor, contraste e movimento

- Texto normal deve atingir contraste mínimo WCAG AA de 4,5:1; texto grande, 3:1.
- Status devem combinar cor com texto, ícone ou forma.
- Respeitar `prefers-reduced-motion` em loaders, transições e pull-to-refresh.
- Não usar animação para comunicar sucesso ou erro sem mensagem textual.
- Não depender de hover para revelar função essencial em mobile.

### Conteúdo e validação

- Erros devem dizer como corrigir.
- Não apagar formulário inteiro depois de falha.
- Confirmar ações irreversíveis com texto do objeto afetado.
- Formatar datas, números e mensagens em português do Brasil.
- Anúncios e fotos devem ter texto alternativo útil; imagem meramente decorativa deve ter alt vazio.

## 7. Responsividade

| Faixa | Comportamento |
| --- | --- |
| 320 a 479 px | Uma coluna, bottom navigation, cards compactos e ações de largura total |
| 480 a 767 px | Uma coluna ampla, grade de itens ainda controlada e modais quase integrais |
| 768 a 1199 px | Conteúdo centralizado, duas colunas quando houver comparação e navegação confortável |
| 1200 px ou mais | Largura máxima legível, espaço lateral, grade com mais itens e painel de detalhes equilibrado |

A interface deve evitar textos cortados, botões que mudam de tamanho ao carregar, imagens sem proporção definida e componentes que exigem rolagem horizontal acidental.

## 8. Segurança percebida

- Exibir selo e reputação junto do anunciante, mas sem transformar nota em garantia absoluta.
- Mostrar aviso para manter a negociação dentro do Reviva.
- Antes de abrir mapa externo, indicar que uma coordenada será enviada a outro serviço.
- Diferenciar item ativo, doado, removido e expirado com texto explícito.
- Em denúncia, confirmar recebimento sem prometer resultado ou revelar investigação.

## 9. Checklist visual antes de publicar

- A primeira ação da tela está clara em até três segundos.
- Nenhum texto essencial depende apenas de cor.
- Campos e botões possuem nome acessível.
- Estados de carregamento, erro, vazio e sucesso foram revisados.
- O layout foi testado em 320 px e 1440 px.
- Teclado e leitor de tela conseguem concluir login, cadastro, busca, publicação e envio de mensagem.
- Fotos não deformam cards nem deslocam ações.
- Ações destrutivas têm confirmação e alternativa de recuperação quando possível.

## 10. Especificação de componentes por estado

### Botão primário

Usa a cor principal do contexto, texto branco ou `--surface` e altura mínima de 44 px. No hover, usa a variante escura; no foco, adiciona anel visível de 2 px; durante envio, mantém largura e mostra `Loader2` com texto “Salvando...” ou equivalente. Nunca trocar o texto por apenas um spinner.

### Campo de formulário

Fundo `--surface`, borda `--border`, texto `--ink` e placeholder `--ink-soft`. No foco, borda de 2 px na cor do contexto e anel externo discreto. No erro, fundo `#FBE6E3`, borda `--error`, ícone de alerta e mensagem textual abaixo. A altura deve permanecer constante entre os estados.

### Chip e filtro

Estado neutro usa fundo `--surface` e borda `--border`. Estado selecionado usa `--role-soft-doador` ou `--role-soft-receptor` e borda primária. O texto sempre informa a seleção; o chip não depende apenas de mudança de cor.

### Card de item

Fundo `--surface`, borda `--border`, título `--ink`, metadados `--ink-soft`. A foto ocupa a área superior com `object-fit: cover`, proporção estável e alt descritivo. Favorito utiliza coral receptor, mas também apresenta estado acessível “Adicionar aos favoritos” ou “Remover dos favoritos”.

### Mensagem de chat

Mensagem própria usa a cor suave do contexto e alinhamento à direita; mensagem recebida usa `--surface` e alinhamento à esquerda. Ambas exibem texto, horário e estado de entrega/leitura por texto ou ícone nomeado. Eventos de sistema usam fundo neutro, ícone e título, sem parecer uma mensagem de pessoa.

### Status de item

`ATIVO` usa verde e ícone de verificação; `EXPIRADO` usa `--warning` e relógio; `REMOVIDO` usa neutro e arquivo; `DOADO` usa verde e `CheckCircle`; `PROBLEMA_REPORTADO` usa `--error` e alerta. Todos exibem o nome do estado.

## 11. Conteúdo de interface

| Situação | Texto recomendado | Ação complementar |
| --- | --- | --- |
| Busca vazia | “Nenhum item encontrado nessa região.” | “Limpar filtros” |
| Inbox vazio | “Nenhuma conversa por aqui.” | “Explorar itens” |
| Publicação concluída | “Item publicado com sucesso.” | “Ver item” |
| API indisponível | “Não foi possível conectar agora.” | “Tentar novamente” |
| GPS negado | “Não foi possível acessar sua localização.” | “Escolher estado e cidade” |
| Item expirado | “Este anúncio expirou.” | “Voltar para busca” |
| Retirada concluída | “Retirada confirmada. A doação foi concluída.” | “Avaliar experiência” |
| Denúncia enviada | “Recebemos sua denúncia.” | “Voltar para o item” |

Mensagens nunca devem expor `500`, stack trace, nomes de classes ou detalhes de banco ao usuário final.

## 12. Checklist de auditoria visual

- [ ] Todas as cores usadas no código estão mapeadas neste documento ou justificadas como cor de integração externa.
- [ ] A cor primária do contexto está consistente entre botão, foco, chip e navegação.
- [ ] Verde, coral, dourado, erro e alerta têm texto ou ícone complementar.
- [ ] Texto principal e de ação passa no contraste AA sobre seu fundo.
- [ ] Nenhum botão muda de largura entre normal, carregando, erro e sucesso.
- [ ] Nenhum modal cobre o campo com erro ou a navegação inferior.
- [ ] O layout foi conferido em 320, 390, 768 e 1440 px.
- [ ] A experiência foi revisada com teclado, leitor de tela e `prefers-reduced-motion`.
