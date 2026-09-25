# Conjunto 4 - Perfil e reputação

## Objetivo
Este conjunto reúne a identidade do usuário, os dados públicos e a confiabilidade construída nas trocas.

## Arquivos do conjunto
- `accountScreens.jsx`: perfil, perfil público, reputação, histórico, comunidades, favoritos, notificações e moderação.
- `avaliacao.jsx`: tela de avaliação do participante, usada após a conclusão da troca.

## Quantidade de telas: 6 telas lógicas

| Tela | Rota no `App.jsx` | Arquivo responsável | Função |
| --- | --- | --- | --- |
| Perfil | `perfil` | `accountScreens.jsx` | Dados pessoais, foto, impacto e ações da conta. |
| Perfil público | `perfilPublico` | `accountScreens.jsx` | Dados públicos e reputação do anunciante. |
| Reputação | `reputacao` | `accountScreens.jsx` | Nota, selos, pontos e avaliações recebidas. |
| Histórico | `historico` | `accountScreens.jsx` | Linha do tempo de anúncios, solicitações e avaliações. |
| Avaliação | `avaliarDoador`, `avaliarReceptor` | `avaliacao.jsx` | Avaliar a outra pessoa após a troca. As duas rotas usam a mesma tela. |
| Moderação | `moderacao` | `accountScreens.jsx` | Enviar denúncia ou relatar um problema. |

Notificações, comunidades e favoritos são telas próprias, mas pertencem aos
Conjuntos 6 e 5 respectivamente; não entram na contagem deste conjunto.

## Separação recomendada

Para uma separação tela por tela, `accountScreens.jsx` pode virar:

- `perfil.jsx`: Perfil e Perfil público.
- `reputacao.jsx`: Reputação e Histórico.
- `moderacao.jsx`: Moderação.

`avaliacao.jsx` já está separado e deve continuar sendo o dono da avaliação.

## Observações
O módulo foi organizado em um arquivo de conta e um arquivo de avaliação, sem
`index.jsx`. A avaliação é encaminhada pelo `App.jsx` para `avaliacao.jsx`.
