# Planejamento Sprint 1 - Brayan

## Objetivo

Permitir que uma pessoa encontre itens disponíveis para doação ou troca e entenda as informações principais antes de demonstrar interesse.

## Funcionalidades previstas


- Apresentar itens disponíveis em uma lista de fácil consulta.
- Permitir a busca de itens por palavras relacionadas ao que a pessoa procura.
- Organizar os itens por categoria.
- Exibir os detalhes de cada item, incluindo título, descrição, condição, modalidade de publicação e imagens.
- Apresentar informações básicas sobre quem publicou o item e onde ele está disponível.
- Indicar quando um item não está mais disponível para evitar expectativas incorretas.

## Requisitos funcionais

- **RF01 — Listar itens disponíveis:** ao acessar a área de descoberta, a pessoa deve visualizar os itens que podem ser consultados. Cada resultado deve apresentar informações resumidas suficientes para reconhecer o item, como título, imagem representativa, categoria e modalidade de publicação. Itens indisponíveis não devem ser apresentados como oportunidades ativas.
- **RF02 — Buscar itens por texto:** a pessoa deve conseguir informar um termo de busca e solicitar resultados relacionados a esse termo. A busca deve considerar as informações descritivas do item e apresentar resultados correspondentes sem exigir que o texto digitado seja idêntico ao anúncio.
- **RF03 — Organizar itens por categoria:** a pessoa deve conseguir identificar a categoria atribuída a cada item na lista e consultar os itens de uma categoria de interesse.
- **RF04 — Consultar detalhes do item:** ao selecionar um resultado, a pessoa deve acessar as informações completas disponíveis do anúncio: título, descrição, categoria, condição de conservação, modalidade (doação ou troca), imagens e localização informada. Se uma informação opcional não tiver sido fornecida, sua ausência não deve ser apresentada como dado conhecido.
- **RF05 — Identificar anunciante e disponibilidade:** os detalhes devem identificar a pessoa que publicou o item e informar claramente se ele ainda está disponível. Se o item deixar de estar disponível, a pessoa deve ser avisada e não deve ser induzida a tratá-lo como uma oferta ativa.
- **RF06 — Tratar busca vazia ou sem resultados:** se a pessoa enviar uma busca sem termo ou se nenhum item corresponder ao termo informado, a área de descoberta deve comunicar a situação e permitir que ela tente outra busca ou retorne à lista geral.
- **RF07 — Tratar falha ao carregar resultados ou detalhes:** quando as informações não puderem ser apresentadas, o sistema deve informar que houve um problema e oferecer uma forma de tentar novamente ou voltar à consulta, sem exibir dados incompletos como se estivessem confirmados.

## Requisitos não funcionais

- **RNF01 — Desempenho:** em ambiente de teste acordado pela equipe, a lista, a busca e os detalhes devem ser apresentados em até 2 segundos no percentil 95, desconsiderando indisponibilidade de serviços externos e medindo a partir do envio da solicitação.
- **RNF02 — Acessibilidade:** os controles de busca, categoria e navegação dos detalhes devem ser utilizáveis por teclado; imagens informativas devem possuir texto alternativo e os campos devem ter rótulos compreensíveis.
- **RNF03 — Responsividade:** lista, filtros e detalhes devem permanecer legíveis e utilizáveis nas larguras de tela suportadas pelo projeto, sem exigir rolagem horizontal da página.
- **RNF04 — Privacidade:** a consulta pública deve exibir somente dados do item e do anunciante previstos para divulgação; endereço pessoal não deve ser exposto automaticamente como localização do item.
- **RNF05 — Consistência e falhas:** indisponibilidade conhecida deve ser refletida na lista e nos detalhes; falhas de consulta devem apresentar mensagem de erro e opção de nova tentativa, sem substituir o erro por uma lista vazia.
- **RNF06 — Compatibilidade:** os fluxos devem funcionar nos navegadores e dispositivos definidos como suportados pelo projeto, usando a mesma origem de dados da publicação.

## Resultado esperado

Ao final da sprint, a pessoa deve conseguir explorar os itens publicados, localizar opções de interesse e consultar informações suficientes para decidir se deseja iniciar contato.
