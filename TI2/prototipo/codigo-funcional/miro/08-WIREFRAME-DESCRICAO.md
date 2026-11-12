# Descrição do Wireframe - Reviva

## 1. Objetivo do wireframe

O wireframe do Reviva deve representar a experiência de uma aplicação mobile-first para conectar pessoas que querem doar ou trocar itens usados, de forma simples, segura e local. A interface deve transmitir confiança, praticidade e rapidez na hora de publicar um item, encontrar objetos úteis e negociar a retirada.

A proposta principal é mostrar como o usuário navega no app de forma intuitiva:
- descobrir itens disponíveis perto dele;
- publicar um objeto para doar ou trocar;
- conversar diretamente com o interessado;
- confirmar a retirada;
- acompanhar impacto e reputação.

---

## 2. Contexto geral do sistema

O sistema funciona como uma plataforma de reutilização de objetos. O usuário pode:
- se cadastrar e fazer login;
- publicar itens com fotos, descrição e localização;
- buscar itens por categoria, tipo de publicação e região;
- salvar itens como favoritos;
- iniciar conversa com o anunciante;
- combinar data, horário e local de entrega/retirada;
- confirmar a conclusão da doação;
- avaliar o outro usuário;
- acompanhar seu impacto ambiental e reputação.

A interface deve priorizar uso em smartphones, mas ser compatível com desktop em uma visualização mais ampla.

---

## 3. Estrutura das telas do fluxo principal

### Tela 1 - Onboarding / Boas-vindas
**Objetivo:** apresentar o app e explicar a proposta de reutilização.

**Elementos esperados:**
- logo do Reviva;
- ilustrativo/ícone de itens doados e comunidade;
- textos curtos explicando a ideia da plataforma;
- botão principal: "Começar";
- botão secundário: "Fazer login";

**Visual esperado:**
- tela limpa, com muito espaço em branco;
- uso de cores suaves e contrastantes;
- destaque para o CTA principal.

---

### Tela 2 - Cadastro / Login
**Objetivo:** permitir acesso ao sistema e criação de conta.

**Campos do cadastro:**
- nome completo;
- e-mail;
- CPF;
- telefone;
- senha;
- endereço com CEP;
- cidade, bairro e estado;

**Campos do login:**
- e-mail;
- senha;
- botão "Entrar";
- link para recuperar senha ou criar conta.

**Visual esperado:**
- formulário centralizado;
- campos com labels visíveis;
- botão principal com destaque;
- mensagens de validação em áreas discretas.

---

### Tela 3 - Home / Feed inicial
**Objetivo:** ser o ponto de entrada do app após login.

**Top section:**
- saudação com nome do usuário;
- indicador de impacto ambiental;
- ícone de notificações com badge;

**Seções principais:**
- busca por item ou categoria;
- filtros rápidos (roupas, livros, móveis, eletrônicos, etc.);
- lista de itens recentes;
- atalhos para: publicar item, mensagens, perfil e comunidades;
- botão de acesso ao mapa ou busca por região.

**Cards de itens:**
- imagem principal;
- título;
- categoria;
- localização;
- tipo (doação ou troca);
- botão de favoritar;
- botão de visualizar anúncio.

**Visual esperado:**
- layout em lista vertical;
- cards com altura uniforme;
- espaço para imagens, texto e ações rápidas;
- menu inferior com navegação principal.

---

### Tela 4 - Busca / Explorar itens
**Objetivo:** permitir filtro e descoberta de itens disponíveis.

**Elementos:**
- barra de busca por texto;
- filtros por categoria;
- filtro por tipo de publicação;
- filtro por cidade/estado;
- botão limpar filtros;
- lista de resultados.

**Comportamento esperado:**
- ao digitar, o usuário pode buscar por termo;
- filtros aparecem em uma aba ou modal;
- resultados atualizam em tempo real;
- itens expirados ou inativos não aparecem.

