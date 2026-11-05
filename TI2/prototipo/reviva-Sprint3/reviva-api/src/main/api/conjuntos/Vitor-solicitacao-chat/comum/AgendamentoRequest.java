package com.reviva.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record AgendamentoRequest(
        @NotBlank String solicitacaoId,
        @NotNull Instant dataHora,
        @NotBlank String localEncontro
) {}
