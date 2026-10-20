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
        UltimaMensagem ultimaMensagem,
        /** ENVIADA, ACEITA, RECUSADA ou CANCELADA. */
        String etapa
) {
    public record UltimaMensagem(String texto, Instant criadaEm) {}

    public static SolicitacaoResponse from(Solicitacao s) {
        return from(s, null);
    }

    public static SolicitacaoResponse from(Solicitacao s, Mensagem ultima) {
        return from(s, ultima, false);
    }

    public static SolicitacaoResponse from(Solicitacao s, Mensagem ultima, boolean doadorRespondeu) {
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
                ultima == null ? null : new UltimaMensagem(previewTexto(ultima.getTexto()), ultima.getCriadaEm()),
                etapa(s, doadorRespondeu)
        );
    }

    public static List<SolicitacaoResponse> from(List<Solicitacao> lista) {
        return lista.stream().map(SolicitacaoResponse::from).toList();
    }

    private static String etapa(Solicitacao s, boolean doadorRespondeu) {
        if (s.getStatus() == Solicitacao.StatusSolicitacao.RECUSADA) return "RECUSADA";
        if (s.getStatus() == Solicitacao.StatusSolicitacao.CANCELADA) return "CANCELADA";
        return doadorRespondeu ? "ACEITA" : "ENVIADA";
    }

    /** Resumo curto para o Inbox (evita JSON cru de foto/localização). */
    public static String previewTexto(String texto) {
        if (texto == null || texto.isBlank()) return "";
        String t = texto.trim();
        if (t.startsWith("{")) {
            if (t.contains("\"LOCALIZACAO\"")) return "Localização compartilhada";
            if (t.contains("\"IMAGEM\"")) return "Foto";
            if (t.contains("\"SOLICITACAO_CANCELADA\"")) return "Conversa cancelada";
            if (t.contains("\"SOLICITACAO_RECUSADA\"")) return "Solicitação recusada";
            if (t.contains("\"RESPOSTA\"")) {
                int i = t.indexOf("\"texto\":\"");
                if (i >= 0) {
                    int fim = t.indexOf('"', i + 9);
                    if (fim > i) return "↪ " + t.substring(i + 9, fim);
                }
                return "Resposta";
            }
        }
        return t.length() > 120 ? t.substring(0, 117) + "..." : t;
    }
}
