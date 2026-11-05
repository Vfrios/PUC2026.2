# Arquivos de envio — Brayan (Sprint 2)

## Entrega principal

- `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/itensDetalhes.jsx`
- `reviva-frontend/src/conjuntos/Brayan-descoberta-detalhes/README.md`

## Contratos compartilhados utilizados

- `reviva-frontend/src/api.js` — consulta por identificador (`itemPorId`) e
  acoes de favoritos/solicitacao ja existentes.
- `reviva-api/src/main/api/conjuntos/Gustavo-publicacao-gestao/` — contrato e
  estado do item; coordenar qualquer alteracao com Gustavo.
- `reviva-api/src/main/api/conjuntos/Thiago-perfil-reputacao/` — dados publicos
  do anunciante, sem expor informacoes privadas.

Nao duplicar entidade, controller ou repositorio de item dentro do conjunto
Brayan. Se o contrato compartilhado precisar mudar, registrar a mudanca e
combina-la com a frente proprietaria.
