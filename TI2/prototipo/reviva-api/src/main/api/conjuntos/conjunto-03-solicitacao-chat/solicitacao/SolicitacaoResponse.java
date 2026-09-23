package com.reviva.api.dto;

import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Solicitacao;

import java.time.Instant;
import java.util.List;

/** DTO de saída para Solicitacao. Substitui o retorno direto da entidade nas APIs. */
public record SolicitacaoResponse(
        String id,
        ItemResponse item,
        UsuarioResponse receptor,
        String doadorId,
        String mensagem,
        String status,
        Instant criadaEm,
        UltimaMensagem ultimaMensagem
) {
    public record UltimaMensagem(String texto, Instant criadaEm) {}

    public static SolicitacaoResponse from(Solicitacao s) {
        return from(s, null);
    }

    public static SolicitacaoResponse from(Solicitacao s, Mensagem ultima) {
        if (s == null) return null;
        String doadorId = s.getDoadorId();
        if ((doadorId == null || doadorId.isBlank()) && s.getItem() != null && s.getItem().getDoador() != null) {
            doadorId = s.getItem().getDoador().getId();
        }
        return new SolicitacaoResponse(
                s.getId(),
                ItemResponse.from(s.getItem()),
                UsuarioResponse.from(s.getReceptor()),
                doadorId,
                s.getMensagem(),
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getCriadaEm(),
                ultima == null ? null : new UltimaMensagem(previewTexto(ultima.getTexto()), ultima.getCriadaEm())
        );
    }

    public static List<SolicitacaoResponse> from(List<Solicitacao> lista) {
        return lista.stream().map(SolicitacaoResponse::from).toList();
    }

    /** Resumo curto para o Inbox (evita JSON cru de foto/localização). */
    public static String previewTexto(String texto) {
        if (texto == null || texto.isBlank()) return "";
        String t = texto.trim();
        if (t.startsWith("{")) {
            if (t.contains("\"LOCALIZACAO\"")) return "Localização compartilhada";
            if (t.contains("\"IMAGEM\"")) return "Foto";
            if (t.contains("\"AGENDAMENTO_CRIADO\"")) return "Agendamento criado";
            if (t.contains("\"AGENDAMENTO_CONFIRMADO\"")) return "Agendamento confirmado";
            if (t.contains("\"RETIRADA_CONFIRMADA\"")) return "Retirada confirmada";
        }
        return t.length() > 120 ? t.substring(0, 117) + "..." : t;
    }
}
