# Planejamento Sprint 1 - Vitor

## Objetivo

Permitir que uma pessoa interessada em um item entre em contato com quem o publicou para conversar sobre a possibilidade de recebê-lo ou trocá-lo.

## Funcionalidades previstas

- Iniciar uma conversa a partir de um item disponível.
- Manter a conversa associada ao item que motivou o contato.
- Apresentar uma caixa de entrada com conversas iniciadas e recebidas.
- Enviar e consultar mensagens de texto em uma conversa.
- Identificar as pessoas participantes e o item relacionado à conversa.
- Apresentar orientações para uma interação segura entre as pessoas.

## Requisitos funcionais

- **RF01 — Iniciar contato sobre item:** a partir de um item disponível, a pessoa interessada deve conseguir iniciar uma conversa com quem o publicou. Se o item não estiver mais disponível, a situação deve ser informada antes de criar uma nova conversa sobre a oferta.
- **RF02 — Vincular conversa ao item:** a conversa deve manter uma referência clara ao item que motivou o contato, para que as pessoas saibam qual anúncio está sendo discutido mesmo ao retornarem mais tarde.
- **RF03 — Consultar caixa de entrada:** a pessoa deve visualizar as conversas das quais participa, incluindo as iniciadas e as recebidas. Cada entrada deve permitir reconhecer a outra pessoa, o item relacionado e a mensagem mais recente quando disponível. Uma caixa sem conversas deve apresentar um estado vazio compreensível.
- **RF04 — Enviar mensagem de texto:** uma pessoa participante deve conseguir escrever e enviar uma mensagem de texto na conversa. Mensagens vazias não devem ser enviadas; após o envio, a mensagem deve aparecer vinculada à conversa correta.
- **RF05 — Consultar histórico da conversa:** as pessoas participantes devem conseguir consultar as mensagens trocadas em uma conversa em ordem que permita acompanhar o contexto do diálogo.
- **RF06 — Identificar participantes e item:** a conversa deve apresentar quem participa e qual item está em discussão, evitando que uma mensagem seja confundida com outra negociação.
- **RF07 — Restringir acesso à conversa:** somente as pessoas participantes devem conseguir consultar e enviar mensagens naquela conversa.
- **RF08 — Informar falhas de envio:** se uma mensagem não puder ser enviada, a pessoa deve receber uma indicação clara e poder tentar novamente; a mensagem não deve ser apresentada como enviada quando isso não tiver ocorrido.
- **RF09 — Exibir orientação de segurança:** a pessoa deve conseguir consultar orientações para manter a negociação dentro da plataforma e conduzir o contato com segurança.

## Requisitos não funcionais

- **RNF01 — Segurança e autorização:** somente participantes autenticados podem consultar uma conversa ou enviar mensagens; a verificação deve ocorrer no servidor em cada operação.
- **RNF02 — Privacidade:** mensagens e conteúdo das conversas não devem ser expostos em páginas ou respostas públicas nem a pessoas que não participam da conversa.
- **RNF03 — Desempenho:** em ambiente de teste acordado pela equipe, abrir a caixa de entrada, carregar o histórico e confirmar o envio de uma mensagem devem levar até 2 segundos no percentil 95, desconsiderando indisponibilidade de serviços externos.
- **RNF04 — Integridade e ordenação:** mensagens confirmadas devem permanecer associadas à conversa correta e aparecer em ordem cronológica após recarregar o histórico.
- **RNF05 — Acessibilidade:** caixa de entrada, histórico e envio devem ser operáveis por teclado; mensagens novas e estados de envio/falha devem ser anunciados de forma compreensível, sem depender somente de cor.
- **RNF06 — Tratamento de falhas:** uma mensagem só pode ser indicada como enviada após confirmação; em caso de falha, o sistema deve informar o estado e permitir nova tentativa sem afirmar sucesso.
- **RNF07 — Segurança de conteúdo:** mensagens devem ser apresentadas como texto, sem executar conteúdo ou marcação fornecida pelo usuário.

## Resultado esperado

Ao final da sprint, uma pessoa deve conseguir iniciar e acompanhar uma conversa vinculada a um item, usando-a para manifestar interesse e combinar os próximos passos.
