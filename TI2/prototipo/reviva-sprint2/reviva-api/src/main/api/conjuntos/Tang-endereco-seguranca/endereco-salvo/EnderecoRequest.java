package com.reviva.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(
        @NotBlank(message = "Dê um apelido ao endereço") @Size(max = 30) String apelido,
        @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido") String cep,
        @NotBlank(message = "Informe a rua") @Size(max = 120) String logradouro,
        @Size(max = 10) String numero,
        @Size(max = 60) String complemento,
        @NotBlank(message = "Informe o bairro") @Size(max = 80) String bairro,
        @NotBlank(message = "Informe a cidade") @Size(max = 80) String cidade,
        @NotBlank @Pattern(regexp = "[A-Za-z]{2}", message = "UF inválida") String uf,
        Double latitude,
        Double longitude,
        Boolean principal
) {}
