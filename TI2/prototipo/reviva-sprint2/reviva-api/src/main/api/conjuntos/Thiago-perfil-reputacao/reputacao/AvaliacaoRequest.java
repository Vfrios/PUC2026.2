package com.reviva.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AvaliacaoRequest(
        @NotBlank String agendamentoId,
        @NotBlank String avaliadoId,
        @Min(1) @Max(5) int nota,
        @Size(max = 400, message = "O comentário pode ter no máximo 400 caracteres") String comentario,
        @Min(1) @Max(5) Integer pontualidade,
        @Min(1) @Max(5) Integer comunicacao,
        @Min(1) @Max(5) Integer estadoItem
) {}
