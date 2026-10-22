# **Sprint 1 – Instruções de envio**

A tarefa consiste em **copiar os arquivos e blocos de funções já existentes do projeto base para o projeto final**, seguindo a ordem listada abaixo. Cada item numerado corresponde à próxima postagem.

- **Adicionar os arquivos ao projeto principal na ordem listada.**
- Alguns arquivos dependem de **funções ou métodos específicos**, que também estão listados na ordem — é preciso copiar o bloco inteiro indicado do projeto base para o arquivo correspondente no projeto final.
- Em `reviva-frontend/src/api.js`, os nomes listados são **métodos do objeto `api`**, implementados como funções. Em `reviva-frontend/src/shared/shared.jsx`, os itens indicados como `function` são funções e os itens `const` são constantes.
- Os arquivos Java listados devem ser enviados como **arquivos inteiros**; eles contêm classes e métodos, não funções isoladas.
- Os utilitários de validação e formatação de `shared.jsx` abaixo já existem no projeto e ficam com Vitor para o fluxo de login/cadastro. São blocos locais do projeto, não novos códigos ou dependências baixados da web.
- **Arquivos compartilhados** devem ser enviados **somente nos blocos de funções explicitamente indicados** — não enviar o arquivo compartilhado inteiro.
- **Não enviar** arquivos ou blocos fora desta lista.

---

## Brayan

1. `reviva-api/src/main/api/conjuntos/Brayan-descoberta-detalhes/busca-descoberta/EnderecoResponse.java` gg
2. `reviva-api/src/main/api/conjuntos/Brayan-descoberta-detalhes/busca-descoberta/GeoService.java`gg
3. `reviva-api/src/main/api/conjuntos/Brayan-descoberta-detalhes/busca-descoberta/GeoController.java`
4. `reviva-frontend/src/api.js` — `listarItens({ categoria, tipo, termo, cidade, uf, disponiveis } = {})`
5. `reviva-frontend/src/api.js` — `itemPorId(id)`
6. `reviva-frontend/src/api.js` — `buscarCep(cep)`
7. `reviva-frontend/src/shared/shared.jsx` — `function capitalize(s)`
8. `reviva-frontend/src/shared/shared.jsx` — `function distanciaKm(origem, destino)`
9. `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/discoveryScreens.jsx`
10. `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/itensDetalhes.jsx`

## Vitor

1. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/Solicitacao.java`
2. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoRepository.java`
3. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoRequest.java`
4. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoResponse.java`
5. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoService.java`
6. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/solicitacao/SolicitacaoController.java`
7. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/Mensagem.java` gg
8. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemRepository.java` 
9. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemRequest.java` 
10. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemResponse.java`
11. `reviva-api/src/main/api/conjuntos/Vitor-solicitacao-chat/chat-negociacao/MensagemController.java` gg
12. `reviva-frontend/src/api.js` — `solicitar(itemId, mensagem)`, `solicitacoesRecebidas()`, `solicitacoesEnviadas()`, `conversas()`, `solicitacaoPorId(id)`, `listarMensagens(solicitacaoId)`, `enviarMensagem(solicitacaoId, texto)` e `marcarMensagensLidas(solicitacaoId)`
13. `reviva-frontend/src/shared/shared.jsx` — `function fmtDateTime(iso)`gg
14. `reviva-frontend/src/shared/shared.jsx` — `const ETAPA_LABEL`gg
15. `reviva-frontend/src/shared/shared.jsx` — `function Avatar({ label, size = 40, tone })`gg
16. `reviva-frontend/src/shared/shared.jsx` — `function onlyDigits(v)`gg
17. `reviva-frontend/src/shared/shared.jsx` — `function formatCpf(v)` e `function formatCnpj(v)`
18. `reviva-frontend/src/shared/shared.jsx` — `function formatDocumento(v)`gg
19. `reviva-frontend/src/shared/shared.jsx` — `function formatCep(v)`gg
20. `reviva-frontend/src/shared/shared.jsx` — `function formatCelular(v)`gg
21. `reviva-frontend/src/shared/shared.jsx` — `function cpfValido(valor)`, incluindo a função interna `const calc = (base) => { ... }`gg
22. `reviva-frontend/src/shared/shared.jsx` — `function cnpjValido(valor)`, incluindo a função interna `const calc = (pesos) => { ... }`gg
23. `reviva-frontend/src/shared/shared.jsx` — `function documentoValido(valor)` gg
24. `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/solicitacao.jsx`
25. `reviva-frontend/src/conjuntos/Vitor-solicitacao-chat/tradeScreens.jsx`
26. `reviva-frontend/src/App.jsx` gg

## Thiago

1. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/perfil/Usuario.java`
2. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/perfil/UsuarioRepository.java`
3. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/perfil/PerfilRequest.java`
4. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/perfil/PerfilPublicoResponse.java`
5. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/perfil/UsuarioResponse.java`
6. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/perfil/UsuarioController.java`
7. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/reputacao/Avaliacao.java`
8. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/reputacao/AvaliacaoRepository.java`
9. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/reputacao/AvaliacaoResponse.java`
10. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/reputacao/AvaliacaoService.java`
11. `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/reputacao/PontuacaoService.java`
12. `reviva-api/src/main/api/auth/RegistroRequest.java`
13. `reviva-api/src/main/api/auth/LoginRequest.java`
14. `reviva-api/src/main/api/auth/RecuperarSenhaRequest.java`
15. `reviva-api/src/main/api/auth/TokenResponse.java`
16. `reviva-api/src/main/api/auth/AuthController.java`
17. `reviva-frontend/src/api.js` — `me()`, `atualizarPerfil(payload)`, `reputacaoDe(usuarioId)`, `perfilPublico(usuarioId)`, `avaliacoesDe(usuarioId)` e `itensDeUsuario(usuarioId)`
18. `reviva-frontend/src/api.js` — `registrar(payload)`, `login(email, senha)` e `recuperarSenha(email, cpf, novaSenha)`
19. `reviva-frontend/src/shared/shared.jsx` — `const BADGES` e `function badgeIndex(tier)`
20. `reviva-frontend/src/shared/shared.jsx` — `function Stars({ value = 0, size = 13 })`
21. `reviva-frontend/src/shared/shared.jsx` — `function FotoPerfil({ usuario, size = 40 })`
22. `reviva-frontend/src/shared/shared.jsx` — `function linkDoPerfil(usuarioId)`
23. `reviva-frontend/src/shared/shared.jsx` — `function StatBox({ value, label, Icon })`
24. `reviva-frontend/src/shared/shared.jsx` — `function ActionSheet({ open, title, actions = [], onClose })`
25. `reviva-frontend/src/shared/shared.jsx` — `function ImpactRing({ pct = 0, size = 84, label, value, tone = "ink" })` e `function ImpactoResumo({ usuario, onOpen })`
26. `reviva-frontend/src/auth/authScreens.jsx` — `function Splash({ onDone })`, `function Auth({ go, onLogin, onRegister })`, `function Onboarding({ go })` e `function ChooseProfile({ go, setRole })`
27. `reviva-frontend/src/conjuntos/Thiago-perfil-reputacao/accountScreens.jsx`

## João

1. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/comunidades/Comunidade.java`
2. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/comunidades/ComunidadeRepository.java`
3. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/comunidades/ComunidadeResponse.java`
4. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/comunidades/ComunidadeController.java`
5. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/favoritos/Favorito.java`
6. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/favoritos/FavoritoRepository.java`
7. `reviva-api/src/main/api/conjuntos/João-comunidades-favoritos/favoritos/FavoritoController.java`
8. `reviva-frontend/src/api.js` — `comunidades()`, `participarComunidade(id)`, `sairComunidade(id)`, `favoritos()`, `adicionarFavorito(itemId)` e `removerFavorito(itemId)`
9. `reviva-frontend/src/conjuntos/João-comunidades-favoritos/communityScreens.jsx`
10. `reviva-frontend/src/conjuntos/João-comunidades-favoritos/favoritos.jsx`

## Michael

1. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/endereco-salvo/Endereco.java` ok 
2. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/endereco-salvo/EnderecoRepository.java` gg
3. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/endereco-salvo/EnderecoRequest.java`
4. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/endereco-salvo/EnderecoService.java`
5. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/endereco-salvo/EnderecoController.java` gg 
6. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/Notificacao.java`
7. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/NotificacaoRepository.java`
8. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/NotificacaoResponse.java`
9. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/NotificacaoService.java`
10. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/PreferenciasNotificacao.java`
11. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/NotificacaoController.java`
12. `reviva-api/src/main/api/conjuntos/Tang-endereco-seguranca/seguranca-termos/SegurancaController.java`
13. `reviva-frontend/src/api.js` — `alterarSenha(senhaAtual, novaSenha)`, `preferencias()`, `salvarPreferencias(payload)`, `enderecos()`, `criarEndereco(payload)`, `editarEndereco(id, payload)`, `excluirEndereco(id)`, `definirEnderecoPrincipal(id)`, `notificacoes({ todas = false } = {})` e `marcarNotificacaoLida(id)`
14. `reviva-frontend/src/shared/shared.jsx` — `const NOTIF_ICONS`
15. `reviva-frontend/src/shared/shared.jsx` — `function timeAgo(iso)`
16. `reviva-frontend/src/shared/shared.jsx` — `function Checkbox({ checked, onChange, label })`
17. `reviva-frontend/src/shared/shared.jsx` — `function Toggle({ checked, onChange, label, disabled })`
18. `reviva-frontend/src/shared/shared.jsx` — `function FieldError({ children })`
19. `reviva-frontend/src/conjuntos/Tang-endereco-seguranca/enderecos.jsx`
20. `reviva-frontend/src/conjuntos/Tang-endereco-seguranca/seguranca.jsx`


## Gustavo


1. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/comum/Item.java`
2. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/comum/ItemRepository.java`
3. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/comum/ItemResponse.java`
4. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/cadastro-item/ItemRequest.java`
5. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/cadastro-item/ItemService.java`
6. `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/cadastro-item/ItemController.java`
7. `reviva-frontend/src/api.js` — `meusItens()`, `criarItem(payload)`, `editarItem(id, payload)` e `marcarItemComoDoado(id)`
8. `reviva-frontend/src/shared/shared.jsx` — `const CATS`, `const ESTADOS`, `const CO2_ESTIMADO` e `const MODOS_ENTREGA`
9. `reviva-frontend/src/shared/shared.jsx` — `function comprimirImagem(file, maxDim = 900, qualidade = 0.72)`
10. `reviva-frontend/src/shared/shared.jsx` — `const STATUS_ITEM`, `function statusDoItem(item)` e `function StatusBadge({ item, status, label })`
11. `reviva-frontend/src/conjuntos/Gustavo-publicacao-gestao/cadastroItem.jsx`
12. `reviva-frontend/src/conjuntos/Gustavo-publicacao-gestao/gerenciarItens.jsx`
