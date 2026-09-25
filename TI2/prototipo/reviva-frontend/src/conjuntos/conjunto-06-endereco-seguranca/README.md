# Conjunto 6 - Endereço e segurança

## Objetivo
Este conjunto reúne o cadastro de endereço, a gestão de conta e as telas de segurança, termos e privacidade.

## Arquivos do conjunto
- `enderecos.jsx`: gestão de endereços salvos e fluxo relacionado.
- `seguranca.jsx`: segurança, privacidade, termos e notificações do usuário.

## Quantidade de telas: 5 telas lógicas

| Tela | Rota no `App.jsx` | Arquivo responsável | Observação |
| --- | --- | --- | --- |
| Endereços salvos | `enderecos` | `enderecos.jsx` | Criar, editar, excluir e definir endereço principal. |
| Segurança e privacidade | `seguranca` | `seguranca.jsx` | Senha, sessões e preferências de notificação. |
| Termos de uso | `termos` | `seguranca.jsx` | Documento informativo acessado pela tela de segurança. |
| Política de privacidade | `privacidade` | `seguranca.jsx` | Documento informativo sobre dados e LGPD. |
| Notificações | `notificacoes` | `seguranca.jsx` | Lista, leitura e limpeza de notificações. |

Termos, privacidade e notificações são telas distintas na navegação, embora
compartilhem o mesmo arquivo por pertencerem ao fluxo de conta e segurança.

## Separação recomendada

Se a regra passar a ser uma tela por arquivo, a divisão natural será:

- `enderecos.jsx`: Endereços salvos.
- `seguranca.jsx`: Segurança e privacidade.
- `documentosConta.jsx`: Termos e Política de privacidade.
- `notificacoes.jsx`: Notificações.

## Observações
Mantém dois módulos principais no conjunto, sem `index.jsx`. A tabela acima
deixa explícito que o segundo arquivo concentra quatro telas relacionadas, o
que pode ser separado futuramente se o projeto exigir um arquivo por tela.
