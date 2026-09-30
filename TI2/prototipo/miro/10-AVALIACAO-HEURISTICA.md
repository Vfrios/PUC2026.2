# Reviva — Avaliação Heurística Inicial dos Wireframes

**Projeto:** Reviva — plataforma de doação e troca local de objetos  
**Disciplina:** TI2 — PUC  
**Etapa representada:** concepção, antes da implementação  
**Base examinada:** [Descrição do Wireframe — Reviva](08-WIREFRAME-DESCRICAO.md)  
**Natureza:** reconstrução retrospectiva da avaliação da especificação; não registra uma sessão comprovadamente realizada naquela etapa  
**Data desta revisão documental:** 28 de setembro de 2026

## 1. Objetivo

Este documento organiza uma avaliação heurística inicial da especificação dos wireframes do Reviva. Como o material disponível é textual, os achados são lacunas e riscos de concepção a considerar antes de desenhar ou implementar as telas; não são problemas observados em uma interface executada. A reconstrução foi preparada posteriormente e não deve ser apresentada como prova de uma avaliação feita anteriormente.

## 2. Método, escopo e limitações

O material foi revisado à luz das dez heurísticas de Nielsen, considerando os objetivos, elementos, fluxos e estados descritos em `08-WIREFRAME-DESCRICAO.md`. Esta análise não avalia código, interface visual, comportamento executado ou opinião de usuários finais. Por isso, a severidade indica o risco da especificação permanecer indefinida e deve ser reavaliada quando existirem wireframes visuais.

Para uma avaliação heurística completa, recomenda-se que **3 a 5 avaliadores** inspecionem individualmente os mesmos wireframes, façam uma passagem geral e outra detalhada, registrem evidências e só depois consolidem duplicidades e divergências. Este arquivo não contém registros individuais, nomes de avaliadores ou capturas de uma sessão na etapa inicial; portanto, apresenta uma análise retrospectiva da especificação, e não comprovação de uma sessão realizada.

**Escopo da especificação:** onboarding e autenticação; home; busca e detalhes; publicação e gestão; Inbox e chat; agendamento; perfil; notificações; comunidades e denúncias; navegação e feedback.

## 3. Escala de severidade

A severidade segue a escala de 0 a 4. A classificação considera o impacto sobre a tarefa, a possibilidade de contorno e a recorrência provável. A equipe deve revisar as notas após reproduzir cada achado no protótipo.

| Grau | Classificação | Interpretação |
| --- | --- | --- |
| 0 | Não é um problema | A observação não caracteriza uma falha de usabilidade. |
| 1 | Cosmético | Não compromete a tarefa; corrigir se houver tempo. |
| 2 | Menor | Causa confusão ou esforço adicional, mas há um contorno razoável. |
| 3 | Maior | Dificulta significativamente uma tarefa importante ou pode levar a uma decisão inadequada. |
| 4 | Catastrófico | Impede a conclusão de uma tarefa essencial ou gera consequência grave sem alternativa adequada. |

## 4. Achados de especificação

Os achados abaixo apontam decisões que faltam na descrição textual. A severidade indica a prioridade sugerida para esclarecer cada decisão antes de produzir ou implementar os wireframes; não é uma medição de impacto observado com usuários.

### AH-01 — Critérios de proximidade ainda não estão definidos

- **Tela/fluxo:** Busca e lista de itens.
- **Heurística:** H7 — Flexibilidade e eficiência de uso; H2 — Correspondência entre o sistema e o mundo real.
- **Severidade sugerida:** **2 — Menor.**
- **Evidência na especificação:** a Home deve mostrar itens próximos e a busca prevê filtros por cidade/estado e acesso a mapa, mas não define raio, ordenação por distância ou funcionamento quando a pessoa não concede localização. Ver [08-WIREFRAME-DESCRICAO.md](08-WIREFRAME-DESCRICAO.md).
- **Risco de usabilidade:** sem esses critérios, “perto” pode significar coisas diferentes e a pessoa pode ter dificuldade para comparar opções que consegue retirar.
- **Recomendação para o wireframe:** escolher entre filtro por raio, ordenação por proximidade ou busca regional; prever entrada manual de localização como alternativa ao GPS e mostrar distância apenas quando houver dados confiáveis.

### AH-02 — A proposta de troca não explicita a contrapartida

- **Tela/fluxo:** Detalhes do item e solicitação.
- **Heurística:** H2 — Correspondência entre o sistema e o mundo real; H6 — Reconhecimento em vez de memorização.
- **Severidade sugerida:** **2 — Menor.**
- **Evidência na especificação:** os wireframes mencionam itens para doação ou troca e mostram o tipo de publicação, mas não descrevem como quem se interessa informa qual objeto oferece em troca. Ver [08-WIREFRAME-DESCRICAO.md](08-WIREFRAME-DESCRICAO.md).
- **Risco de usabilidade:** as partes podem entender “troca” de formas diferentes e só perceber a divergência depois de iniciar a conversa.
- **Recomendação para o wireframe:** apresentar a contrapartida no fluxo de troca, com campo simples para descrevê-la e orientação sobre como continuar a negociação no chat.

### AH-03 — Comportamento de validação e recuperação de erros está pouco especificado

