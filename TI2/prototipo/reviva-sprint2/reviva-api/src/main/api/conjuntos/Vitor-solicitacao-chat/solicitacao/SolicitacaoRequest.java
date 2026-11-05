package com.reviva.api.dto;

import jakarta.validation.constraints.NotBlank;

public record SolicitacaoRequest(@NotBlank String itemId, String mensagem) {}
