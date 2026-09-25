package com.reviva.api.dto;

import com.reviva.api.model.Usuario;

import java.time.Instant;

/** Perfil visível para outras pessoas: sem e-mail, CPF, telefone ou endereço. */
public record PerfilPublicoResponse(
        String id,
        String nome,
        String fotoUrl,
        String cidade,
        String uf,
        Double reputacaoScore,
        int totalAvaliacoes,
        Integer itensDoados,
        Double kgResiduoEvitado,
        Integer pontos,
        String seloAtual,
        Boolean emailVerificado,
        Boolean telefoneVerificado,
        Instant criadoEm
) {
    public static PerfilPublicoResponse from(Usuario u, int totalAvaliacoes) {
        return new PerfilPublicoResponse(u.getId(), u.getNome(), u.getFotoUrl(), u.getCidade(), u.getUf(),
                u.getReputacaoScore(), totalAvaliacoes, u.getItensDoados(), u.getKgResiduoEvitado(), u.getPontos(),
                u.getSeloAtual() != null ? u.getSeloAtual().name() : null,
                u.getEmailVerificado(), u.getTelefoneVerificado(), u.getCriadoEm());
    }
}
