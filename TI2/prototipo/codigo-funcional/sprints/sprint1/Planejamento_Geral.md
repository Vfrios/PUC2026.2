# Sprint 1 — REVIVA (versão corrigida)

Entendi o feedback do professor: **cada frente tem UMA funcionalidade** (o que será entregue), e o resto é **descrição** dessa funcionalidade — não uma lista de "RF01, RF02… RF09" que infla o escopo e mistura requisito com comportamento esperado.

Abaixo o documento reescrito no formato que ele pediu: **Funcionalidade → Descrição → Critério de aceite**. Sem numeração de RF, sem transformar tratamento de erro em "requisito".

---

# Planejamento da Sprint 1 — REVIVA

## 1. Visão geral

A Sprint 1 entrega as **seis funcionalidades** que dão forma inicial ao Reviva: encontrar itens, publicar ofertas, conversar sobre um item, manter perfil, organizar endereços e participar de comunidades/favoritos. Cada frente é responsável por **uma funcionalidade**; o texto abaixo descreve o comportamento esperado dela, não um conjunto de requisitos numerados.

O ponto de partida é o início do projeto: nada disso existe ainda. A sprint termina quando as seis funcionalidades podem ser **demonstradas funcionando juntas**.

---

## 2. Objetivo da sprint

Permitir que uma pessoa **encontre um item, veja seus detalhes, demonstre interesse e converse com quem publicou**, enquanto as demais frentes entregam o mínimo para que isso funcione: publicar um item, ter perfil, ter endereço e guardar/participar.

---

## 3. As seis funcionalidades da Sprint 1

| # | Frente | Funcionalidade |
|---|---|---|
| 1 | **Brayan** | Busca e visualização de itens |
| 2 | **Gustavo** | Publicação e gestão de itens |
| 3 | **João** | Comunidades e favoritos |
| 4 | **Tang** | Endereços e segurança básica |
| 5 | **Thiago** | Perfil e reputação inicial |
| 6 | **Vitor** | Solicitação e conversa (chat) |

---

## 4. Descrição de cada funcionalidade

### 4.1 Brayan — Busca e visualização de itens

**O que é:** a pessoa consegue listar os itens disponíveis, buscar por texto ou categoria e abrir os detalhes de uma oferta.

**Descrição:** a tela de descoberta mostra os itens ativos com título, imagem, categoria e modalidade (doação/troca). A busca recebe um termo e retorna itens relacionados. Ao abrir um item, a pessoa vê descrição, condição, modalidade, imagens, localização informada, quem publicou e se ainda está disponível. Quando não há resultado ou o carregamento falha, a tela explica a situação e permite tentar de novo ou voltar à lista.

**Critério de aceite:** saindo da lista, a pessoa localiza uma oferta por texto ou categoria, abre seus detalhes e entende se ela segue disponível; se não houver resultado ou der erro, recebe uma orientação clara.

---

### 4.2 Gustavo — Publicação e gestão de itens

**O que é:** a pessoa anuncia um objeto para doação ou troca e acompanha/edita os anúncios que publicou.

**Descrição:** o cadastro coleta título, descrição, categoria, condição de conservação e modalidade (doação ou troca), com imagens e localização geral quando houver. Ao publicar, a pessoa vê a confirmação e o anúncio passa a aparecer entre os seus. Ela pode editar os dados e marcar se o item continua disponível. Campos obrigatórios ausentes ou inválidos são apontados antes de concluir; falha ao publicar não cria anúncio duplicado. Só quem publicou pode editar ou mudar a disponibilidade.

**Critério de aceite:** a pessoa cadastra uma oferta válida, encontra-a entre os próprios anúncios, corrige seus dados e atualiza a disponibilidade; erros de preenchimento são explicados antes de concluir.

---

### 4.3 João — Comunidades e favoritos

**O que é:** a pessoa consulta comunidades, registra participação e mantém uma lista pessoal de itens favoritos.

