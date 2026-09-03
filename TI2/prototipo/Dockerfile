# --- Stage 1: build do frontend (React/Vite) ---
FROM node:20-slim AS frontend-build
WORKDIR /front
COPY reviva-frontend/package*.json ./
RUN npm install
COPY reviva-frontend/ ./
# Same-origin: front e back vão morar no mesmo serviço, então a URL da API é relativa (vazia)
ENV VITE_API_URL=""
RUN npm run build

# --- Stage 2: build do backend (Java/Maven), com o front já embutido ---
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY reviva-api/pom.xml .
RUN mvn -B dependency:go-offline
COPY reviva-api/src ./src
# Copia os arquivos buildados do front para dentro dos recursos estáticos do Spring Boot
COPY --from=frontend-build /front/dist ./src/main/resources/static
RUN mvn -B clean package -DskipTests

# --- Stage 3: runtime ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN mkdir -p db
COPY reviva-api/db/reviva.db ./db/reviva.db
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
