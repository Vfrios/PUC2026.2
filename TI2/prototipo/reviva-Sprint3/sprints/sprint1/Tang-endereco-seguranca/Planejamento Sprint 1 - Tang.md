# Planejamento Sprint 1 - Tang

## Objetivo

Permitir que a pessoa organize informações básicas de localização e encontre controles essenciais para proteger sua conta.

## Funcionalidades previstas

- Cadastrar e consultar endereços associados à conta.
- Identificar um endereço principal para uso preferencial.
- Atualizar ou remover um endereço salvo.
- Consultar e ajustar preferências básicas de recebimento de notificações.
- Consultar avisos importantes relacionados à conta e às interações na plataforma.
- Disponibilizar orientações para que a pessoa mantenha suas negociações dentro da plataforma.

## Requisitos funcionais

- **RF01 — Cadastrar endereço:** a pessoa deve conseguir informar os dados necessários para reconhecer um endereço e associá-lo à própria conta. Antes de salvar, o sistema deve apontar informações obrigatórias ausentes ou inconsistentes; após o cadastro, deve confirmar a inclusão.
- **RF02 — Consultar endereços:** a pessoa deve conseguir visualizar os endereços associados à sua conta e distinguir cada um pelas informações fornecidas. Se não houver endereços cadastrados, o sistema deve indicar essa situação.
- **RF03 — Definir endereço principal:** a pessoa deve conseguir escolher um de seus endereços salvos como principal. A escolha deve substituir a indicação anterior, de modo que exista apenas um endereço principal por conta.
- **RF04 — Atualizar endereço:** a pessoa deve conseguir selecionar um endereço próprio, corrigir ou complementar seus dados e confirmar a alteração. O sistema deve validar as informações e apresentar os dados atualizados após o salvamento.
- **RF05 — Remover endereço:** a pessoa deve conseguir remover um endereço próprio que não deseja mais manter. Antes de concluir uma remoção que altere o endereço principal, o sistema deve tornar claro que a escolha principal precisará ser revista.
- **RF06 — Consultar orientações de segurança:** a pessoa deve conseguir acessar orientações compreensíveis sobre como conduzir interações e negociações com segurança dentro da plataforma.
- **RF07 — Consultar avisos:** a pessoa deve conseguir visualizar os avisos importantes relacionados à conta e às interações. Quando não houver avisos, o sistema deve informar que não há novos conteúdos a consultar.
- **RF08 — Consultar e ajustar preferências básicas:** a pessoa deve conseguir verificar suas preferências de notificação e alterar as opções disponíveis. O sistema deve confirmar a alteração e refletir a preferência escolhida em consultas posteriores.
- **RF09 — Restringir acesso aos próprios dados:** cada pessoa deve consultar e administrar apenas os endereços e preferências associados à própria conta.

## Requisitos não funcionais

- **RNF01 — Privacidade:** endereços são dados privados e não devem ser expostos em telas ou respostas públicas; sua consulta e gestão devem exigir a conta autenticada da pessoa titular.
- **RNF02 — Segurança e autorização:** toda leitura ou alteração de endereço e preferência deve ser autorizada no servidor para a conta correspondente; identificadores fornecidos pelo cliente não devem permitir acesso a dados de outra pessoa.
- **RNF03 — Desempenho:** em ambiente de teste acordado pela equipe, consultar ou salvar endereços e preferências deve levar até 2 segundos no percentil 95, desconsiderando indisponibilidade de serviços externos.
- **RNF04 — Integridade:** deve existir no máximo um endereço principal por conta; a alteração do endereço principal deve ser refletida nas consultas seguintes.
- **RNF05 — Usabilidade e acessibilidade:** formulários devem indicar os campos e erros de forma clara, permitir navegação por teclado e não depender exclusivamente de cor para informar o endereço principal ou o estado de uma preferência.
- **RNF06 — Tratamento de falhas:** se uma operação não for salva, o sistema deve informar a falha e não apresentar a alteração como concluída; os dados pessoais não devem aparecer em mensagens de erro.

## Resultado esperado

Ao final da sprint, a pessoa deve conseguir manter seus endereços organizados e compreender os controles básicos de segurança e comunicação disponíveis.