**Descrição:** a tela de comunidades lista as disponíveis com descrição e permite manifestar participação, mostrando o estado atual. A partir de um item (lista ou detalhe), a pessoa pode favoritá-lo; a lista de favoritos é pessoal, permite remover itens e não duplica entradas. Itens salvos mostram se a oferta ainda está ativa, sem parecer disponível algo que não está.

**Critério de aceite:** a pessoa explora as comunidades e mantém uma lista pessoal de favoritos que reflete a disponibilidade conhecida de cada item.

---

### 4.4 Tang — Endereços e segurança básica

**O que é:** a pessoa mantém os endereços da própria conta e consulta orientações/avisos básicos de segurança.

**Descrição:** é possível cadastrar, consultar, atualizar e remover endereços, e escolher **um** endereço principal por conta (a escolha se mantém consistente). A pessoa também consulta avisos e orientações de segurança e ajusta preferências básicas de notificação, com confirmação das escolhas. Tudo é restrito à própria conta: ninguém administra dados de outra pessoa. O endereço da conta **não** é exibido automaticamente como localização pública de um item.

**Critério de aceite:** a pessoa mantém seus endereços, define o principal e consulta orientações/avisos/preferências sem acessar dados de outra conta.

---

### 4.5 Thiago — Perfil e reputação inicial

**O que é:** a pessoa vê e edita o próprio perfil, e outras pessoas veem apenas a apresentação pública.

**Descrição:** o perfil próprio mostra os dados atuais e sua visibilidade; a edição permite alterar a apresentação e aponta problemas de preenchimento. A visão pública exibe somente informações definidas como públicas. A reputação e os indicadores de participação aparecem **quando existirem**; se ainda não houver avaliações, a tela diz isso — não inventa reputação. Só a pessoa titular edita o próprio perfil.

**Critério de aceite:** a pessoa consulta e atualiza o próprio perfil; outras veem só o que é público; ausência de avaliações não gera reputação fictícia.

---

### 4.6 Vitor — Solicitação e conversa (chat)

**O que é:** a pessoa inicia uma conversa a partir de um item e troca mensagens com quem publicou.

**Descrição:** a partir de uma oferta ativa, a pessoa inicia um contato; a conversa fica **vinculada ao item** que a motivou. Existe uma caixa de entrada com as conversas iniciadas e recebidas, mostrando participantes, item e última mensagem. É possível enviar mensagens de texto (não vazias) e ver o histórico em ordem. A pessoa identifica com quem fala e sobre qual oferta. Só os participantes acessam a conversa. Se o envio falhar, a mensagem não aparece como enviada e é possível tentar de novo. Há uma orientação de segurança para a negociação.

**Critério de aceite:** a pessoa inicia contato sobre uma oferta, troca mensagens e retoma o histórico sabendo quem participa e qual item está em discussão.

---

## 5. Integração entre as funcionalidades

- A **busca (Brayan)** depende dos itens **publicados (Gustavo)**.
- O **chat (Vitor)** depende de o item estar identificado e disponível, e mantém o vínculo com o item.
- **Favoritos (João)** dependem de itens consultáveis e refletem a disponibilidade conhecida.
- O **perfil público (Thiago)** aparece junto de ofertas e conversas, separando o que é público do que é do titular.
- **Endereço da conta (Tang)** e **localização do item (Gustavo)** são informações diferentes: uma pertence à pessoa, a outra é informada na oferta.

Esses são **pontos de integração a combinar durante o trabalho** — não presumem que qualquer fluxo já esteja pronto.

---

## 6. Critérios gerais de aceite da sprint

- Cada frente entrega **sua funcionalidade** funcionando.
- A pessoa entende quando uma ação foi concluída, está pendente ou falhou.
- Dado opcional ausente aparece como **desconhecido**, não é preenchido por suposição.
- Estados vazios (lista sem itens, busca sem resultado) são explicados.
- Edição e gestão respeitam a **titularidade** dos dados e das ofertas.
- Publicação, descoberta e início de conversa mantêm o **mesmo contexto do item**.
- As seis frentes são demonstradas **juntas**, sem exigir recursos da Sprint 2.

---

## 7. Fora do escopo da Sprint 1

