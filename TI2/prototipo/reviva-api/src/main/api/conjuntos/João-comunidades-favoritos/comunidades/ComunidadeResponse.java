package com.reviva.api.dto;

import com.reviva.api.model.Comunidade;
import com.reviva.api.model.ComunidadePost;

import java.time.Instant;

public record ComunidadeResponse(
        String id,
        String nome,
        String descricao,
        String bairroReferencia,
        String categoria,
        String cidade,
        String uf,
        int totalMembros,
        long totalPosts,
        boolean participando,
        Instant criadaEm
) {
    public static ComunidadeResponse from(Comunidade c, String usuarioId, long totalPosts) {
        var membros = c.idsDosMembros();
        return new ComunidadeResponse(c.getId(), c.getNome(), c.getDescricao(), c.getBairroReferencia(),
                c.getCategoria(), c.getCidade(), c.getUf(), membros.size(), totalPosts,
                usuarioId != null && membros.contains(usuarioId), c.getCriadaEm());
    }

    public record Post(String id, String autorId, String autorNome, String autorFotoUrl, String texto,
                       int apoios, boolean apoiei, Instant criadoEm) {
        public static Post from(ComunidadePost p, String usuarioId) {
            int total = p.getApoios() != null ? p.getApoios().size() : 0;
            boolean apoiei = usuarioId != null && p.getApoios() != null && p.getApoios().contains(usuarioId);
            return new Post(p.getId(), p.getAutorId(), p.getAutorNome(), p.getAutorFotoUrl(), p.getTexto(),
                    total, apoiei, p.getCriadoEm());
        }
    }
}