**Visual esperado:**
- organização em grade ou lista;
- resultados com destaque visual para disponibilidade.

---

### Tela 5 - Detalhes do item
**Objetivo:** fornecer informações completas do item antes da conversa.

**Conteúdo esperado:**
- galeria de fotos;
- título do item;
- categoria e condição;
- descrição;
- tipo de publicação (doação ou troca);
- nome do anunciante;
- reputação/avaliação do anunciante;
- localização aproximada;
- status do item;
- botão "Enviar mensagem";
- botão "Salvar favorito";

**Seções extras:**
- informações do doador;
- impacto estimado do item;
- botão de denunciar (se houver problema).

**Visual esperado:**
- layout com imagem grande no topo;
- conteúdo em blocos organizados;
- CTA principal em destaque na parte inferior.

---

### Tela 6 - Publicar item
**Objetivo:** permitir que o usuário cadastre um item para doar ou trocar.

**Formulário de cadastro:**
- título;
- categoria;
- condição (novo, seminovo, usado);
- tipo de publicação;
- descrição;
- peso estimado;
- fotos;
- endereço / CEP;
- cidade e estado;
- observações relevantes.

**Ações:**
- botão "Adicionar fotos";
- botão "Salvar anúncio";
- botão "Cancelar";

**Visual esperado:**
- formulário longo em etapas ou em uma única tela scroll;
- campos agrupados por categoria;
- preview de fotos;
- indicação de quantidade máxima de imagens.

---

### Tela 7 - Meus anúncios / Gerenciamento
**Objetivo:** mostrar os itens do usuário e permitir ações de gestão.

**Conteúdo esperado:**
- lista dos itens publicados;
- status do item (ativo, doado, removido, expirado);
- ações: editar, arquivar, restaurar, marcar como doado;
- botão de adicionar novo item.

**Card do item:**
- imagem;
- título;
- status;
- validade;
- botão de gerenciamento.

**Visual esperado:**
- organização em lista vertical;
- diferenciação visual dos estados do item.

---

### Tela 8 - Inbox / Mensagens
**Objetivo:** centralizar as conversas do usuário.

**Estrutura:**
- lista de conversas recentes;
- avatar ou foto do anunciante;
- nome da pessoa;
- prévia da última mensagem;
- indicador de mensagens não lidas;
- data da última interação;

**Ações:**
- abrir conversa;
- filtrar por conversas ativas;
- navegar para notificação.

**Visual esperado:**
- interface tipo chat com lista lateral e conversa principal;
- destaque para conversas pendentes.

---

### Tela 9 - Chat da conversa
**Objetivo:** facilitar a negociação do item.

**Elementos:**
- cabeçalho com nome do anunciante e status do item;
- mensagens em balões;
- indicadores de enviada, entregue e lida;
- campo de texto para nova mensagem;
- botão de anexar arquivo ou localização;
- botão para agendar retirada;

**Fluxo esperado:**
- ao clicar em "Enviar mensagem", abre a conversa diretamente;
- a primeira mensagem pode perguntar se o item ainda está disponível;
- a negociação acontece dentro do mesmo chat.

**Visual esperado:**
- layout clássico de chat mobile;
- mensagens em lados opostos;
- área de digitação fixa na parte inferior.

---

### Tela 10 - Agendamento / Retirada
**Objetivo:** definir data, horário e local para a coleta do item.

**Campos do agendamento:**
- data;
- horário;
- local de encontro;
- observações adicionais;
- botão confirmar agendamento;

**Estados visuais:**
- agendamento pendente;
- confirmado;
- concluído;
- problema reportado;

**Visual esperado:**
- formulário simples com seleção de data e horário;
- resumo da reunião antes da confirmação;
- botão principal de confirmação em destaque.

---

### Tela 11 - Perfil do usuário
**Objetivo:** mostrar dados públicos do usuário e seu impacto.

