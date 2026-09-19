package com.reviva.api.dto;

import com.reviva.api.model.Solicitacao;

import java.time.Instant;
import java.util.List;

/** DTO de saída para Solicitacao. Substitui o retorno direto da entidade nas APIs. */
public record SolicitacaoResponse(
        String id,
        ItemResponse item,
        UsuarioResponse receptor,
        String mensagem,
        String status,
        Instant criadaEm
) {
    public static SolicitacaoResponse from(Solicitacao s) {
        if (s == null) return null;
        return new SolicitacaoResponse(
                s.getId(),
                ItemResponse.from(s.getItem()),
                UsuarioResponse.from(s.getReceptor()),
                s.getMensagem(),
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getCriadaEm()
        );
    }

    public static List<SolicitacaoResponse> from(List<Solicitacao> lista) {
        return lista.stream().map(SolicitacaoResponse::from).toList();
    }
}
