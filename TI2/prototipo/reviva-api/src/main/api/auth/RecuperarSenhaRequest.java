package com.reviva.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Redefine a senha sem e-mail: e-mail + CPF/CNPJ cadastrados. */
public record RecuperarSenhaRequest(
        @Email @NotBlank String email,
        @NotBlank String cpf,
        @NotBlank @Size(min = 8, max = 72, message = "A nova senha deve ter pelo menos 8 caracteres") String novaSenha
) {}
