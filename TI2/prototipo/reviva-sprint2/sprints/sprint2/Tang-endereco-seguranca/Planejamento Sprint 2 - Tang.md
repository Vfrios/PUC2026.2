# Planejamento Sprint 2 — Tang

## Funcionalidade

Seguranca e termos: reunir controles de conta, preferencias e notificacoes em
uma experiencia clara e restrita a pessoa autenticada.

## Trabalho

1. Consultar e salvar preferencias de notificacao.
2. Consultar notificacoes, marcar como lidas e usar as operacoes de limpeza
   disponiveis.
3. Permitir alteracao segura de senha e encerramento das outras sessoes,
   conforme endpoints existentes.
4. Apresentar orientacoes e documentos legais sem confundir conteudo
   informativo com configuracao de seguranca.
5. Exibir confirmacao somente depois de sucesso do servidor e tratar erro.

## Sequencia

- Dia 1: revisar endpoints de seguranca, sessoes e notificacoes.
- Dias 2–3: exercitar preferencias, central de notificacoes e controles de
  conta.
- Dia 4: testar conta autenticada, falhas e persistencia apos recarregar.
- Dia 5: validar criterios e preparar demonstracao.

## Criterios de aceite

- Preferencias persistem e podem ser consultadas novamente.
- Notificacoes diferenciam lidas/nao lidas e nao somem por falha de rede.
- Alteracoes de conta exigem autenticacao e validacao do backend.
- A interface nao afirma oferecer autenticacao em duas etapas se esse recurso
  nao estiver implementado.
- Conteudo legal e recomendacoes estao acessiveis sem expor dados privados.