Filtros avançados por localização/distância, ciclo completo de negociação e retirada, avaliações após conclusão, indicadores completos de impacto, gerenciamento avançado de notificações, denúncias e recursos de comunidade além de consulta e participação inicial. Ficam para a Sprint 2 ou decisões futuras.

---

## 8. Pontos a confirmar durante o planejamento

- Campos obrigatórios da oferta e opções de categoria/condição (acordar antes da validação final).
- O que significa **"participar"** de uma comunidade (regra de produto).
- Quais dados do perfil são **públicos** (sem expor informação pessoal desnecessária).
- O endereço da conta **não** deve virar localização pública automática de uma oferta.
- A **disponibilidade** de uma oferta precisa ser coerente entre gestão, busca, favoritos e chat.

---

## 9. Requisitos não funcionais (gerais, valem para todas as funcionalidades)

- **Desempenho:** leitura/gravação comuns respondem em até **2 s no p95** no ambiente de teste; se exceder ou falhar, a tela informa o estado em vez de parecer travada.
- **Segurança/autorização:** dados pessoais, anúncios próprios e conversas são validados **no servidor**; esconder botão na tela não substitui autorização.
- **Privacidade:** endereços, favoritos, mensagens e dados pessoais só aparecem para quem tem permissão.
- **Acessibilidade:** navegação por teclado, rótulos claros, erros/estados sem depender só de cor, texto alternativo em imagens informativas.
- **Responsividade:** telas legíveis e operáveis nas larguras/navegadores suportados, sem rolagem horizontal.
- **Integridade:** alteração confirmada persiste em consultas seguintes; repetir após falha **não duplica** anúncios, favoritos ou mensagens.
- **Tratamento de erros:** falha, ausência de dado e lista vazia são situações **distintas**; só indicar concluído após confirmação.
- **Validação:** validar na interface (orientar) **e** no servidor (proteger), sem confiar só no cliente.
- **Integração:** frentes que exibem/alteram o mesmo item, perfil ou estado usam **identificadores e estados coerentes**.

**Como verificar:** medir tempos no ambiente acordado; tentar acessar/alterar dados de outra conta; testar teclado, rótulos e erro em largura móvel e desktop; recarregar telas após alterações; simular falha de carregamento/gravação.

---

## 10. APIs previstas para a Sprint 1

Rotas planejadas (uso previsto, **não** implementação concluída), conforme `reviva-frontend/src/api.js`:

- **Conta:** `POST /api/auth/registrar`, `POST /api/auth/login`
- **Busca (Brayan):** `GET /api/itens` (texto, categoria, modalidade, disponibilidade), `GET /api/itens/{id}`, `GET /api/usuarios/{id}/publico`
- **Publicação (Gustavo):** `GET /api/itens/meus`, `POST /api/itens`, `PUT /api/itens/{id}`, `POST /api/itens/{id}/doado`, `GET /api/geo/cep/{cep}`
- **Comunidades/favoritos (João):** `GET /api/comunidades`, `POST /api/comunidades/{id}/participar`, `GET /api/favoritos`, `POST /api/favoritos/{itemId}`, `DELETE /api/favoritos/{itemId}`
- **Endereços/preferências (Tang):** `GET|POST /api/enderecos`, `PUT|DELETE /api/enderecos/{id}`, `POST /api/enderecos/{id}/principal`, `GET|PUT /api/usuarios/me/preferencias`, `GET /api/notificacoes`
- **Perfil (Thiago):** `GET|PUT /api/usuarios/me`, `GET /api/usuarios/{id}/publico`, `GET /api/usuarios/{id}/reputacao`, `GET /api/usuarios/{id}/itens`
- **Chat (Vitor):** `POST /api/solicitacoes`, `GET /api/solicitacoes/recebidas`, `GET /api/solicitacoes/enviadas`, `GET /api/solicitacoes/conversas`, `GET /api/solicitacoes/{id}`, `GET /api/solicitacoes/{id}/mensagens`, `POST /api/solicitacoes/{id}/mensagens`

Ficam fora: localização avançada, agendamentos, avaliações pós-negociação, denúncias, publicações em comunidades e notificações avançadas.

