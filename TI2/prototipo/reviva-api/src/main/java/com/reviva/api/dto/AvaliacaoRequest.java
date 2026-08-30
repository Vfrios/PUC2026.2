package com.reviva.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AvaliacaoRequest(
        @NotBlank String agendamentoId,
        @NotBlank String avaliadoId,
        @Min(1) @Max(5) int nota,
        String comentario
) {}
