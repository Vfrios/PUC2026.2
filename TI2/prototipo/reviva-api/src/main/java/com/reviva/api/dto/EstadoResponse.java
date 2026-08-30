package com.reviva.api.dto;

/** Estado (UF) retornado pela API pública do IBGE. */
public record EstadoResponse(String sigla, String nome) {}
