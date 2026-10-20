package com.reviva.api.dto;

public record EnderecoResponse(
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        Double latitude,
        Double longitude
) {}