**Conteúdo esperado:**
- foto/avatar;
- nome;
- reputação;
- selo ou nível;
- pontos;
- número de itens doados;
- quantidade de resíduos evitados;
- histórico ou lista de itens publicados;

**Ações:**
- editar dados;
- ver avaliações;
- visualizar itens públicos;
- acessar configurações.

**Visual esperado:**
- banner superior com identidade do perfil;
- métricas em blocos;
- abas para itens, avaliações e histórico.

---

### Tela 12 - Notificações
**Objetivo:** avisar o usuário sobre interações relevantes.

**Tipos de notificação:**
- nova mensagem;
- conversa iniciada;
- confirmação de agendamento;
- item doado;
- novo comentário ou avaliação;

**Elementos:**
- lista de notificações;
- indicador de lidas e não lidas;
- botão para marcar como lida;
- botão para limpar notificações.

**Visual esperado:**
- cards de notificação com prioridade visual;
- uso de cor para distinguir itens não lidos.

---

### Tela 13 - Comunidades / Denúncias
**Objetivo:** mostrar grupos e mecanismos de moderação.

**Comunidades:**
- lista de comunidades por interesse ou região;
- botão para participar;
- cards com nome, descrição e quantidade de membros.

**Denúncias:**
- botão de reportar item ou comportamento;
- seleção de motivo;
- campo para descrever o problema;
- confirmação da denúncia.

**Visual esperado:**
- organização em lista compacta;
- formulário simples e direto.

---

## 4. Navegação e estrutura geral

A navegação principal pode seguir este fluxo:

1. Onboarding
2. Login / Cadastro
3. Home
4. Explorar itens
5. Detalhes do item
6. Mensagens / Inbox
7. Chat
8. Agendamento
9. Perfil
10. Configurações / Comunidades / Notificações

A navegação inferior pode conter:
- Início
- Explorar
- Publicar
- Mensagens
- Perfil

Essa composição facilita uso em mobile e mantém o usuário sempre em contexto de doação e troca.

---

## 5. Elementos visuais e padrões de interface

### Padrões de layout
- mobile-first;
- botão principal com destaque visual;
- campos bem espaçados;
- cards com bordas suaves;
- ações primárias sempre visíveis;
- grande foco em imagens e títulos dos itens.

### Tipos de componentes
- input text;
- select/dropdown;
- cards de item;
- modal de filtros;
- modal de notificação;
- toast de sucesso ou erro;
- botão de ação flutuante para publicar item.

### Padrões de feedback
- carregamento em telas de busca e listagem;
- feedback visual de ação concluída;
- mensagens de erro em contexto;
- ícones claros para notificação, perfil e favoritos.

---

## 6. Direção visual sugerida

Para manter consistência com a proposta do produto, o wireframe deve transmitir:
- acolhimento e confiança;
- simplicidade e praticidade;
- sensação de comunidade e reaproveitamento;
- abordagem amigável e informal.

Cores sugeridas:
- verde/verdoso: ligado a sustentabilidade e impacto ambiental;
- branco e cinza claros: visual limpo e funcional;
- azul ou teal: para confiança e ação; 
- laranja suave: para destaques e badges.

---

## 7. Resumo do fluxo principal do usuário

O usuário entra no app, cadastra-se ou faz login, acessa a home, descobre itens próximos, visualiza o anúncio, conversa com o anunciante, combina a retirada e conclui a ação. Ao final, o sistema atualiza reputação, pontos e impacto ambiental.

Esse é o fluxo central que o wireframe deve priorizar.

---

## 8. Observações para o preenchimento no wireframe

Ao montar o protótipo no Figma ou no Miro, é importante destacar:
- telas principais em sequência;
- caminhos de navegação claros;
- CTA principal em cada tela;
- estados de vazio, erro e carregamento;
- diferenciação entre usuário logado e visitante;
- foco em mobile e em ação direta.

O principal objetivo do wireframe não é detalhar toda a lógica de negócio, e sim mostrar a jornada do usuário de forma clara, rápida e convincente.
