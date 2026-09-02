package com.reviva.api.dto;

import com.reviva.api.model.Item;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ItemRequest(
        @NotBlank String titulo,
        String descricao,
        @NotNull Item.Categoria categoria,
        @NotNull Item.EstadoConservacao estadoConservacao,
        @NotNull Item.TipoPublicacao tipoPublicacao,
        Double latitude,
        Double longitude,
        String cep,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        Double impactoCo2Kg,
        List<String> fotosUrls
) {}
