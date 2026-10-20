package com.reviva.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank String nome,
        @Email @NotBlank String email,
        @NotBlank String cpf,
        String telefone,
        String celular,
        String tipoPessoa,
        String cep,
        @NotBlank @Pattern(regexp = "\\d+", message = "Numero deve conter apenas digitos") String numero,
        String complemento,
        String rua,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        @Size(min = 8) String senha
) {}
