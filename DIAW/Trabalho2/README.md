# AuraLogin

Aplicacao de login e cadastro feita com Spring Boot + Thymeleaf, para a Atividade 02.

## Integrantes
- Nome 1 - Matricula
- Nome 2 - Matricula

## Tecnologias
- Java 17 + Spring Boot 3.3
- Spring Security (autenticacao + senha criptografada com BCrypt)
- Spring Data JPA + H2 (banco em memoria)
- Thymeleaf

## Endpoints

| Metodo | Endpoint          | Descricao                         |
|--------|-------------------|------------------------------------|
| GET    | /login            | Tela de login                      |
| POST   | /login            | Processado pelo Spring Security    |
| GET    | /register         | Tela de cadastro                   |
| POST   | /register         | Processa o cadastro                |
| GET    | /recoverpassword  | Tela de recuperacao de senha       |
| POST   | /recoverpassword  | Processa o pedido de recuperacao   |
| GET    | /home             | Area protegida (logado)            |
| POST   | /logout           | Encerra a sessao                   |

## Como rodar

Pre-requisito: Java 17 e Maven instalados.

```bash
mvn spring-boot:run
```

Acesse: http://localhost:8080/login

Usuario de teste ja criado automaticamente:
- usuario: `demo`
- senha: `demo1234`

Ou clique em "Criar conta" para se cadastrar.

## Observacoes

- As senhas sao armazenadas com hash (BCrypt), nunca em texto puro.
- O cadastro valida campos vazios, email invalido, senha muito curta, senhas diferentes e usuario/email duplicado.
- A recuperacao de senha por email nao envia um email de verdade nesta versao (fica simulada, so mostra uma mensagem). Para envio real, seria necessario configurar um servico de email (JavaMailSender) no `AuthController`.
- Banco H2 em memoria: os dados sao apagados a cada reinicio da aplicacao.
