package com.reviva.api.dto;

import com.reviva.api.model.Comunidade;

public record ComunidadeResponse(
        String id,
        String nome,
        String descricao,
        String bairroReferencia,
        String categoria,
        String cidade,
        String uf,
        int totalMembros,
        boolean participando
) {
    public static ComunidadeResponse from(Comunidade c, String usuarioId) {
        var membros = c.idsDosMembros();
        return new ComunidadeResponse(c.getId(), c.getNome(), c.getDescricao(), c.getBairroReferencia(),
                c.getCategoria(), c.getCidade(), c.getUf(), membros.size(),
                usuarioId != null && membros.contains(usuarioId));
    }
}
