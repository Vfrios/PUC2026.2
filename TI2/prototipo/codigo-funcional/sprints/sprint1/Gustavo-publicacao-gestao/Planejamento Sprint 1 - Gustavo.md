# Planejamento Sprint 1 - Gustavo

## Objetivo

Permitir que uma pessoa anuncie um objeto em bom estado para doação ou troca e acompanhe os anúncios que publicou.

## Funcionalidades previstas

- Cadastrar um item informando título, descrição, categoria e condição de conservação.
- Escolher se o item será oferecido para doação ou troca.
- Informar imagens e a localização geral do item.
- Consultar os próprios anúncios e suas informações principais.
- Atualizar os dados de um anúncio para corrigir ou complementar as informações.
- Indicar se o item continua disponível.

## Requisitos funcionais

- **RF01 — Cadastrar item:** a pessoa deve conseguir criar um anúncio informando título, descrição, categoria e condição de conservação. Os campos necessários devem ser solicitados de forma compreensível; se algum deles estiver vazio ou inválido, o anúncio não deve ser publicado e a pessoa deve saber o que precisa corrigir.
- **RF02 — Definir modalidade:** a pessoa deve escolher se o item é oferecido para doação ou troca antes de concluir o anúncio. A modalidade escolhida deve ficar clara para quem consulta o item.
- **RF03 — Complementar anúncio com imagens e localização:** a pessoa deve conseguir associar imagens do objeto e informar sua localização geral. O anúncio deve continuar compreensível mesmo quando uma informação complementar não tiver sido fornecida, sem inventar ou preencher dados por conta própria.
- **RF04 — Confirmar publicação:** após o envio de informações válidas, a pessoa deve receber uma confirmação de que o anúncio foi criado e poder consultar o resultado publicado. Se a publicação não for concluída, ela deve receber uma mensagem clara e poder tentar novamente sem criar anúncios duplicados.
- **RF05 — Consultar anúncios próprios:** a pessoa deve conseguir visualizar os anúncios que publicou, incluindo título, modalidade e estado de disponibilidade. Quando ainda não houver anúncios, deve receber uma indicação de que sua lista está vazia.
- **RF06 — Editar anúncio próprio:** a pessoa deve conseguir selecionar um anúncio seu, alterar as informações desejadas e confirmar as mudanças. As alterações devem aparecer ao consultar novamente o anúncio; informações inválidas devem ser apontadas antes de concluir a atualização.
- **RF07 — Controlar disponibilidade:** a pessoa deve conseguir indicar se o item continua disponível. A situação atual deve ficar visível para ela e orientar a apresentação do anúncio às demais pessoas.
- **RF08 — Restringir gestão ao anunciante:** a pessoa deve poder editar ou alterar a disponibilidade somente de anúncios que publicou. Anúncios de outras pessoas devem permanecer apenas para consulta.

## Requisitos não funcionais

- **RNF01 — Desempenho:** em ambiente de teste acordado pela equipe, salvar ou consultar um anúncio deve levar até 2 segundos no percentil 95, desconsiderando indisponibilidade de serviços externos.
- **RNF02 — Segurança e autorização:** a API deve validar os dados recebidos e verificar a titularidade no servidor antes de permitir criar, editar ou alterar a disponibilidade de um anúncio; ocultar controles na interface, por si só, não é autorização.
- **RNF03 — Integridade:** após salvar ou editar, os dados confirmados devem ser persistidos e permanecer iguais ao consultar novamente; uma nova tentativa após falha não deve criar anúncio duplicado.
- **RNF04 — Usabilidade e acessibilidade:** campos devem ter rótulos e instruções claros, erros devem apontar como corrigi-los e as operações principais devem ser possíveis por teclado.
- **RNF05 — Privacidade:** dados de localização fornecidos no anúncio devem ser tratados conforme a visibilidade definida para a oferta e não devem ser preenchidos com o endereço da conta sem ação explícita da pessoa.
- **RNF06 — Tratamento de falhas:** se criação, edição ou atualização de disponibilidade falhar, a interface deve informar que a operação não foi concluída e preservar os dados já digitados sempre que possível.

## Resultado esperado

Ao final da sprint, uma pessoa deve conseguir publicar um item com informações claras e consultar ou ajustar seus próprios anúncios.
