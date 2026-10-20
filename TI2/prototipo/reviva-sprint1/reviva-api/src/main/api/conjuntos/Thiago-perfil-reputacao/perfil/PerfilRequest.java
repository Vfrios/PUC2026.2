package com.reviva.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados que o próprio usuário pode editar na tela de Perfil. */
public record PerfilRequest(
        @NotBlank @Size(min = 3, max = 80, message = "O nome deve ter entre 3 e 80 caracteres") String nome,
        String telefone,
        @Size(max = 1_500_000, message = "A foto é muito grande") String fotoUrl,
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        String numero,
        String complemento
) {}
