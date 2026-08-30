package com.reviva.api.dto;

import jakarta.validation.constraints.NotBlank;

public record MensagemRequest(@NotBlank String texto) {}
