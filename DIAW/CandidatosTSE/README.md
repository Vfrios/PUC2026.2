# Candidatos TSE - Gabarito AV1 DIAW

Projeto Spring Boot completo (Java + Maven + Thymeleaf + HTML + CSS) que lista os
candidatos de MG (eleições 2026) com filtros por cargo, partido e texto.

## Requisitos
- JDK 25 (ou 21, veja a observação abaixo)
- Apache Maven 3.9+ (ou o Maven embutido da IDE)
- Internet na primeira execução (Maven baixa as dependências)

## Como rodar

### Pelo terminal
```
cd CandidatosTSE
mvn spring-boot:run
```
Depois abra: http://localhost:8080/

### Pelo IntelliJ / Eclipse / VS Code
1. Abra a pasta `CandidatosTSE` como projeto Maven (File > Open > pom.xml).
2. Aguarde o Maven baixar as dependências.
3. Execute a classe `application/CandidatosTseApplication.java`.
4. Acesse http://localhost:8080/

### Gerando o .jar
```
mvn clean package
java -jar target/CandidatosTSE-0.0.1-SNAPSHOT.jar
```

## Observações
- Se você não tiver o JDK 25 instalado, altere `<java.version>25</java.version>` no
  `pom.xml` para `21` (o código funciona igual).
- Se der erro de porta em uso, feche o que usa a 8080 ou mude `server.port` em
  `src/main/resources/application.properties`.
- O CSV é lido uma única vez na inicialização (pode levar 1-2 segundos).
- Candidatos sem foto no disco mostram o placeholder "Sem foto".

## O que foi feito (requisitos da prova)
| Questão | Arquivo | O que faz |
|---|---|---|
| 1 (10 pts) | `controller/CandidatosTseController.java` | `@Controller`, service injetado por construtor, `GET /` com `@RequestParam(required = false)` para `cargo`, `partido` e `texto`; envia ao Model: `candidatos`, `total`, `cargos`, `partidos`, `cargoSelecionado`, `partidoSelecionado`, `textoSelecionado` (null vira ""); retorna `"index"` |
| 2 (10 pts) | `templates/index.html` | namespace `th`, `th:href` no CSS, form `method="get"` com `th:action`, `th:value` no texto, `<select>` com opção "Todos" + `th:each` + `th:selected`, cards com `th:each`, foto via `nomeArquivoFoto`, `th:if` nos campos opcionais, contagem e mensagem de lista vazia, botões Filtrar e Limpar |
| 3 (5 pts) | `static/css/style.css` | CSS Grid responsivo (`auto-fill, minmax(150px, 1fr)`), foto com `aspect-ratio: 161 / 225` e `object-fit: cover` |

Também foram copiados: o CSV para `src/main/resources/data/candidatos/` e as fotos para
`src/main/resources/static/images/candidatos/`.

Os arquivos `model/Candidato.java` e `service/CandidatosTseService.java` são os fornecidos
na prova, sem alterações.

## Estrutura
```
CandidatosTSE
├── pom.xml
└── src/main
    ├── java/com/example/CandidatosTSE
    │   ├── application/CandidatosTseApplication.java
    │   ├── controller/CandidatosTseController.java
    │   ├── model/Candidato.java
    │   └── service/CandidatosTseService.java
    └── resources
        ├── application.properties
        ├── data/candidatos/consulta_cand_2026_MG.csv
        ├── static/css/style.css
        ├── static/images/candidatos/*.jpg
        └── templates/index.html
```
