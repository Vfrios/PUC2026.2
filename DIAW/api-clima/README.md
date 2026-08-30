# 🌦️ Clima API — Belo Horizonte (Spring Boot)

API REST desenvolvida em **Java + Spring Boot** que consulta a previsão do
tempo de **Belo Horizonte - MG** consumindo a API externa gratuita
[Open-Meteo](https://open-meteo.com/), e disponibiliza os dados processados
em um endpoint próprio, em formato JSON.

A **Open-Meteo** foi escolhida porque é gratuita e **não exige API Key**
para o uso feito neste projeto, o que simplifica a configuração.

## ⚙️ Tecnologias

- Java 17
- Spring Boot 3.3 (Spring Web)
- Maven
- RestTemplate para consumo da API externa
- Open-Meteo (API pública de dados meteorológicos)

## 📦 Estrutura do projeto

```text
src/main/java/com/example/clima/
├── ClimaApiApplication.java     # classe principal
├── controller/
│   └── ClimaController.java     # endpoints REST
├── service/
│   └── ClimaService.java        # integração com a Open-Meteo e regras de negócio
├── dto/
│   ├── ClimaResponse.java       # objeto de resposta da nossa API
│   └── OpenMeteoResponse.java   # mapeamento da resposta da API externa
└── exception/
    ├── ClimaIndisponivelException.java
    └── GlobalExceptionHandler.java  # tratamento de erros da API externa
```

## 🔑 Configuração da API Key

A **Open-Meteo não exige API Key** para os dados usados neste projeto,
então nenhuma credencial precisa ser configurada.

Caso queira trocar para uma API que exija chave (ex.: OpenWeather,
WeatherAPI), basta:

1. Adicionar a propriedade no `src/main/resources/application.properties`:
   ```properties
   clima.api-key=${CLIMA_API_KEY}
   ```
2. Definir a variável de ambiente `CLIMA_API_KEY` antes de rodar a
   aplicação, evitando deixar a chave exposta no código-fonte.

## ▶️ Como executar localmente

Pré-requisitos: **Java 17+** e **Maven** instalados (ou use o `./mvnw`
incluído no projeto, se disponível).

```bash
# 1. Clonar o repositório
git clone <URL-DO-REPOSITORIO>
cd clima-api

# 2. Rodar a aplicação
mvn spring-boot:run
```

A aplicação sobe por padrão em `http://localhost:8080`.

## 🌐 Endpoints disponíveis

### `GET /clima`
Retorna o clima atual de Belo Horizonte - MG (cidade padrão da atividade).

### `GET /clima/belo-horizonte`
Equivalente ao endpoint acima — retorna explicitamente o clima de Belo
Horizonte - MG.

**Exemplo de resposta:**

```json
{
  "cidade": "Belo Horizonte",
  "latitude": -19.9167,
  "longitude": -43.9345,
  "temperaturaAtual": 24.3,
  "temperaturaMaxima": 27.1,
  "temperaturaMinima": 15.8,
  "umidade": 48,
  "velocidadeVento": 11.2,
  "direcaoVento": "L",
  "condicaoClimatica": "Predominantemente limpo",
  "descricao": "Tempo predominantemente limpo em Belo Horizonte.",
  "consultadoEm": "2026-08-24T10:15:32.101"
}
```

### `GET /clima/cidade?nome={nome}&latitude={lat}&longitude={lon}` (desafio extra)
Permite consultar o clima atual de **qualquer cidade**, informando nome e
coordenadas geográficas. Exemplo:

```text
GET /clima/cidade?nome=São Paulo&latitude=-23.5505&longitude=-46.6333
```

## ⚠️ Tratamento de erros

- Se a API externa estiver fora do ar ou a requisição falhar, a aplicação
  responde com status **503 (Service Unavailable)** e uma mensagem
  explicativa.
- Parâmetros inválidos (ex.: latitude/longitude ausentes no endpoint
  `/clima/cidade`) resultam em **400 (Bad Request)**.
- Erros inesperados são capturados por um `@RestControllerAdvice` global,
  retornando **500 (Internal Server Error)** com um corpo padronizado.

## 📚 Dependências principais (`pom.xml`)

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-test` (testes)

## ⭐ Possíveis melhorias futuras

- Cache das respostas da API externa (ex.: Spring Cache) para reduzir
  chamadas repetidas.
- Suporte a previsão para os próximos dias (a Open-Meteo já retorna esses
  dados no bloco `daily`, bastando expor mais campos).
- Testes unitários para `ClimaService` com mock do `RestTemplate`.

---

Projeto desenvolvido para a atividade **"API REST de Clima com Spring
Boot"**, em dupla, utilizando Pair Programming.
