package com.reviva.api.dto;

public record TokenResponse(String token, String tipo) {
    public static TokenResponse of(String token) { return new TokenResponse(token, "Bearer"); }
}
