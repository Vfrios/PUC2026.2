package com.reviva.api.dto;

import com.reviva.api.model.Usuario;

import java.time.Instant;

/** DTO de saída para Usuario. Substitui o retorno direto da entidade nas APIs. */
public record UsuarioResponse(
        String id,
        String nome,
        String email,
        String cpf,
        String telefone,
        String fotoUrl,
        String cep,
        String numero,
        String complemento,
        String perfilAtivo,
        Double latitude,
        Double longitude,
        Integer raioBuscaKm,
        Boolean emailVerificado,
        Boolean telefoneVerificado,
        Double reputacaoScore,
        Integer itensDoados,
        Double kgResiduoEvitado,
        Integer pontos,
        String seloAtual,
        Instant criadoEm
) {
    public static UsuarioResponse from(Usuario u) {
        if (u == null) return null;
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getCpf(),
                u.getTelefone(),
                u.getFotoUrl(),
                u.getCep(),
                u.getNumero(),
                u.getComplemento(),
                u.getPerfilAtivo() != null ? u.getPerfilAtivo().name() : null,
                u.getLatitude(),
                u.getLongitude(),
                u.getRaioBuscaKm(),
                u.getEmailVerificado(),
                u.getTelefoneVerificado(),
                u.getReputacaoScore(),
                u.getItensDoados(),
                u.getKgResiduoEvitado(),
                u.getPontos(),
                u.getSeloAtual() != null ? u.getSeloAtual().name() : null,
                u.getCriadoEm()
        );
    }
}