- **Tela/fluxo:** Cadastro e login.
- **Heurística:** H5 — Prevenção de erros; H9 — Ajudar a reconhecer e corrigir erros.
- **Severidade sugerida:** **2 — Menor.**
- **Evidência na especificação:** o documento prevê mensagens de validação, mas não define quando aparecem, como se associam aos campos nem se os dados preenchidos são preservados após falha. Ver [08-WIREFRAME-DESCRICAO.md](08-WIREFRAME-DESCRICAO.md).
- **Risco de usabilidade:** a pessoa pode só descobrir um campo incorreto depois de tentar enviar todo o formulário e ter dificuldade para localizar ou corrigir o problema.
- **Recomendação para o wireframe:** prever validação junto ao campo, linguagem que explique a correção e preservação dos outros dados informados.

### AH-04 — A organização do formulário de publicação permanece em aberto

- **Tela/fluxo:** Publicar item.
- **Heurística:** H8 — Estética e design minimalista; H6 — Reconhecimento em vez de memorização.
- **Severidade sugerida:** **2 — Menor.**
- **Evidência na especificação:** o formulário inclui dados, fotos, endereço e observações, mas pode ser uma página longa ou dividido em etapas; a decisão e a indicação de progresso não estão definidas. Ver [08-WIREFRAME-DESCRICAO.md](08-WIREFRAME-DESCRICAO.md).
- **Risco de usabilidade:** sem uma estrutura definida, a tarefa pode parecer extensa e a pessoa pode perder a noção do que falta preencher.
- **Recomendação para o wireframe:** agrupar campos relacionados, indicar progresso se houver etapas e permitir voltar sem apagar os dados informados.

### AH-05 — Correção ou cancelamento do agendamento não está descrito

- **Tela/fluxo:** Agendamento e retirada.
- **Heurística:** H3 — Controle e liberdade do usuário; H5 — Prevenção de erros.
- **Severidade sugerida:** **2 — Menor.**
- **Evidência na especificação:** a tela prevê data, horário, local, confirmação e estados do agendamento, mas não descreve como alterar ou cancelar antes da retirada. Ver [08-WIREFRAME-DESCRICAO.md](08-WIREFRAME-DESCRICAO.md).
- **Risco de usabilidade:** uma data escolhida por engano ou mudança de disponibilidade pode deixar os participantes sem uma saída clara.
- **Recomendação para o wireframe:** prever edição e cancelamento antes da confirmação final, resumir o combinado e confirmar ações que afetem a outra pessoa.

## 5. Matriz das heurísticas consideradas

Como a base é uma especificação textual, “sem lacuna identificada” não significa que uma futura interface já atende à heurística. A avaliação visual deverá ocorrer quando os wireframes estiverem desenhados.

| Heurística | Resultado nesta inspeção | Achado relacionado |
| --- | --- | --- |
| H1 — Visibilidade do status do sistema | Estados de carregamento e feedback são citados em termos gerais; detalhar o retorno por ação nos wireframes. | A validar visualmente |
| H2 — Correspondência entre o sistema e o mundo real | A contrapartida da troca e os critérios de proximidade precisam ser definidos. | AH-01, AH-02 |
| H3 — Controle e liberdade do usuário | Alteração e cancelamento do agendamento não estão descritos. | AH-05 |
| H4 — Consistência e padrões | A consistência visual não pode ser avaliada pela descrição textual. | A validar visualmente |
| H5 — Prevenção de erros | Validação do cadastro e correção de agendamento precisam de comportamento especificado. | AH-03, AH-05 |
| H6 — Reconhecimento em vez de memorização | A contrapartida e o progresso do formulário devem estar visíveis. | AH-02, AH-04 |
| H7 — Flexibilidade e eficiência de uso | Critérios de proximidade e alternativa ao GPS precisam ser definidos. | AH-01 |
| H8 — Estética e design minimalista | A publicação reúne vários dados; agrupamento e divisão em etapas seguem em aberto. | AH-04 |
| H9 — Ajudar a reconhecer e corrigir erros | A especificação não detalha a apresentação e correção de erros de validação. | AH-03 |
| H10 — Ajuda e documentação | Ajuda contextual e instruções de segurança deverão ser conferidas nos wireframes visuais. | A validar visualmente |

## 6. Priorização para a concepção

1. Definir localização e busca e tornar explícito o fluxo de contrapartida para troca.
2. Especificar validação do cadastro, organização do formulário de publicação e edição/cancelamento do agendamento.
3. Após desenhar os wireframes, realizar inspeções independentes com 3 a 5 avaliadores, registrar evidências e revisar as severidades.

## 7. Próximos passos

- Transformar a descrição textual em wireframes visuais das telas do fluxo principal.
- Convidar 3 a 5 avaliadores para inspecionar individualmente os mesmos wireframes, sem discussão prévia.
- Registrar para cada achado a tela, evidência, heurística, impacto, severidade e recomendação.
- Consolidar duplicidades e divergências em uma sessão de debriefing.
- Separar avaliação heurística de teste de usabilidade com participantes; um método não substitui o outro.
- Inserir nomes e evidências reais antes de exportar o PDF, caso a disciplina exija comprovação da aplicação do método.

## 8. Referências

NIELSEN, Jakob. **10 Usability Heuristics for User Interface Design**. Nielsen Norman Group. Disponível em: [nngroup.com/articles/ten-usability-heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/). Acesso em: 28 set. 2026.

NIELSEN, Jakob. **Severity Ratings for Usability Problems**. Nielsen Norman Group. Disponível em: [nngroup.com/articles/how-to-rate-the-severity-of-usability-problems](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/). Acesso em: 28 set. 2026.

REVIVA. **Descrição do Wireframe — Reviva**. Documento interno do projeto, arquivo `08-WIREFRAME-DESCRICAO.md`, pasta `miro/`. Disponível em: [repositório Reviva](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-2-ti2-7600100-reviva). Acesso em: 28 set. 2026.
