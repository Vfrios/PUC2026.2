package com.reviva.api.dto;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;

import java.time.Instant;
import java.util.List;

/** DTO enxuto para notificacoes, evitando serializar o grafo JPA da solicitacao. */
public record NotificacaoResponse(
        String id,
        String titulo,
        String tipo,
        boolean lida,
        Instant criadaEm,
        boolean expirada,
        String solicitacaoId,
        ItemResponse item,
        UsuarioResumo receptor
) {
    public static NotificacaoResponse from(Notificacao notificacao, Instant limite) {
        var solicitacao = notificacao.getSolicitacao();
        return new NotificacaoResponse(
                notificacao.getId(),
                notificacao.getTitulo(),
                notificacao.getTipo() != null ? notificacao.getTipo().name() : null,
                Boolean.TRUE.equals(notificacao.getLida()),
                notificacao.getCriadaEm(),
                notificacao.getCriadaEm() != null && notificacao.getCriadaEm().isBefore(limite),
                solicitacao != null ? solicitacao.getId() : null,
                solicitacao != null ? ItemResponse.from(solicitacao.getItem()) : null,
                solicitacao != null ? UsuarioResumo.from(solicitacao.getReceptor()) : null
        );
    }

    public static List<NotificacaoResponse> from(List<Notificacao> notificacoes, Instant limite) {
        return notificacoes.stream().map(n -> from(n, limite)).toList();
    }

    public record UsuarioResumo(String id, String nome, String fotoUrl) {
        public static UsuarioResumo from(Usuario usuario) {
            return usuario == null ? null : new UsuarioResumo(usuario.getId(), usuario.getNome(), usuario.getFotoUrl());
        }
    }
}
