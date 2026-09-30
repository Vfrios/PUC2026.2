package com.reviva.api.dto;

import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Usuario;

import java.time.Instant;
import java.util.List;

public record AvaliacaoResponse(
        String id,
        String agendamentoId,
        String itemTitulo,
        Autor avaliador,
        int nota,
        Integer pontualidade,
        Integer comunicacao,
        Integer estadoItem,
        String comentario,
        Instant criadaEm
) {
    public record Autor(String id, String nome, String fotoUrl) {
        static Autor from(Usuario u) {
            return u == null ? null : new Autor(u.getId(), u.getNome(), u.getFotoUrl());
        }
    }

    public static AvaliacaoResponse from(Avaliacao a) {
        var agendamento = a.getAgendamento();
        String itemTitulo = agendamento != null && agendamento.getSolicitacao() != null && agendamento.getSolicitacao().getItem() != null
                ? agendamento.getSolicitacao().getItem().getTitulo() : null;
        return new AvaliacaoResponse(
                a.getId(),
                agendamento != null ? agendamento.getId() : null,
                itemTitulo,
                Autor.from(a.getAvaliador()),
                a.getNota(),
                a.getPontualidade(),
                a.getComunicacao(),
                a.getEstadoItem(),
                a.getComentario(),
                a.getCriadaEm()
        );
    }

    public static List<AvaliacaoResponse> from(List<Avaliacao> lista) {
        return lista.stream().map(AvaliacaoResponse::from).toList();
    }
}
