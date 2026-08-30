package com.reviva.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank String nome,
        @Email @NotBlank String email,
        @Size(min = 8) String senha
) {}
