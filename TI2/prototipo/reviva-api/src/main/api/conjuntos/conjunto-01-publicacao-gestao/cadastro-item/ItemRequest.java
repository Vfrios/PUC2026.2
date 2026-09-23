package com.reviva.api.dto;

import com.reviva.api.model.Item;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ItemRequest(
        @NotBlank @Size(min = 3, max = 80, message = "O título deve ter entre 3 e 80 caracteres") String titulo,
        @Size(max = 1000, message = "A descrição pode ter no máximo 1000 caracteres") String descricao,
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
        @Positive(message = "O peso deve ser maior que zero") Double pesoKg,
        @Size(max = 5, message = "Envie no máximo 5 fotos") List<String> fotosUrls,
        Item.ModoEntrega modoEntrega,
        @Size(max = 300, message = "As regras de retirada podem ter no máximo 300 caracteres") String regrasRetirada
) {}
