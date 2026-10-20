# Reviva API

Backend Java 21 com Spring Boot 3.3.2, Spring Data MongoDB, JWT e WebSocket.
A API atende o frontend React e persiste os dados no MongoDB Atlas.

## Executar

Configure `MONGODB_URI`, `MONGODB_DATABASE` e `JWT_SECRET` no ambiente e rode:

```powershell
mvn spring-boot:run
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Banco: MongoDB Atlas
- Demo: `doador@reviva.com` ou `receptor@reviva.com`, senha `reviva123`

## Responsabilidades

Os pacotes `conjuntos/conjunto-*` agrupam controllers, services, repositories,
entidades e DTOs por fluxo de negocio. Cada README de conjunto lista os
arquivos existentes e os endpoints relacionados.

- Publicacao e gestao: itens e status dos anuncios.
- Descoberta e detalhes: CEP, estados, cidades e geolocalizacao reversa.
- Solicitacao e chat: conversas, mensagens, presenca e agendamentos.
- Perfil e reputacao: usuarios, avaliacoes e pontuacao.
- Comunidades e favoritos: participacao, posts, apoio e itens salvos.
- Endereco e seguranca: enderecos salvos, senha, sessoes e notificacoes.

## Validacao

```powershell
mvn -q -DskipTests compile
mvn test -q
```

Para a visao completa da arquitetura, configuracao, frontend e rotas REST,
consulte o [README da raiz](../README.md).
