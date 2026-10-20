# Planejamento Sprint 1 - Thiago

## Objetivo

Apresentar informações básicas de cada pessoa usuária e estabelecer uma visão inicial de confiança na comunidade.

## Funcionalidades previstas

- Consultar as informações públicas do perfil de uma pessoa.
- Permitir que a própria pessoa consulte e atualize suas informações de apresentação.
- Exibir os principais dados de reputação disponíveis para consulta.
- Apresentar indicadores básicos relacionados à participação da pessoa na plataforma.
- Diferenciar as informações próprias das informações visíveis para outras pessoas.

## Requisitos funcionais

- **RF01 — Consultar perfil de outra pessoa:** ao acessar um perfil, a pessoa deve visualizar somente as informações de apresentação definidas como públicas. Informações que não foram fornecidas não devem ser inventadas nem apresentadas como conhecidas.
- **RF02 — Consultar próprio perfil:** a pessoa deve conseguir consultar as informações atualmente associadas ao próprio perfil e identificar quais dados de apresentação estão visíveis para outras pessoas.
- **RF03 — Atualizar apresentação pessoal:** a pessoa deve conseguir alterar suas próprias informações de apresentação. O sistema deve solicitar a correção de dados obrigatórios ausentes ou inválidos e confirmar quando a atualização for concluída.
- **RF04 — Apresentar reputação disponível:** o perfil deve exibir os dados de reputação já existentes para a pessoa, com rótulos compreensíveis. Se ainda não houver avaliações ou dados suficientes, essa condição deve ser informada sem atribuir uma nota fictícia.
- **RF05 — Apresentar participação:** o perfil deve mostrar os indicadores básicos de participação que estiverem disponíveis, diferenciando claramente a ausência de atividade de uma falha ao carregar as informações.
- **RF06 — Diferenciar visão própria e pública:** a pessoa deve conseguir consultar seu próprio perfil sem que informações privadas de gestão sejam expostas na visualização pública.
- **RF07 — Restringir edição:** somente a pessoa titular do perfil deve conseguir alterar suas informações de apresentação. Quem visita o perfil de outra pessoa deve ter acesso apenas à consulta das informações públicas.

## Requisitos não funcionais

- **RNF01 — Privacidade:** respostas e telas de perfil público devem conter somente campos classificados como públicos; informações privadas não podem ser expostas por omissão na interface ou na API.
- **RNF02 — Segurança e autorização:** a edição deve ser autorizada no servidor com base na identidade autenticada; tentar alterar o identificador de outra pessoa não deve permitir modificar seu perfil.
- **RNF03 — Desempenho:** em ambiente de teste acordado pela equipe, consultar ou salvar um perfil deve levar até 2 segundos no percentil 95, desconsiderando indisponibilidade de serviços externos.
- **RNF04 — Integridade da reputação:** avaliações e indicadores devem refletir dados existentes; quando não houver base suficiente, o sistema deve apresentar essa condição em vez de criar valor padrão ou nota fictícia.
- **RNF05 — Acessibilidade:** informações, rótulos e estados do perfil devem ser compreensíveis por tecnologias assistivas, com navegação por teclado e sem distinção baseada apenas em cor.
- **RNF06 — Tratamento de falhas:** falhas ao consultar ou atualizar o perfil devem ser diferenciadas de ausência de dados; mudanças só devem ser indicadas como salvas após confirmação.

## Resultado esperado

Ao final da sprint, cada pessoa deve conseguir manter seu perfil atualizado e consultar as informações básicas que ajudam outras pessoas a conhecê-la.
