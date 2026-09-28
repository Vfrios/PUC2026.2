# Candidatos TSE 2 - Gabarito AV1 (versão B) DIAW

Projeto Spring Boot completo (Java + Maven + Thymeleaf + HTML + CSS) que mostra o
**perfil** dos candidatos de MG (eleições 2026), com filtros por gênero, escolaridade
e faixa etária.

## Requisitos
- JDK 25 (ou 21, veja a observação abaixo)
- Apache Maven 3.9+ (ou o Maven embutido da IDE)
- Internet na primeira execução (Maven baixa as dependências)

## Como rodar

### Pelo terminal
```
cd CandidatosTSE2
mvn spring-boot:run
```
Depois abra: http://localhost:8080/

### Pelo IntelliJ / Eclipse / VS Code
1. Abra a pasta `CandidatosTSE2` como projeto Maven (File > Open > pom.xml).
2. Aguarde o Maven baixar as dependências.
3. Execute a classe `application/CandidatosTseApplication.java`.
4. Acesse http://localhost:8080/

### Gerando o .jar
```
mvn clean package
java -jar target/CandidatosTSE2-0.0.1-SNAPSHOT.jar
```

## Observações
- Se você não tiver o JDK 25 instalado, altere `<java.version>25</java.version>` no
  `pom.xml` para `21` (o código funciona igual).
- Se der erro de porta em uso, feche o que usa a 8080 ou mude `server.port` em
  `src/main/resources/application.properties`.
- O CSV é lido uma única vez na inicialização (pode levar 1-2 segundos).
- Candidatos sem foto no disco mostram o placeholder "Sem foto".
- O gênero "NÃO DIVULGÁVEL" (que aparece no print da prova) foi tratado com a
  mesma classe `etiqueta-m` no CSS, já que o enunciado só pede duas cores
  (feminino/masculino). Se quiser uma terceira cor, é só criar `.etiqueta-outro`
  e ajustar a condição no `index.html`.

## O que foi feito (requisitos da prova)
| Questão | Arquivo | O que faz |
|---|---|---|
| 1 (10 pts) | `controller/CandidatosTseController.java` | `@Controller`, service injetado por construtor, `GET /` com `@RequestParam(required = false)` para `genero`, `escolaridade` (String) e `idadeMin`/`idadeMax` (Integer); chama `filtrarPerfil(...)`; envia ao Model `candidatos`, `totalEncontrado`, `generos`, `escolaridades`, `generoSelecionado`, `escolaridadeSelecionada`, `idadeMin`, `idadeMax`; retorna `"index"` |
| 2 (10 pts) | `templates/index.html` | namespace `th`, CSS via `th:href`, form `method="get"`, radios de gênero com `th:checked`, select de escolaridade com `th:selected`, inputs `number` com `th:value` para idade, cards com `th:each`, foto via `nomeArquivoFoto`, etiqueta de gênero com `th:classappend` (`etiqueta-f`/`etiqueta-m`), `th:if` nos campos opcionais, contagem e mensagem de lista vazia, botões Filtrar e Limpar |
| 3 (5 pts) | `static/css/style.css` | `.layout` em grid de duas colunas (`260px 1fr`), `.lista-candidatos` em grid responsivo (`auto-fill, minmax(320px, 1fr)`), `.card-candidato` em flex horizontal, foto com `aspect-ratio: 161 / 225` e `object-fit: cover`, classes `.etiqueta-f`/`.etiqueta-m`, media query em 800px que empilha o layout em uma coluna |

Também foram copiados: o CSV para `src/main/resources/data/candidatos/` e as fotos para
`src/main/resources/static/images/candidatos/`.

Os arquivos `model/Candidato.java` e `service/CandidatosTseService.java` são os fornecidos
na prova, sem alterações.

## Estrutura
```
CandidatosTSE2
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
