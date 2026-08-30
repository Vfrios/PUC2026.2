package com.reviva.api.dto;

import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;

import java.time.Instant;
import java.util.List;

/** DTO de saída para Item. Substitui o retorno direto da entidade nas APIs. */
public record ItemResponse(
        String id,
        DoadorResumo doador,
        String titulo,
        String descricao,
        String categoria,
        String estadoConservacao,
        String tipoPublicacao,
        String status,
        Double latitude,
        Double longitude,
        String bairro,
        String cidade,
        String uf,
        Double impactoCo2Kg,
        List<String> fotosUrls,
        Instant publicadoEm
) {
    public static ItemResponse from(Item i) {
        if (i == null) return null;
        return new ItemResponse(
                i.getId(),
                DoadorResumo.from(i.getDoador()),
                i.getTitulo(),
                i.getDescricao(),
                i.getCategoria() != null ? i.getCategoria().name() : null,
                i.getEstadoConservacao() != null ? i.getEstadoConservacao().name() : null,
                i.getTipoPublicacao() != null ? i.getTipoPublicacao().name() : null,
                i.getStatus() != null ? i.getStatus().name() : null,
                i.getLatitude(),
                i.getLongitude(),
                i.getBairro(),
                i.getCidade(),
                i.getUf(),
                i.getImpactoCo2Kg(),
                i.getFotosUrls(),
                i.getPublicadoEm()
        );
    }

    public static List<ItemResponse> from(List<Item> itens) {
        return itens.stream().map(ItemResponse::from).toList();
    }

    /** Só o essencial do doador — nunca o Usuario inteiro (e-mail, localização exata etc). */
    public record DoadorResumo(String id, String nome, String fotoUrl, Double reputacaoScore, String seloAtual) {
        public static DoadorResumo from(Usuario u) {
            if (u == null) return null;
            return new DoadorResumo(u.getId(), u.getNome(), u.getFotoUrl(), u.getReputacaoScore(),
                    u.getSeloAtual() != null ? u.getSeloAtual().name() : null);
        }
    }
}
